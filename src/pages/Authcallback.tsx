import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        if (data.session) {
          console.log('Session established:', data.session);
          toast({
            title: 'Bem-vindo!',
            description: 'Login realizado com sucesso',
          });
          navigate('/');
        } else {
          console.error('No session found after callback');
          toast({
            title: 'Erro',
            description: 'Não foi possível completar o login',
            variant: 'destructive',
          });
          navigate('/auth');
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro ao processar login',
          variant: 'destructive',
        });
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-accent border-r-transparent mb-4"></div>
        <p className="text-muted-foreground">Processando login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;