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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const OAUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '';

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
const TOKEN_STORAGE_KEY = 'calox_google_access_token_v1';
const USER_STORAGE_KEY = 'calox_google_auth_user_v1';
const TOKEN_EXPIRY_KEY = 'calox_google_token_expiry_v1';

let cachedAccessToken: string | null = (() => {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (stored && expiry && Number(expiry) > Date.now()) {
      return stored;
    }
  } catch {}
  return null;
})();

let currentAuthUser: AuthUser | null = (() => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
})();

export const saveAuthSession = (user: AuthUser, token: string, expiresInSeconds: number = 3600) => {
  cachedAccessToken = token;
  currentAuthUser = user;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresInSeconds * 1000));
  } catch (e) {
    console.error('Error saving auth session:', e);
  }
};

export const clearAuthSession = () => {
  cachedAccessToken = null;
  currentAuthUser = null;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch {}
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: AuthUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check if session is already restored from localStorage
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
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
        } catch {}
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(authUser, cachedAccessToken);
        }
      } else if (!currentAuthUser) {
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
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (stored && expiry && Number(expiry) > Date.now()) {
      cachedAccessToken = stored;
      return cachedAccessToken;
    }
  } catch {}
  return null;
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
