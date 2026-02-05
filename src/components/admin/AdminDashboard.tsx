 import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Package, ShoppingCart, MessageSquare, DollarSign, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Users, Bell, CreditCard } from 'lucide-react';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRequests: number;
  pendingRequests: number;
  totalRevenue: number;
}

 const mockChartData = [
   { name: 'Jan', vendas: 4000, views: 2400 },
   { name: 'Fev', vendas: 3000, views: 1398 },
   { name: 'Mar', vendas: 9800, views: 2000 },
   { name: 'Abr', vendas: 3908, views: 2780 },
   { name: 'Mai', vendas: 4800, views: 1890 },
   { name: 'Jun', vendas: 3800, views: 2390 },
   { name: 'Jul', vendas: 4300, views: 3490 },
   { name: 'Ago', vendas: 5100, views: 2100 },
   { name: 'Set', vendas: 4600, views: 2900 },
 ];
 
 const weeklyData = [
   { name: 'Seg', value: 2400 },
   { name: 'Ter', value: 1398 },
   { name: 'Qua', value: 9800 },
   { name: 'Qui', value: 3908 },
   { name: 'Sex', value: 4800 },
   { name: 'Sáb', value: 3800 },
   { name: 'Dom', value: 4300 },
 ];
 
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
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
           <div key={i} className="animate-pulse rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
             <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
             <div className="h-8 bg-gray-700 rounded w-1/3" />
           </div>
        ))}
      </div>
    );
  }

  return (
     <div className="space-y-6">
       {/* Row 1: Stats Cards + Weekly Chart */}
       <div className="grid gap-4 lg:grid-cols-3">
         {/* Weekly Sales Card */}
         <div className="rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
           <div className="flex items-center justify-between mb-4">
             <div>
               <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
               <p className="text-gray-500 text-sm">Vendas da Semana</p>
             </div>
             <span className="flex items-center gap-1 text-xs font-medium text-red-400">
               <ArrowDownRight className="h-3 w-3" />
               8.6%
             </span>
           </div>
           <div className="h-20">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={weeklyData}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorValue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </div>
 
         {/* Mini Stat Cards */}
         <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
             <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
               <ShoppingCart className="h-6 w-6 text-blue-400" />
             </div>
             <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
             <p className="text-xs text-gray-500">Pedidos</p>
           </div>
           
           <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
             <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
               <DollarSign className="h-6 w-6 text-emerald-400" />
             </div>
             <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
             <p className="text-xs text-gray-500">Receita</p>
           </div>
           
           <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
             <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
               <Bell className="h-6 w-6 text-red-400" />
             </div>
             <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
             <p className="text-xs text-gray-500">Notificações</p>
           </div>
           
           <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
             <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
               <CreditCard className="h-6 w-6 text-cyan-400" />
             </div>
             <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
             <p className="text-xs text-gray-500">Pagamento</p>
           </div>
         </div>
       </div>
 
       {/* Row 2: Users Stats + Main Chart */}
       <div className="grid gap-4 lg:grid-cols-3">
         {/* Total Users Card */}
         <div className="rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
           <div className="flex items-center justify-between mb-2">
             <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
             <button className="text-gray-500">⋮</button>
           </div>
           <p className="text-gray-500 text-sm mb-4">Total de Produtos</p>
           <div className="flex gap-1 mb-2">
             {[40, 60, 80, 50, 70, 90, 45, 65, 55, 75, 85, 60].map((h, i) => (
               <div 
                 key={i} 
                 className="flex-1 rounded-sm bg-gradient-to-t from-red-500 to-orange-400"
                 style={{ height: `${h}px` }}
               />
             ))}
           </div>
           <p className="text-emerald-400 text-xs font-medium">
             <ArrowUpRight className="inline h-3 w-3" /> 12.5% em relação ao mês anterior
           </p>
         </div>
 
         {/* Active Users Ring */}
         <div className="rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
           <div className="flex items-center justify-between mb-2">
             <p className="text-3xl font-bold text-white">{stats.totalRequests}</p>
             <button className="text-gray-500">⋮</button>
           </div>
           <p className="text-gray-500 text-sm mb-4">Solicitações Ativas</p>
           <div className="flex items-center justify-center">
             <div className="relative w-24 h-24">
               <svg className="w-24 h-24 transform -rotate-90">
                 <circle cx="48" cy="48" r="40" stroke="#374151" strokeWidth="8" fill="none" />
                 <circle 
                   cx="48" 
                   cy="48" 
                   r="40" 
                   stroke="url(#gradient)" 
                   strokeWidth="8" 
                   fill="none"
                   strokeDasharray={`${78 * 2.51} ${100 * 2.51}`}
                   strokeLinecap="round"
                 />
                 <defs>
                   <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#06b6d4" />
                     <stop offset="100%" stopColor="#ec4899" />
                   </linearGradient>
                 </defs>
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-xl font-bold text-white">78%</span>
               </div>
             </div>
           </div>
           <p className="text-center text-gray-500 text-sm mt-2">
             Taxa de resolução
           </p>
         </div>
 
         {/* Sales & Views Chart */}
         <div className="rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
           <div className="flex items-center justify-between mb-4">
             <p className="text-lg font-semibold text-white">Vendas & Visualizações</p>
             <button className="text-gray-500">⋮</button>
           </div>
           <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={mockChartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                 <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                 <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                   labelStyle={{ color: '#fff' }}
                 />
                 <Bar dataKey="vendas" fill="#10b981" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="flex items-center justify-center gap-4 mt-2">
             <span className="flex items-center gap-1 text-xs text-gray-400">
               <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Vendas
             </span>
             <span className="flex items-center gap-1 text-xs text-gray-400">
               <span className="w-2 h-2 bg-purple-500 rounded-full" /> Views
             </span>
           </div>
         </div>
       </div>
 
       {/* Row 3: Monthly/Yearly Stats + Recent Orders */}
       <div className="grid gap-4 lg:grid-cols-2">
         {/* Monthly/Yearly Cards */}
         <div className="grid grid-cols-2 gap-4">
           <div className="rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
             <div className="flex items-center gap-4">
               <div className="relative w-16 h-16">
                 <svg className="w-16 h-16 transform -rotate-90">
                   <circle cx="32" cy="32" r="28" stroke="#374151" strokeWidth="6" fill="none" />
                   <circle 
                     cx="32" 
                     cy="32" 
                     r="28" 
                     stroke="#8b5cf6" 
                     strokeWidth="6" 
                     fill="none"
                     strokeDasharray={`${65 * 1.76} ${100 * 1.76}`}
                     strokeLinecap="round"
                   />
                 </svg>
               </div>
               <div>
                 <p className="text-gray-500 text-xs">Mensal</p>
                 <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue * 0.67)}</p>
                 <p className="text-emerald-400 text-xs">
                   <ArrowUpRight className="inline h-3 w-3" /> 16.5%
                 </p>
               </div>
             </div>
           </div>
 
           <div className="rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
             <div className="flex items-center gap-4">
               <div className="relative w-16 h-16">
                 <svg className="w-16 h-16 transform -rotate-90">
                   <circle cx="32" cy="32" r="28" stroke="#374151" strokeWidth="6" fill="none" />
                   <circle 
                     cx="32" 
                     cy="32" 
                     r="28" 
                     stroke="#06b6d4" 
                     strokeWidth="6" 
                     fill="none"
                     strokeDasharray={`${75 * 1.76} ${100 * 1.76}`}
                     strokeLinecap="round"
                   />
                 </svg>
               </div>
               <div>
                 <p className="text-gray-500 text-xs">Anual</p>
                 <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue * 10)}</p>
                 <p className="text-emerald-400 text-xs">
                   <ArrowUpRight className="inline h-3 w-3" /> 24.9%
                 </p>
               </div>
             </div>
           </div>
         </div>
 
         {/* Recent Orders */}
         <div className="rounded-xl p-6" style={{ backgroundColor: '#1a1a1a' }}>
           <div className="flex items-center justify-between mb-4">
             <p className="text-lg font-semibold text-white">Pedidos Recentes</p>
             <button className="text-gray-500">⋮</button>
           </div>
           
           {recentOrders.length === 0 ? (
             <div className="text-center py-8">
               <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-gray-600" />
               <p className="text-gray-500">Nenhum pedido ainda</p>
             </div>
           ) : (
             <div className="space-y-3">
               {recentOrders.slice(0, 4).map((order) => {
                 const statusConfig = getStatusConfig(order.status);
                 return (
                   <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                         {order.customer_name.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-white">{order.customer_name}</p>
                         <p className="text-xs text-gray-500">{order.customer_email}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-white">{formatCurrency(order.total_amount)}</p>
                       <span className={`text-xs px-2 py-0.5 rounded-full ${
                         order.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                         order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                         'bg-gray-500/20 text-gray-400'
                       }`}>
                         {statusConfig.label}
                       </span>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
