import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Infinity } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free Plan",
      price: "৳0",
      duration: "30 days free",
      description: "Perfect for trying out MarketFlow",
      icon: <Star className="h-6 w-6" />,
      features: [
        "30 days full access",
        "Create unlimited diagrams",
        "Manage accounts & costs",
        "Take notes",
        "Export diagrams",
        "After 30 days: View-only access"
      ],
      limitations: ["No editing after 30 days", "No adding new data after trial"],
      buttonText: "Start Free Trial",
      popular: false,
      badge: "Free Trial"
    },
    {
      name: "1 Month",
      price: "৳99",
      duration: "/month",
      description: "Great for short-term projects",
      icon: <Check className="h-6 w-6" />,
      features: [
        "Full access to all features",
        "Unlimited diagrams & accounts",
        "Advanced cost tracking",
        "Smart templates",
        "Export & share capabilities",
        "Priority support"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "6 Months",
      price: "৳499",
      duration: "/6 months",
      description: "Best value for growing businesses",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Everything in 1 Month plan",
        "Advanced analytics",
        "Custom color categories",
        "Bulk import/export",
        "Premium templates",
        "Advanced reporting",
        "Email support"
      ],
      buttonText: "Choose 6 Months",
      popular: true,
      badge: "Most Popular",
      savings: "Save ৳95"
    },
    {
      name: "1 Year",
      price: "৳899",
      duration: "/year",
      description: "Perfect for established businesses",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Everything in 6 Months plan",
        "Advanced automation",
        "API access",
        "Custom integrations",
        "Priority email & chat support",
        "Monthly strategy calls",
        "Advanced security features"
      ],
      buttonText: "Choose 1 Year",
      popular: false,
      savings: "Save ৳289"
    },
    {
      name: "Lifetime",
      price: "৳1999",
      duration: "one-time",
      description: "Complete solution for life",
      icon: <Infinity className="h-6 w-6" />,
      features: [
        "Everything in 1 Year plan",
        "Lifetime access to all features",
        "Future feature updates included",
        "VIP support",
        "Personal account manager",
        "Custom training sessions",
        "White-label options",
        "No recurring payments"
      ],
      buttonText: "Get Lifetime Access",
      popular: false,
      badge: "Best Value",
      savings: "Save ৳2000+"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">MarketFlow</span>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 text-center">
        <div className="container">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with a free trial and upgrade when you're ready to unlock the full power of MarketFlow
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary scale-105' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant={plan.popular ? "default" : "secondary"}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4 text-primary">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.duration}
                    </span>
                  </div>
                  {plan.savings && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {plan.savings}
                    </Badge>
                  )}
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations && (
                    <div className="pt-2 border-t">
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-start space-x-2 text-muted-foreground">
                          <span className="text-sm">• {limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose MarketFlow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Powerful Diagram Builder</h3>
              <p className="text-muted-foreground">
                Create stunning marketing flowcharts with our intuitive drag-and-drop interface
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Smart Cost Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your expenses and earnings with detailed monthly analytics
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Account Management</h3>
              <p className="text-muted-foreground">
                Organize your customer accounts and track important business relationships
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2024 MarketFlow. Streamline your marketing workflow.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;