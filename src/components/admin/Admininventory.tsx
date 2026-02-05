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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  AlertTriangle,
  TrendingUp,
  Package,
  Edit,
  Plus,
  Minus,
  RotateCw
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  price: number;
  category: string;
}

export function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      const inventoryData = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku || `SKU-${product.id.slice(0, 8)}`,
        stock: product.stock || 0,
        min_stock: product.min_stock || 5,
        price: product.price,
        category: product.category || 'Sem categoria',
      }));

      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar estoque',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async () => {
    if (!selectedItem) return;

    try {
      const newStock = selectedItem.stock + adjustAmount;

      if (newStock < 0) {
        toast({
          title: 'Erro',
          description: 'Estoque não pode ser negativo',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Estoque atualizado',
      });

      setIsAdjustOpen(false);
      setAdjustAmount(0);
      fetchInventory();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao ajustar estoque',
        variant: 'destructive',
      });
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return { label: 'Esgotado', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    } else if (stock <= minStock) {
      return { label: 'Baixo', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    } else {
      return { label: 'Normal', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: inventory.length,
    lowStock: inventory.filter(item => item.stock <= item.min_stock && item.stock > 0).length,
    outOfStock: inventory.filter(item => item.stock === 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.stock * item.price), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total de Itens</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Estoque Baixo</p>
                <p className="text-3xl font-bold text-amber-400 mt-2">{stats.lowStock}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Esgotados</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{stats.outOfStock}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Valor Total</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
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
              <CardTitle className="text-white">Controle de Estoque</CardTitle>
              <CardDescription className="text-slate-400">
                Gerencie o estoque de todos os produtos
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600">
              <RotateCw className="h-4 w-4" />
              Atualizar
            </Button>
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
                placeholder="Buscar por nome ou SKU..."
                className="pl-10 bg-slate-900/50 border-slate-800/50 text-white"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-slate-400 mt-4">Carregando estoque...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-3 text-slate-600" />
              <p className="font-medium text-white">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800/50 hover:bg-transparent">
                    <TableHead className="text-slate-400">SKU</TableHead>
                    <TableHead className="text-slate-400">Produto</TableHead>
                    <TableHead className="text-slate-400">Categoria</TableHead>
                    <TableHead className="text-slate-400">Estoque Atual</TableHead>
                    <TableHead className="text-slate-400">Estoque Mín.</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Valor Unit.</TableHead>
                    <TableHead className="text-right text-slate-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item.stock, item.min_stock);
                    return (
                      <TableRow key={item.id} className="border-slate-800/50 hover:bg-slate-800/30">
                        <TableCell className="font-mono text-xs text-slate-400">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-semibold text-white">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {item.category}
                        </TableCell>
                        <TableCell>
                          <span className={`text-lg font-bold ${
                            item.stock === 0 ? 'text-red-400' :
                            item.stock <= item.min_stock ? 'text-amber-400' :
                            'text-white'
                          }`}>
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {item.min_stock}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} border`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsAdjustOpen(true);
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
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

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Ajustar Estoque</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Produto</p>
                <p className="font-bold text-white">{selectedItem.name}</p>
                <p className="text-xs text-slate-500 mt-1">SKU: {selectedItem.sku}</p>
              </div>

              <div>
                <Label className="text-white mb-2 block">Estoque Atual</Label>
                <div className="text-3xl font-bold text-white text-center p-4 bg-slate-800/30 rounded-lg">
                  {selectedItem.stock}
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Ajuste de Quantidade</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAdjustAmount(Math.max(adjustAmount - 1, -selectedItem.stock))}
                    className="h-12 w-12 border-slate-800"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="text-center text-2xl font-bold bg-slate-800/30 border-slate-800 text-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAdjustAmount(adjustAmount + 1)}
                    className="h-12 w-12 border-slate-800"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-slate-400 text-center mt-2">
                  Novo estoque: <span className="font-bold text-white">{selectedItem.stock + adjustAmount}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-800"
                  onClick={() => {
                    setIsAdjustOpen(false);
                    setAdjustAmount(0);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={adjustStock}
                >
                  Confirmar Ajuste
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}