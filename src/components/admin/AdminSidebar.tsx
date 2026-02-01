import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings,
  LogOut,
  Home,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral' },
  { id: 'products', title: 'Produtos', icon: Package, description: 'Gerenciar catálogo' },
  { id: 'orders', title: 'Pedidos', icon: ShoppingCart, description: 'Acompanhar vendas' },
  { id: 'requests', title: 'Solicitações', icon: MessageSquare, description: 'Atender clientes' },
  { id: 'settings', title: 'Configurações', icon: Settings, description: 'Minha conta' },
];

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-foreground rounded-lg p-1.5">
            <img src={logo} alt="Tecnoiso" className="h-7 w-auto invert" />
          </div>
          <div>
            <span className="font-bold text-foreground text-lg tracking-tight">Tecnoiso</span>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full px-3 py-2.5 rounded-lg transition-all duration-200
                      ${activeTab === item.id 
                        ? 'bg-foreground text-background font-semibold shadow-sm' 
                        : 'text-foreground hover:bg-secondary'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? 'text-background' : 'text-muted-foreground'}`} />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start border-border hover:bg-secondary hover:text-foreground transition-colors"
          onClick={() => navigate('/')}
        >
          <Store className="h-4 w-4 mr-2" />
          Ir para a Loja
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
