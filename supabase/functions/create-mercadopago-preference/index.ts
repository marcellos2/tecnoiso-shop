import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomerData {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
}

interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface RequestBody {
  items: CartItem[];
  customer: CustomerData;
  address: AddressData;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    const body: RequestBody = await req.json();
    const { items, customer, address, successUrl, failureUrl, pendingUrl } = body;

    // Formatar itens para o Mercado Pago
    const mpItems = items.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'BRL',
      picture_url: item.image,
    }));

    // Criar preferência no Mercado Pago
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
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
      statement_descriptor: 'TECNOISO',
      external_reference: `order_${Date.now()}`,
    };

    console.log('Creating preference:', JSON.stringify(preference, null, 2));

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
      throw new Error(data.message || 'Error creating preference');
    }

    console.log('Preference created:', data.id);

    return new Response(
      JSON.stringify({
        preferenceId: data.id,
        initPoint: data.init_point,
        sandboxInitPoint: data.sandbox_init_point,
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
