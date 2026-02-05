import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, Package, ImageIcon, Star, Tag, DollarSign, Layers } from 'lucide-react';
import { ProductMediaUpload } from './ProductMediaUpload';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  in_stock: boolean | null;
  discount: number | null;
  rating: number | null;
  reviews_count: number | null;
  specifications: any;
  media_urls: MediaItem[];
  created_at: string;
}

const CATEGORIES = [
  'Termômetros',
  'Manômetros',
  'Balanças',
  'Multímetros',
  'Paquímetros',
  'Termoigrômetros',
  'Calibradores',
  'Acessórios',
  'Outros',
];

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    in_stock: true,
    discount: '',
    rating: '',
    specifications: '',
  });
  
  const [mediaUrls, setMediaUrls] = useState<MediaItem[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse media_urls from JSON
      const productsWithMedia = (data || []).map(p => ({
        ...p,
        media_urls: Array.isArray(p.media_urls) 
          ? (p.media_urls as unknown as MediaItem[])
          : [],
      })) as Product[];
      
      setProducts(productsWithMedia);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do produto é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Erro',
        description: 'O preço deve ser maior que zero',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: 'Erro',
        description: 'Selecione uma categoria',
        variant: 'destructive',
      });
      return;
    }

    if (mediaUrls.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Recomendamos adicionar pelo menos uma imagem do produto',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Parse specifications JSON
      let specs = null;
      if (formData.specifications.trim()) {
        try {
          specs = JSON.parse(formData.specifications);
        } catch {
          // Try to parse as key: value format
          const lines = formData.specifications.split('\n');
          specs = {};
          for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              specs[key.trim()] = valueParts.join(':').trim();
            }
          }
        }
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: mediaUrls.length > 0 ? mediaUrls[0].url : null,
        category: formData.category,
        in_stock: formData.in_stock,
        discount: formData.discount ? parseInt(formData.discount) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        specifications: specs,
        media_urls: mediaUrls as unknown as any,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: 'Sucesso!',
          description: 'Produto atualizado com sucesso.',
        });
      } else {
        const { error } = await supabase.from('products').insert([productData]);

        if (error) throw error;

        toast({
          title: 'Sucesso!',
          description: 'Produto criado com sucesso.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao salvar produto. Verifique os dados.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category: product.category,
      in_stock: product.in_stock ?? true,
      discount: product.discount?.toString() || '',
      rating: product.rating?.toString() || '',
      specifications: product.specifications
        ? typeof product.specifications === 'string'
          ? product.specifications
          : JSON.stringify(product.specifications, null, 2)
        : '',
    });
    setMediaUrls(product.media_urls || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir produto',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      category: '',
      in_stock: true,
      discount: '',
      rating: '',
      specifications: '',
    });
    setMediaUrls([]);
    setEditingProduct(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie o catálogo de produtos da loja</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
              <Plus className="h-5 w-5" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Media Upload Section */}
              <div className="border border-border rounded-xl p-6 bg-secondary/20">
                <ProductMediaUpload
                  mediaUrls={mediaUrls}
                  onMediaChange={setMediaUrls}
                  maxFiles={10}
                />
              </div>

              {/* Basic Info Section */}
              <div className="space-y-6 border border-border rounded-xl p-6 bg-background">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Tag className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Informações Básicas</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name" className="text-foreground font-medium">
                      Nome do Produto *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Termômetro Digital Infravermelho"
                      required
                      className="border-border h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-foreground font-medium">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva as características principais do produto"
                      rows={3}
                      className="border-border resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-foreground font-medium">
                      Categoria *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger className="border-border h-11">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-6 border border-border rounded-xl p-6 bg-background">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-success/10">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Preços e Estoque</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-foreground font-medium">
                      Preço Atual (R$) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                      className="border-border h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="original_price" className="text-foreground font-medium">
                      Preço Original (R$)
                    </Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="0.00"
                      className="border-border h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount" className="text-foreground font-medium">
                      Desconto (%)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
                      className="border-border h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-foreground font-medium">
                      Avaliação (0-5)
                    </Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="4.5"
                      className="border-border h-11"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                    <div>
                      <Label htmlFor="in_stock" className="text-foreground font-medium cursor-pointer">
                        Disponível em Estoque
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Produto disponível para compra
                      </p>
                    </div>
                    <Switch
                      id="in_stock"
                      checked={formData.in_stock}
                      onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Specifications Section */}
              <div className="space-y-6 border border-border rounded-xl p-6 bg-background">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Especificações Técnicas</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specifications" className="text-foreground font-medium">
                    Especificações
                  </Label>
                  <Textarea
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    placeholder="Formato: chave: valor (uma por linha)&#10;Exemplo:&#10;Faixa de medição: -50°C a 300°C&#10;Precisão: ±0.5°C&#10;Alimentação: 2x AAA"
                    rows={5}
                    className="border-border resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite uma especificação por linha no formato "nome: valor"
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  className="border-border h-11 px-6"
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-8 font-semibold"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Salvando...
                    </>
                  ) : (
                    editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 border-border"
        />
      </div>

      {/* Products Table */}
      <Card className="border-border bg-background shadow-sm">
        <CardHeader className="border-b border-border bg-secondary/20">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            Catálogo de Produtos
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
              {filteredProducts.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin h-10 w-10 border-3 border-accent border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-secondary/50 w-fit mx-auto mb-4">
                <Package className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-foreground text-lg">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? 'Tente buscar com outros termos' : 'Adicione seu primeiro produto clicando no botão acima'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent bg-secondary/30">
                    <TableHead className="text-muted-foreground font-semibold">Produto</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Categoria</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Preço</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Mídia</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-border hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url || (product.media_urls && product.media_urls[0]) ? (
                            <img
                              src={product.image_url || product.media_urls[0]?.url}
                              alt={product.name}
                              className="h-14 w-14 rounded-lg object-cover border border-border shadow-sm"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center border border-border">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground line-clamp-1">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {product.discount && product.discount > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground font-medium">
                                  -{product.discount}%
                                </span>
                              )}
                              {product.rating && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  {product.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-foreground text-base">{formatCurrency(product.price)}</p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.original_price)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {(product.media_urls?.length || 0) + (product.image_url && !product.media_urls?.length ? 1 : 0)} arquivo(s)
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            product.in_stock
                              ? 'bg-accent/10 text-accent border border-accent/20'
                              : 'bg-destructive/10 text-destructive border border-destructive/20'
                          }`}
                        >
                          {product.in_stock ? '✓ Disponível' : '✕ Esgotado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="border-border hover:bg-accent hover:text-accent-foreground h-9 w-9"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 w-9"
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
    </div>
  );
}