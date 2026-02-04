import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminRequests } from '@/components/admin/AdminRequests';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { 
  Loader2, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Store, 
  Menu,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral' },
  { id: 'products', title: 'Produtos', icon: Package, description: 'Gerenciar catálogo' },
  { id: 'orders', title: 'Pedidos', icon: ShoppingCart, description: 'Acompanhar vendas' },
  { id: 'requests', title: 'Solicitações', icon: MessageSquare, description: 'Mensagens de clientes' },
  { id: 'settings', title: 'Configurações', icon: Settings, description: 'Ajustes do sistema' },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [loading, user, isAdmin, navigate]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }

      toast({
        title: 'Até logo!',
        description: 'Você saiu da sua conta com sucesso.',
      });

      // Force navigation with page reload to clear all state
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
      
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleGoToStore = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
            <Loader2 className="h-12 w-12 animate-spin text-accent relative" />
          </div>
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
    const item = menuItems.find(m => m.id === activeTab);
    return item?.title || 'Dashboard';
  };

  const getPageDescription = () => {
    const item = menuItems.find(m => m.id === activeTab);
    return item?.description || '';
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header Premium */}
      <header className="bg-foreground sticky top-0 z-50 shadow-lg">
        <div className="container">
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Mobile Menu + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Menu className="w-5 h-5 text-background" />
                </SheetTrigger>
                <SheetContent side="left" className="bg-background w-80 p-0">
                  <SheetHeader className="p-6 border-b border-border">
                    <SheetTitle className="flex items-center gap-3">
                      <img src={logo} alt="Tecnoiso" className="h-8" />
                      <div>
                        <span className="font-bold text-foreground">Admin</span>
                        <p className="text-xs text-muted-foreground font-normal">Painel de Controle</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <nav className="p-4 space-y-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`
                          flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left w-full group
                          ${activeTab === item.id 
                            ? 'bg-accent text-accent-foreground font-semibold shadow-md' 
                            : 'text-foreground hover:bg-secondary'
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className={`text-xs ${activeTab === item.id ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                      </button>
                    ))}
                    
                    <div className="border-t border-border my-4 pt-4" />
                    
                    <button
                      onClick={handleGoToStore}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors w-full"
                    >
                      <Store className="h-5 w-5" />
                      <span className="font-medium">Ir para a Loja</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-left w-full disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <LogOut className="h-5 w-5" />
                      )}
                      <span className="font-medium">{isLoggingOut ? 'Saindo...' : 'Sair da Conta'}</span>
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center gap-3">
                <img src={logo} alt="Tecnoiso" className="h-9 md:h-10" />
                <div className="hidden md:block border-l border-background/20 pl-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-background font-bold text-sm">Painel Admin</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-1 bg-background/10 rounded-xl p-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium
                    ${activeTab === item.id 
                      ? 'bg-accent text-accent-foreground shadow-md' 
                      : 'text-background/80 hover:text-background hover:bg-background/10'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleGoToStore}
                className="hidden md:flex items-center gap-2 text-background/80 hover:text-background hover:bg-background/10"
              >
                <Store className="h-4 w-4" />
                <span className="hidden lg:inline">Loja</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 text-background/80 hover:text-background hover:bg-background/10"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="hidden md:inline">{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-background border-b border-border shadow-sm">
        <div className="container py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/" className="hover:text-accent transition-colors">Início</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{getPageTitle()}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {getPageDescription()}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Tecnoiso Admin © {new Date().getFullYear()} — Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
