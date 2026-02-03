// src/integrations/supabase/client.ts
// Template Correto para OAuth com Google

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

// Criar cliente com configurações para OAuth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Importante para OAuth funcionar
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    
    // Configuração de storage (localStorage)
    storage: window.localStorage,
    
    // Flow type (implicit é melhor para web)
    flowType: 'implicit',
  },
  
  // Configurações globais
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
});

// Log de inicialização
console.log('✅ Cliente Supabase inicializado');

// Listener para debug de autenticação (remova em produção)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth State Change:', event);
  console.log('👤 Session:', session ? 'Active' : 'No session');
  
  if (event === 'SIGNED_IN') {
    console.log('✅ User signed in:', session?.user?.email);
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('👋 User signed out');
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refreshed');
  }
});

export default supabase;