import { NextRequest, NextResponse } from 'next/server';
import { registerPaidReference } from '@/lib/pagbank';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[PagBank Webhook] Notificação recebida:', JSON.stringify(payload, null, 2));

    // Check PagBank notification type and status
    const status = payload?.charges?.[0]?.status || payload?.status;
    const referenceId = payload?.reference_id || payload?.referenceId;

    if (status === 'PAID' || status === 'AUTHORIZED') {
      console.log(`[PagBank Webhook] Pagamento confirmado com sucesso para referência: ${referenceId}`);
      if (referenceId) {
        registerPaidReference(referenceId);
      }
      return NextResponse.json({ received: true, status: 'PAID', referenceId });
    }

    return NextResponse.json({ received: true, status });
  } catch (err: any) {
    console.error('[PagBank Webhook] Erro ao processar webhook:', err);
    return NextResponse.json({ received: false, error: err.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'PagBank Webhook Listener Ativo - BIRDPRO' });
}
