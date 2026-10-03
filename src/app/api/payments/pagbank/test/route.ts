import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, isSandbox } = body;

    if (!token || token.trim().length < 10) {
      return NextResponse.json({ 
        success: false, 
        message: 'Informe um Token do PagBank para testar.' 
      }, { status: 400 });
    }

    const baseUrl = isSandbox ? 'https://sandbox.api.pagseguro.com' : 'https://api.pagseguro.com';

    // Test API call to PagBank Orders endpoint
    const res = await fetch(`${baseUrl}/orders?reference_id=TEST_PING`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`
      }
    });

    if (res.status === 200 || res.status === 404) {
      return NextResponse.json({
        success: true,
        status: res.status,
        message: '✅ Conexão com PagBank estabelecida e autenticada com sucesso!'
      });
    }

    if (res.status === 401) {
      return NextResponse.json({
        success: false,
        status: 401,
        message: '❌ Token não autorizado pelo PagBank (Erro 401). Verifique se o Token foi gerado na área de Desenvolvedor / Integrações do PagBank/PagSeguro.'
      });
    }

    const data = await res.json().catch(() => null);
    return NextResponse.json({
      success: false,
      status: res.status,
      message: `Resposta do PagBank (Status ${res.status}): ${JSON.stringify(data?.error_messages || data || 'Erro na requisição')}`
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `Erro ao conectar com PagBank: ${err.message}`
    }, { status: 500 });
  }
}
