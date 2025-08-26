// Client-side encryption utilities for sensitive data
import { supabase } from "@/integrations/supabase/client";

class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: CryptoKey | null = null;

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private async getOrCreateEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('User must be authenticated to access encrypted data');
    }

    // Generate a key based on user ID (in production, you'd want a more secure approach)
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(user.id.slice(0, 32).padEnd(32, '0')),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('supabase-accounts-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this.encryptionKey;
  }

  async encrypt(text: string): Promise<string> {
    if (!text) return text;
    
    try {
      const key = await this.getOrCreateEncryptionKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  async decrypt(encryptedText: string): Promise<string> {
    if (!encryptedText) return encryptedText;
    
    try {
      const key = await this.getOrCreateEncryptionKey();
      
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedText)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      // Return the original text if decryption fails (for backward compatibility)
      return encryptedText;
    }
  }

  // Clear the encryption key on logout
  clearKey(): void {
    this.encryptionKey = null;
  }
}

export const encryptionService = EncryptionService.getInstance();