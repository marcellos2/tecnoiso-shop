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
import { Search, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

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
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'approved', label: 'Aprovado', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { value: 'processing', label: 'Processando', icon: Truck, color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'Enviado', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'Concluído', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
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
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pedido encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">ID do Pedido</Label>
                  <p className="font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p>{new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Dados do Cliente</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    <p>{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p>{selectedOrder.customer_phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CPF/CNPJ</Label>
                    <p>{selectedOrder.customer_cpf || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Endereço de Entrega</h4>
                {selectedOrder.shipping_address && (
                  <div className="text-sm">
                    <p>
                      {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}
                    </p>
                    {selectedOrder.shipping_address.complement && (
                      <p>{selectedOrder.shipping_address.complement}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address.neighborhood} - {selectedOrder.shipping_address.city}/{selectedOrder.shipping_address.state}
                    </p>
                    <p>CEP: {selectedOrder.shipping_address.zipCode}</p>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Itens do Pedido</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status do Pedido</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observações Internas</Label>
                <Textarea
                  placeholder="Adicione observações sobre este pedido..."
                  defaultValue={selectedOrder.notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== selectedOrder.notes) {
                      updateOrderNotes(selectedOrder.id, e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
