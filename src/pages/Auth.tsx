import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import { z } from 'zod';

const emailSchema = z.string().email('E-mail inválido').max(255, 'E-mail muito longo');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100, 'Senha muito longa');

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    // IMPORTANT: listener FIRST, then check for existing session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        // After OAuth redirects / hard refresh, we often get INITIAL_SESSION.
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          // Defer navigation to avoid deadlock
          setTimeout(() => {
            if (isMounted) {
              navigate('/');
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) {
        navigate('/');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Valida os inputs
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({
        title: 'Erro',
        description: emailResult.error.errors[0].message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({
        title: 'Erro',
        description: passwordResult.error.errors[0].message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          let message = 'Erro ao fazer login';
          if (error.message.includes('Invalid login credentials')) {
            message = 'E-mail ou senha incorretos';
          } else if (error.message.includes('Email not confirmed')) {
            message = 'Por favor, confirme seu e-mail antes de fazer login';
          }
          throw new Error(message);
        }

        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso',
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          let message = 'Erro ao criar conta';
          if (error.message.includes('already registered')) {
            message = 'Este e-mail já está cadastrado';
          }
          throw new Error(message);
        }

        toast({
          title: 'Conta criada!',
          description: 'Verifique seu e-mail para confirmar a conta',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando login com Google...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/authcallback`,
        },
      });

      if (error) {
        console.error('Erro no OAuth:', error);
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
      // Se não houver erro, vai redirecionar automaticamente
      
    } catch (error) {
      console.error('Erro no login com Google:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao fazer login com Google.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-foreground py-4">
        <div className="container flex justify-center">
          <Link to="/">
            <img src={logo} alt="Tecnoiso" className="h-10 brightness-0 invert" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center pt-8 md:pt-16 px-4">
        <div className="w-full max-w-4xl flex flex-col md:flex-row md:gap-16">
          {/* Left side - Title */}
          <div className="flex-1 mb-8 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-light text-foreground leading-tight">
              {isLogin ? (
                <>
                  Digite seu e-mail ou telefone<br />
                  para iniciar sessão
                </>
              ) : (
                <>
                  Crie sua conta<br />
                  para começar a comprar
                </>
              )}
            </h1>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm text-muted-foreground block mb-2">
                  E-mail ou telefone
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-border focus:border-accent focus:ring-accent"
                  placeholder=""
                  required
                />
              </div>

              {showPassword && (
                <div>
                  <label htmlFor="password" className="text-sm text-muted-foreground block mb-2">
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-border focus:border-accent focus:ring-accent"
                    placeholder=""
                    required
                  />
                </div>
              )}

              {!showPassword ? (
                <Button
                  type="button"
                  onClick={() => setShowPassword(true)}
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded"
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded"
                >
                  {isLoading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar conta'}
                </Button>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setShowPassword(false);
                  }}
                  className="text-accent hover:underline text-sm font-medium"
                >
                  {isLogin ? 'Criar conta' : 'Já tenho uma conta'}
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 border border-border rounded flex items-center justify-center gap-3 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-foreground font-medium">
                  {isLoading ? 'Redirecionando...' : 'Fazer Login com o Google'}
                </span>
              </button>
            </form>

            <div className="mt-8 space-y-4 text-sm">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                Tenho um problema de segurança
              </button>
              <button className="text-accent hover:underline">
                Preciso de ajuda
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border mt-auto">
        <div className="container flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>
            <a href="#" className="hover:text-foreground">Como cuidamos da sua privacidade</a>
            {' - '}
            Copyright © 1999-2026 Tecnoiso LTDA.
          </p>
          <p className="mt-2 md:mt-0">
            Protegido por reCAPTCHA -{' '}
            <a href="#" className="hover:text-foreground">Privacidade</a>
            {' - '}
            <a href="#" className="hover:text-foreground">Condições</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;