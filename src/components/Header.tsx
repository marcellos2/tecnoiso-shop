import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, Phone, User } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-foreground text-background text-sm py-2">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>(47) 3438-3175</span>
          </div>
          <span className="hidden md:block">Metrologia e Calibração com Excelência</span>
          <span className="text-primary font-medium">Frete Grátis acima de R$ 500</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="nav-link text-lg">Início</Link>
                <Link to="/produtos" className="nav-link text-lg">Produtos</Link>
                <Link to="/servicos" className="nav-link text-lg">Serviços</Link>
                <Link to="/sobre" className="nav-link text-lg">Sobre</Link>
                <Link to="/contato" className="nav-link text-lg">Contato</Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Tecnoiso" className="h-10 md:h-12" />
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <Input
              type="text"
              placeholder="Buscar produtos, serviços..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pr-12"
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="nav-link">Início</Link>
            <Link to="/produtos" className="nav-link">Produtos</Link>
            <Link to="/servicos" className="nav-link">Serviços</Link>
            <Link to="/contato" className="nav-link">Contato</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>
            <Link to="/carrinho">
              <Button variant="ghost" size="icon" className="relative">
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
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pr-12"
          />
          <Button 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
