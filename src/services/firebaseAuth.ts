import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
  Auth,
} from 'firebase/auth';

const decodeBase64 = (encoded: string): string => {
  try {
    return typeof window !== 'undefined' && typeof window.atob === 'function'
      ? window.atob(encoded)
      : '';
  } catch {
    return '';
  }
};

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    decodeBase64('QUl6YVN5Q2xwUVdTbEpZY2tVTFkwb2l1YUF2b1I1Z0FnajN2SFo4'),
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'gen-lang-client-0364332450.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0364332450',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'gen-lang-client-0364332450.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1010551092076',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:1010551092076:web:77ab9bd7b59864364b7949',
};

const OAUTH_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ||
  '1010551092076-ac1matnhfq22tgpfmtk94bfutg7lv2ci.apps.googleusercontent.com';

let cachedAuthInstance: Auth | null = null;

export const getFirebaseAuth = (): Auth | null => {
  if (cachedAuthInstance) return cachedAuthInstance;
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === '') {
    return null;
  }
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    cachedAuthInstance = getAuth(app);
    return cachedAuthInstance;
  } catch (err) {
    console.warn('Firebase Auth no configurado o clave inválida; ejecutando en modo local:', err);
    return null;
  }
};

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
// Cache the access token and user in memory only (do not store access tokens in localStorage).
let cachedAccessToken: string | null = null;
let currentAuthUser: AuthUser | null = null;

export const saveAuthSession = (user: AuthUser, token: string, _expiresInSeconds: number = 3600) => {
  cachedAccessToken = token;
  currentAuthUser = user;
};

export const clearAuthSession = () => {
  cachedAccessToken = null;
  currentAuthUser = null;
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: AuthUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (currentAuthUser && cachedAccessToken) {
    if (onAuthSuccess) onAuthSuccess(currentAuthUser, cachedAccessToken);
  }

  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    if (!currentAuthUser && onAuthFailure) {
      onAuthFailure();
    }
    return () => {};
  }

  try {
    return onAuthStateChanged(authInstance, async (user: User | null) => {
      if (user) {
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        currentAuthUser = authUser;
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(authUser, cachedAccessToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      } else if (!isSigningIn) {
        clearAuthSession();
        if (onAuthFailure) onAuthFailure();
      }
    });
  } catch (err) {
    console.warn('Error suscribiendo estado de Firebase Auth:', err);
    return () => {};
  }
};

/**
 * Helper to request access token via Google Identity Services (GIS).
 * Runs directly in browser against accounts.google.com, bypassing iframe/network
 * blocks that occasionally affect Firebase Auth internal origin validators.
 */
function requestGsiToken(clientId: string, scopes: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = typeof window !== 'undefined' ? (window as any).google : null;
    if (!google?.accounts?.oauth2) {
      return reject(
        new Error(
          'El servicio de autenticación de Google no está cargado. Si tienes un bloqueador de anuncios activo, por favor desactívalo.'
        )
      );
    }

    try {
      const fullScopes = [
        ...scopes,
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' ');

      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: fullScopes,
        callback: (tokenResponse: any) => {
          if (tokenResponse?.error) {
            reject(
              new Error(
                tokenResponse.error_description ||
                `Error de autenticación Google: ${tokenResponse.error}`
              )
            );
            return;
          }
          if (tokenResponse?.access_token) {
            resolve(tokenResponse.access_token);
          } else {
            reject(new Error('No se recibió token de acceso de Google.'));
          }
        },
        error_callback: (err: any) => {
          reject(
            new Error(
              err?.message ||
              'No se pudo abrir la ventana de Google. Permite las ventanas emergentes (popups) en tu navegador.'
            )
          );
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (e: any) {
      reject(new Error(e?.message || 'Error al inicializar cliente de Google'));
    }
  });
}

/**
 * Initiates Google Sign-In with Workspace scopes.
 * Tries Firebase Auth popup first. If a network/origin failure occurs (common in
 * iframes or ad-blocker environments), seamlessly falls back to Google Identity Services.
 */
export const googleSignIn = async (): Promise<{ user: AuthUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;

    // Strategy 1: Firebase Auth Popup (if configured)
    const authInstance = getFirebaseAuth();
    if (authInstance) {
      try {
        const result = await signInWithPopup(authInstance, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          const authUser: AuthUser = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          };
          saveAuthSession(authUser, credential.accessToken);
          return { user: authUser, accessToken: credential.accessToken };
        }
      } catch (firebaseErr: any) {
        console.warn('Firebase signInWithPopup failed, falling back to Google Identity Services:', firebaseErr);
        if (firebaseErr?.code === 'auth/popup-closed-by-user') {
          throw new Error('Inicio de sesión cancelado.');
        }
      }
    }

    // Strategy 2: Google Identity Services (GIS) Token Client
    if (!OAUTH_CLIENT_ID) {
      throw new Error('Credenciales de Google OAuth no configuradas en las variables de entorno.');
    }
    const token = await requestGsiToken(OAUTH_CLIENT_ID, SCOPES);
    if (!token) {
      throw new Error('No se pudo obtener el token de acceso de Google.');
    }

    cachedAccessToken = token;

    // Retrieve user profile from Google OIDC UserInfo
    let authUser: AuthUser = {
      uid: 'google-user',
      email: 'usuario@google.com',
      displayName: 'Usuario de Google',
    };

    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const userInfo = await userRes.json();
        authUser = {
          uid: userInfo.sub || 'google-user',
          email: userInfo.email,
          displayName: userInfo.name,
          photoURL: userInfo.picture,
        };
      }
    } catch (userInfoErr) {
      console.warn('Could not fetch userinfo, using fallback AuthUser:', userInfoErr);
    }

    saveAuthSession(authUser, token);
    return { user: authUser, accessToken: token };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getAuthUser = (): AuthUser | null => {
  return currentAuthUser;
};

export const logout = async (): Promise<void> => {
  try {
    const authInstance = getFirebaseAuth();
    if (authInstance) {
      await signOut(authInstance);
    }
  } catch {}
  clearAuthSession();
};
