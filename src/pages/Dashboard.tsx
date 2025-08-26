import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, FolderOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const mockProjects = [
    {
      id: 1,
      title: "Q1 Campaign Strategy",
      category: "Sales",
      lastModified: "2 hours ago",
      preview: "Target Audience → Ad Budget → Social Media..."
    },
    {
      id: 2,
      title: "Brand Awareness Flow",
      category: "Branding",
      lastModified: "1 day ago",
      preview: "Brand Identity → Content Strategy → Channels..."
    },
    {
      id: 3,
      title: "Customer Retention Map",
      category: "Retention",
      lastModified: "3 days ago",
      preview: "Onboarding → Engagement → Loyalty Program..."
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      Sales: "bg-sales/10 text-sales border-sales/20",
      Branding: "bg-branding/10 text-branding border-branding/20",
      Retention: "bg-retention/10 text-retention border-retention/20",
      Ads: "bg-ads/10 text-ads border-ads/20",
      Analytics: "bg-analytics/10 text-analytics border-analytics/20"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
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
            <Button variant="ghost" size="sm">Profile</Button>
            <Button variant="outline" size="sm">Sign Out</Button>
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

          {/* Existing Projects */}
          {mockProjects.map((project) => (
            <Link key={project.id} to="/builder">
              <Card className="p-6 hover:shadow-medium transition-shadow cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <div className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(project.category)}`}>
                        {project.category}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.preview}
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
                    <Calendar className="w-3 h-3 mr-1" />
                    {project.lastModified}
                  </div>
                </div>
              </Card>
            </Link>
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
