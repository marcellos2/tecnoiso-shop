import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CreditCard, QrCode, Barcode, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SecurityBadge } from "@/components/SecurityBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

type PaymentMethod = "mercadopago" | "pix" | "credit_card" | "boleto";

interface FormData {
  // Dados Pessoais
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  
  // Endereço
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  
  // Pagamento - Cartão
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
}

// Initialize Mercado Pago SDK
const mercadoPagoPublicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
if (mercadoPagoPublicKey) {
  initMercadoPago(mercadoPagoPublicKey, { locale: 'pt-BR' });
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const pixPrice = totalPrice * 0.95;

  // Máscaras de input
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPhone = (value: string) => {
    // Aceitar qualquer formato de telefone - apenas limitar caracteres
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
      // Formato: (XX) XXXX-XXXX
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    } else {
      // Formato: (XX) XXXXX-XXXX
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const maskCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})\d+?$/, "$1");
  };

  const maskCardExpiry = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\/\d{2})\d+?$/, "$1");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let maskedValue = value;

    if (field === "cpf") maskedValue = maskCPF(value);
    if (field === "phone") maskedValue = maskPhone(value);
    if (field === "cep") maskedValue = maskCEP(value);
    if (field === "cardNumber") maskedValue = maskCardNumber(value);
    if (field === "cardExpiry") maskedValue = maskCardExpiry(value);
    if (field === "cardCvv") maskedValue = value.replace(/\D/g, "").slice(0, 4);

    setFormData({ ...formData, [field]: maskedValue });
  };

  // Buscar CEP via API dos Correios (ViaCEP)
  const searchCEP = async () => {
    const cepNumbers = formData.cep.replace(/\D/g, "");
    
    if (cepNumbers.length !== 8) return;

    setIsLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData({
          ...formData,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Validação de cada step - apenas campos essenciais obrigatórios
  const validateStep1 = () => {
    const phoneDigits = formData.phone.replace(/\D/g, "").length;
    return (
      formData.fullName.length > 3 &&
      formData.email.includes("@") &&
      (phoneDigits >= 8 && phoneDigits <= 15) // Aceita telefones de 8 a 15 dígitos
      // CPF agora é opcional
    );
  };

  const validateStep2 = () => {
    return (
      formData.cep.replace(/\D/g, "").length === 8 &&
      formData.street.length > 0 &&
      formData.number.length > 0 &&
      formData.neighborhood.length > 0 &&
      formData.city.length > 0 &&
      formData.state.length === 2
    );
  };

  const handleContinue = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const createMercadoPagoPreference = async () => {
    setIsCreatingPreference(true);
    
    try {
      const nameParts = formData.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const areaCode = phoneDigits.slice(0, 2);
      const phoneNumber = phoneDigits.slice(2);

      const { data, error } = await supabase.functions.invoke('mercadopago-preference', {
        body: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          payer: {
            name: firstName,
            surname: lastName,
            email: formData.email,
            phone: {
              area_code: areaCode,
              number: phoneNumber,
            },
            identification: formData.cpf ? {
              type: 'CPF',
              number: formData.cpf.replace(/\D/g, ''),
            } : undefined,
            address: {
              street_name: formData.street,
              street_number: parseInt(formData.number) || 0,
              zip_code: formData.cep.replace(/\D/g, ''),
            },
          },
          back_urls: {
            success: `${window.location.origin}/order-confirmed`,
            failure: `${window.location.origin}/checkout`,
            pending: `${window.location.origin}/order-pending`,
          },
        },
      });

      if (error) {
        console.error('Error creating preference:', error);
        toast.error('Erro ao iniciar pagamento. Tente novamente.');
        return;
      }

      console.log('Preference created:', data);
      setPreferenceId(data.id);
      toast.success('Preferência criada! Clique no botão do Mercado Pago para pagar.');
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar pagamento.');
    } finally {
      setIsCreatingPreference(false);
    }
  };

  const handleFinishOrder = async () => {
    if (paymentMethod === "mercadopago") {
      await createMercadoPagoPreference();
    } else {
      // Legacy flow for other payment methods
      console.log("Dados do pedido:", {
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          cpfCnpj: formData.cpf,
        },
        address: {
          cep: formData.cep,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        paymentMethod: paymentMethod,
        items: items,
        totalAmount: paymentMethod === "pix" ? pixPrice : totalPrice,
      });
      navigate("/order-confirmed");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Carrinho vazio</h2>
          <p className="text-muted-foreground mb-6">
            Adicione produtos ao carrinho antes de finalizar a compra.
          </p>
          <Link to="/">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar à loja
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b border-border py-4 sticky top-0 z-50">
        <div className="container flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Tecnoiso" className="h-8" />
          </Link>
          <SecurityBadge />
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        currentStep >= step
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className={`ml-3 text-sm font-medium hidden sm:block ${
                      currentStep >= step ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step === 1 && "Dados Pessoais"}
                      {step === 2 && "Endereço"}
                      {step === 3 && "Pagamento"}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        currentStep > step ? "bg-accent" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Dados Pessoais</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      placeholder="João da Silva"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        placeholder="(47) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00 (opcional)"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Opcional - necessário apenas para nota fiscal
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!validateStep1()}
                  className="w-full mt-6"
                  size="lg"
                >
                  Continuar para Endereço
                </Button>
              </Card>
            )}

            {/* Step 2: Endereço */}
            {currentStep === 2 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Endereço de Entrega</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    Voltar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={(e) => handleInputChange("cep", e.target.value)}
                        onBlur={searchCEP}
                        maxLength={9}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={searchCEP}
                        disabled={isLoadingCep || formData.cep.replace(/\D/g, "").length !== 8}
                      >
                        {isLoadingCep ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <a
                        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Não sei meu CEP
                      </a>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="street">Rua/Avenida *</Label>
                    <Input
                      id="street"
                      placeholder="Rua das Flores"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        placeholder="123"
                        value={formData.number}
                        onChange={(e) => handleInputChange("number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto 45, Bloco B"
                        value={formData.complement}
                        onChange={(e) => handleInputChange("complement", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Centro"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        placeholder="Joinville"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        placeholder="SC"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value.toUpperCase())}
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!validateStep2()}
                  className="w-full mt-6"
                  size="lg"
                >
                  Continuar para Pagamento
                </Button>
              </Card>
            )}

            {/* Step 3: Pagamento */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Forma de Pagamento</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                    >
                      Voltar
                    </Button>
                  </div>

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => {
                      setPaymentMethod(value as PaymentMethod);
                      setPreferenceId(null); // Reset preference when changing payment method
                    }}
                  >
                    {/* Mercado Pago - Opção Principal */}
                    <div className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "mercadopago" ? "border-accent bg-accent/5" : "hover:border-accent"}`}>
                      <RadioGroupItem value="mercadopago" id="mercadopago" />
                      <Label
                        htmlFor="mercadopago"
                        className="flex items-center justify-between flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#009EE3]/10 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#009EE3"/>
                              <path d="M16.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-9 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm4.5 6.5c-2.33 0-4.32-1.45-5.12-3.5h1.67c.69 1.19 1.97 2 3.45 2s2.76-.81 3.45-2h1.67c-.8 2.05-2.79 3.5-5.12 3.5z" fill="white"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold">Mercado Pago</p>
                            <p className="text-sm text-muted-foreground">
                              PIX, Cartão, Boleto e mais
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(totalPrice)}</p>
                          <p className="text-xs text-[#009EE3] font-medium">Compra segura</p>
                        </div>
                      </Label>
                    </div>

                    {/* PIX */}
                    <div className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "pix" ? "border-accent bg-accent/5" : "hover:border-accent"}`}>
                      <RadioGroupItem value="pix" id="pix" />
                      <Label
                        htmlFor="pix"
                        className="flex items-center justify-between flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold">PIX Direto</p>
                            <p className="text-sm text-muted-foreground">
                              Aprovação imediata
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-success">
                            {formatPrice(pixPrice)}
                          </p>
                          <p className="text-xs text-success font-medium">5% de desconto</p>
                        </div>
                      </Label>
                    </div>

                    {/* Cartão de Crédito */}
                    <div className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "credit_card" ? "border-accent bg-accent/5" : "hover:border-accent"}`}>
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label
                        htmlFor="credit_card"
                        className="flex items-center justify-between flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Cartão de Crédito</p>
                            <p className="text-sm text-muted-foreground">
                              Até 12x sem juros
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(totalPrice)}</p>
                          <p className="text-xs text-muted-foreground">
                            12x de {formatPrice(totalPrice / 12)}
                          </p>
                        </div>
                      </Label>
                    </div>

                    {/* Boleto */}
                    <div className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "boleto" ? "border-accent bg-accent/5" : "hover:border-accent"}`}>
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label
                        htmlFor="boleto"
                        className="flex items-center justify-between flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Barcode className="w-6 h-6 text-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold">Boleto Bancário</p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento em 3 dias
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(totalPrice)}</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </Card>

                {/* Formulário de Cartão */}
                {paymentMethod === "credit_card" && (
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Dados do Cartão</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardName">Nome no Cartão *</Label>
                        <Input
                          id="cardName"
                          placeholder="NOME COMO ESTÁ NO CARTÃO"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value.toUpperCase())}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Validade *</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/AA"
                            value={formData.cardExpiry}
                            onChange={(e) => handleInputChange("cardExpiry", e.target.value)}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv">CVV *</Label>
                          <Input
                            id="cardCvv"
                            placeholder="000"
                            value={formData.cardCvv}
                            onChange={(e) => handleInputChange("cardCvv", e.target.value)}
                            maxLength={4}
                            type="password"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Informações PIX */}
                {paymentMethod === "pix" && (
                  <Alert className="bg-success/10 border-success">
                    <QrCode className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      Após confirmar o pedido, você receberá o QR Code para pagamento via PIX.
                      O pagamento é processado instantaneamente.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Informações Boleto */}
                {paymentMethod === "boleto" && (
                  <Alert>
                    <Barcode className="h-4 w-4" />
                    <AlertDescription>
                      O boleto será gerado após a confirmação do pedido. O prazo de compensação
                      é de até 3 dias úteis.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Mercado Pago Wallet Button */}
                {paymentMethod === "mercadopago" && preferenceId && (
                  <div className="w-full">
                    <Wallet initialization={{ preferenceId }} />
                  </div>
                )}

                {/* Regular Button for other methods or to create preference */}
                {paymentMethod === "mercadopago" && !preferenceId && (
                  <Button
                    onClick={handleFinishOrder}
                    disabled={isCreatingPreference}
                    className="w-full bg-[#009EE3] hover:bg-[#0088c7]"
                    size="lg"
                  >
                    {isCreatingPreference ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Preparando pagamento...
                      </>
                    ) : (
                      "Pagar com Mercado Pago"
                    )}
                  </Button>
                )}

                {paymentMethod !== "mercadopago" && (
                  <Button
                    onClick={handleFinishOrder}
                    className="w-full"
                    size="lg"
                  >
                    Finalizar Pedido
                  </Button>
                )}

                {/* Security Badge */}
                <SecurityBadge variant="banner" showPaymentMethods />
              </div>
            )}
          </div>

          {/* Resumo do Pedido - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-border">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                      <p className="text-sm font-bold">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-medium text-success">GRÁTIS</span>
                </div>
                {paymentMethod === "pix" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success font-medium">Desconto PIX (5%)</span>
                    <span className="font-medium text-success">
                      -{formatPrice(totalPrice * 0.05)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-accent">
                    {formatPrice(paymentMethod === "pix" ? pixPrice : totalPrice)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}