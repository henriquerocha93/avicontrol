/**
 * Mercado Pago Integration Service for BIRDPRO
 * Official API v1 integration for Instant Dynamic PIX and Automatic Webhook confirmation.
 * Fully autonomous with zero manual steps.
 */

export interface MercadoPagoPixRequest {
  referenceId: string;
  customerName: string;
  customerEmail: string;
  customerCpf?: string;
  customerPhone?: string;
  amount: number; // in Reais, e.g. 169.99 or 14.99
  description: string;
  token?: string;
}

export interface MercadoPagoPixResponse {
  success: boolean;
  paymentId: string;
  referenceId: string;
  pixCode: string; // Pix Copia e Cola
  qrCodeBase64?: string; // Base64 PNG image for immediate scannable rendering
  ticketUrl?: string;
  expirationDate?: string;
  amount: number;
  status: string;
  error?: string;
  raw?: any;
}

// In-memory set of confirmed paid transactions for high-speed lookup
declare global {
  var __BIRDPRO_MP_PAID_REFERENCES__: Set<string> | undefined;
  var __BIRDPRO_MP_PAYMENTS__: Map<string, { status: string; approvedAt: string; referenceId: string }> | undefined;
}

if (!globalThis.__BIRDPRO_MP_PAID_REFERENCES__) {
  globalThis.__BIRDPRO_MP_PAID_REFERENCES__ = new Set<string>();
}

if (!globalThis.__BIRDPRO_MP_PAYMENTS__) {
  globalThis.__BIRDPRO_MP_PAYMENTS__ = new Map();
}

export function registerMercadoPagoPaidReference(referenceId: string, paymentId?: string) {
  if (!referenceId) return;
  const clean = referenceId.trim();
  const cleanUpper = clean.toUpperCase();

  if (globalThis.__BIRDPRO_MP_PAID_REFERENCES__) {
    globalThis.__BIRDPRO_MP_PAID_REFERENCES__.add(clean);
    globalThis.__BIRDPRO_MP_PAID_REFERENCES__.add(cleanUpper);
  }

  // Also bridge to global paid references so all services recognize it
  if (globalThis.__BIRDPRO_PAID_REFERENCES__) {
    globalThis.__BIRDPRO_PAID_REFERENCES__.add(clean);
    globalThis.__BIRDPRO_PAID_REFERENCES__.add(cleanUpper);
  }

  if (paymentId && globalThis.__BIRDPRO_MP_PAYMENTS__) {
    globalThis.__BIRDPRO_MP_PAYMENTS__.set(paymentId, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      referenceId: clean
    });
  }
}

export function isMercadoPagoReferencePaid(referenceId: string): boolean {
  if (!referenceId) return false;
  const clean = referenceId.trim();
  const cleanUpper = clean.toUpperCase();

  if (globalThis.__BIRDPRO_MP_PAID_REFERENCES__) {
    if (globalThis.__BIRDPRO_MP_PAID_REFERENCES__.has(clean) || globalThis.__BIRDPRO_MP_PAID_REFERENCES__.has(cleanUpper)) {
      return true;
    }
  }

  if (globalThis.__BIRDPRO_PAID_REFERENCES__) {
    if (globalThis.__BIRDPRO_PAID_REFERENCES__.has(clean) || globalThis.__BIRDPRO_PAID_REFERENCES__.has(cleanUpper)) {
      return true;
    }
  }

  return false;
}

/**
 * Creates an official Dynamic PIX Order on Mercado Pago
 */
