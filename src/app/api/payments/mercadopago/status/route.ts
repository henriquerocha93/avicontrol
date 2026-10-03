import { NextRequest, NextResponse } from 'next/server';
import { checkMercadoPagoPaymentStatus } from '@/lib/mercadopago';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId') || '';
    const referenceId = searchParams.get('referenceId') || searchParams.get('ref') || '';

    if (!paymentId && !referenceId) {
      return NextResponse.json({
        success: false,
        paid: false,
        status: 'INVALID_REQUEST',
        error: 'Identificador do pagamento (paymentId ou referenceId) é obrigatório.'
      }, { status: 400 });
    }

    const token = INITIAL_GLOBAL_CONFIG.gatewayApiKey || process.env.MERCADOPAGO_ACCESS_TOKEN;

    const result = await checkMercadoPagoPaymentStatus({
      paymentId,
      referenceId,
      token
    });

    return NextResponse.json({
      success: true,
      paid: result.paid,
      status: result.status,
      paymentId: result.paymentId,
      referenceId: result.referenceId,
      message: result.paid
        ? '🎉 Pagamento confirmado e aprovado pelo Mercado Pago!'
        : 'Aguardando confirmação do pagamento no Mercado Pago.'
    });
  } catch (err: any) {
    console.error('[API MercadoPago Status] Erro:', err);
    return NextResponse.json({
      success: false,
      paid: false,
      status: 'ERROR',
      error: err.message
    }, { status: 500 });
  }
}
