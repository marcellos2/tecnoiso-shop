import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, Phone, User, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";
import { useState } from "react";

export function Header() {
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-sm py-2">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-medium">(47) 3438-3175</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Joinville, SC</span>
            </div>
          </div>
          <span className="font-semibold">🚚 Frete Grátis acima de R$ 500</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center gap-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">Início</Link>
                <Link to="/produtos" className="text-lg font-medium hover:text-primary transition-colors">Produtos</Link>
                <Link to="/categorias" className="text-lg font-medium hover:text-primary transition-colors">Categorias</Link>
                <Link to="/ofertas" className="text-lg font-medium hover:text-primary transition-colors">Ofertas</Link>
                <Link to="/contato" className="text-lg font-medium hover:text-primary transition-colors">Contato</Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Tecnoiso" className="h-10 md:h-12" />
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Input
              type="text"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pr-14"
            />
            <Button 
              size="icon" 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="nav-link">Início</Link>
            <Link to="/produtos" className="nav-link">Produtos</Link>
            <Link to="/categorias" className="nav-link">Categorias</Link>
            <Link to="/ofertas" className="nav-link text-accent font-semibold">Ofertas</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" className="hidden md:flex hover:text-primary">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex hover:text-primary">
              <User className="w-5 h-5" />
            </Button>
            <Link to="/carrinho">
              <Button variant="ghost" size="icon" className="relative hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-4 md:hidden relative">
          <Input
            type="text"
            placeholder="O que você está procurando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pr-12"
          />
          <Button 
            size="icon" 
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
