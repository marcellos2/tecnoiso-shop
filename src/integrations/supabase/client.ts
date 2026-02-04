// src/integrations/supabase/client.ts
// Configuração Corrigida para OAuth com Google

import { createClient } from '@supabase/supabase-js';

// Buscar variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação (importante para debug)
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL não está definida!');
  console.log('Verifique se o arquivo .env existe na raiz do projeto');
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não está definida!');
  console.log('Verifique se o arquivo .env existe na raiz do projeto');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

// Log para debug (remova em produção)
console.log('✅ Supabase configurado:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
  keyStart: supabaseAnonKey.substring(0, 20) + '...',
});

// ✅ CORREÇÃO: Usar PKCE ao invés de implicit
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // IMPORTANTE: PKCE é mais seguro e recomendado
    flowType: 'pkce',  // ✅ CORRIGIDO
    
    // Auto refresh de tokens
    autoRefreshToken: true,
    
    // Persistir sessão no localStorage
    persistSession: true,
    
    // Detectar sessão na URL (importante para OAuth)
    detectSessionInUrl: true,
    
    // Storage padrão
    storage: window.localStorage,
    
    // Configurações de debug (remover em produção)
    debug: import.meta.env.DEV,
  },
  
  // Configurações globais
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
});

// Log de inicialização
console.log('✅ Cliente Supabase inicializado com PKCE flow');

// Listener para debug de autenticação (opcional - remova em produção)
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth State Change:', event);
    
    if (session) {
      console.log('👤 Session Active:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: new Date(session.expires_at! * 1000).toLocaleString(),
      });
    } else {
      console.log('👤 No active session');
    }
  });
}

export default supabase;