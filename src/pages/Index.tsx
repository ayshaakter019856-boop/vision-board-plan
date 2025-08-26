import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Workflow, StickyNote, Shield, TrendingUp, Eye, BarChart3, FileText, Lock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MarketFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="default" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  All-in-One Business
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Management Hub</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create visual diagrams, manage notes, secure digital accounts, and track your daily earnings & costs - all in one powerful platform designed for modern businesses.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>30 days free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Business management dashboard visualization" 
                className="w-full h-auto rounded-2xl shadow-large"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Everything your business needs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to streamline your workflow, secure your data, and track your financial performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Visual Diagrams</h3>
              <p className="text-muted-foreground text-sm">
                Create interactive flow diagrams with drag & drop. Perfect for business processes and marketing strategies.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                <StickyNote className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold">Smart Notes</h3>
              <p className="text-muted-foreground text-sm">
                Organize your thoughts and ideas with a powerful note-taking system. Never lose track of important information.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Secure Accounts</h3>
              <p className="text-muted-foreground text-sm">
                Safely store and manage your digital accounts with encrypted password protection and easy access.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Financial Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Monitor daily earnings and costs with detailed analytics. Get insights into your financial performance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Workflow className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Interactive Diagram Builder</h3>
                      <p className="text-muted-foreground">Create flowcharts and process diagrams with ease</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Advanced Note Management</h3>
                      <p className="text-muted-foreground">Rich text editor with search and organization</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Encrypted Account Storage</h3>
                      <p className="text-muted-foreground">Securely store passwords and login credentials</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Financial Analytics</h3>
                      <p className="text-muted-foreground">Track income, expenses and profitability trends</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-secondary rounded-2xl p-8 text-center">
                <Eye className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">See Everything at a Glance</h3>
                <p className="text-muted-foreground mb-6">
                  Get a comprehensive view of your business operations with our integrated dashboard
                </p>
                <Link to="/auth">
                  <Button size="lg" className="w-full">
                    Try It Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">Ready to streamline your business?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who manage their business operations more efficiently with MarketFlow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-12">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-12">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MarketFlow. Complete business management solution.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
