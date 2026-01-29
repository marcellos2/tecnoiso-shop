import { ShieldCheck, Lock, CreditCard } from "lucide-react";

interface SecurityBadgeProps {
  variant?: "inline" | "banner";
  showPaymentMethods?: boolean;
}

export function SecurityBadge({ variant = "inline", showPaymentMethods = false }: SecurityBadgeProps) {
  if (variant === "banner") {
    return (
      <div className="bg-success/5 border border-success/20 rounded-lg p-4">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-success">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Compra 100% Segura</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Dados Protegidos</span>
          </div>
          {showPaymentMethods && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Mercado Pago</span>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Pagamento processado pelo Mercado Pago com a máxima segurança
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Lock className="w-4 h-4 text-success" />
      <span>Compra 100% segura</span>
    </div>
  );
}
