import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Input validation schemas
const CartItemSchema = z.object({
  id: z.string().min(1, "ID do item é obrigatório").max(100, "ID do item muito longo"),
  name: z.string().min(1, "Nome do item é obrigatório").max(200, "Nome do item muito longo"),
  price: z.number().positive("Preço deve ser positivo").max(999999.99, "Preço excede o limite"),
  quantity: z.number().int("Quantidade deve ser inteira").positive("Quantidade deve ser positiva").max(100, "Quantidade máxima excedida"),
  image: z.string().url("URL de imagem inválida").max(500, "URL de imagem muito longa").optional(),
});

const CustomerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().min(8, "Telefone muito curto").max(20, "Telefone muito longo").optional(),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido").optional(),
});

const AddressSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória").max(200, "Rua muito longa"),
  number: z.string().min(1, "Número é obrigatório").max(10, "Número muito longo"),
  complement: z.string().max(100, "Complemento muito longo").optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório").max(100, "Bairro muito longo"),
  city: z.string().min(1, "Cidade é obrigatória").max(100, "Cidade muito longa"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
});

const RequestSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Carrinho vazio").max(50, "Limite de 50 itens excedido"),
  customer: CustomerSchema,
  address: AddressSchema,
  successUrl: z.string().url("URL de sucesso inválida").max(500, "URL muito longa"),
  failureUrl: z.string().url("URL de falha inválida").max(500, "URL muito longa"),
  pendingUrl: z.string().url("URL de pendente inválida").max(500, "URL muito longa"),
});

type CartItem = z.infer<typeof CartItemSchema>;
type CustomerData = z.infer<typeof CustomerSchema>;
type AddressData = z.infer<typeof AddressSchema>;
type RequestBody = z.infer<typeof RequestSchema>;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Autenticação necessária. Por favor, faça login para continuar.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client with user's auth token for user verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Sessão expirada. Por favor, faça login novamente.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    // Parse and validate request body with Zod
    let body: RequestBody;
    try {
      const rawBody = await req.json();
      body = RequestSchema.parse(rawBody);
      console.log('Request validated successfully');
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        ).join('; ');
        console.error('Validation error:', errorMessages);
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: errorMessages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      throw validationError;
    }

    const { items, customer, address, successUrl, failureUrl, pendingUrl } = body;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save order to database BEFORE creating payment preference
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || null,
        customer_cpf: customer.cpf || null,
        shipping_address: address,
        items: items,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error saving order:', orderError);
      throw new Error('Erro ao salvar pedido: ' + orderError.message);
    }

    console.log('Order saved with ID:', order.id);

    // Format items for Mercado Pago
    const mpItems = items.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'BRL',
      picture_url: item.image,
    }));

    // Create Mercado Pago preference with order ID in URLs
    const preference = {
      items: mpItems,
      payer: {
        name: customer.name.split(' ')[0],
        surname: customer.name.split(' ').slice(1).join(' ') || '',
        email: customer.email,
        phone: customer.phone ? {
          area_code: customer.phone.replace(/\D/g, '').substring(0, 2),
          number: customer.phone.replace(/\D/g, '').substring(2),
        } : undefined,
        identification: customer.cpf ? {
          type: 'CPF',
          number: customer.cpf.replace(/\D/g, ''),
        } : undefined,
        address: {
          zip_code: address.cep.replace(/\D/g, ''),
          street_name: address.street,
          street_number: parseInt(address.number) || 0,
        },
      },
      shipments: {
        receiver_address: {
          zip_code: address.cep.replace(/\D/g, ''),
          street_name: address.street,
          street_number: parseInt(address.number) || 0,
          floor: address.complement || '',
          apartment: '',
          city_name: address.city,
          state_name: address.state,
        },
      },
      back_urls: {
        success: `${successUrl}?order_id=${order.id}`,
        failure: `${failureUrl}?order_id=${order.id}`,
        pending: `${pendingUrl}&order_id=${order.id}`,
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
      statement_descriptor: 'TECNOISO',
      external_reference: order.id, // Use database order ID for tracking
    };

    console.log('Creating preference for order:', order.id);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago error:', data);
      
      // If Mercado Pago fails, delete the order or mark as failed
      await supabaseAdmin
        .from('orders')
        .update({ status: 'failed', payment_status: 'failed' })
        .eq('id', order.id);
      
      throw new Error(data.message || 'Error creating preference');
    }

    // Update order with payment preference ID
    await supabaseAdmin
      .from('orders')
      .update({ payment_id: data.id })
      .eq('id', order.id);

    console.log('Preference created:', data.id, 'for order:', order.id);

    return new Response(
      JSON.stringify({
        preferenceId: data.id,
        initPoint: data.init_point,
        sandboxInitPoint: data.sandbox_init_point,
        orderId: order.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
