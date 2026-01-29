import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, CreditCard, QrCode, ArrowLeft, ShieldCheck, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("pix");

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const pixPrice = totalPrice * 0.95;
  const shipping = totalPrice >= 500 ? 0 : 49.90;
  const finalPrice = paymentMethod === "pix" ? pixPrice + shipping : totalPrice + shipping;

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="container py-12 min-h-[60vh]">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Carrinho Vazio</h1>
            <p className="text-muted-foreground mb-6">
              Seu carrinho está vazio. Explore nossos produtos e encontre o que você precisa!
            </p>
            <Link to="/">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Meu Carrinho</h1>
          <span className="text-muted-foreground">({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-success">
                          {formatPrice(item.price * item.quantity * 0.95)} no PIX
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shipping === 0 ? "text-success" : ""}>
                    {shipping === 0 ? "Grátis" : formatPrice(shipping)}
                  </span>
                </div>
                {paymentMethod === "pix" && (
                  <div className="flex justify-between text-success">
                    <span>Desconto PIX (5%)</span>
                    <span>-{formatPrice(totalPrice * 0.05)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalPrice)}</span>
              </div>

              {paymentMethod !== "pix" && (
                <p className="text-sm text-muted-foreground mt-2">
                  ou 12x de {formatPrice(finalPrice / 12)} sem juros
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Forma de Pagamento</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex-1 cursor-pointer flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">PIX</p>
                      <p className="text-xs text-success">5% de desconto</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer mt-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Cartão de Crédito</p>
                      <p className="text-xs text-muted-foreground">até 12x sem juros</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Calcular Frete</h2>
              <div className="flex gap-2">
                <Input placeholder="CEP" className="flex-1" maxLength={9} />
                <Button variant="outline">Calcular</Button>
              </div>
              {totalPrice >= 500 && (
                <p className="text-sm text-success mt-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Frete grátis para este pedido!
                </p>
              )}
            </Card>

            <Link to="/checkout">
              <Button className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90">
                Finalizar Compra
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Compra Segura
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Entrega Rápida
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
