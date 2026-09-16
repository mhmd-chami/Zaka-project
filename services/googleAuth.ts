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

export function getGoogleSetupIssue(): string | null {
  if (Platform.OS === 'web') return googleWebClientId ? null : 'Google sign-in has not been configured yet.';
  if (Constants.executionEnvironment === 'storeClient') {
    return 'Google sign-in needs a ZakaPay development build. Expo Go cannot load native Google sign-in.';
  }
  if (!googleWebClientId) {
    return 'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file, then rebuild ZakaPay.';
  }
  return null;
}

export async function startGoogleSignIn(webCredential?: string): Promise<GoogleAuthResult> {
  if (Platform.OS === 'web') {
    return webCredential
      ? { ok: true, identity: { id: '', name: '', email: '', idToken: webCredential } }
      : { ok: false, error: 'Use the Google sign-in button to continue.' };
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
        return {
          ok: false,
          error: 'Google sign-in configuration does not match this Android build. Check the package name, SHA-1, and client ID.',
        };
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
  try {
    const { GoogleOneTapSignIn } = await import('react-native-nitro-google-signin');
    GoogleOneTapSignIn.configure({ webClientId: googleWebClientId! });
    await GoogleOneTapSignIn.signOut();
  } catch {
    // The local session is still cleared if Google has no active native session.
  }
}
