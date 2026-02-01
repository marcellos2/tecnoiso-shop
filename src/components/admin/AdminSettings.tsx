import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Shield, Phone, Save, CheckCircle } from 'lucide-react';

export function AdminSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-border bg-background">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <User className="h-5 w-5 text-foreground" />
            </div>
            Meu Perfil
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Gerencie suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-secondary border-border text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground font-medium">Nome Completo</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="border-border"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">Telefone</Label>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="border-border flex-1"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={saving}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-background">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <Shield className="h-5 w-5 text-foreground" />
            </div>
            Segurança
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Informações sobre sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-success/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Nível de Acesso</p>
                <p className="text-sm text-muted-foreground">Administrador com permissões totais</p>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-foreground text-background rounded-full text-sm font-bold">
              Admin
            </span>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <p className="font-semibold text-foreground">Último Acesso</p>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="p-4 border border-border rounded-lg bg-secondary/30">
            <p className="font-semibold text-foreground">Email de Administrador</p>
            <p className="text-sm text-muted-foreground mt-1">
              mclsouza1613ad@gmail.com
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Este é o único email com acesso administrativo ao sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
