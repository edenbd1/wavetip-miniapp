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
      "payload": "eyJkb21haW4iOiJ3YXZldGlwLWZpLnZlcmNlbC5hcHAifQ",
      "signature": "OcB0s99Nk9nQkjDx2yj82HBRKfWe97B2aUZZjfj+ox9ULkItqEHgwl3fBjsC0zO05Ks0QwuaOWCoop1UHMarKhw="
    },
  "baseBuilder": {
    "ownerAddress": "0x6e2e08fBBA9ED06168eB235145Fe6b5B10aE6BfE"
  },
  miniapp: {
    version: "1",
    name: "WaveTip",
    subtitle: "Watch and Tip Twitch Streamers",
    description: "Watch your favorite Twitch streamers directly in Base App. Search any channel and enjoy live streams.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.jpg`],
    iconUrl: `${ROOT_URL}/blue-icon.jpg`,
    splashImageUrl: `${ROOT_URL}/blue-hero-wavetip.jpg`,
    splashBackgroundColor: "#006afe",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["twitch", "streaming", "live", "tips", "crypto"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Watch streams, tip creators",
    ogTitle: "WaveTip - Watch and Tip",
    ogDescription: "Watch your favorite streamers directly on Base App",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
    noindex: true,
  }
} as const;