import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, ChevronDown, User, Heart, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartSidebar } from './CartSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

const Header = () => {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  // Check if we're on a product page
  const isProductPage = location.pathname.startsWith('/produto/');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Categorias', href: '/', hasDropdown: true },
    { name: 'Ofertas', href: '/' },
    { name: 'Cupons', href: '/' },
    { name: 'Contato', href: '/' },
  ];

  return (
    <>
      {/* Header Fixo no Topo */}
      <div className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${isProductPage ? 'bg-white shadow-md' : (isScrolled ? 'bg-white shadow-md' : 'bg-transparent')}`}>
        <div className="container">
          {/* Linha Principal */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Mobile Menu + Logo + Localização */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger className="md:hidden p-2 hover:bg-gray-100 rounded transition-colors">
                  <Menu className="w-5 h-5" />
                </SheetTrigger>
                <SheetContent side="left" className="bg-background">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="text-foreground hover:text-accent py-2 border-b border-border transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      <Link to="/" className="block py-2 hover:text-accent transition-colors">
                        Entrar
                      </Link>
                      <Link to="/" className="block py-2 hover:text-accent transition-colors">
                        Central de Ajuda
                      </Link>
                      <Link to="/" className="block py-2 hover:text-accent transition-colors">
                        Rastrear Pedido
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <img src={logo} alt="Tecnoiso" className="h-8 md:h-10" />
              </Link>

              {/* Localização - Desktop */}
              <button className="hidden md:flex items-center gap-1 text-xs hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                <MapPin size={14} className="text-gray-600" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-600 leading-none">Enviar para</p>
                  <p className="text-xs font-semibold text-gray-800 leading-none">Informe o CEP</p>
                </div>
              </button>
            </div>

            {/* Barra de Busca - Desktop */}
            <div className="hidden md:block flex-1 max-w-[600px]">
              <div className="flex rounded-sm shadow-sm overflow-hidden bg-white">
                <input
                  type="text"
                  placeholder="Buscar produtos, marcas e muito mais..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
                />
                <button className="px-4 bg-white hover:bg-gray-50 transition-colors border-l border-gray-200">
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Banner Promocional - Desktop */}
            <div className="hidden xl:flex items-center gap-3">
              <img 
                src="https://http2.mlstatic.com/D_NQ_827675-MLA79361834945_092024-OO.webp" 
                alt="Disney+" 
                className="h-8 rounded"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <div className="text-xs">
                <p className="font-semibold text-gray-800"></p>
              </div>
            </div>

            {/* Ações do Usuário */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Links - Desktop */}
              <div className="hidden lg:flex items-center gap-4 text-xs text-gray-800">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Crie a sua conta
                </Link>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Entre
                </Link>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Compras
                </Link>
              </div>

              {/* Carrinho */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Menu de Navegação - Desktop */}
          <nav className="hidden md:flex items-center gap-6 pb-3 text-sm text-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
              </Link>
            ))}
            
            {/* Items extras do ML */}
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Supermercado
            </Link>
            <Link to="/" className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full hover:shadow-lg transition-all text-xs font-medium">
              <span>Mercado Play</span>
            </Link>
            
            <div className="flex items-center gap-4 ml-auto text-xs text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Contato
              </Link>
            </div>
          </nav>
        </div>

        {/* Barra de Busca Mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex rounded-sm shadow-sm overflow-hidden bg-white">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
            />
            <button className="px-3 bg-white border-l border-gray-200">
              <Search className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md bg-background">
          <SheetHeader>
            <SheetTitle>Carrinho</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CartSidebar />
          </div>
          <div className="mt-6">
            <Link to="/carrinho" onClick={() => setIsCartOpen(false)}>
              <button className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-600 transition-colors">
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