export interface LocationQrData {
  locationId: string;
  name: string;
}

export function buildLocationQrPayload(
  locationId: string,
  name: string
): string {
  const params = new URLSearchParams();
  params.set('location', locationId);
  params.set('name', name);
  return `zakapay://cashout?${params.toString()}`;
}

export function parseLocationQrPayload(raw: string): LocationQrData | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const withScheme = trimmed.startsWith('zakapay://')
      ? trimmed.replace('zakapay://', 'https://')
      : trimmed.startsWith('http')
        ? trimmed
        : `https://cashout?${trimmed.replace(/^cashout\?/, '')}`;

    const url = new URL(withScheme);
    const path = url.pathname.replace(/^\//, '');
    const isCashOut =
      path === 'cashout' || trimmed.includes('cashout') || url.searchParams.has('location');

    if (!isCashOut) return null;

    const locationId = url.searchParams.get('location');
    if (!locationId) return null;

    const name = url.searchParams.get('name') ?? 'ZakaPay Branch';
    return { locationId, name };
  } catch {
    return null;
  }
}
