import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processando autenticação...');
  
  // ✅ CRÍTICO: useRef para garantir execução ÚNICA
  const processingRef = useRef(false);
  const processedRef = useRef(false);

  useEffect(() => {
    // ✅ PROTEÇÃO ABSOLUTA contra execução múltipla
    if (processingRef.current || processedRef.current) {
      console.log('⚠️ Callback já está sendo processado ou foi processado, abortando...');
      return;
    }
    
    // Marcar como processando IMEDIATAMENTE
    processingRef.current = true;
    processedRef.current = true;

    let timeoutId: NodeJS.Timeout;

    const handleCallback = async () => {
      try {
        console.log('=== INÍCIO DO CALLBACK ===');
        console.log('Timestamp:', new Date().toISOString());
        setStatus('Verificando credenciais...');
        
        // Obter URL e parâmetros
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        console.log('URL:', url.href);
        console.log('Hash params:', Array.from(hashParams.entries()));
        console.log('Query params:', Array.from(url.searchParams.entries()));
        
        // 1. Verificar erros primeiro
        const hashError = hashParams.get('error');
        const hashErrorDesc = hashParams.get('error_description');
        const queryError = url.searchParams.get('error');
        const queryErrorDesc = url.searchParams.get('error_description');
        
        if (hashError || queryError) {
          const errorMsg = hashErrorDesc || queryErrorDesc || 'Erro na autenticação';
          console.error('❌ OAuth error:', hashError || queryError);
          setError(errorMsg);
          timeoutId = setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }

        // 2. Processar PKCE flow (código na URL)
        const code = url.searchParams.get('code');
        if (code) {
          console.log('=== FLUXO PKCE DETECTADO ===');
          console.log('Code (primeiros 20 chars):', code.substring(0, 20) + '...');
          setStatus('Trocando código por sessão...');
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('❌ Erro no exchangeCodeForSession:', exchangeError);
            setError(exchangeError.message);
            timeoutId = setTimeout(() => {
              navigate('/auth', { replace: true });
            }, 3000);
            return;
          }

          if (data?.session?.user?.id) {
            console.log('✅ Sessão obtida via PKCE');
            console.log('User ID:', data.session.user.id);
            console.log('Email:', data.session.user.email);
            
            await redirectAfterLogin(data.session.user.id);
            return;
          }
        }

        // 3. Processar hash-based flow (tokens no hash)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          console.log('=== FLUXO HASH-BASED DETECTADO ===');
          console.log('Access token (primeiros 20 chars):', accessToken.substring(0, 20) + '...');
          setStatus('Configurando sessão...');
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('❌ Erro no setSession:', sessionError);
            setError(sessionError.message);
            timeoutId = setTimeout(() => {
              navigate('/auth', { replace: true });
            }, 3000);
            return;
          }

          if (data?.session?.user?.id) {
            console.log('✅ Sessão configurada via hash');
            console.log('User ID:', data.session.user.id);
            console.log('Email:', data.session.user.email);
            
            await redirectAfterLogin(data.session.user.id);
            return;
          }
        }

        // 4. Verificar sessão existente (último recurso)
        console.log('=== VERIFICANDO SESSÃO EXISTENTE ===');
        setStatus('Verificando sessão...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Erro ao obter sessão:', sessionError);
          setError('Erro ao verificar sessão');
          timeoutId = setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }

        if (session?.user?.id) {
          console.log('✅ Sessão existente encontrada');
          console.log('User ID:', session.user.id);
          console.log('Email:', session.user.email);
          
          await redirectAfterLogin(session.user.id);
          return;
        }

        // Se chegou aqui, não há sessão válida
        console.log('❌ Nenhuma sessão válida encontrada');
        setError('Nenhuma sessão ativa encontrada');
        timeoutId = setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 2000);
        
      } catch (err: any) {
        console.error('❌ ERRO GERAL NO CALLBACK:', err);
        console.error('Stack:', err?.stack);
        
        setError(err?.message || 'Erro ao processar autenticação');
        timeoutId = setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    // Função para redirecionar após login
    const redirectAfterLogin = async (sessionUserId: string) => {
      try {
        console.log('=== VERIFICANDO PERMISSÕES ===');
        setStatus('Verificando permissões...');
        
        const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin', {
          _user_id: sessionUserId,
        });

        if (adminErr) {
          console.error('⚠️ Erro ao verificar admin:', adminErr);
          console.log('➡️ Redirecionando para home (fallback)');
          setStatus('Redirecionando...');
          
          timeoutId = setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
          return;
        }

        console.log('✅ Admin check:', isAdmin ? 'É admin' : 'Não é admin');
        const destination = isAdmin ? '/admin' : '/';
        console.log('➡️ Redirecionando para:', destination);
        
        setStatus('Redirecionando...');
        timeoutId = setTimeout(() => {
          navigate(destination, { replace: true });
        }, 1000);
        
      } catch (err: any) {
        console.error('⚠️ Erro ao verificar admin:', err);
        console.log('➡️ Redirecionando para home (erro)');
        
        timeoutId = setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    };

    // Executar o callback
    handleCallback();

    // ✅ CLEANUP: Limpar timeout se o componente desmontar
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

  }, []); // ✅ Array vazio - executa APENAS uma vez

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
            <p className="text-muted-foreground mb-4">
              {status}
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