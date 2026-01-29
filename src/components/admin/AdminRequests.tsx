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
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Trash2, MessageCircle } from 'lucide-react';

interface CustomerRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  request_type: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-blue-100 text-blue-700' },
  { value: 'resolved', label: 'Resolvido', color: 'bg-green-100 text-green-700' },
  { value: 'closed', label: 'Fechado', color: 'bg-gray-100 text-gray-700' },
];

const requestTypes = [
  { value: 'question', label: 'Dúvida' },
  { value: 'complaint', label: 'Reclamação' },
  { value: 'suggestion', label: 'Sugestão' },
  { value: 'support', label: 'Suporte' },
  { value: 'quote', label: 'Orçamento' },
  { value: 'other', label: 'Outro' },
];

export function AdminRequests() {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('requests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_requests' },
        (payload) => {
          console.log('Request change:', payload);
          fetchRequests();

          if (payload.eventType === 'INSERT') {
            toast({
              title: '📩 Nova Solicitação!',
              description: `Nova solicitação de ${(payload.new as CustomerRequest).customer_name}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar solicitações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('customer_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Status atualizado',
      });

      if (selectedRequest) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  };

  const saveAdminResponse = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('customer_requests')
        .update({
          admin_response: adminResponse,
          status: 'resolved',
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Resposta salva com sucesso',
      });

      setSelectedRequest({
        ...selectedRequest,
        admin_response: adminResponse,
        status: 'resolved',
      });
      fetchRequests();
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar resposta',
        variant: 'destructive',
      });
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;

    try {
      const { error } = await supabase
        .from('customer_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Solicitação excluída',
      });

      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir solicitação',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((o) => o.value === status);
    if (!option) return <span className="text-xs">{status}</span>;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
        {option.label}
      </span>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const option = requestTypes.find((o) => o.value === type);
    return option?.label || type;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou assunto..."
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
          <CardTitle>Solicitações ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.customer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.customer_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getRequestTypeLabel(request.request_type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {request.subject}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminResponse(request.admin_response || '');
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteRequest(request.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedRequest.customer_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedRequest.customer_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p>{selectedRequest.customer_phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p>{getRequestTypeLabel(selectedRequest.request_type)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Data</Label>
                <p>{new Date(selectedRequest.created_at).toLocaleString('pt-BR')}</p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <Label className="text-muted-foreground">Assunto</Label>
                <p className="font-medium">{selectedRequest.subject}</p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <Label className="text-muted-foreground">Mensagem</Label>
                <p className="whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) => updateRequestStatus(selectedRequest.id, value)}
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
                <Label>Resposta do Administrador</Label>
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                />
                <Button onClick={saveAdminResponse} className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Salvar Resposta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
