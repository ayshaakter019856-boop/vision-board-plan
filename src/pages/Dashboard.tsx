import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, FolderOpen, Calendar, X, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDiagrams } from "@/hooks/useDiagrams";
import { useState } from "react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { diagrams, loading, deleteDiagram } = useDiagrams();
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenDiagrams, setHiddenDiagrams] = useState<Set<string>>(new Set());

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
      </div>
    </div>
  );
};

export default Dashboard;
