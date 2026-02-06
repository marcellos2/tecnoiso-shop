import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminRequests } from '@/components/admin/AdminRequests';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminCustomers } from '@/components/admin/Admincustomers';
import { AdminAnalytics } from '@/components/admin/Adminanalytics';
import { AdminInventory } from '@/components/admin/Admininventory';
import { AdminReports } from '@/components/admin/Adminreports';
import { AdminMarketing } from '@/components/admin/Adminmarketing';
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
  Bell,
  Search,
  Home,
  Users,
  BarChart3,
  Warehouse,
  FileText,
  Megaphone,
  X,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import { Badge } from '@/components/ui/badge';

const menuSections = [
  {
    title: 'Visão Geral',
    items: [
      { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, badge: null },
      { id: 'analytics', title: 'Análise', icon: BarChart3, badge: 'Novo' },
    ]
  },
  {
    title: 'Vendas',
    items: [
      { id: 'orders', title: 'Pedidos', icon: ShoppingCart, badge: null },
      { id: 'customers', title: 'Clientes', icon: Users, badge: null },
      { id: 'requests', title: 'Solicitações', icon: MessageSquare, badge: null },
    ]
  },
  {
    title: 'Catálogo',
    items: [
      { id: 'products', title: 'Produtos', icon: Package, badge: null },
      { id: 'inventory', title: 'Estoque', icon: Warehouse, badge: null },
    ]
  },
  {
    title: 'Marketing',
    items: [
      { id: 'marketing', title: 'Campanhas', icon: Megaphone, badge: 'Beta' },
      { id: 'reports', title: 'Relatórios', icon: FileText, badge: null },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { id: 'settings', title: 'Minha Conta', icon: Settings, badge: null },
    ]
  }
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, userName } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();

  // Redirect logic
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && !isAdmin) {
      navigate('/');
    }
  }, [isLoading, user, isAdmin, navigate]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Até logo!',
        description: 'Você saiu da sua conta com sucesso.',
      });

      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
      setIsLoggingOut(false);
    }
  };

  const handleNavigateToStore = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            <div className="absolute inset-0 h-12 w-12 animate-ping text-emerald-500/30">
              <Loader2 className="h-full w-full" />
            </div>
          </div>
          <p className="text-slate-400 font-medium">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'products':
        return <AdminProducts />;
      case 'inventory':
        return <AdminInventory />;
      case 'orders':
        return <AdminOrders />;
      case 'customers':
        return <AdminCustomers />;
      case 'requests':
        return <AdminRequests />;
      case 'marketing':
        return <AdminMarketing />;
      case 'reports':
        return <AdminReports />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/50
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800/50">
            <button 
              onClick={handleNavigateToStore}
              className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity group"
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <img src={logo} alt="Tecnoiso" className="h-6 invert brightness-0" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">Tecnoiso</span>
                <p className="text-xs text-slate-500 font-medium">Admin Panel</p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all group
                        ${activeTab === item.id 
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-2 rounded-lg transition-all
                          ${activeTab === item.id 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-slate-800/50 text-slate-400 group-hover:bg-slate-800 group-hover:text-white'
                          }
                        `}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          {item.badge}
                        </Badge>
                      )}
                      {activeTab === item.id && (
                        <ChevronRight className="h-4 w-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-800/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-800/50">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {userName?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userName || 'Admin'}</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sair da conta"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              {/* Page Title */}
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white">
                  {menuSections
                    .flatMap(s => s.items)
                    .find(item => item.id === activeTab)?.title || 'Dashboard'}
                </h1>
                <p className="text-xs text-slate-500">Gerencie sua loja</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos, pedidos, clientes..."
                  className="w-full pl-10 bg-slate-900/50 border-slate-800/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all hidden md:block"
                title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Store Link */}
              <button 
                onClick={handleNavigateToStore}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Ir para Loja</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 bg-slate-950/90 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>© 2024 Tecnoiso. Todos os direitos reservados.</p>
            <p>Versão 2.0.0 • <span className="text-emerald-500">Sistema Operacional</span></p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Admin;