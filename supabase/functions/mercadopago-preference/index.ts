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

interface PayerInfo {
  name: string;
  surname: string;
  email: string;
  phone: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
  address: {
    street_name: string;
    street_number: number;
    zip_code: string;
  };
}

interface PreferenceRequest {
  items: CartItem[];
  payer: PayerInfo;
  external_reference?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PreferenceRequest = await req.json();
    console.log('Received preference request:', JSON.stringify(body, null, 2));

    // Build preference items
    const items = body.items.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'BRL',
      picture_url: item.image || undefined,
    }));

    // Build preference object
    const preference = {
      items,
      payer: {
        name: body.payer.name,
        surname: body.payer.surname,
        email: body.payer.email,
        phone: body.payer.phone,
        identification: body.payer.identification,
        address: body.payer.address,
      },
      back_urls: body.back_urls || {
        success: `${req.headers.get('origin') || 'https://tecnoiso.com'}/order-confirmed`,
        failure: `${req.headers.get('origin') || 'https://tecnoiso.com'}/checkout`,
        pending: `${req.headers.get('origin') || 'https://tecnoiso.com'}/order-pending`,
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 12,
      },
      statement_descriptor: 'TECNOISO',
      external_reference: body.external_reference || `ORDER-${Date.now()}`,
    };

    console.log('Creating preference:', JSON.stringify(preference, null, 2));

    // Create preference via Mercado Pago API
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();
    console.log('Mercado Pago response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Mercado Pago error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment preference', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error creating preference:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
