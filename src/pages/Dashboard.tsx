import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, FolderOpen, Calendar, X, User, Edit, StickyNote, Workflow, FileText, Shield, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDiagrams } from "@/hooks/useDiagrams";
import { useNotes } from "@/hooks/useNotes";
import { useAccounts } from "@/hooks/useAccounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { diagrams, loading, deleteDiagram } = useDiagrams();
  const { notes, loading: notesLoading, saveNote, deleteNote } = useNotes();
  const { accounts, loading: accountsLoading, createAccount, updateAccount, deleteAccount } = useAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenDiagrams, setHiddenDiagrams] = useState<Set<string>>(new Set());
  
  // Notes state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  
  // Accounts state
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState({
    product_name: '',
    email: '',
    password: '',
    note: '',
    customer_name: '',
    order_date: '',
    category: ''
  });
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Section visibility state
  const [activeSection, setActiveSection] = useState<'diagrams' | 'notes' | 'accounts' | null>(null);

  const filteredDiagrams = diagrams.filter(diagram =>
    diagram.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !hiddenDiagrams.has(diagram.id)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const getPreview = (nodes: any) => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return 'Empty diagram';
    }
    return nodes.slice(0, 3).map((node: any) => node.data?.label || 'Node').join(' → ') + 
           (nodes.length > 3 ? '...' : '');
  };

  const handleHideDiagram = (id: string) => {
    setHiddenDiagrams(prev => new Set([...prev, id]));
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) return;
    
    await saveNote(noteTitle, noteContent, editingNote || undefined);
    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setIsNoteDialogOpen(false);
  };

  const handleEditNote = (note: any) => {
    setNoteTitle(note.title);
    setNoteContent(note.content || '');
    setEditingNote(note.id);
    setIsNoteDialogOpen(true);
  };

  const handleNewNote = () => {
    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setIsNoteDialogOpen(true);
  };

  // Account handlers
  const resetAccountForm = () => {
    setAccountForm({
      product_name: '',
      email: '',
      password: '',
      note: '',
      customer_name: '',
      order_date: '',
      category: ''
    });
  };

  const handleNewAccount = () => {
    resetAccountForm();
    setEditingAccount(null);
    setIsAccountDialogOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setAccountForm({
      product_name: account.product_name,
      email: account.email,
      password: account.password,
      note: account.note || '',
      customer_name: account.customer_name || '',
      order_date: account.order_date || '',
      category: account.category
    });
    setEditingAccount(account.id);
    setIsAccountDialogOpen(true);
  };

  const handleSaveAccount = async () => {
    if (!accountForm.product_name.trim() || !accountForm.category.trim()) return;
    
    if (editingAccount) {
      await updateAccount(editingAccount, accountForm);
    } else {
      await createAccount(accountForm);
    }
    
    resetAccountForm();
    setEditingAccount(null);
    setIsAccountDialogOpen(false);
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const copyAccountDetails = async (account: any) => {
    const details = [
      account.email ? `Email: ${account.email}` : '',
      account.password ? `Password: ${account.password}` : '',
      account.note ? `Note: ${account.note}` : ''
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(details);
      // You could add a toast notification here if needed
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Get unique categories
  const categories = Array.from(new Set(accounts.map(account => account.category))).filter(Boolean);
  
  // Filter accounts by category
  const filteredAccounts = selectedCategory === 'all' 
    ? accounts 
    : accounts.filter(account => account.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MarketFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your marketing plans, notes, and digital accounts</p>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-medium group ${
              activeSection === 'diagrams' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setActiveSection(activeSection === 'diagrams' ? null : 'diagrams')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Marketing Plans</h3>
                <p className="text-sm text-muted-foreground">{diagrams.length} diagrams</p>
              </div>
            </div>
          </Card>

          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-medium group ${
              activeSection === 'notes' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setActiveSection(activeSection === 'notes' ? null : 'notes')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Notes</h3>
                <p className="text-sm text-muted-foreground">{notes.length} notes</p>
              </div>
            </div>
          </Card>

          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-medium group ${
              activeSection === 'accounts' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setActiveSection(activeSection === 'accounts' ? null : 'accounts')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Digital Accounts</h3>
                <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Marketing Plans Section */}
        {activeSection === 'diagrams' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Marketing Plans</h2>
                <p className="text-muted-foreground">Create and manage your visual marketing strategies</p>
              </div>
              <Link to="/builder">
                <Button size="lg" className="shrink-0">
                  <Plus className="w-5 h-5 mr-2" />
                  New Plan
                </Button>
              </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search marketing plans..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Card */}
              <Link to="/builder">
                <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Create New Plan</h3>
                      <p className="text-muted-foreground text-sm">Start mapping your marketing strategy</p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Loading State */}
              {loading && (
                <div className="col-span-full flex justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Loading diagrams...</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredDiagrams.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="space-y-4">
                    <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No diagrams found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Try adjusting your search term' : 'Create your first marketing diagram to get started'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Projects */}
              {!loading && filteredDiagrams.map((diagram) => (
                <Card key={diagram.id} className="p-6 hover:shadow-medium transition-shadow group relative">
                  {/* Hide Button - positioned absolute with z-index */}
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteDiagram(diagram.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Clickable content area */}
                  <Link to={`/builder/${diagram.id}`} className="block">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1 pr-10">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {diagram.title}
                          </h3>
                          {diagram.description && (
                            <p className="text-sm text-muted-foreground">{diagram.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {getPreview(diagram.nodes)}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(diagram.updated_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {activeSection === 'notes' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">My Notes</h2>
                <p className="text-muted-foreground">Keep track of your marketing plans and ideas</p>
              </div>
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={handleNewNote}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
                    <DialogDescription>
                      {editingNote ? 'Update your note' : 'Add a new note to keep track of your marketing plans'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="note-title" className="text-sm font-medium">Title</label>
                      <Input
                        id="note-title"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Enter note title..."
                      />
                    </div>
                    <div>
                      <label htmlFor="note-content" className="text-sm font-medium">Content</label>
                      <Textarea
                        id="note-content"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Write your note content here..."
                        rows={6}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNote}>
                      {editingNote ? 'Update Note' : 'Save Note'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Notes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Loading State */}
              {notesLoading && (
                <div className="col-span-full flex justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Loading notes...</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!notesLoading && notes.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="space-y-4">
                    <StickyNote className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No notes yet</h3>
                      <p className="text-muted-foreground">Create your first note to start organizing your ideas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {!notesLoading && notes.map((note) => (
                <Card key={note.id} className="p-6 hover:shadow-medium transition-shadow group relative">
                  {/* Edit Button */}
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleEditNote(note)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => deleteNote(note.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="pr-10">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                      {note.content && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          {note.content}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(note.updated_at)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Digital Accounts Section */}
        {activeSection === 'accounts' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Digital Accounts</h2>
                <p className="text-muted-foreground">Securely manage your account credentials</p>
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span>All sensitive data is encrypted using AES-256 encryption before storage. Your encryption key is unique to your session and is cleared when you log out.</span>
                  </div>
                </div>
              </div>
              <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={handleNewAccount}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingAccount ? 'Edit Account' : 'Create New Account'}</DialogTitle>
                    <DialogDescription>
                      {editingAccount ? 'Update account information' : 'Add a new digital account with secure encryption'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="product-name" className="text-sm font-medium">Product/Service Name *</label>
                      <Input
                        id="product-name"
                        value={accountForm.product_name}
                        onChange={(e) => setAccountForm({...accountForm, product_name: e.target.value})}
                        placeholder="e.g. Netflix, Spotify, Gmail"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="text-sm font-medium">Category *</label>
                      <Input
                        id="category"
                        value={accountForm.category}
                        onChange={(e) => setAccountForm({...accountForm, category: e.target.value})}
                        placeholder="e.g. Streaming, Music, Email"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input
                        id="email"
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
                        placeholder="account@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="text-sm font-medium">Password</label>
                      <Input
                        id="password"
                        type="password"
                        value={accountForm.password}
                        onChange={(e) => setAccountForm({...accountForm, password: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label htmlFor="customer-name" className="text-sm font-medium">Customer Name</label>
                      <Input
                        id="customer-name"
                        value={accountForm.customer_name}
                        onChange={(e) => setAccountForm({...accountForm, customer_name: e.target.value})}
                        placeholder="Account holder name"
                      />
                    </div>
                    <div>
                      <label htmlFor="order-date" className="text-sm font-medium">Order/Creation Date</label>
                      <Input
                        id="order-date"
                        type="date"
                        value={accountForm.order_date}
                        onChange={(e) => setAccountForm({...accountForm, order_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="note" className="text-sm font-medium">Notes</label>
                      <Textarea
                        id="note"
                        value={accountForm.note}
                        onChange={(e) => setAccountForm({...accountForm, note: e.target.value})}
                        placeholder="Additional notes about this account..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAccount}>
                      {editingAccount ? 'Update Account' : 'Save Account'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filter by category:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({accounts.length})</SelectItem>
                  {categories.map((category) => {
                    const count = accounts.filter(account => account.category === category).length;
                    return (
                      <SelectItem key={category} value={category}>
                        {category} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Accounts Table */}
            <div className="space-y-4">
              {/* Loading State */}
              {accountsLoading && (
                <div className="flex justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Loading accounts...</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!accountsLoading && filteredAccounts.length === 0 && (
                <div className="text-center py-12">
                  <div className="space-y-4">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No accounts yet</h3>
                      <p className="text-muted-foreground">Create your first digital account to start organizing your credentials</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Accounts Table */}
              {!accountsLoading && filteredAccounts.length > 0 && (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Buyer/Seller Name</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => (
                        <TableRow key={account.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm">
                            {account.order_date ? new Date(account.order_date).toLocaleDateString() : formatDate(account.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{account.product_name}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {account.category}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {account.email || '-'}
                          </TableCell>
                          <TableCell>
                            {account.password ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">
                                  {showPassword[account.id] ? account.password : '••••••••'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => togglePasswordVisibility(account.id)}
                                >
                                  {showPassword[account.id] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {account.customer_name || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs">
                            {account.note ? (
                              <span className="line-clamp-2">{account.note}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-secondary hover:text-secondary-foreground"
                                onClick={() => copyAccountDetails(account)}
                                title="Copy email, password and note"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleEditAccount(account)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => deleteAccount(account.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
