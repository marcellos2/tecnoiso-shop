import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, ChevronDown, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartSidebar } from './CartSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
      {/* Main Header - Yellow background like ML */}
      <header className="bg-[#ffe600] sticky top-0 z-40">
        <div className="container py-3">
          {/* Top Row */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="Tecnoiso" className="h-10" />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-3xl">
              <div className="flex bg-white rounded shadow-sm">
                <input
                  type="text"
                  placeholder="Buscar produtos, marcas e muito mais..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none rounded-l"
                />
                <button className="px-4 bg-white border-l border-border hover:bg-muted transition-colors rounded-r">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-6 text-foreground text-sm">
              <Link to="/" className="hover:underline">Crie sua conta</Link>
              <Link to="/" className="hover:underline">Entre</Link>
              <Link to="/" className="hover:underline">Compras</Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-foreground text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Location & Nav Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-foreground/80">
              <MapPin className="w-3.5 h-3.5" />
              <span>Informe seu</span>
              <span className="font-medium underline cursor-pointer">CEP</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-0.5"
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
                </Link>
              ))}
            </nav>
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
            <Link to="/cart" onClick={() => setIsCartOpen(false)}>
              <button className="w-full bg-[#3483fa] text-white py-3 rounded font-semibold hover:bg-[#3483fa]/90 transition-colors">
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
