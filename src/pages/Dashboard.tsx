import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, FolderOpen, Calendar, X, User, Edit, StickyNote } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDiagrams } from "@/hooks/useDiagrams";
import { useNotes } from "@/hooks/useNotes";
import { useAccounts } from "@/hooks/useAccounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            <h1 className="text-3xl font-bold mb-2">Marketing Plans</h1>
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
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search marketing plans..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">All Categories</Button>
            <Button variant="outline" size="sm">Recent</Button>
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
                    handleHideDiagram(diagram.id);
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

        {/* Quick Actions */}
        <div className="mt-12 p-6 bg-gradient-secondary rounded-2xl">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Quick Start Templates</h2>
            <p className="text-muted-foreground">Jump-start your planning with pre-built templates</p>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <div className="w-8 h-8 bg-sales/10 rounded-lg flex items-center justify-center">
                  <span className="text-sales text-sm font-bold">S</span>
                </div>
                <span>Sales Funnel</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <div className="w-8 h-8 bg-branding/10 rounded-lg flex items-center justify-center">
                  <span className="text-branding text-sm font-bold">B</span>
                </div>
                <span>Brand Strategy</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <div className="w-8 h-8 bg-ads/10 rounded-lg flex items-center justify-center">
                  <span className="text-ads text-sm font-bold">A</span>
                </div>
                <span>Ad Campaign</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
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

                <div className="space-y-4 pr-16">
                  <h3 className="font-semibold text-lg line-clamp-2">{note.title}</h3>
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(note.updated_at)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Accounts Section */}
        <div className="mt-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Digital Product Accounts</h2>
              <p className="text-muted-foreground">Manage your digital product customer accounts</p>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={handleNewAccount}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingAccount ? 'Edit Account' : 'Create New Account'}</DialogTitle>
                    <DialogDescription>
                      {editingAccount ? 'Update account information' : 'Add a new digital product account'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Product Name *</label>
                      <Input
                        value={accountForm.product_name}
                        onChange={(e) => setAccountForm(prev => ({...prev, product_name: e.target.value}))}
                        placeholder="Enter product name..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category *</label>
                      <Input
                        value={accountForm.category}
                        onChange={(e) => setAccountForm(prev => ({...prev, category: e.target.value}))}
                        placeholder="Enter category..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm(prev => ({...prev, email: e.target.value}))}
                        placeholder="Enter email..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={accountForm.password}
                        onChange={(e) => setAccountForm(prev => ({...prev, password: e.target.value}))}
                        placeholder="Enter password..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Customer Name</label>
                      <Input
                        value={accountForm.customer_name}
                        onChange={(e) => setAccountForm(prev => ({...prev, customer_name: e.target.value}))}
                        placeholder="Enter customer name..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Order Date</label>
                      <Input
                        type="date"
                        value={accountForm.order_date}
                        onChange={(e) => setAccountForm(prev => ({...prev, order_date: e.target.value}))}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium">Note</label>
                      <Textarea
                        value={accountForm.note}
                        onChange={(e) => setAccountForm(prev => ({...prev, note: e.target.value}))}
                        placeholder="Additional notes..."
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
          </div>

          {/* Accounts Grid */}
          <div className="grid gap-4">
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
                    <p className="text-muted-foreground">
                      {selectedCategory === 'all' 
                        ? 'Create your first account to start managing your digital products'
                        : `No accounts found in "${selectedCategory}" category`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Table */}
            {!accountsLoading && filteredAccounts.length > 0 && (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Product</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Password</th>
                        <th className="text-left p-4 font-medium">Customer</th>
                        <th className="text-left p-4 font-medium">Order Date</th>
                        <th className="text-left p-4 font-medium">Note</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map((account) => (
                        <tr key={account.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{account.product_name}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                              {account.category}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{account.email}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">
                                {showPassword[account.id] ? account.password : '••••••••'}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => togglePasswordVisibility(account.id)}
                              >
                                {showPassword[account.id] ? 
                                  <EyeOff className="w-3 h-3" /> : 
                                  <Eye className="w-3 h-3" />
                                }
                              </Button>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{account.customer_name || '-'}</td>
                          <td className="p-4 text-sm">
                            {account.order_date ? new Date(account.order_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-sm max-w-32 truncate" title={account.note}>
                            {account.note || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
