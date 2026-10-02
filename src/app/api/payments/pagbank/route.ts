import { NextRequest, NextResponse } from 'next/server';
import { createPagBankPixOrder } from '@/lib/pagbank';

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
      token,
      isSandbox
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valor inválido para o pedido.' }, { status: 400 });
    }

    const order = await createPagBankPixOrder({
      referenceId: referenceId || `ORD-${Date.now()}`,
      customerName: customerName || 'Criador BirdPro',
      customerEmail: customerEmail || 'contato@birdpro.com.br',
      customerCpf,
      customerPhone,
      amount: parseFloat(amount),
      description: description || 'Assinatura BirdPro',
      token,
      isSandbox
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('PagBank Order Creation Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Erro ao gerar pedido PagBank.' }, { status: 500 });
  }
}