export async function createMercadoPagoPixOrder(params: MercadoPagoPixRequest): Promise<MercadoPagoPixResponse> {
  const {
    referenceId,
    customerName,
    customerEmail,
    customerCpf,
    customerPhone,
    amount,
    description,
    token
  } = params;

  const accessToken = token || process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken || accessToken.length < 20) {
    return {
      success: false,
      paymentId: '',
      referenceId,
      pixCode: '',
      amount,
      status: 'CONFIG_ERROR',
      error: 'Access Token do Mercado Pago não configurado.'
    };
  }

  try {
    const cleanCpf = (customerCpf || '19119119100').replace(/\D/g, '');
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    const nameParts = (customerName || 'Cliente BirdPro').trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'BirdPro';

    const payload = {
      transaction_amount: Number(amount.toFixed(2)),
      description: description || 'Assinatura BirdPro',
      payment_method_id: 'pix',
      external_reference: referenceId,
      notification_url: 'https://www.birdpro.com.br/api/webhooks/mercadopago',
      payer: {
        email: customerEmail || 'contato@birdpro.com.br',
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: cleanCpf.length === 14 ? 'CNPJ' : 'CPF',
          number: cleanCpf.length >= 11 ? cleanCpf : '19119119100'
        }
      }
    };

    const idempotencyKey = `mp-${referenceId}-${Date.now()}`;
    const res = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.id) {
      const qrData = data.point_of_interaction?.transaction_data;
      return {
        success: true,
        paymentId: String(data.id),
        referenceId: data.external_reference || referenceId,
        pixCode: qrData?.qr_code || '',
        qrCodeBase64: qrData?.qr_code_base64 || '',
        ticketUrl: qrData?.ticket_url || '',
        expirationDate: data.date_of_expiration,
        amount: data.transaction_amount || amount,
        status: data.status || 'pending',
        raw: data
      };
    } else {
      console.error('[MercadoPago createPix] Erro:', data);
      const errMsg = data.message || data.error_messages?.[0]?.description || 'Erro ao gerar PIX no Mercado Pago.';
      return {
        success: false,
        paymentId: '',
        referenceId,
        pixCode: '',
        amount,
        status: 'ERROR',
        error: errMsg,
        raw: data
      };
    }
  } catch (err: any) {
    console.error('[MercadoPago createPix Exception]:', err);
    return {
      success: false,
      paymentId: '',
      referenceId,
      pixCode: '',
      amount,
      status: 'EXCEPTION',
      error: err.message || 'Erro de conexão com Mercado Pago.'
    };
  }
}

/**
 * Checks the status of a payment directly in Mercado Pago API
 */
export async function checkMercadoPagoPaymentStatus(params: {
  paymentId?: string;
  referenceId?: string;
  token?: string;
}): Promise<{ paid: boolean; status: string; paymentId?: string; referenceId?: string; raw?: any }> {
  const { paymentId, referenceId, token } = params;

  // 1. Check in-memory fast cache first
  if (referenceId && isMercadoPagoReferencePaid(referenceId)) {
    return { paid: true, status: 'approved', referenceId, paymentId };
  }

  const accessToken = token || process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken || accessToken.length < 20) {
    return { paid: false, status: 'NO_TOKEN' };
  }

  try {
    // If we have paymentId, direct query
    if (paymentId && !paymentId.startsWith('PGB-') && !paymentId.startsWith('BP-')) {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const isApproved = data.status === 'approved';
        const ref = data.external_reference || referenceId || '';

        if (isApproved && ref) {
          registerMercadoPagoPaidReference(ref, String(data.id));
        }

        return {
          paid: isApproved,
          status: data.status,
          paymentId: String(data.id),
          referenceId: ref,
          raw: data
        };
      }
    }

    // If we only have referenceId, search payments by external_reference
    if (referenceId) {
      const searchRes = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(referenceId)}&sort=date_created&criteria=desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const payment = searchData.results?.[0];
        if (payment) {
          const isApproved = payment.status === 'approved';
          if (isApproved) {
            registerMercadoPagoPaidReference(referenceId, String(payment.id));
          }
          return {
            paid: isApproved,
            status: payment.status,
            paymentId: String(payment.id),
            referenceId,
            raw: payment
          };
        }
      }
    }
  } catch (err: any) {
    console.error('[MercadoPago checkStatus Error]:', err);
  }

  return { paid: false, status: 'pending', referenceId, paymentId };
}
