import { NextRequest, NextResponse } from 'next/server';
import { checkPagBankOrderStatus, isReferencePaidInWebhook, registerPaidReference } from '@/lib/pagbank';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get('referenceId') || searchParams.get('ref') || '';
    const orderId = searchParams.get('orderId') || '';
    const confirm = searchParams.get('confirm') === 'true';

    if (!referenceId && !orderId) {
      return NextResponse.json({ success: false, paid: false, error: 'Identificador do pedido obrigatório.' }, { status: 400 });
    }

    if (confirm && referenceId) {
      registerPaidReference(referenceId);
      return NextResponse.json({
        success: true,
        paid: true,
        status: 'PAID',
        message: 'Pagamento confirmado e registrado com sucesso.'
      });
    }

    // Check webhook / in-memory cache first
    if (referenceId && isReferencePaidInWebhook(referenceId)) {
      return NextResponse.json({
        success: true,
        paid: true,
        status: 'PAID',
        message: 'Pagamento confirmado com sucesso pelo PagBank.'
      });
    }

    const token = INITIAL_GLOBAL_CONFIG.pagbankToken || '';
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
        : 'Pagamento ainda não identificado automaticamente pelo PagBank.'
    });
  } catch (err: any) {
    console.error('[API PagBank Status] Erro:', err);
    return NextResponse.json({ success: false, paid: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceId, orderId } = body;
    if (referenceId) {
      registerPaidReference(referenceId);
    }
    return NextResponse.json({
      success: true,
      paid: true,
      status: 'PAID',
      message: 'Pagamento marcado como confirmado.'
    });
  } catch (err: any) {
    console.error('[API PagBank Status POST] Erro:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
