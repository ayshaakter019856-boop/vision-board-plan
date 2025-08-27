import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, FolderOpen, Calendar, X, User, Edit, StickyNote, Workflow, FileText, Shield, Copy, DollarSign, TrendingUp, TrendingDown, Eye, EyeOff, Check, Folder, Clock, AlertTriangle, Download } from "lucide-react";
import Papa from 'papaparse';
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDiagrams } from "@/hooks/useDiagrams";
import { useNotes } from "@/hooks/useNotes";
import { useAccounts } from "@/hooks/useAccounts";
import { CSVUpload } from "@/components/CSVUpload";
import { useCosts } from "@/hooks/useCosts";
import { useProfile } from "@/hooks/useProfile";
import { useRoles } from "@/hooks/useRoles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { diagrams, loading, deleteDiagram } = useDiagrams();
  const { notes, loading: notesLoading, saveNote, completeNote, deleteNote, fetchNotes } = useNotes();
  const { accounts, loading: accountsLoading, createAccount, updateAccount, deleteAccount, bulkCreateAccounts } = useAccounts();
  const { costs, loading: costsLoading, saveCost, deleteCost } = useCosts();
  const { profile } = useProfile();
  const { isAdmin } = useRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenDiagrams, setHiddenDiagrams] = useState<Set<string>>(new Set());
  
  // Notes state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  
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
  const [selectedFolder, setSelectedFolder] = useState('active'); // active, expired, problem
  const [accountToDelete, setAccountToDelete] = useState<{id: string, name: string} | null>(null);
  
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

  const handleCompleteNote = (note: any) => {
    completeNote(note.id);
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
      month_name: new Date().toLocaleString('default', { month: 'long' }),
      date: new Date().toISOString().split('T')[0],
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
  
  // Filter accounts by category and folder status
  const filteredAccounts = accounts.filter(account => {
    const matchesCategory = selectedCategory === 'all' || account.category === selectedCategory;
    const matchesFolder = account.status === selectedFolder || !account.status; // handle legacy accounts without status
    return matchesCategory && matchesFolder;
  });

  // Function to move account to expired folder
  const moveToExpired = async (accountId: string) => {
    try {
      await updateAccount(accountId, { status: 'expired' });
      toast({
        title: "Success",
        description: "Account moved to Expired folder",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move account to expired folder",
        variant: "destructive",
      });
    }
  };

  // Function to move account to problem folder
  const moveToProblem = async (accountId: string) => {
    try {
      await updateAccount(accountId, { status: 'problem' });
      toast({
        title: "Success",
        description: "Account moved to Problem folder",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move account to problem folder",
        variant: "destructive",
      });
    }
  };

  // Function to move account back to active folder (solved)
  const moveToActive = async (accountId: string) => {
    try {
      await updateAccount(accountId, { status: 'active' });
      toast({
        title: "Success",
        description: "Account moved back to Active folder",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move account to active folder",
        variant: "destructive",
      });
    }
  };

  // Function to export all accounts as CSV
  const exportAllAccounts = () => {
    try {
      const csvData = accounts.map(account => ({
        'Product Name': account.product_name,
        'Email': account.email,
        'Password': account.password,
        'Customer Name': account.customer_name || '',
        'Category': account.category,
        'Order Date': account.order_date || '',
        'Note': account.note || '',
        'Status': account.status,
        'Created At': new Date(account.created_at).toLocaleDateString(),
        'Updated At': new Date(account.updated_at).toLocaleDateString()
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `accounts_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Success",
        description: `Exported ${accounts.length} accounts to CSV`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export accounts",
        variant: "destructive",
      });
    }
  };

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
            {isAdmin && (
              <Badge variant="default" className="text-xs">
                Admin Access
              </Badge>
            )}
            
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading your marketing plans...</p>
                  </div>
                </div>
              )}

              {/* Existing Diagrams */}
              {!loading && filteredDiagrams.map((diagram) => (
                <Card key={diagram.id} className="p-6 hover:shadow-medium transition-all group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {diagram.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getPreview(diagram.nodes)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(diagram.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleHideDiagram(diagram.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/builder/${diagram.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteDiagram(diagram.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Empty State */}
              {!loading && filteredDiagrams.length === 0 && searchTerm && (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No plans found</h3>
                  <p className="text-muted-foreground">Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {activeSection === 'notes' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Notes</h2>
                <p className="text-muted-foreground">Keep track of your thoughts and ideas</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" onClick={() => {
                  const newShowCompleted = !showCompleted;
                  setShowCompleted(newShowCompleted);
                  fetchNotes(newShowCompleted);
                }}>
                  <Folder className="w-5 h-5 mr-2" />
                  {showCompleted ? 'Pending' : 'Completed'}
                </Button>
                <Button onClick={handleNewNote} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  New Note
                </Button>
              </div>
            </div>

            {/* Notes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showCompleted ? false : notesLoading) && (
                <div className="col-span-full flex justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading your notes...</p>
                  </div>
                </div>
              )}

              {!notesLoading && notes.filter(note => showCompleted ? note.completed : !note.completed).map((note) => (
                <Card key={note.id} className="p-6 hover:shadow-medium transition-all group">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {note.content || 'No content'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(note.updated_at)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!note.completed ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteNote(note)}
                            className="text-green-600 hover:text-green-700"
                            title="Mark as completed"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Completed
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete note"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}


              {!notesLoading && notes.filter(note => showCompleted ? note.completed : !note.completed).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                    <StickyNote className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {showCompleted ? 'No completed notes' : 'No notes yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {showCompleted ? 'Completed notes will appear here' : 'Create your first note to get started'}
                  </p>
                  {!showCompleted && (
                    <Button onClick={handleNewNote}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Note
                    </Button>
                  )}
                </div>
              )}

            </div>

            {/* Note Dialog */}
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
                  <DialogDescription>
                    {editingNote ? 'Update your note content' : 'Add a new note to your collection'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Enter note title..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Enter note content..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote}>
                    {editingNote ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Accounts Section */}
        {activeSection === 'accounts' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Digital Accounts</h2>
                <p className="text-muted-foreground">Manage your digital service accounts and credentials</p>
              </div>
              <div className="flex gap-3">
                <CSVUpload onUpload={bulkCreateAccounts} />
                <Button 
                  onClick={exportAllAccounts} 
                  variant="outline" 
                  size="lg"
                  disabled={accounts.length === 0}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export All
                </Button>
                <Button onClick={handleNewAccount} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  New Account
                </Button>
              </div>
            </div>

            {/* Folder Navigation */}
            <div className="flex gap-2 items-center mb-4">
              <label className="text-sm font-medium">Folders:</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedFolder === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFolder('active')}
                  className="flex items-center gap-2"
                >
                  <Folder className="w-4 h-4" />
                  Active ({accounts.filter(a => (a.status || 'active') === 'active').length})
                </Button>
                <Button
                  variant={selectedFolder === 'expired' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFolder('expired')}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Expired ({accounts.filter(a => a.status === 'expired').length})
                </Button>
                <Button
                  variant={selectedFolder === 'problem' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFolder('problem')}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Problem ({accounts.filter(a => a.status === 'problem').length})
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Filter by category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Accounts Table */}
            <Card>
              <CardHeader>
                <CardTitle>Account List</CardTitle>
                <CardDescription>
                  Your saved digital accounts and login credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Loading accounts...</p>
                    </div>
                  </div>
                ) : filteredAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No accounts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedCategory === 'all' 
                        ? 'Create your first account to get started'
                        : `No accounts in the "${selectedCategory}" category`
                      }
                    </p>
                    <Button onClick={handleNewAccount}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </Button>
                  </div>
                ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product/Service</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Password</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Expired Date</TableHead>
                          <TableHead>Remain Days</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">
                            {account.product_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{account.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{account.email || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm">
                                {account.password ? (
                                  showPassword[account.id] 
                                    ? account.password 
                                    : '••••••••'
                                ) : '-'}
                              </span>
                              {account.password && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(account.id)}
                                >
                                  {showPassword[account.id] ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{account.customer_name || '-'}</TableCell>
                          <TableCell>
                            {account.order_date ? (
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(account.order_date).toLocaleDateString()}
                                </span>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {account.order_date ? (
                              (() => {
                                const expiredDate = new Date(account.order_date);
                                const currentDate = new Date();
                                const diffTime = expiredDate.getTime() - currentDate.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                return (
                                  <span className={`text-sm font-medium ${
                                    diffDays < 0 ? 'text-red-600' : 
                                    diffDays <= 7 ? 'text-yellow-600' : 
                                    'text-green-600'
                                  }`}>
                                    {diffDays < 0 ? `Expired ${Math.abs(diffDays)} days ago` : 
                                     diffDays === 0 ? 'Expires today' :
                                     `${diffDays} days remaining`}
                                  </span>
                                );
                              })()
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyAccountDetails(account)}
                                title="Copy account details"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAccount(account)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {selectedFolder === 'active' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveToExpired(account.id)}
                                    className="text-orange-600 hover:text-orange-700"
                                    title="Move to Expired folder"
                                  >
                                    <Clock className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveToProblem(account.id)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Move to Problem folder"
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {(selectedFolder === 'expired' || selectedFolder === 'problem') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveToActive(account.id)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Mark as solved - Move back to Active"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the account for "{account.product_name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteAccount(account.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Yes, Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Account Dialog */}
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                  <DialogDescription>
                    {editingAccount ? 'Update account information' : 'Add a new digital service account'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Product/Service Name *</label>
                    <Input
                      value={accountForm.product_name}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, product_name: e.target.value }))}
                      placeholder="e.g., Netflix, Spotify, Adobe..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <Input
                      value={accountForm.category}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Streaming, Design, Productivity..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="account@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={accountForm.password}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Customer Name</label>
                    <Input
                      value={accountForm.customer_name}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expired Date</label>
                    <Input
                      type="date"
                      value={accountForm.order_date}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, order_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Note</label>
                    <Textarea
                      value={accountForm.note}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, note: e.target.value }))}
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
                    {editingAccount ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Daily Costing Section */}
        {activeSection === 'costs' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Daily Costing</h2>
                <p className="text-muted-foreground">Track your daily expenses and earnings</p>
              </div>
              <Button onClick={handleAddCost} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Entry
              </Button>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    <span>Monthly Expenses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ৳{totalMonthlyCosting.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedMonthFilter} {currentYear}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Monthly Earnings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ৳{totalMonthlyEarning.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedMonthFilter} {currentYear}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <span>Net Result</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netEarning >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ৳{netEarning.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {netEarning >= 0 ? 'Profit' : 'Loss'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Month Filter */}
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Filter by month:</label>
              <Select value={selectedMonthFilter} onValueChange={setSelectedMonthFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month} {currentYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Costing Table */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Entries</CardTitle>
                <CardDescription>
                  Your daily expense and earning records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {costsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Loading cost entries...</p>
                    </div>
                  </div>
                ) : monthlyData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No entries for {selectedMonthFilter}</h3>
                    <p className="text-muted-foreground mb-4">Start tracking your expenses and earnings</p>
                    <Button onClick={handleAddCost}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((cost) => (
                        <TableRow key={cost.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(cost.date).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={cost.is_earning ? "default" : "secondary"}>
                              {cost.is_earning ? 'Earning' : 'Expense'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {cost.costing_reason}
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${cost.is_earning ? 'text-green-600' : 'text-red-600'}`}>
                              {cost.is_earning ? '+' : '-'}৳{cost.costing_amount.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCost(cost)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCost(cost.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Cost Entry Dialog */}
            <Dialog open={isAddCostDialogOpen} onOpenChange={setIsAddCostDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCost ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
                  <DialogDescription>
                    {editingCost ? 'Update cost entry' : 'Add a new expense or earning entry'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Month *</label>
                    <Select 
                      value={costFormData.month_name} 
                      onValueChange={(value) => setCostFormData(prev => ({ ...prev, month_name: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                      type="date"
                      value={costFormData.date}
                      onChange={(e) => setCostFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type *</label>
                    <Select 
                      value={costFormData.is_earning.toString()} 
                      onValueChange={(value) => setCostFormData(prev => ({ ...prev, is_earning: value === 'true' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Expense</SelectItem>
                        <SelectItem value="true">Earning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason *</label>
                    <Input
                      value={costFormData.costing_reason}
                      onChange={(e) => setCostFormData(prev => ({ ...prev, costing_reason: e.target.value }))}
                      placeholder="e.g., Office supplies, Client payment..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (৳) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={costFormData.costing_amount}
                      onChange={(e) => setCostFormData(prev => ({ ...prev, costing_amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCostDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCostSubmit}>
                    {editingCost ? 'Update' : 'Add Entry'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
