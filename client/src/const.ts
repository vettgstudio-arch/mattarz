export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Validar se as variáveis de ambiente estão definidas
  if (!oauthPortalUrl) {
    console.error(
      "[Auth Error] VITE_OAUTH_PORTAL_URL não está definida. " +
      "Verifique se o ficheiro .env contém a variável VITE_OAUTH_PORTAL_URL"
    );
    throw new Error(
      "Configuração de autenticação inválida: VITE_OAUTH_PORTAL_URL não definida"
    );
  }
  
  if (!appId) {
    console.error(
      "[Auth Error] VITE_APP_ID não está definida. " +
      "Verifique se o ficheiro .env contém a variável VITE_APP_ID"
    );
    throw new Error(
      "Configuração de autenticação inválida: VITE_APP_ID não definida"
    );
  }
  
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error(
      "[Auth Error] Erro ao construir URL de login:",
      error,
      "Portal URL:", oauthPortalUrl
    );
    throw new Error(
      `URL de autenticação inválida: ${oauthPortalUrl}/app-auth`
    );
  }
};
