const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contentflow-ai-node-ia.vercel.app";
const SCOPES = "openid profile w_member_social email";

export const LINKEDIN_REDIRECT_URI = `${APP_URL}/api/auth/linkedin/callback`;

function getClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET non configurées dans les variables d'environnement Vercel"
    );
  }
  return { clientId, clientSecret };
}

export function getLinkedInAuthUrl(state: string): string {
  const { clientId } = getClientCredentials();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state,
    scope: SCOPES,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export async function exchangeLinkedInCode(code: string): Promise<{ accessToken: string; expiresIn: number }> {
  const { clientId, clientSecret } = getClientCredentials();
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Échange du code LinkedIn échoué : ${text || res.statusText}`);
  }

  const data = await res.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export async function getLinkedInProfile(accessToken: string): Promise<{ sub: string; name: string }> {
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Récupération du profil LinkedIn échouée : ${text || res.statusText}`);
  }

  const data = await res.json();
  return { sub: data.sub, name: data.name || data.given_name || "LinkedIn" };
}

// LinkedIn's Posts API uses a "Little Text" markup where these characters
// have special meaning; escape them so plain text renders literally
// (hashtags '#' are left unescaped on purpose so '#tag' stays clickable).
function escapeLinkedInText(text: string): string {
  return text.replace(/([\\*_~()[\]{}<>|@])/g, "\\$1");
}

export async function publishToLinkedIn(
  accessToken: string,
  personSub: string,
  text: string
): Promise<{ id: string }> {
  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202401",
    },
    body: JSON.stringify({
      author: `urn:li:person:${personSub}`,
      commentary: escapeLinkedInText(text),
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!res.ok) {
    const text2 = await res.text().catch(() => "");
    throw new Error(`Publication LinkedIn échouée : ${text2 || res.statusText}`);
  }

  const id = res.headers.get("x-restli-id") || res.headers.get("x-linkedin-id") || "";
  return { id };
}
