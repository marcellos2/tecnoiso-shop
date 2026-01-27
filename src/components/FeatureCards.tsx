import { Truck, User, MapPin, CreditCard, ShieldCheck, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Frete Grátis',
    description: 'Acima de R$ 500',
  },
  {
    icon: ShieldCheck,
    title: 'Garantia',
    description: '12 meses em todos os produtos',
  },
  {
    icon: CreditCard,
    title: '12x Sem Juros',
    description: 'Em todos os cartões',
  },
  {
    icon: Headphones,
    title: 'Suporte',
    description: 'Atendimento especializado',
  },
];

const FeatureCards = () => {
  return (
    <section className="border-b border-border bg-background">
      <div className="container py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
