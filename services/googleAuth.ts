import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface GoogleIdentity {
  id: string;
  email: string;
  name: string;
  idToken: string;
}

type GoogleAuthResult =
  | { ok: true; identity: GoogleIdentity }
  | { ok: false; cancelled?: boolean; error?: string };

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

function decodeJwtPayload(idToken: string): Record<string, string> {
  const segment = idToken.split('.')[1];
  if (!segment) return {};
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const json = globalThis.atob
    ? globalThis.atob(normalized)
    : Buffer.from(normalized, 'base64').toString('utf8');
  return JSON.parse(json) as Record<string, string>;
}

export function getGoogleSetupIssue(): string | null {
  if (!googleWebClientId || googleWebClientId.includes('example')) {
    return 'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file, then restart Expo.';
  }
  if (Platform.OS === 'web') return null;
  return null;
}

async function startGoogleSignInWithAuthSession(): Promise<GoogleAuthResult> {
  const setupIssue = getGoogleSetupIssue();
  if (setupIssue) return { ok: false, error: setupIssue };

  const WebBrowser = await import('expo-web-browser');
  const AuthSession = await import('expo-auth-session');
  const Crypto = await import('expo-crypto');
  WebBrowser.maybeCompleteAuthSession();

  const redirectUri = AuthSession.makeRedirectUri({ path: 'oauthredirect' });
  const nonce = Crypto.randomUUID();
  const request = new AuthSession.AuthRequest({
    clientId: googleWebClientId!,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.IdToken,
    extraParams: { nonce, prompt: 'select_account' },
  });

  const result = await request.promptAsync({
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { ok: false, cancelled: true };
  }
  if (result.type !== 'success') {
    return { ok: false, error: 'Google sign-in did not complete. Please try again.' };
  }

  const idToken = result.params.id_token;
  if (!idToken) {
    return {
      ok: false,
      error: `Google did not return a token. Add this redirect URI in Google Cloud Console: ${redirectUri}`,
    };
  }

  const payload = decodeJwtPayload(idToken);
  if (!payload.email) {
    return { ok: false, error: 'Google did not return an email address for this account.' };
  }

  return {
    ok: true,
    identity: {
      id: payload.sub || '',
      email: payload.email,
      name: payload.name?.trim() || payload.email.split('@')[0],
      idToken,
    },
  };
}

export async function startGoogleSignIn(webCredential?: string): Promise<GoogleAuthResult> {
  if (Platform.OS === 'web') {
    return webCredential
      ? { ok: true, identity: { id: '', name: '', email: '', idToken: webCredential } }
      : { ok: false, error: 'Use the Google sign-in button to continue.' };
  }

  if (Constants.executionEnvironment === 'storeClient') {
    return startGoogleSignInWithAuthSession();
  }

  const setupIssue = getGoogleSetupIssue();
  if (setupIssue) return { ok: false, error: setupIssue };

  let google: typeof import('react-native-nitro-google-signin') | undefined;
  try {
    google = await import('react-native-nitro-google-signin');
    google.GoogleOneTapSignIn.configure({
      webClientId: googleWebClientId!,
      autoSelectOnSignIn: false,
    });

    await google.GoogleOneTapSignIn.checkPlayServices(true);
    let response = await google.GoogleOneTapSignIn.signIn();

    if (google.isNoSavedCredentialFoundResponse(response)) {
      response = await google.GoogleOneTapSignIn.createAccount();
    }
    if (google.isNoSavedCredentialFoundResponse(response)) {
      response = await google.GoogleOneTapSignIn.presentExplicitSignIn();
    }
    if (google.isCancelledResponse(response)) {
      return { ok: false, cancelled: true };
    }
    if (!google.isSuccessResponse(response)) {
      return { ok: false, error: 'Google sign-in did not complete. Please try again.' };
    }

    const { user, idToken } = response.data;
    if (!user.email) {
      return { ok: false, error: 'Google did not return an email address for this account.' };
    }

    return {
      ok: true,
      identity: {
        id: user.id,
        email: user.email,
        name: user.name?.trim() || user.email.split('@')[0],
        idToken,
      },
    };
  } catch (error) {
    if (google && google.isErrorWithCode(error)) {
      if (error.code === google.statusCodes.SIGN_IN_CANCELLED) {
        return { ok: false, cancelled: true };
      }
      if (error.code === google.statusCodes.DEVELOPER_ERROR) {
        return startGoogleSignInWithAuthSession();
      }
      if (error.code === google.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { ok: false, error: 'Google Play services are unavailable or need an update.' };
      }
    }
    return { ok: false, error: error instanceof Error ? error.message : 'Could not sign in with Google.' };
  }
}

export async function signOutFromGoogle(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (getGoogleSetupIssue()) return;
  if (Constants.executionEnvironment === 'storeClient') return;
  try {
    const { GoogleOneTapSignIn } = await import('react-native-nitro-google-signin');
    GoogleOneTapSignIn.configure({ webClientId: googleWebClientId! });
    await GoogleOneTapSignIn.signOut();
  } catch {
    // The local session is still cleared if Google has no active native session.
  }
}
