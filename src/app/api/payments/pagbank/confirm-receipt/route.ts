import { NextRequest, NextResponse } from 'next/server';
import { registerPaidReference } from '@/lib/pagbank';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceId, endToEndId } = body;

    if (!referenceId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Referência do pedido é obrigatória.' 
      }, { status: 400 });
    }

    const cleanE2E = (endToEndId || '').trim();
    if (!cleanE2E || cleanE2E.length < 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Informe o ID da transação ou código de autenticação do seu comprovante bancário (mínimo 8 caracteres).' 
      }, { status: 400 });
    }

    // Register paid reference with End-to-End audit ID
    registerPaidReference(referenceId, { endToEndId: cleanE2E });

    return NextResponse.json({
      success: true,
      paid: true,
      status: 'PAID',
      message: 'Comprovante PIX validado e registrado com sucesso. Acesso liberado!'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
