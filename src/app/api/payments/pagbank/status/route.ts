import { NextRequest, NextResponse } from 'next/server';
import { checkPagBankOrderStatus, isReferencePaidInWebhook } from '@/lib/pagbank';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get('referenceId') || searchParams.get('ref') || '';
    const orderId = searchParams.get('orderId') || '';

    if (!referenceId && !orderId) {
      return NextResponse.json({ 
        success: false, 
        paid: false, 
        status: 'INVALID_REQUEST',
        error: 'Identificador do pedido (referenceId ou orderId) obrigatório.' 
      }, { status: 400 });
    }

    // 1. Check if payment was confirmed via PagBank Webhook
    if (referenceId && isReferencePaidInWebhook(referenceId)) {
      return NextResponse.json({
        success: true,
        paid: true,
        status: 'PAID',
        message: 'Pagamento confirmado com sucesso via Notificação Oficial do PagBank.'
      });
    }

    // 2. Real query to PagBank API servers
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
        : 'Pagamento ainda não confirmado no PagBank. Aguardando compensação bancária.'
    });
  } catch (err: any) {
    console.error('[API PagBank Status] Erro:', err);
    return NextResponse.json({ 
      success: false, 
      paid: false, 
      status: 'ERROR',
      error: err.message || 'Erro ao consultar status no PagBank.' 
    }, { status: 500 });
  }
}
