import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, FolderOpen, Calendar, X, User, Edit, StickyNote, Workflow, FileText, Shield, Copy, DollarSign, TrendingUp, TrendingDown, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDiagrams } from "@/hooks/useDiagrams";
import { useNotes } from "@/hooks/useNotes";
import { useAccounts } from "@/hooks/useAccounts";
import { useCosts } from "@/hooks/useCosts";
import { useProfile } from "@/hooks/useProfile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { diagrams, loading, deleteDiagram } = useDiagrams();
  const { notes, loading: notesLoading, saveNote, deleteNote } = useNotes();
  const { accounts, loading: accountsLoading, createAccount, updateAccount, deleteAccount } = useAccounts();
  const { costs, loading: costsLoading, saveCost, deleteCost } = useCosts();
  const { profile, isFreePlan, isPlanExpired, daysLeft } = useProfile();
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
  
  // Daily costing states
  const [isAddCostDialogOpen, setIsAddCostDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>(new Date().toLocaleString('default', { month: 'long' }));
  const [costFormData, setCostFormData] = useState({
    month_name: "",
    date: "",
    costing_reason: "",
    costing_amount: "",
    is_earning: false
  });
  
  // Section visibility state
  const [activeSection, setActiveSection] = useState<'diagrams' | 'notes' | 'accounts' | 'costs' | null>(null);

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

  // Daily costing functions
  const handleAddCost = () => {
    setCostFormData({
      month_name: "",
      date: "",
      costing_reason: "",
      costing_amount: "",
      is_earning: false
    });
    setEditingCost(null);
    setIsAddCostDialogOpen(true);
  };

  const handleEditCost = (cost: any) => {
    setCostFormData({
      month_name: cost.month_name,
      date: cost.date,
      costing_reason: cost.costing_reason,
      costing_amount: cost.costing_amount.toString(),
      is_earning: cost.is_earning
    });
    setEditingCost(cost);
    setIsAddCostDialogOpen(true);
  };

  const handleCostSubmit = async () => {
    if (!costFormData.month_name || !costFormData.date || !costFormData.costing_reason || !costFormData.costing_amount) {
      return;
    }

    await saveCost(
      costFormData.month_name,
      costFormData.date,
      costFormData.costing_reason,
      parseFloat(costFormData.costing_amount),
      costFormData.is_earning,
      editingCost?.id
    );

    setIsAddCostDialogOpen(false);
    setCostFormData({
      month_name: "",
      date: "",
      costing_reason: "",
      costing_amount: "",
      is_earning: false
    });
    setEditingCost(null);
  };

  const handleDeleteCost = async (costId: string) => {
    await deleteCost(costId);
  };

  // Calculate cost totals
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  // Get month number from selected month name for filtering
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const selectedMonthIndex = monthNames.indexOf(selectedMonthFilter);
  
  const monthlyData = (costs || []).filter(cost => {
    const costDate = new Date(cost.date);
    return costDate.getMonth() === selectedMonthIndex && 
           costDate.getFullYear() === currentYear;
  });

  const totalMonthlyCosting = monthlyData
    .filter(cost => !cost.is_earning)
    .reduce((sum, cost) => sum + parseFloat(cost.costing_amount.toString()), 0);
    
  const totalMonthlyEarning = monthlyData
    .filter(cost => cost.is_earning)
    .reduce((sum, cost) => sum + parseFloat(cost.costing_amount.toString()), 0);
    
  const netEarning = totalMonthlyEarning - totalMonthlyCosting;

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
            {/* Current Plan Display */}
            <div className="flex items-center space-x-2 text-sm bg-muted/50 px-3 py-1.5 rounded-lg">
              <Badge variant={isFreePlan ? "secondary" : "default"} className="text-xs">
                {profile?.current_plan || 'Free Plan'}
              </Badge>
              {isFreePlan && !isPlanExpired && (
                <span className="text-muted-foreground">
                  {daysLeft} days left
                </span>
              )}
              {isPlanExpired && (
                <span className="text-destructive text-xs">Expired</span>
              )}
            </div>
            
            <Link to="/pricing">
              <Button variant="outline" size="sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isFreePlan || isPlanExpired ? 'Upgrade Plan' : 'Manage Plan'}
              </Button>
            </Link>
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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

          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-medium group ${
              activeSection === 'costs' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setActiveSection(activeSection === 'costs' ? null : 'costs')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Daily Costing</h3>
                <p className="text-sm text-muted-foreground">{costs.length} entries</p>
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

        {/* Daily Costing Section */}
        {activeSection === 'costs' && (
          <div className="mb-8">
            <Card className="border-border/40 bg-card/30 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Daily Costing
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track your daily expenses and earnings
                  </CardDescription>
                </div>
                <Dialog open={isAddCostDialogOpen} onOpenChange={setIsAddCostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddCost} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cost
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingCost ? "Edit Cost" : "Add New Cost"}</DialogTitle>
                      <DialogDescription>
                        {editingCost ? "Update the cost details." : "Add a new daily cost or earning entry."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="month_name" className="text-right">
                          Month
                        </label>
                        <Select
                          value={costFormData.month_name}
                          onValueChange={(value) => setCostFormData({ ...costFormData, month_name: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50">
                            <SelectItem value="January">January</SelectItem>
                            <SelectItem value="February">February</SelectItem>
                            <SelectItem value="March">March</SelectItem>
                            <SelectItem value="April">April</SelectItem>
                            <SelectItem value="May">May</SelectItem>
                            <SelectItem value="June">June</SelectItem>
                            <SelectItem value="July">July</SelectItem>
                            <SelectItem value="August">August</SelectItem>
                            <SelectItem value="September">September</SelectItem>
                            <SelectItem value="October">October</SelectItem>
                            <SelectItem value="November">November</SelectItem>
                            <SelectItem value="December">December</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="date" className="text-right">
                          Date
                        </label>
                        <Input
                          id="date"
                          type="date"
                          value={costFormData.date}
                          onChange={(e) => setCostFormData({ ...costFormData, date: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="costing_reason" className="text-right">
                          Reason
                        </label>
                        <Input
                          id="costing_reason"
                          value={costFormData.costing_reason}
                          onChange={(e) => setCostFormData({ ...costFormData, costing_reason: e.target.value })}
                          className="col-span-3"
                          placeholder="Grocery shopping"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="costing_amount" className="text-right">
                          Amount
                        </label>
                        <Input
                          id="costing_amount"
                          type="number"
                          step="0.01"
                          value={costFormData.costing_amount}
                          onChange={(e) => setCostFormData({ ...costFormData, costing_amount: e.target.value })}
                          className="col-span-3"
                          placeholder="100.00"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="is_earning" className="text-right">
                          Type
                        </label>
                        <Select
                          value={costFormData.is_earning ? "earning" : "cost"}
                          onValueChange={(value) => setCostFormData({ ...costFormData, is_earning: value === "earning" })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cost">Cost</SelectItem>
                            <SelectItem value="earning">Earning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCostSubmit} className="bg-primary hover:bg-primary/90">
                        {editingCost ? "Update Cost" : "Add Cost"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {/* Monthly Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Filter by Month:</label>
                    <Select
                      value={selectedMonthFilter}
                      onValueChange={setSelectedMonthFilter}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="February">February</SelectItem>
                        <SelectItem value="March">March</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="May">May</SelectItem>
                        <SelectItem value="June">June</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="August">August</SelectItem>
                        <SelectItem value="September">September</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                        <SelectItem value="November">November</SelectItem>
                        <SelectItem value="December">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Monthly Costing</CardTitle>
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">৳{totalMonthlyCosting.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">{selectedMonthFilter} {currentYear}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Monthly Earning</CardTitle>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">৳{totalMonthlyEarning.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">{selectedMonthFilter} {currentYear}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Net Earning</CardTitle>
                      <DollarSign className="h-4 w-4 text-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${netEarning >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        ৳{netEarning.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedMonthFilter} {currentYear}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Costs Table */}
                <div className="border border-border/40 rounded-md bg-card/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Costing Reason</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Costing Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Loading costs...
                          </TableCell>
                        </TableRow>
                      ) : monthlyData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No costs found for {selectedMonthFilter} {currentYear}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        monthlyData.map((cost) => (
                          <TableRow key={cost.id}>
                            <TableCell className="font-medium">{cost.month_name}</TableCell>
                            <TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell>
                            <TableCell>{cost.costing_reason}</TableCell>
                            <TableCell>
                              <Badge variant={cost.is_earning ? "default" : "destructive"}>
                                {cost.is_earning ? "Earning" : "Cost"}
                              </Badge>
                            </TableCell>
                            <TableCell className={cost.is_earning ? "text-primary font-medium" : "text-destructive font-medium"}>
                              ৳{parseFloat(cost.costing_amount.toString()).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => handleEditCost(cost)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleDeleteCost(cost.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
