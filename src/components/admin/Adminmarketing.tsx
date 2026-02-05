import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, 
  Mail,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Plus
} from 'lucide-react';

export function AdminMarketing() {
  const campaigns = [
    {
      name: 'Promoção de Verão',
      status: 'active',
      reach: 1234,
      conversions: 89,
      revenue: 12450,
    },
    {
      name: 'Black Friday 2024',
      status: 'scheduled',
      reach: 0,
      conversions: 0,
      revenue: 0,
    },
    {
      name: 'Newsletter Semanal',
      status: 'active',
      reach: 856,
      conversions: 34,
      revenue: 4890,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativa</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Agendada</Badge>;
      case 'paused':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pausada</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Alcance Total</p>
                <p className="text-3xl font-bold text-white mt-2">2.1K</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Taxa Conversão</p>
                <p className="text-3xl font-bold text-white mt-2">5.8%</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Receita Gerada</p>
                <p className="text-3xl font-bold text-white mt-2">R$ 17.3K</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <DollarSign className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Campanhas de Marketing</CardTitle>
              <CardDescription className="text-slate-400">
                Gerencie suas campanhas e estratégias de marketing
              </CardDescription>
            </div>
            <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4" />
              Nova Campanha
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <Card key={index} className="border-slate-800/50 bg-slate-800/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{campaign.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {campaign.status === 'active' ? 'Campanha em andamento' : 'Aguardando início'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800/50">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{campaign.reach}</p>
                      <p className="text-xs text-slate-400 mt-1">Alcance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{campaign.conversions}</p>
                      <p className="text-xs text-slate-400 mt-1">Conversões</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(campaign.revenue)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Receita</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 border-slate-800">
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-slate-800">
                      {campaign.status === 'active' ? 'Pausar' : 'Ativar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Marketing */}
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5" />
            Email Marketing
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie suas campanhas de email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Total de Inscritos</p>
              <p className="text-2xl font-bold text-white">3,456</p>
              <p className="text-xs text-emerald-400 mt-1">+12% este mês</p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Taxa de Abertura</p>
              <p className="text-2xl font-bold text-white">24.8%</p>
              <p className="text-xs text-emerald-400 mt-1">+2.3% vs mês anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}