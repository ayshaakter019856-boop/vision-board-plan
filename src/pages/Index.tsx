import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Palette, Share, Target } from "lucide-react";
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
              <Target className="w-5 h-5 text-white" />
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
                  Plan Your Marketing
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Visually</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create beautiful marketing diagrams with drag-and-drop simplicity. 
                  Map out strategies, track campaigns, and collaborate with your team.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    Start Planning
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    View Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>No credit card</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Marketing diagram visualization" 
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
            <h2 className="text-4xl font-bold">Everything you need to plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful diagramming tools designed specifically for marketing teams
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-sales/10 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-sales" />
              </div>
              <h3 className="text-lg font-semibold">Drag & Drop</h3>
              <p className="text-muted-foreground text-sm">
                Intuitive interface to build complex marketing flows in minutes
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-branding/10 rounded-xl flex items-center justify-center mx-auto">
                <Palette className="w-6 h-6 text-branding" />
              </div>
              <h3 className="text-lg font-semibold">Color Categories</h3>
              <p className="text-muted-foreground text-sm">
                Organize strategies with color-coded categories for clarity
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-ads/10 rounded-xl flex items-center justify-center mx-auto">
                <Share className="w-6 h-6 text-ads" />
              </div>
              <h3 className="text-lg font-semibold">Export & Share</h3>
              <p className="text-muted-foreground text-sm">
                Export diagrams as PNG/PDF and share with stakeholders
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-retention/10 rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-retention" />
              </div>
              <h3 className="text-lg font-semibold">Smart Templates</h3>
              <p className="text-muted-foreground text-sm">
                Pre-built templates for common marketing scenarios
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">Ready to visualize your marketing?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of marketers who plan better with visual diagrams
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MarketFlow. Built for marketing teams.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
