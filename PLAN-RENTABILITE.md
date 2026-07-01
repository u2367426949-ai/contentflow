# ContentFlow — Plan Rentabilité & Innovation

> Plan d'exécution destiné à être codé par un agent (Sonnet 5). Chaque phase est
> autonome et livrable séparément. Lire d'abord la section « Contraintes » —
> elles sont non négociables.

## Contraintes techniques (à respecter dans TOUT le code)

1. **JAMAIS `prisma.<model>.upsert()`** — l'adapter Neon HTTP (`@prisma/adapter-neon`,
   `src/lib/prisma.ts`) rejette les transactions à l'exécution (build et `tsc` passent,
   ça casse en prod). Toujours faire `findUnique` puis `create`/`update`.
   Avant de terminer : `grep -rn "upsert" src` doit retourner zéro résultat.
2. Vérification : `npx tsc --noEmit` (eslint est cassé localement — @babel/core manquant).
   `next build` échoue sans `DATABASE_URL` — ne pas s'en servir comme validation.
3. Source de vérité des plans : `src/lib/plans.ts` (free / creator 29€ / pro 79€ / agency 199€).
   Tout gating passe par `getPlan(user.plan)` et ses flags (`analytics`, `autoPublish`, `brandVoices`, `genQuota`).
4. Auth API : pattern existant `getUserId()` (`src/lib/auth.ts`) → clerkId → `prisma.user.findUnique({ where: { clerkId } })`. Voir `src/app/api/brand-voices/route.ts` comme référence de style (gating 402 + `upgradeUrl: "/upgrade"`, messages d'erreur en français).
5. UI : suivre le style de `src/app/dashboard/brand-voices/page.tsx` (Clerk `useUser`/`useAuth` + `getToken()` en header Authorization, classes Tailwind `bg-card border-border rounded-2xl`, icônes lucide-react, état verrouillé avec CTA `/upgrade`).
6. Migrations : fichiers SQL manuels dans `prisma/migrations/<date>_<nom>/migration.sql`,
   déployés avec `prisma migrate deploy` sur Neon (à faire par l'humain).

---

## Diagnostic (pourquoi ce plan)

Le produit est déjà solide : clonage de style (Brand Voice), OAuth LinkedIn + X avec
auto-publication par cron, multi-sources (URL/YouTube/RSS/texte), Stripe câblé sur
3 tiers. **Le trou n°1 : les plans Pro (79€) et Agency (199€) vendent des
« analytics » qui n'existent pas** — le flag `analytics` de `plans.ts` n'est branché
sur rien. C'est à la fois un risque (promesse non tenue) et le plus gros levier de
revenu : la boucle de performance est le différenciateur face à Taplio/AuthoredUp
(65€, LinkedIn-only, sans apprentissage).

Ordre de priorité : **Phase 1** (livrer ce qui est vendu + moat produit) →
**Phase 2** (mécanique de conversion/ARPU) → **Phase 3** (acquisition).

---

## Phase 1 — Performance Loop (Pilier 4) 🎯 priorité absolue

**Concept** : stats d'engagement sur les posts publiés → l'IA analyse ce qui marche
pour CET utilisateur → les enseignements sont réinjectés dans les prochaines
générations. « Le seul outil qui apprend de tes performances. »

**⚠️ ÉTAT : ~80 % déjà codé dans la worktree `claude/laughing-chaum-18e9de`**
(fichiers non commités). Deux options : (a) partir de cette worktree et ne coder
que le reste (§1.8–1.9), ou (b) tout recoder depuis main en suivant les specs
ci-dessous. L'option (a) est recommandée.

### 1.1 Schéma Prisma — ✅ FAIT (worktree)
`prisma/schema.prisma` :
- `ScheduledPost` : ajout de `externalId String?` (id du post sur la plateforme,
  tweet id ou URN LinkedIn), `impressions Int?`, `likes Int?`, `comments Int?`,
  `shares Int?`, `metricsAt DateTime?`.
- Nouveau modèle `PerformanceInsight` : `id`, `userId` (FK User, cascade),
  `platform String`, `insight String` (JSON), `postCount Int @default(0)`,
  timestamps, `@@unique([userId, platform])`.
- Relation `performanceInsights PerformanceInsight[]` sur `User`.

Migration : `prisma/migrations/20260701_add_performance_loop/migration.sql` — ✅ FAIT.

### 1.2 Capture de l'id publié — ✅ FAIT (worktree)
`src/app/api/cron/publish/route.ts` : `publishToLinkedIn` et `publishToTwitter`
retournaient déjà `{ id }` mais il était jeté. Stocker dans
`ScheduledPost.externalId` lors du passage à `status: "published"`.

### 1.3 Lib d'analyse — ✅ FAIT (worktree)
`src/lib/performance.ts` (miroir de `src/lib/brand-voice.ts`) :
- `MIN_MEASURED_POSTS = 3` (minimum de posts mesurés par plateforme avant insight).
- `engagementScore(post)` = likes + 3×comments + 5×shares.
- `analyzePerformance(platform, posts)` : trie par score, prend top 5 + flop 3,
  appelle gpt-4o-mini (`response_format: json_object`, temp 0.3) qui retourne
  `PerformanceProfile { summary, hooks, topics, structure, avoid, recommendations[] }`.
  Prompt en français, exiger des patterns ACTIONNABLES (pas « poste régulièrement »).
- `buildPerformanceInstruction(insightJson, platform)` : fragment de system prompt
  (même style que `buildVoiceInstruction`), terminer par « Applique ces enseignements
  sans les mentionner explicitement dans le post. »

### 1.4 Stats X automatiques — ✅ FAIT (worktree)
`src/lib/twitter.ts` : `fetchTweetMetrics(accessToken, tweetIds[])` →
`GET https://api.x.com/2/tweets?ids=...&tweet.fields=public_metrics` (max 100 ids,
le scope `tweet.read` est déjà demandé à la connexion). Retourne map id →
`{ impressions, likes, comments (=replies), shares (=retweets+quotes) }`.
⚠️ Le tier gratuit de l'API X limite les lectures : le fetch doit être best-effort
(erreur capturée, on continue avec la saisie manuelle).

### 1.5 Routes API — ✅ FAIT (worktree)
Toutes gated par `getPlan(user.plan).analytics` (402 + `upgradeUrl` sinon) :
- `GET /api/analytics` : posts publiés (100 max, desc) avec métriques + tous les
  `PerformanceInsight` de l'utilisateur + `twitterConnected: boolean`.
- `PATCH /api/analytics/metrics` : saisie manuelle `{ postId, impressions, likes,
  comments, shares }` (LinkedIn n'expose pas d'API de stats membre — l'utilisateur
  recopie ses chiffres). Vérifier l'ownership du post.
- `POST /api/analytics/refresh` : (1) fetch auto des stats X pour les tweets avec
  `externalId` (refresh du token OAuth si expiré, même logique que le cron) ;
  (2) pour chaque plateforme avec ≥ 3 posts mesurés (`metricsAt not null`),
  recalcule l'insight et l'enregistre (findUnique sur `userId_platform` puis
  update/create — PAS d'upsert).

### 1.6 Injection dans la génération — ✅ FAIT (worktree)
- `src/app/api/generate/route.ts` : si `plan.analytics`, charger les insights de
  l'utilisateur, concaténer les `buildPerformanceInstruction(...)` et injecter dans
  le system prompt après l'instruction de voix.
- `src/app/api/generate/stream/route.ts` : idem mais map plateforme → instruction,
  injectée par plateforme dans la boucle de génération.

### 1.7 Vérifs déjà passées (worktree)
`npx tsc --noEmit` n'a PAS encore été relancé après ces changements — le faire.
`grep -rn "upsert" src` doit rester vide.

### 1.8 UI — ❌ RESTE À CODER
`src/app/dashboard/analytics/page.tsx` (client component, style brand-voices) :
- Chargement : `GET /api/analytics` avec token Clerk. Si 402 → état verrouillé
  (icône Lock, « La boucle de performance est réservée au plan Pro (79€/mois) »,
  CTA Crown → `/upgrade`).
- **Cartes insights** par plateforme (parse du JSON `PerformanceProfile`) :
  summary en texte, facettes hooks/topics/structure/avoid (composant type
  `ProfileFacet`), recommandations en liste. Badge « calculé sur N posts ».
- **Bouton « Actualiser »** → `POST /api/analytics/refresh` (spinner, puis reload) ;
  afficher `twitterError` en warning doux si présent (« Stats X indisponibles —
  saisis-les manuellement »).
- **Tableau des posts publiés** : badge plateforme, date, extrait du contenu
  (2 lignes max), 4 inputs numériques (impressions / j'aime / commentaires /
  partages) pré-remplis, bouton save par ligne → `PATCH /api/analytics/metrics`.
- **Empty state** : « Publie tes premiers posts planifiés, leurs stats
  apparaîtront ici. Il faut au moins 3 posts mesurés par plateforme pour générer
  tes insights. »

### 1.9 Navigation — ❌ RESTE À CODER
`src/components/NavLinks.tsx` : ajouter
`{ href: "/dashboard/analytics", label: "Performance", requireAuth: true }`.

### 1.10 Déploiement (humain)
- `npx prisma migrate deploy` sur Neon (migration 20260701).
- Rien d'autre : pas de nouvelle env var.

---

## Phase 2 — Conversion & ARPU (maximiser l'argent par visiteur)

### 2.1 Facturation annuelle (−2 mois offerts)
- `plans.ts` : ajouter `yearlyPrice` (290€ / 790€ / 1990€) et
  `PLAN_PRICE_ENV_YEARLY` (`STRIPE_PRICE_CREATOR_YEARLY`, etc.).
- `/api/stripe/checkout` : accepter `interval: "month" | "year"`.
- Webhook / `getPlanFromPriceId` : reconnaître aussi les price ids annuels.
- UI `/upgrade` + pricing landing (`src/app/HomeContent.tsx`, grille dérivée de
  `PLANS`) : toggle Mensuel/Annuel avec badge « 2 mois offerts ».
- Humain : créer les 3 prix annuels dans Stripe + env vars Vercel.
- Impact type : +20-30 % d'ARPU et du cash upfront.

### 2.2 Paywall au moment du quota (moment de plus forte intention)
- Le 402 `QUOTA_EXCEEDED` existe déjà côté API. Côté dashboard : modal riche
  (pas un simple message) — « Tu as utilisé tes 5 générations gratuites » +
  comparatif Creator + CTA checkout direct (pré-sélectionner Creator).
- Ajouter une barre de progression du quota visible en permanence pour le plan
  free (ex. « 3/5 générations ce mois-ci ») — l'anticipation convertit mieux que
  le mur.

### 2.3 Upsell contextuel Pro
- Sur le dashboard des utilisateurs Creator : après chaque génération, encart
  « 💡 Avec Pro, ce post serait optimisé par tes stats réelles » (lien
  `/dashboard/analytics` qui montre l'état verrouillé). Le meilleur vendeur de la
  Phase 1, coût quasi nul.

### 2.4 Emails de cycle de vie (optionnel, fort ROI)
- J+1 inscription (activer la 1re génération), quota à 80 %, échec de publication,
  insight hebdo (« Ton post de mardi a fait 3× ta moyenne »). Via Resend
  (`RESEND_API_KEY`) — nouveau fichier `src/lib/email.ts` + appels aux points
  chauds. L'insight hebdo est aussi un mécanisme de rétention (churn ↓).

---

## Phase 3 — Acquisition (faire venir du monde)

### 3.1 SEO programmatique
- Pages `/outils/generateur-post-linkedin`, `/outils/generateur-post-twitter`,
  `/alternatives/taplio`, etc. — générées depuis un template + le endpoint démo
  existant (`/api/demo`) en widget interactif. Cible : requêtes FR
  « générateur post LinkedIn IA » (faible concurrence, forte intention).
- FAQ + schema.org (JSON-LD) sur la landing.

### 3.2 Boucle virale intégrée au produit
- Watermark discret « Rédigé avec ContentFlow » optionnel sur le plan free
  (désactivable en payant — c'est un motif d'upgrade ET de la distribution).
- Programme de parrainage simple : 1 mois offert par filleul payant (code promo
  Stripe, table `Referral` minimaliste).

### 3.3 Positionnement / copy landing
- Marteler le différenciateur : « Il écrit comme toi. Il publie pour toi.
  **Il apprend de tes stats.** » — 29€ vs Taplio 65€ LinkedIn-only.
- Ajouter les badges de la boucle de performance dans la grille pricing dès que
  la Phase 1 est shippée (Pro devient réellement justifiable à 79€).

---

## Ordre d'exécution recommandé pour l'agent

1. Phase 1 §1.8 + §1.9 (UI + nav) depuis la worktree, puis `npx tsc --noEmit`
   et `grep -rn "upsert" src` (doit être vide). Commit.
2. Phase 2.1 (annuel) puis 2.2 (paywall quota) puis 2.3 (upsell Pro). Commit par item.
3. Phase 3 selon l'appétit (3.3 est le plus rapide, 3.1 le plus rentable long terme).

## Actions humaines (non codables)
- Déployer la migration Neon (`npx prisma migrate deploy`).
- Créer les prix annuels Stripe + `STRIPE_PRICE_*_YEARLY` dans Vercel (Phase 2.1).
- Vérifier le tier de l'app X (les lectures de stats peuvent nécessiter le tier
  Basic) — la saisie manuelle couvre le cas contraire.
- (Phase 2.4) Créer un compte Resend + `RESEND_API_KEY`.
