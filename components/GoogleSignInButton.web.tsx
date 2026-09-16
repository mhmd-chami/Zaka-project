import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

interface GoogleSdk {
  accounts: { id: {
    initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select: boolean }) => void;
    renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
  } };
}
const sdk = () => (window as Window & { google?: GoogleSdk }).google;
let scriptPromise: Promise<void> | undefined;
function loadGoogle() {
  if (sdk()) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const timer = setTimeout(() => { script.remove(); scriptPromise = undefined; reject(new Error('Google sign-in timed out. Refresh to try again.')); }, 15000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); scriptPromise = undefined; reject(new Error('Google sign-in could not load. Check your connection.')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function GoogleSignInButton({ onPress, loading = false }: { onPress: (credential?: string) => void; loading?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onPress);
  callback.current = onPress;
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!clientId || clientId.includes('example')) { setError('Google sign-in is not configured yet. You can sign in with your phone and password.'); return; }
    loadGoogle().then(() => {
      if (!active || !container.current) return;
      const google = sdk();
      if (!google) throw new Error('Google sign-in is unavailable.');
      google.accounts.id.initialize({ client_id: clientId, auto_select: false, callback: ({ credential }) => { if (active) callback.current(credential); } });
      google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: 300 });
    }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, []);
  return <View style={{ alignItems: 'center', gap: 8 }}>
    <div ref={container} style={{ minHeight: error ? 0 : 44, pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.6 : 1 }} />
    {loading ? <Text style={{ color: '#99b8b1' }}>Signing in…</Text> : null}
    {error ? <Text style={{ color: '#99b8b1', textAlign: 'center' }}>{error}</Text> : null}
  </View>;
}
