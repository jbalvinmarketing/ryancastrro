import { useState } from "react";
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";

const MerchNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-border/30">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-8">
          <a href="/" className="font-display text-xl font-bold tracking-wider text-foreground uppercase">
            Ryan Castro
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-foreground underline underline-offset-4">
              Home
            </a>
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Merch <ChevronDown className="w-3 h-3" />
            </button>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Accesorios
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-4 py-4 space-y-3">
          <a href="/" className="block text-sm font-medium text-foreground">Home</a>
          <a href="#" className="block text-sm font-medium text-muted-foreground">Merch</a>
          <a href="#" className="block text-sm font-medium text-muted-foreground">Accesorios</a>
        </div>
      )}
    </nav>
  );
};

export default MerchNavbar;
