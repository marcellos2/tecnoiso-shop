import { Truck, User, MapPin, CreditCard, BadgeDollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Truck,
    title: 'Frete grátis',
    description: 'Benefício por ser sua primeira compra.',
    buttonText: 'Mostrar produtos',
  },
  {
    icon: User,
    title: 'Entre na sua conta',
    description: 'Aproveite ofertas para comprar tudo que quiser.',
    buttonText: 'Entrar na sua conta',
  },
  {
    icon: MapPin,
    title: 'Insira sua localização',
    description: 'Confira os custos e prazos de entrega.',
    buttonText: 'Informar localização',
  },
  {
    icon: CreditCard,
    title: 'Meios de pagamento',
    description: 'Pague suas compras com rapidez e segurança.',
    buttonText: 'Mostrar meios',
  },
  {
    icon: BadgeDollarSign,
    title: 'Menos de R$100',
    description: 'Confira produtos com preços baixos.',
    buttonText: 'Mostrar produtos',
  },
  {
    icon: TrendingUp,
    title: 'Mais vendidos',
    description: 'Explore os produtos que são tendência.',
    buttonText: 'Ir para Mais vendidos',
  },
];

const FeatureCards = () => {
  return (
    <section className="container py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-foreground text-sm mb-3">
                {feature.title}
              </h3>
              
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-[#ffe600]/20 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-[#333]" strokeWidth={1.5} />
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mb-4 min-h-[32px]">
                {feature.description}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-[#3483fa] text-[#3483fa] hover:bg-[#3483fa]/5"
              >
                {feature.buttonText}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureCards;
