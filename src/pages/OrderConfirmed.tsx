import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Home, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

interface OrderData {
  id: string;
  status: string;
  payment_status: string | null;
  total_amount: number;
  customer_name: string;
  created_at: string;
}

export default function OrderConfirmed() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart on successful order confirmation
    clearCart();
    
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('id, status, payment_status, total_amount, customer_name, created_at')
          .eq('id', orderId)
          .single();

        if (fetchError) {
          console.error('Error fetching order:', fetchError);
          setError('Não foi possível carregar os detalhes do pedido.');
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Erro ao carregar pedido.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatOrderNumber = (id: string) => {
    return `TEC${id.slice(-8).toUpperCase()}`;
  };

  const isPending = status === 'pending' || order?.payment_status === 'pending';

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container flex items-center justify-center">
          <Link to="/">
            <img src={logo} alt="Tecnoiso" className="h-8" />
          </Link>
        </div>
      </header>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success/Pending Icon */}
          <div className="mb-8">
            <div className={`w-24 h-24 ${isPending ? 'bg-warning/10' : 'bg-accent/10'} rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in`}>
              {isPending ? (
                <Clock className="w-14 h-14 text-warning" />
              ) : (
                <CheckCircle2 className="w-14 h-14 text-accent" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isPending ? 'Pagamento Pendente' : 'Pedido Confirmado!'}
            </h1>
            <p className="text-muted-foreground">
              {isPending 
                ? 'Seu pedido foi recebido e está aguardando confirmação de pagamento.'
                : 'Obrigado por comprar na Tecnoiso. Seu pedido foi recebido com sucesso.'}
            </p>
          </div>

          {/* Order Details */}
          <Card className="p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Número do pedido</p>
                <p className="text-xl font-bold text-foreground">
                  #{order ? formatOrderNumber(order.id) : 'N/A'}
                </p>
              </div>
              <Package className="w-10 h-10 text-accent" />
            </div>

            {order && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total do pedido</span>
                  <span className="font-bold text-lg">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-2">Próximos passos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  Você receberá um e-mail de confirmação com os detalhes do pedido
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  {isPending 
                    ? 'Aguardando confirmação do seu pagamento (PIX/Boleto pode levar até 1 dia útil)'
                    : 'Assim que o pagamento for confirmado, iniciaremos a preparação'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  Você poderá acompanhar o status da entrega em tempo real
                </li>
              </ul>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <Home className="w-5 h-5" />
                Voltar à loja
              </Button>
            </Link>
            <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90">
              Acompanhar pedido
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Contact */}
          <p className="mt-8 text-sm text-muted-foreground">
            Precisa de ajuda? Entre em contato pelo{" "}
            <a href="mailto:contato@tecnoiso.com.br" className="text-accent hover:underline">
              contato@tecnoiso.com.br
            </a>{" "}
            ou{" "}
            <a href="tel:+554734383175" className="text-accent hover:underline">
              (47) 3438-3175
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
