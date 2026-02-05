 import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
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
   Bell,
   Search,
   Users,
   TrendingUp,
   Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
   const { user, isAdmin, isLoading, signOut, userName } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

   // Redirect logic
   if (!isLoading && !user) {
     navigate('/auth');
     return null;
   }
 
   if (!isLoading && user && !isAdmin) {
     navigate('/');
     return null;
   }
 
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
     const { error } = await signOut();
     
     if (error) {
       setIsLoggingOut(false);
       toast({
         title: 'Erro ao sair',
         description: 'Ocorreu um erro. Tente novamente.',
         variant: 'destructive',
       });
       return;
     }
 
     toast({
       title: 'Até logo!',
       description: 'Você saiu da sua conta com sucesso.',
     });
 
     window.location.href = '/';
  };

   if (isLoading) {
    return (
       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
         <div className="flex flex-col items-center gap-4 text-white">
           <Loader2 className="h-10 w-10 animate-spin" />
           <p className="text-gray-400">Carregando painel...</p>
        </div>
      </div>
    );
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

  return (
     <div className="min-h-screen flex" style={{ backgroundColor: '#0d0d0d' }}>
       {/* Sidebar */}
       <aside 
         className={`
           fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0
           ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
         `}
         style={{ backgroundColor: '#111111' }}
       >
         <div className="flex flex-col h-full">
           {/* Logo */}
           <div className="p-6 border-b border-gray-800">
             <Link to="/" className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                 <img src={logo} alt="Tecnoiso" className="h-6 invert" />
               </div>
               <span className="text-xl font-bold text-white">Tecnoiso</span>
             </Link>
           </div>
 
           {/* Navigation */}
           <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
             <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
               Menu Principal
             </p>
             {menuItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => {
                   setActiveTab(item.id);
                   setIsMobileMenuOpen(false);
                 }}
                 className={`
                   w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                   ${activeTab === item.id 
                     ? 'bg-emerald-500/10 text-emerald-500' 
                     : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }
                 `}
               >
                 <item.icon className="h-5 w-5" />
                 <span className="font-medium">{item.title}</span>
               </button>
             ))}
 
             <div className="my-4 border-t border-gray-800" />
 
             <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
               Ações Rápidas
             </p>
             <Link
               to="/"
               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
             >
               <Store className="h-5 w-5" />
               <span className="font-medium">Ir para Loja</span>
             </Link>
           </nav>
 
           {/* User Section */}
           <div className="p-4 border-t border-gray-800">
             <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                 {userName?.charAt(0).toUpperCase() || 'A'}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-white truncate">{userName || 'Admin'}</p>
                 <p className="text-xs text-gray-500">Administrador</p>
               </div>
               <button
                 onClick={handleLogout}
                 disabled={isLoggingOut}
                 className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
           className="fixed inset-0 bg-black/60 z-40 lg:hidden"
           onClick={() => setIsMobileMenuOpen(false)}
         />
       )}
 
       {/* Main Content */}
       <div className="flex-1 flex flex-col min-h-screen">
         {/* Top Header */}
         <header className="sticky top-0 z-30 border-b border-gray-800" style={{ backgroundColor: '#111111' }}>
           <div className="flex items-center justify-between px-4 lg:px-6 py-3">
             {/* Mobile Menu Button */}
             <button
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
             >
               <Menu className="h-5 w-5" />
             </button>
 
             {/* Search Bar */}
             <div className="flex-1 max-w-xl mx-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                 <Input
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Pesquisar..."
                   className="w-full pl-10 bg-white/5 border-gray-800 text-white placeholder:text-gray-500 focus:border-emerald-500"
                 />
               </div>
             </div>
 
             {/* Right Actions */}
             <div className="flex items-center gap-2">
               <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
               </button>
               <Link 
                 to="/"
                 className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
               >
                 <Home className="h-4 w-4" />
                 <span className="text-sm">Loja</span>
               </Link>
             </div>
           </div>
         </header>
 
         {/* Page Content */}
         <main className="flex-1 p-4 lg:p-6 overflow-auto">
           {renderContent()}
         </main>
       </div>
    </div>
  );
};

export default Admin;
