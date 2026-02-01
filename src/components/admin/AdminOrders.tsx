import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Truck, CheckCircle, XCircle, Clock, ShoppingCart, MapPin, User, Package } from 'lucide-react';

interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_cpf: string | null;
  shipping_address: any;
  items: any;
  total_amount: number;
  status: string;
  payment_id: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'approved', label: 'Aprovado', icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' },
  { value: 'processing', label: 'Processando', icon: Package, className: 'bg-foreground/10 text-foreground border-foreground/20' },
  { value: 'shipped', label: 'Enviado', icon: Truck, className: 'bg-foreground/10 text-foreground border-foreground/20' },
  { value: 'completed', label: 'Concluído', icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change:', payload);
          fetchOrders();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: '🛒 Novo Pedido!',
              description: `Novo pedido recebido de ${(payload.new as Order).customer_name}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pedidos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Status do pedido atualizado',
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar pedido',
        variant: 'destructive',
      });
    }
  };

  const updateOrderNotes = async (orderId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ notes })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Observações atualizadas',
      });

      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, notes });
      }
      fetchOrders();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar observações',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((o) => o.value === status);
    if (!option) return <Badge variant="outline">{status}</Badge>;

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${option.className}`}>
        {option.label}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border bg-background"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-border bg-background">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent className="border-border">
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-background">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Nenhum pedido encontrado</p>
              <p className="text-sm text-muted-foreground">Os pedidos aparecerão aqui quando forem realizados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold">Pedido</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Total</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Data</TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-foreground/5 flex items-center justify-center">
                            <span className="text-sm font-bold text-foreground">
                              {order.customer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailOpen(true);
                          }}
                          className="border-border hover:bg-secondary"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">ID do Pedido</Label>
                  <p className="font-mono text-sm text-foreground mt-1">#{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Data</Label>
                  <p className="text-sm text-foreground mt-1">{new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <User className="h-4 w-4" />
                  Dados do Cliente
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <p className="text-foreground">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-foreground">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Telefone</Label>
                    <p className="text-foreground">{selectedOrder.customer_phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">CPF</Label>
                    <p className="text-foreground">{selectedOrder.customer_cpf || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <MapPin className="h-4 w-4" />
                  Endereço de Entrega
                </div>
                {selectedOrder.shipping_address && (
                  <div className="text-sm text-foreground">
                    <p>{selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}</p>
                    {selectedOrder.shipping_address.complement && (
                      <p className="text-muted-foreground">{selectedOrder.shipping_address.complement}</p>
                    )}
                    <p>{selectedOrder.shipping_address.neighborhood} - {selectedOrder.shipping_address.city}/{selectedOrder.shipping_address.state}</p>
                    <p className="text-muted-foreground">CEP: {selectedOrder.shipping_address.zipCode}</p>
                  </div>
                )}
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Package className="h-4 w-4" />
                  Itens do Pedido
                </div>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-3 text-lg border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Status do Pedido</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Observações Internas</Label>
                <Textarea
                  placeholder="Adicione observações sobre este pedido..."
                  defaultValue={selectedOrder.notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== selectedOrder.notes) {
                      updateOrderNotes(selectedOrder.id, e.target.value);
                    }
                  }}
                  className="border-border resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
