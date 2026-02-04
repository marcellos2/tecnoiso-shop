import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminRequests } from '@/components/admin/AdminRequests';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { Loader2, LayoutDashboard, Package, ShoppingCart, MessageSquare, Settings, LogOut, Store, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', title: 'Produtos', icon: Package },
  { id: 'orders', title: 'Pedidos', icon: ShoppingCart },
  { id: 'requests', title: 'Solicitações', icon: MessageSquare },
  { id: 'settings', title: 'Configurações', icon: Settings },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [loading, user, isAdmin, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-foreground" />
          <p className="text-muted-foreground font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'requests':
        return <AdminRequests />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'products': return 'Gerenciar Produtos';
      case 'orders': return 'Pedidos';
      case 'requests': return 'Solicitações de Clientes';
      case 'settings': return 'Configurações';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header - Estilo Mercado Livre */}
      <header className="bg-accent sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Mobile Menu + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger className="lg:hidden p-2 hover:bg-white/10 rounded transition-colors">
                  <Menu className="w-5 h-5 text-foreground" />
                </SheetTrigger>
                <SheetContent side="left" className="bg-background w-72">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <img src={logo} alt="Tecnoiso" className="h-8" />
                      <span>Admin</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left w-full
                          ${activeTab === item.id 
                            ? 'bg-foreground text-background font-semibold' 
                            : 'text-foreground hover:bg-secondary'
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.title}
                      </button>
                    ))}
                    <div className="border-t border-border my-4" />
                    <Link
                      to="/"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors"
                    >
                      <Store className="h-5 w-5" />
                      Ir para a Loja
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      Sair da Conta
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <img src={logo} alt="Tecnoiso" className="h-8 md:h-10" />
              </Link>

              {/* Título Admin */}
              <div className="hidden md:block">
                <span className="text-foreground font-bold text-lg">Painel Administrativo</span>
              </div>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium
                    ${activeTab === item.id 
                      ? 'bg-foreground text-background' 
                      : 'text-foreground hover:bg-white/10'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                to="/"
                className="hidden md:flex items-center gap-2 text-sm text-foreground hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                <Store className="h-4 w-4" />
                <span className="hidden lg:inline">Ir para a Loja</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-foreground hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-background border-b border-border">
        <div className="container py-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todos os aspectos da sua loja
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Admin;
