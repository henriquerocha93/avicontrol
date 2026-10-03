import { NextRequest, NextResponse } from 'next/server';
import { createMercadoPagoPixOrder } from '@/lib/mercadopago';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      referenceId,
      customerName,
      customerEmail,
      customerCpf,
      customerPhone,
      amount,
      description,
      token
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valor da transação inválido.' }, { status: 400 });
    }

    const effectiveToken = token || INITIAL_GLOBAL_CONFIG.gatewayApiKey || process.env.MERCADOPAGO_ACCESS_TOKEN;

    const result = await createMercadoPagoPixOrder({
      referenceId: referenceId || `BP-${Date.now()}`,
      customerName: customerName || 'Cliente BirdPro',
      customerEmail: customerEmail || 'contato@birdpro.com.br',
      customerCpf,
      customerPhone,
      amount: Number(amount),
      description: description || 'Assinatura BirdPro',
      token: effectiveToken
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        paymentId: result.paymentId,
        referenceId: result.referenceId,
        pixCode: result.pixCode,
        qrCodeBase64: result.qrCodeBase64,
        ticketUrl: result.ticketUrl,
        expirationDate: result.expirationDate,
        amount: result.amount,
        status: result.status
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Erro ao gerar PIX no Mercado Pago'
      }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[API MercadoPago] Erro:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
