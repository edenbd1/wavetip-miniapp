const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  "accountAssociation": {
      "header": "eyJmaWQiOjEzODUwMDAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg3MGRiNGJBNTZFNTA3YTEzZDgxYjhBNGU5MDM2Yzc0Y2U4Q2ZlMDdGIn0",
      "payload": "eyJkb21haW4iOiJuZXctbWluaS1hcHAtcXVpY2tzdGFydC1vbmUtZ3JlZW4udmVyY2VsLmFwcCJ9",
      "signature": "imQtTZ0wzx7NpJj+93Tz+d23EodmwoLdYHUJMShXHDhem6FxLljcutya3USlTNyGt2xOeu91aNzpzUG+xUv09Bw="
  },
  "baseBuilder": {
    "ownerAddress": "0x6e2e08fBBA9ED06168eB235145Fe6b5B10aE6BfE"
  },
  miniapp: {
    version: "1",
    name: "Twitch Viewer",
    subtitle: "Watch Twitch Streams on Base",
    description: "Regardez vos streamers Twitch préférés directement dans Base App. Recherchez n'importe quel channel et profitez du stream en direct.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#9146FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["twitch", "streaming", "entertainment", "live", "gaming"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "Watch live streams on Base",
    ogTitle: "Twitch Viewer - Watch Live Streams",
    ogDescription: "Regardez vos streamers préférés directement sur Base App",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  }
} as const;