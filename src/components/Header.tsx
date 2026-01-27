import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, ChevronDown, User, Heart, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartSidebar } from './CartSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

const Header = () => {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: 'Categorias', href: '/', hasDropdown: true },
    { name: 'Ofertas', href: '/' },
    { name: 'Cupons', href: '/' },
    { name: 'Contato', href: '/' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-foreground text-background text-xs py-2">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Bem-vindo à Tecnoiso - Instrumentos de Medição e Calibração</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-accent transition-colors">Central de Ajuda</Link>
            <span className="hidden md:inline text-background/40">|</span>
            <Link to="/" className="hidden md:flex items-center gap-1 hover:text-accent transition-colors">
              <MapPin className="w-3 h-3" />
              Rastrear Pedido
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center gap-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger className="md:hidden">
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-foreground hover:text-accent py-2 border-b border-border"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="Tecnoiso" className="h-10" />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="flex border border-border rounded-md overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none bg-background"
                />
                <button className="px-5 bg-foreground text-background hover:bg-foreground/90 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 ml-auto">
              <Link to="/" className="hidden lg:flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors">
                <User className="w-5 h-5" />
                <span>Entrar</span>
              </Link>
              <Link to="/" className="hidden lg:block">
                <Heart className="w-5 h-5 text-foreground hover:text-accent transition-colors" />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2"
              >
                <ShoppingCart className="w-6 h-6 text-foreground" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 mt-4 pt-4 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-foreground hover:text-accent flex items-center gap-1 transition-colors"
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
              </Link>
            ))}
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <MapPin className="w-4 h-4" />
              <span>Enviar para</span>
              <button className="text-accent font-medium hover:underline">Informe seu CEP</button>
            </div>
          </nav>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex border border-border rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 text-sm focus:outline-none bg-background"
            />
            <button className="px-4 bg-foreground text-background">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Carrinho</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CartSidebar />
          </div>
          <div className="mt-6">
            <Link to="/carrinho" onClick={() => setIsCartOpen(false)}>
              <button className="w-full bg-accent text-accent-foreground py-3 rounded font-semibold hover:bg-accent/90 transition-colors">
                Finalizar compra
              </button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
