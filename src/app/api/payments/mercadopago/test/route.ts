import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_GLOBAL_CONFIG } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token || INITIAL_GLOBAL_CONFIG.gatewayApiKey || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token || token.length < 20) {
      return NextResponse.json({
        success: false,
        message: 'Token de acesso do Mercado Pago não informado ou inválido.'
      }, { status: 400 });
    }

    const res = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const userName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.nickname || data.email;
      return NextResponse.json({
        success: true,
        message: `✅ Autenticado com sucesso no Mercado Pago! Conta conectada: ${userName} (${data.email}). PIX Dinâmico habilitado!`
      });
    } else {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: `Falha na autenticação do Mercado Pago (Status: ${res.status}): ${errData.message || 'Token inválido'}`
      }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `Erro de rede ao conectar com Mercado Pago: ${err.message}`
    }, { status: 500 });
  }
}
