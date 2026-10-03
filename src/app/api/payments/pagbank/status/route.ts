import { NextRequest, NextResponse } from 'next/server';
import { checkPagBankOrderStatus, isReferencePaidInWebhook } from '@/lib/pagbank';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get('referenceId') || searchParams.get('ref') || '';
    const orderId = searchParams.get('orderId') || '';

    if (!referenceId && !orderId) {
      return NextResponse.json({ success: false, paid: false, error: 'Identificador do pedido obrigatório.' }, { status: 400 });
    }

    // Check webhook cache first
    if (referenceId && isReferencePaidInWebhook(referenceId)) {
      return NextResponse.json({
        success: true,
        paid: true,
        status: 'PAID',
        message: 'Pagamento confirmado com sucesso pelo Webhook do PagBank.'
      });
    }

    const token = INITIAL_GLOBAL_CONFIG.pagbankToken || '20213321-f0b7-455f-8ff6-c437a8b1ff105b6fd3a74fc3b080814c834862d748b6f421-e36a-4ed4-be40-a4becc8ec034';
    const isSandbox = INITIAL_GLOBAL_CONFIG.pagbankSandbox || false;

    const result = await checkPagBankOrderStatus({
      orderId,
      referenceId,
      token,
      isSandbox
    });

    return NextResponse.json({
      success: true,
      paid: result.paid,
      status: result.status,
      message: result.paid 
        ? 'Pagamento identificado e aprovado pelo PagBank.' 
        : 'Pagamento ainda não identificado no PagBank. Aguardando compensação.'
    });
  } catch (err: any) {
    console.error('[API PagBank Status] Erro:', err);
    return NextResponse.json({ success: false, paid: false, error: err.message }, { status: 500 });
  }
}
