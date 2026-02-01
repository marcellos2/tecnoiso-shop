import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminRequests } from '@/components/admin/AdminRequests';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [loading, user, isAdmin, navigate]);

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/30">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          <header className="h-16 border-b border-border flex items-center px-6 bg-background sticky top-0 z-10 shadow-sm">
            <SidebarTrigger className="mr-4 hover:bg-secondary transition-colors rounded-lg p-2" />
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-muted-foreground">
                Painel Administrativo Tecnoiso
              </p>
            </div>
          </header>
          <div className="p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
