import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, ArrowLeft, Home } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";

export default function OrderPending() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart when payment is pending
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Pagamento em Processamento</h1>
        
        <p className="text-muted-foreground mb-6">
          Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail 
          assim que o pagamento for aprovado.
        </p>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Próximos passos:</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li>• Verifique seu e-mail para atualizações</li>
            <li>• O processamento pode levar até 3 dias úteis para boletos</li>
            <li>• Pagamentos via PIX são aprovados instantaneamente</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Home className="w-4 h-4" />
              Voltar à Loja
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full gap-2">
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
