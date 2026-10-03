import { NextRequest, NextResponse } from 'next/server';
import { 
  createPagBankPixOrder, 
  createPagBankCardCharge, 
  createPagBankBoletoOrder 
} from '@/lib/pagbank';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paymentMethod = 'PIX',
      referenceId,
      customerName,
      customerEmail,
      customerCpf,
      customerPhone,
      amount,
      description,
      token = INITIAL_GLOBAL_CONFIG.pagbankToken,
      isSandbox = INITIAL_GLOBAL_CONFIG.pagbankSandbox,
      // Card specific
      cardNumber,
      cardHolder,
      cardExpiry,
      cardCvv,
      installments,
      // Boleto specific
      address
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valor inválido para o pedido.' }, { status: 400 });
    }

    if (paymentMethod === 'CARD') {
      const cardResult = await createPagBankCardCharge({
        referenceId: referenceId || `BP-CARD-${Date.now()}`,
        customerName: customerName || 'Criador BirdPro',
        customerEmail: customerEmail || 'contato@birdpro.com.br',
        customerCpf,
        customerPhone,
        amount: parseFloat(amount),
        description: description || 'Assinatura BirdPro',
        cardNumber: cardNumber || '',
        cardHolder: cardHolder || '',
        cardExpiry: cardExpiry || '',
        cardCvv: cardCvv || '',
        installments: parseInt(installments) || 1,
        token,
        isSandbox
      });
      return NextResponse.json(cardResult);
    }

    if (paymentMethod === 'BOLETO') {
      const boletoResult = await createPagBankBoletoOrder({
        referenceId: referenceId || `BP-BOL-${Date.now()}`,
        customerName: customerName || 'Criador BirdPro',
        customerEmail: customerEmail || 'contato@birdpro.com.br',
        customerCpf,
        customerPhone,
        amount: parseFloat(amount),
        description: description || 'Assinatura BirdPro',
        address,
        token,
        isSandbox
      });
      return NextResponse.json(boletoResult);
    }

    // Default: PIX
    const pixOrder = await createPagBankPixOrder({
      referenceId: referenceId || `BP-PIX-${Date.now()}`,
      customerName: customerName || 'Criador BirdPro',
      customerEmail: customerEmail || 'contato@birdpro.com.br',
      customerCpf,
      customerPhone,
      amount: parseFloat(amount),
      description: description || 'Assinatura BirdPro',
      token,
      isSandbox
    });

    return NextResponse.json(pixOrder);
  } catch (err: any) {
    console.error('[API PagBank Route] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Erro ao processar transação no PagBank.' }, { status: 500 });
  }
}
