import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Check, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
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
  });

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login necessário",
        description: "Faça login para continuar com a compra",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate, toast]);

  // Preencher email do usuário logado
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
    if (user?.user_metadata?.full_name && !formData.fullName) {
      setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name || "" }));
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    let maskedValue = value;

    if (field === "cpf") maskedValue = maskCPF(value);
    if (field === "phone") maskedValue = maskPhone(value);
    if (field === "cep") maskedValue = maskCEP(value);

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
    }
  };

  // Função para redirecionar para o Mercado Pago
  const handlePayWithMercadoPago = async () => {
    if (!validateStep2()) return;
    
    setIsProcessing(true);
    
    try {
      const baseUrl = window.location.origin;
      
      const response = await supabase.functions.invoke('create-mercadopago-preference', {
        body: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customer: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
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
          successUrl: `${baseUrl}/order-confirmed`,
          failureUrl: `${baseUrl}/checkout`,
          pendingUrl: `${baseUrl}/order-confirmed?status=pending`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar pagamento');
      }

      const data = response.data;
      
      if (data.initPoint) {
        // Redirecionar para o Mercado Pago
        window.location.href = data.initPoint;
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: 'Erro no pagamento',
        description: error instanceof Error ? error.message : 'Erro ao processar pagamento. Tente novamente.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não autenticado - será redirecionado pelo useEffect
  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Compra 100% segura</span>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2].map((step) => (
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
                      {step === 2 && "Endereço e Pagamento"}
                    </span>
                  </div>
                  {step < 2 && (
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

                {/* Selo de Compra Segura */}
                <Alert className="bg-success/10 border-success mt-4">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <AlertDescription className="text-success font-medium">
                    Compra 100% segura via Mercado Pago. Você será redirecionado para escolher sua forma de pagamento (PIX, Cartão, Boleto).
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handlePayWithMercadoPago}
                  disabled={!validateStep2() || isProcessing}
                  className="w-full mt-6 gap-2"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Pagar com Mercado Pago
                    </>
                  )}
                </Button>
              </Card>
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
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-accent">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Selo Mercado Pago */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span>Pagamento seguro via</span>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <div className="bg-[#009EE3] text-white px-3 py-1.5 rounded font-bold text-sm">
                    Mercado Pago
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}