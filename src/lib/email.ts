import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL || "ContentFlow AI <contact@node-ia.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contentflow-ai-node-ia.vercel.app";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function wrapEmail(title: string, bodyHtml: string, ctaLabel: string, ctaHref: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #f97316; margin: 0 0 16px;">ContentFlow AI</p>
      <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 16px; line-height: 1.3;">${title}</h1>
      <div style="font-size: 14px; line-height: 1.6; color: #444;">${bodyHtml}</div>
      <a href="${ctaHref}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; border-radius: 12px; background: linear-gradient(135deg, #f97316, #fbbf24); color: #000; font-weight: 700; font-size: 14px; text-decoration: none;">${ctaLabel}</a>
      <p style="font-size: 12px; color: #999; margin-top: 32px;">ContentFlow AI — Node IA Studio, Rouen</p>
    </div>
  `;
}

/** Best-effort send: never throws, so a missing RESEND_API_KEY or a transient
 * email failure never breaks the request/cron that triggered it. */
async function send(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY non configurée — email "${subject}" à ${to} non envoyé`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Envoi échoué:", err instanceof Error ? err.message : String(err));
  }
}

export async function sendActivationEmail(to: string): Promise<void> {
  const html = wrapEmail(
    "Votre premier post vous attend",
    `<p>Vous vous êtes inscrit·e sur ContentFlow AI mais n'avez pas encore généré de post.</p>
     <p>Collez l'URL d'un article, d'une vidéo YouTube, ou même un simple texte — l'IA s'occupe du reste. 5 générations gratuites par mois, sans carte bancaire.</p>`,
    "Générer mon premier post",
    `${APP_URL}/dashboard`
  );
  await send(to, "Votre premier post vous attend sur ContentFlow AI", html);
}

export async function sendQuotaWarningEmail(to: string, used: number, limit: number): Promise<void> {
  const html = wrapEmail(
    "Vous approchez de votre quota gratuit",
    `<p>Vous avez utilisé ${used} de vos ${limit} générations gratuites ce mois-ci.</p>
     <p>Passez à Creator (29€/mois) pour des générations illimitées, le clonage de votre style d'écriture et l'auto-publication LinkedIn.</p>`,
    "Passer à Creator",
    `${APP_URL}/upgrade`
  );
  await send(to, `Plus que ${Math.max(0, limit - used)} génération(s) gratuite(s) ce mois-ci`, html);
}

export async function sendPublishFailureEmail(
  to: string,
  failures: { platform: string; error: string }[]
): Promise<void> {
  const platformLabels: Record<string, string> = { linkedin: "LinkedIn", twitter: "Twitter / X" };
  const items = failures
    .map(
      (f) =>
        `<li><strong>${platformLabels[f.platform] || f.platform}</strong> — ${f.error}</li>`
    )
    .join("");
  const html = wrapEmail(
    failures.length > 1 ? "Certains de vos posts n'ont pas pu être publiés" : "Un post n'a pas pu être publié",
    `<p>La publication automatique a échoué pour ${failures.length > 1 ? "ces posts" : "ce post"} :</p>
     <ul style="padding-left: 20px;">${items}</ul>
     <p>Vérifiez la connexion de votre compte dans les paramètres.</p>`,
    "Vérifier mes connexions",
    `${APP_URL}/dashboard/settings`
  );
  await send(to, "Échec de publication automatique — ContentFlow AI", html);
}

export async function sendWeeklyInsightEmail(
  to: string,
  platform: string,
  summary: string
): Promise<void> {
  const platformLabels: Record<string, string> = { linkedin: "LinkedIn", twitter: "Twitter / X", instagram: "Instagram" };
  const html = wrapEmail(
    `Ce qui a marché sur ${platformLabels[platform] || platform} cette semaine`,
    `<p>${summary}</p>
     <p>Ces enseignements sont automatiquement appliqués à vos prochaines générations.</p>`,
    "Voir mes performances",
    `${APP_URL}/dashboard/analytics`
  );
  await send(to, `Votre bilan de performance ${platformLabels[platform] || platform}`, html);
}
