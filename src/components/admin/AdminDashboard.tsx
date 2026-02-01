import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, MessageSquare, DollarSign, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRequests: number;
  pendingRequests: number;
  totalRevenue: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();

    // Subscribe to real-time updates
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchStats();
          fetchRecentOrders();
        }
      )
      .subscribe();

    const requestsChannel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_requests' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, requestsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, status, total_amount'),
        supabase.from('customer_requests').select('id, status', { count: 'exact' }),
      ]);

      const orders = ordersRes.data || [];
      const requests = requestsRes.data || [];

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        totalRevenue: orders
          .filter(o => o.status === 'approved' || o.status === 'completed')
          .reduce((sum, o) => sum + Number(o.total_amount), 0),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', className: 'bg-warning/10 text-warning border-warning/20' };
      case 'approved':
        return { label: 'Aprovado', className: 'bg-success/10 text-success border-success/20' };
      case 'completed':
        return { label: 'Concluído', className: 'bg-foreground/10 text-foreground border-foreground/20' };
      case 'cancelled':
        return { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border-destructive/20' };
      default:
        return { label: status, className: 'bg-muted text-muted-foreground' };
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse border-border">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-background hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <Package className="h-5 w-5 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">itens no catálogo</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-background hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalOrders}</div>
            <div className="flex items-center gap-1 mt-1">
              {stats.pendingOrders > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                  {stats.pendingOrders} pendente(s)
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-background hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-1 text-success text-xs font-medium">
              <ArrowUpRight className="h-3 w-3" />
              pedidos aprovados
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-background hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Pendentes</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">aguardando ação</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-background hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solicitações</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalRequests}</div>
            <div className="flex items-center gap-1 mt-1">
              {stats.pendingRequests > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                  {stats.pendingRequests} pendente(s)
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-background hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.totalOrders > 0
                ? `${((stats.totalOrders - stats.pendingOrders) / stats.totalOrders * 100).toFixed(1)}%`
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">pedidos finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-border bg-background">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-bold text-foreground">Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="text-muted-foreground text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium">Nenhum pedido ainda</p>
              <p className="text-sm">Os pedidos aparecerão aqui quando forem realizados</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">
                          {order.customer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">{formatCurrency(order.total_amount)}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
