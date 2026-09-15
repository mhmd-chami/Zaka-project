export interface PaymentQrData {
  phone: string;
  name?: string;
  amount?: number;
}

export function buildPaymentQrPayload(
  phone: string,
  name: string,
  amount?: number
): string {
  const params = new URLSearchParams();
  params.set('phone', phone.replace(/\s+/g, '').trim());
  params.set('name', name);
  if (amount && amount > 0) {
    params.set('amount', amount.toFixed(2));
  }
  return `zakapay://pay?${params.toString()}`;
}

export function parsePaymentQrPayload(raw: string): PaymentQrData | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const withScheme = trimmed.startsWith('zakapay://')
      ? trimmed.replace('zakapay://', 'https://')
      : trimmed.startsWith('http')
        ? trimmed
        : `https://pay?${trimmed.replace(/^pay\?/, '')}`;

    const url = new URL(withScheme);
    const phone = url.searchParams.get('phone');
    if (!phone) return null;

    const name = url.searchParams.get('name') ?? undefined;
    const amountRaw = url.searchParams.get('amount');
    const amount = amountRaw ? parseFloat(amountRaw) : undefined;

    return {
      phone,
      name,
      amount: amount && amount > 0 ? amount : undefined,
    };
  } catch {
    return null;
  }
}
