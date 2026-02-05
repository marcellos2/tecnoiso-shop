import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users
} from 'lucide-react';

export function AdminReports() {
  const reports = [
    {
      title: 'Relatório de Vendas',
      description: 'Análise completa das vendas por período',
      icon: DollarSign,
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Relatório de Produtos',
      description: 'Performance e movimento de estoque',
      icon: Package,
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      title: 'Relatório de Clientes',
      description: 'Análise de comportamento e segmentação',
      icon: Users,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      title: 'Relatório Financeiro',
      description: 'Receitas, despesas e lucratividade',
      icon: TrendingUp,
      color: 'bg-amber-500/20 text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Relatórios e Exportações</CardTitle>
          <CardDescription className="text-slate-400">
            Gere relatórios detalhados sobre seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report, index) => (
              <Card key={index} className="border-slate-800/50 bg-slate-800/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${report.color}`}>
                      <report.icon className="h-6 w-6" />
                    </div>
                    <Calendar className="h-5 w-5 text-slate-500" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{report.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{report.description}</p>
                  <Button className="w-full gap-2 bg-slate-700 hover:bg-slate-600">
                    <Download className="h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-semibold text-white">vendas_janeiro_2024.pdf</p>
                    <p className="text-xs text-slate-500">Gerado há {i} dias</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}