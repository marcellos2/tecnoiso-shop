import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const redirectAfterLogin = async (sessionUserId: string) => {
          // Decide destino: admin vai direto pro painel.
          const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', {
            _user_id: sessionUserId,
          });

          if (adminErr) {
            console.error('Erro ao checar admin:', adminErr);
            navigate('/', { replace: true });
            return;
          }

          navigate(isAdmin ? '/admin' : '/', { replace: true });
        };

        // 1) Fluxo com tokens no hash (#access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });

          if (error) {
            console.error('Erro ao configurar sessão:', error);
            setError(error.message);
            setTimeout(() => navigate('/auth'), 3000);
            return;
          }

          if (data.session?.user?.id) {
            await redirectAfterLogin(data.session.user.id);
            return;
          }
        }

        // 2) Fluxo PKCE com ?code=...
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error('Erro ao trocar code por sessão:', error);
            setError(error.message);
            setTimeout(() => navigate('/auth'), 3000);
            return;
          }

          const userId = data?.session?.user?.id;
          if (userId) {
            await redirectAfterLogin(userId);
            return;
          }
        }

        // 3) Se não veio nada, tenta pegar sessão existente
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user?.id) {
          console.error('Nenhuma sessão encontrada');
          navigate('/auth', { replace: true });
          return;
        }

        await redirectAfterLogin(session.user.id);
      } catch (err) {
        console.error('Erro ao processar callback:', err);
        setError('Erro ao processar autenticação');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <img src={logo} alt="Tecnoiso" className="h-16 mx-auto mb-8" />
        
        {error ? (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Erro na Autenticação</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecionando para a página de login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Autenticando...</h1>
            <p className="text-muted-foreground">
              Aguarde enquanto completamos seu login
            </p>
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;