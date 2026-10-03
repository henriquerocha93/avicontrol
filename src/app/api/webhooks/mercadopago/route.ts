import { NextRequest, NextResponse } from 'next/server';
import { checkMercadoPagoPaymentStatus, registerMercadoPagoPaidReference } from '@/lib/mercadopago';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get('id') || searchParams.get('data.id');
    const queryTopic = searchParams.get('topic') || searchParams.get('type');

    let bodyId = '';
    let bodyType = '';
    try {
      const body = await req.json();
      bodyId = body?.data?.id || body?.id || '';
      bodyType = body?.type || body?.action || '';
    } catch (e) {
      // Body might be empty in some MP ping variants
    }

    const paymentId = queryId || bodyId;
    const type = queryTopic || bodyType;

    if (!paymentId) {
      return NextResponse.json({ received: true, note: 'No payment id found in webhook' }, { status: 200 });
    }

    // Query Mercado Pago API to get authoritative payment state
    const token = INITIAL_GLOBAL_CONFIG.gatewayApiKey || process.env.MERCADOPAGO_ACCESS_TOKEN;
    const result = await checkMercadoPagoPaymentStatus({
      paymentId: String(paymentId),
      token
    });

    if (result.paid && result.referenceId) {
      registerMercadoPagoPaidReference(result.referenceId, String(paymentId));
      console.log(`[Webhook MercadoPago] Pagamento APROVADO! Ref: ${result.referenceId} Payment: ${paymentId}`);
    }

    return NextResponse.json({
      received: true,
      processed: true,
      paid: result.paid,
      status: result.status,
      referenceId: result.referenceId
    }, { status: 200 });
  } catch (err: any) {
    console.error('[Webhook MercadoPago] Erro:', err);
    return NextResponse.json({ received: true, error: err.message }, { status: 200 });
  }
}

// Mercado Pago also sends HEAD or GET to verify webhook endpoints
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'BIRDPRO MercadoPago Webhook' }, { status: 200 });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
