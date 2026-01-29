import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MapPin, Truck, CreditCard, QrCode, FileText, ShieldCheck, ChevronRight, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { Progress } from "@/components/ui/progress";
import logo from "@/assets/logo.png";

type CheckoutStep = "address" | "shipping" | "payment" | "review";

interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  recipient: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
  description: string;
}

const shippingOptions: ShippingOption[] = [
  { id: "express", name: "Entrega Expressa", price: 49.90, days: "1-2 dias úteis", description: "Receba mais rápido" },
  { id: "standard", name: "Entrega Padrão", price: 29.90, days: "3-5 dias úteis", description: "Melhor custo-benefício" },
  { id: "economic", name: "Entrega Econômica", price: 0, days: "7-10 dias úteis", description: "Frete grátis acima de R$ 500" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  
  const [address, setAddress] = useState<Address>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    recipient: "",
  });
  
  const [selectedShipping, setSelectedShipping] = useState<string>("standard");
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  
  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState("1");

  useEffect(() => {
    if (items.length === 0) {
      navigate("/carrinho");
    }
  }, [items, navigate]);

  const steps = [
    { id: "address", label: "Endereço", icon: MapPin },
    { id: "shipping", label: "Entrega", icon: Truck },
    { id: "payment", label: "Pagamento", icon: CreditCard },
    { id: "review", label: "Revisão", icon: FileText },
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getShippingPrice = () => {
    const option = shippingOptions.find(o => o.id === selectedShipping);
    if (!option) return 0;
    if (option.id === "economic" && totalPrice >= 500) return 0;
    return option.price;
  };

  const getDiscount = () => {
    if (paymentMethod === "pix") return totalPrice * 0.05;
    return 0;
  };

  const getFinalPrice = () => {
    return totalPrice + getShippingPrice() - getDiscount();
  };

  const handleCepSearch = async () => {
    if (address.cep.length < 8) return;
    
    setIsLoadingCep(true);
    try {
      const cleanCep = address.cep.replace(/\D/g, "");
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleFinishOrder = () => {
    // Here you would integrate with payment gateway
    clearCart();
    navigate("/pedido-confirmado");
  };

  const canProceedFromAddress = () => {
    return address.cep && address.street && address.number && address.neighborhood && address.city && address.state && address.recipient;
  };

  const canProceedFromPayment = () => {
    if (paymentMethod === "pix" || paymentMethod === "boleto") return true;
    return cardNumber.length >= 16 && cardName && cardExpiry && cardCvv;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "address":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Onde você quer receber seu pedido?</h2>
              <p className="text-muted-foreground text-sm">Informe o endereço de entrega</p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="recipient">Nome do destinatário *</Label>
                <Input
                  id="recipient"
                  placeholder="Nome completo"
                  value={address.recipient}
                  onChange={(e) => setAddress(prev => ({ ...prev, recipient: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={address.cep}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                        const formatted = value.replace(/(\d{5})(\d)/, "$1-$2");
                        setAddress(prev => ({ ...prev, cep: formatted }));
                      }}
                      onBlur={handleCepSearch}
                    />
                    <Button variant="outline" onClick={handleCepSearch} disabled={isLoadingCep}>
                      {isLoadingCep ? "..." : "Buscar"}
                    </Button>
                  </div>
                  <a href="https://buscacepinter.correios.com.br" target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-1 inline-block">
                    Não sei meu CEP
                  </a>
                </div>
              </div>

              <div>
                <Label htmlFor="street">Rua / Avenida *</Label>
                <Input
                  id="street"
                  placeholder="Nome da rua"
                  value={address.street}
                  onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    placeholder="123"
                    value={address.number}
                    onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto, bloco, etc."
                    value={address.complement}
                    onChange={(e) => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  placeholder="Bairro"
                  value={address.neighborhood}
                  onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={address.city}
                    onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    maxLength={2}
                    value={address.state}
                    onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => setCurrentStep("shipping")}
              disabled={!canProceedFromAddress()}
            >
              Continuar para entrega
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Como você quer receber?</h2>
              <p className="text-muted-foreground text-sm">Escolha a forma de entrega</p>
            </div>

            {/* Address Summary */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium">{address.recipient}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.street}, {address.number} {address.complement && `- ${address.complement}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.neighborhood} - {address.city}/{address.state}
                    </p>
                    <p className="text-sm text-muted-foreground">CEP: {address.cep}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep("address")}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
              {shippingOptions.map((option) => {
                const isFree = option.id === "economic" && totalPrice >= 500;
                const displayPrice = isFree ? 0 : option.price;
                
                return (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedShipping === option.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedShipping(option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">{option.name}</Label>
                        {isFree && (
                          <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded font-medium">
                            GRÁTIS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.days} • {option.description}</p>
                    </div>
                    <div className="text-right">
                      {displayPrice === 0 ? (
                        <span className="font-bold text-accent">Grátis</span>
                      ) : (
                        <span className="font-bold">{formatPrice(displayPrice)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep("address")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button className="flex-1" size="lg" onClick={() => setCurrentStep("payment")}>
                Continuar para pagamento
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Como você quer pagar?</h2>
              <p className="text-muted-foreground text-sm">Escolha a forma de pagamento</p>
            </div>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {/* PIX */}
              <div
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === "pix" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
                onClick={() => setPaymentMethod("pix")}
              >
                <div className="flex items-center space-x-4">
                  <RadioGroupItem value="pix" id="pix" />
                  <QrCode className="w-8 h-8 text-accent" />
                  <div className="flex-1">
                    <Label htmlFor="pix" className="font-medium cursor-pointer">PIX</Label>
                    <p className="text-sm text-accent font-medium">5% de desconto</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{formatPrice(totalPrice * 0.95 + getShippingPrice())}</p>
                    <p className="text-xs text-muted-foreground">à vista</p>
                  </div>
                </div>
                {paymentMethod === "pix" && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Após finalizar, você receberá o código PIX para pagamento. O pedido será confirmado assim que o pagamento for identificado.
                    </p>
                  </div>
                )}
              </div>

              {/* Credit Card */}
              <div
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === "card" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="flex items-center space-x-4">
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="w-8 h-8 text-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="card" className="font-medium cursor-pointer">Cartão de Crédito</Label>
                    <p className="text-sm text-muted-foreground">até 12x sem juros</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(totalPrice + getShippingPrice())}</p>
                    <p className="text-xs text-muted-foreground">em até 12x de {formatPrice((totalPrice + getShippingPrice()) / 12)}</p>
                  </div>
                </div>
                {paymentMethod === "card" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Número do cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                          const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
                          setCardNumber(formatted);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Nome impresso no cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Validade</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                            const formatted = value.replace(/(\d{2})(\d)/, "$1/$2");
                            setCardExpiry(formatted);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="000"
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="installments">Parcelas</Label>
                      <select
                        id="installments"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                          <option key={n} value={n}>
                            {n}x de {formatPrice((totalPrice + getShippingPrice()) / n)} sem juros
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Boleto */}
              <div
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === "boleto" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
                onClick={() => setPaymentMethod("boleto")}
              >
                <div className="flex items-center space-x-4">
                  <RadioGroupItem value="boleto" id="boleto" />
                  <FileText className="w-8 h-8 text-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="boleto" className="font-medium cursor-pointer">Boleto Bancário</Label>
                    <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(totalPrice + getShippingPrice())}</p>
                    <p className="text-xs text-muted-foreground">à vista</p>
                  </div>
                </div>
                {paymentMethod === "boleto" && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      O boleto será gerado após a finalização do pedido. O prazo de entrega começa a contar após a confirmação do pagamento.
                    </p>
                  </div>
                )}
              </div>
            </RadioGroup>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep("shipping")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                className="flex-1" 
                size="lg" 
                onClick={() => setCurrentStep("review")}
                disabled={!canProceedFromPayment()}
              >
                Revisar pedido
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "review":
        const selectedShippingOption = shippingOptions.find(o => o.id === selectedShipping);
        
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Revise seu pedido</h2>
              <p className="text-muted-foreground text-sm">Confira todos os detalhes antes de finalizar</p>
            </div>

            {/* Products */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Produtos ({items.length})</h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded bg-muted p-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Address */}
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Endereço de entrega</h3>
                  <p className="text-sm">{address.recipient}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.street}, {address.number} {address.complement && `- ${address.complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.neighborhood} - {address.city}/{address.state} - CEP: {address.cep}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep("address")}>
                  Alterar
                </Button>
              </div>
            </Card>

            {/* Shipping */}
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Forma de entrega</h3>
                  <p className="text-sm">{selectedShippingOption?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedShippingOption?.days}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {getShippingPrice() === 0 ? (
                      <span className="text-accent">Grátis</span>
                    ) : (
                      formatPrice(getShippingPrice())
                    )}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep("shipping")}>
                    Alterar
                  </Button>
                </div>
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Forma de pagamento</h3>
                  {paymentMethod === "pix" && (
                    <>
                      <p className="text-sm flex items-center gap-2">
                        <QrCode className="w-4 h-4" /> PIX
                      </p>
                      <p className="text-sm text-accent">5% de desconto aplicado</p>
                    </>
                  )}
                  {paymentMethod === "card" && (
                    <>
                      <p className="text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Cartão de crédito
                      </p>
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• {cardNumber.slice(-4)} - {installments}x de {formatPrice(getFinalPrice() / parseInt(installments))}
                      </p>
                    </>
                  )}
                  {paymentMethod === "boleto" && (
                    <p className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Boleto Bancário
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep("payment")}>
                  Alterar
                </Button>
              </div>
            </Card>

            {/* Summary */}
            <Card className="p-4 bg-muted/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={getShippingPrice() === 0 ? "text-accent" : ""}>
                    {getShippingPrice() === 0 ? "Grátis" : formatPrice(getShippingPrice())}
                  </span>
                </div>
                {getDiscount() > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Desconto PIX</span>
                    <span>-{formatPrice(getDiscount())}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(getFinalPrice())}</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep("payment")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button className="flex-1 bg-accent hover:bg-accent/90" size="lg" onClick={handleFinishOrder}>
                <ShieldCheck className="w-5 h-5 mr-2" />
                Finalizar Compra
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Ao finalizar, você concorda com nossos Termos de Uso e Política de Privacidade
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Tecnoiso" className="h-8" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-accent" />
            Compra 100% Segura
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-background border-b border-border">
        <div className="container py-4">
          <Progress value={progress} className="h-1 mb-4" />
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < stepIndex;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    isActive ? "text-accent font-medium" : isCompleted ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive || isCompleted ? "bg-accent text-accent-foreground" : "bg-muted"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline text-sm">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {renderStepContent()}
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Resumo da compra</h3>
              
              <div className="space-y-3 mb-4">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded bg-muted p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-sm text-muted-foreground">+ {items.length - 3} outros itens</p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} itens)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {currentStep !== "address" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className={getShippingPrice() === 0 ? "text-accent" : ""}>
                      {getShippingPrice() === 0 ? "Grátis" : formatPrice(getShippingPrice())}
                    </span>
                  </div>
                )}
                {getDiscount() > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Desconto PIX</span>
                    <span>-{formatPrice(getDiscount())}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(getFinalPrice())}</span>
              </div>

              {paymentMethod === "card" && currentStep === "review" && (
                <p className="text-sm text-muted-foreground mt-2">
                  ou {installments}x de {formatPrice(getFinalPrice() / parseInt(installments))} sem juros
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
