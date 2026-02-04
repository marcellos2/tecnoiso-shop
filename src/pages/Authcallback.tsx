import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processando autenticação...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        console.log('=== CALLBACK INICIADO ===');
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error') || url.searchParams.get('error');
        
        // Check for errors
        if (hashError) {
          const errorDesc = hashParams.get('error_description') || url.searchParams.get('error_description') || 'Erro na autenticação';
          console.error('❌ OAuth error:', hashError);
          setError(errorDesc);
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
          return;
        }

        // Process PKCE code
        if (code) {
          console.log('=== PROCESSANDO CÓDIGO PKCE ===');
          setStatus('Finalizando login...');
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('❌ Erro ao trocar código:', exchangeError);
            setError(exchangeError.message);
            setTimeout(() => navigate('/auth', { replace: true }), 2000);
            return;
          }

          if (data?.session?.user) {
            console.log('✅ Login bem-sucedido:', data.session.user.email);
            await checkAndRedirect(data.session.user.id);
            return;
          }
        }

        // Process hash tokens
        const accessToken = hashParams.get('access_token');
        if (accessToken) {
          console.log('=== PROCESSANDO TOKENS HASH ===');
          setStatus('Configurando sessão...');
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (sessionError) {
            console.error('❌ Erro ao configurar sessão:', sessionError);
            setError(sessionError.message);
            setTimeout(() => navigate('/auth', { replace: true }), 2000);
            return;
          }

          if (data?.session?.user) {
            console.log('✅ Sessão configurada:', data.session.user.email);
            await checkAndRedirect(data.session.user.id);
            return;
          }
        }

        // Check existing session
        console.log('=== VERIFICANDO SESSÃO EXISTENTE ===');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Sessão existente:', session.user.email);
          await checkAndRedirect(session.user.id);
          return;
        }

        // No session found
        console.log('❌ Nenhuma sessão encontrada');
        setError('Sessão não encontrada. Tente novamente.');
        setTimeout(() => navigate('/auth', { replace: true }), 2000);
        
      } catch (err: any) {
        console.error('❌ Erro geral:', err);
        setError(err?.message || 'Erro inesperado');
        setTimeout(() => navigate('/auth', { replace: true }), 2000);
      }
    };

    const checkAndRedirect = async (userId: string) => {
      setStatus('Verificando permissões...');
      
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        const isAdmin = !!roleData;
        const destination = isAdmin ? '/admin' : '/';
        
        console.log(`✅ Redirecionando para ${destination} (admin: ${isAdmin})`);
        setStatus('Redirecionando...');
        
        setTimeout(() => navigate(destination, { replace: true }), 500);
      } catch (err) {
        console.error('⚠️ Erro ao verificar role:', err);
        setTimeout(() => navigate('/', { replace: true }), 500);
      }
    };

    processAuth();
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
            <p className="text-sm text-muted-foreground">Redirecionando...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Autenticando...</h1>
            <p className="text-muted-foreground mb-4">{status}</p>
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