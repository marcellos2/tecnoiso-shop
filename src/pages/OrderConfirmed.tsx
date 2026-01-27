import { Link } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logo from "@/assets/logo.png";

export default function OrderConfirmed() {
  const orderNumber = `TEC${Date.now().toString().slice(-8)}`;

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
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="w-14 h-14 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pedido Confirmado!</h1>
            <p className="text-muted-foreground">
              Obrigado por comprar na Tecnoiso. Seu pedido foi recebido com sucesso.
            </p>
          </div>

          {/* Order Details */}
          <Card className="p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Número do pedido</p>
                <p className="text-xl font-bold text-foreground">#{orderNumber}</p>
              </div>
              <Package className="w-10 h-10 text-accent" />
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-2">Próximos passos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  Você receberá um e-mail de confirmação com os detalhes do pedido
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  Assim que o pagamento for confirmado, iniciaremos a preparação
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
