import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

export function AdminAnalytics() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    avgOrderValue: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Buscar pedidos dos últimos 12 meses
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Processar dados de receita mensal
      const monthlyRevenue = processMonthlyRevenue(orders || []);
      setRevenueData(monthlyRevenue);

      // Processar dados de categoria
      const categories = processCategoryData(orders || []);
      setCategoryData(categories);

      // Calcular estatísticas
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthOrders = (orders || []).filter(o => {
        const date = new Date(o.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const lastMonthOrders = (orders || []).filter(o => {
        const date = new Date(o.created_at);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return date.getMonth() === lastMonth && date.getFullYear() === year;
      });

      const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const ordersGrowth = lastMonthOrders.length > 0
        ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
        : 0;

      setStats({
        totalRevenue: thisMonthRevenue,
        revenueGrowth,
        totalOrders: thisMonthOrders.length,
        ordersGrowth,
        avgOrderValue: thisMonthOrders.length > 0 ? thisMonthRevenue / thisMonthOrders.length : 0,
        conversionRate: 68.5, // Mock - em produção calcular baseado em visitantes/compras
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyRevenue = (orders: any[]) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const monthlyData = months.map((month, index) => ({
      name: month,
      receita: 0,
      pedidos: 0,
    }));

    orders.forEach(order => {
      const date = new Date(order.created_at);
      const month = date.getMonth();
      monthlyData[month].receita += Number(order.total_amount);
      monthlyData[month].pedidos += 1;
    });

    return monthlyData;
  };

  const processCategoryData = (orders: any[]) => {
    const categories: Record<string, number> = {};

    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        const category = item.category || 'Outros';
        categories[category] = (categories[category] || 0) + (item.price * item.quantity);
      });
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400 font-medium">Receita (Mês)</p>
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {stats.revenueGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">
                    {formatPercentage(stats.revenueGrowth)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 font-semibold">
                    {formatPercentage(stats.revenueGrowth)}
                  </span>
                </>
              )}
              <span className="text-slate-500">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400 font-medium">Pedidos (Mês)</p>
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ShoppingCart className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {stats.totalOrders}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {stats.ordersGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">
                    {formatPercentage(stats.ordersGrowth)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 font-semibold">
                    {formatPercentage(stats.ordersGrowth)}
                  </span>
                </>
              )}
              <span className="text-slate-500">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400 font-medium">Ticket Médio</p>
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {formatCurrency(stats.avgOrderValue)}
            </p>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-slate-500">Média por pedido</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400 font-medium">Taxa Conversão</p>
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Users className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {stats.conversionRate.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">+2.4%</span>
              <span className="text-slate-500">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-slate-800/50">
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Receita Mensal</CardTitle>
              <CardDescription className="text-slate-400">
                Evolução da receita nos últimos 12 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#colorReceita)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Volume de Pedidos</CardTitle>
              <CardDescription className="text-slate-400">
                Quantidade de pedidos por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="pedidos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Vendas por Categoria</CardTitle>
                <CardDescription className="text-slate-400">
                  Distribuição de receita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Top Categorias</CardTitle>
                <CardDescription className="text-slate-400">
                  Categorias mais vendidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-white font-medium">{category.name}</span>
                      </div>
                      <span className="text-slate-400 font-bold">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}