const firebaseAuthMessages: Record<string, string> = {
  "auth/account-exists-with-different-credential":
    "Ya existe una cuenta con ese email usando otro método de acceso.",
  "auth/cancelled-popup-request": "La ventana de Google se cerró antes de terminar.",
  "auth/email-already-in-use": "Este email ya está registrado. Inicia sesión o usa otro email.",
  "auth/invalid-credential": "Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.",
  "auth/invalid-email": "El email no tiene un formato válido.",
  "auth/network-request-failed": "No pudimos conectar con autenticación. Revisa tu conexión e inténtalo de nuevo.",
  "auth/operation-not-allowed":
    "Este método de acceso no está habilitado. Activa Email/Password o Google en Firebase Authentication.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permite popups para continuar.",
  "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de completar el acceso.",
  "auth/too-many-requests": "Demasiados intentos seguidos. Espera unos minutos antes de volver a intentar.",
  "auth/unauthorized-domain":
    "Este dominio no está autorizado en Firebase Authentication. Añade el dominio de Render a Authorized domains.",
  "auth/user-disabled": "Esta cuenta está desactivada. Contacta con soporte.",
  "auth/user-not-found": "No encontramos una cuenta con ese email.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/wrong-password": "Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.",
};

export function getAuthErrorMessage(error: unknown, fallback: string) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  return firebaseAuthMessages[code] || fallback;
}
