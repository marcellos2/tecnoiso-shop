import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag,
  TrendingUp,
  Calendar,
  Eye,
  MoreVertical,
  Download,
  Filter
} from 'lucide-react';

interface Customer {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order?: string;
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Buscar perfis de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Para cada perfil, buscar estatísticas de pedidos
      const customersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
          const lastOrder = orders?.[0]?.created_at || null;

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone,
            created_at: profile.created_at,
            total_orders: totalOrders,
            total_spent: totalSpent,
            last_order: lastOrder,
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    }
  };

  const viewCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerOrders(customer.id);
    setIsDetailOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getCustomerSegment = (totalSpent: number) => {
    if (totalSpent >= 5000) return { label: 'VIP', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    if (totalSpent >= 2000) return { label: 'Premium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (totalSpent >= 500) return { label: 'Regular', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    return { label: 'Novo', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: customers.length,
    newThisMonth: customers.filter(c => {
      const created = new Date(c.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    vip: customers.filter(c => (c.total_spent || 0) >= 5000).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total de Clientes</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <UserPlus className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Novos (Este Mês)</p>
                <p className="text-3xl font-bold text-white mt-2">+{stats.newThisMonth}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Clientes VIP</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.vip}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <ShoppingBag className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Receita Total</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <TrendingUp className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Gerenciar Clientes</CardTitle>
              <CardDescription className="text-slate-400">
                Visualize e gerencie todos os seus clientes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-slate-800 hover:bg-slate-800">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="pl-10 bg-slate-900/50 border-slate-800/50 text-white"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-slate-400 mt-4">Carregando clientes...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto mb-3 text-slate-600" />
              <p className="font-medium text-white">Nenhum cliente encontrado</p>
              <p className="text-sm text-slate-400">Os clientes aparecerão aqui quando se registrarem</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800/50 hover:bg-transparent">
                    <TableHead className="text-slate-400">Cliente</TableHead>
                    <TableHead className="text-slate-400">Contato</TableHead>
                    <TableHead className="text-slate-400">Pedidos</TableHead>
                    <TableHead className="text-slate-400">Total Gasto</TableHead>
                    <TableHead className="text-slate-400">Segmento</TableHead>
                    <TableHead className="text-slate-400">Cadastro</TableHead>
                    <TableHead className="text-right text-slate-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const segment = getCustomerSegment(customer.total_spent || 0);
                    return (
                      <TableRow key={customer.id} className="border-slate-800/50 hover:bg-slate-800/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {customer.full_name?.charAt(0).toUpperCase() || customer.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {customer.full_name || 'Sem nome'}
                              </p>
                              <p className="text-xs text-slate-400">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <span className="text-slate-400">{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-slate-500" />
                                <span className="text-slate-400">{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-white font-semibold">{customer.total_orders || 0}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-white font-bold">
                            {formatCurrency(customer.total_spent || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${segment.color} border`}>
                            {segment.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDate(customer.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewCustomerDetails(customer)}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedCustomer.full_name?.charAt(0).toUpperCase() || selectedCustomer.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {selectedCustomer.full_name || 'Sem nome'}
                  </h3>
                  <p className="text-sm text-slate-400">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-slate-400">{selectedCustomer.phone}</p>
                  )}
                </div>
                <Badge className={`${getCustomerSegment(selectedCustomer.total_spent || 0).color} border`}>
                  {getCustomerSegment(selectedCustomer.total_spent || 0).label}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{selectedCustomer.total_orders || 0}</p>
                  <p className="text-sm text-slate-400 mt-1">Total de Pedidos</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(selectedCustomer.total_spent || 0)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Total Gasto</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">
                    {selectedCustomer.last_order ? formatDate(selectedCustomer.last_order) : '-'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Último Pedido</p>
                </div>
              </div>

              {/* Orders History */}
              <div>
                <h4 className="font-semibold text-white mb-3">Histórico de Pedidos</h4>
                {customerOrders.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Nenhum pedido ainda</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div>
                          <p className="text-sm font-mono text-slate-400">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{formatCurrency(order.total_amount)}</p>
                          <p className="text-xs text-slate-400">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}