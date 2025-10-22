import { NextRequest, NextResponse } from "next/server";

// Variables d'environnement pour l'API Twitch
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";

// Cache pour le token
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getTwitchToken() {
  // Utiliser le cache si valide
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get Twitch token");
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // Token expire dans 1 heure, on le cache pour 50 minutes
    tokenExpiry = Date.now() + 50 * 60 * 1000;

    return cachedToken;
  } catch (error) {
    console.error("Error getting Twitch token:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ channels: [] });
  }

  // Vérifier que les credentials sont configurés
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    console.error("Twitch credentials not configured");
    return NextResponse.json(
      { error: "Twitch API not configured" },
      { status: 500 }
    );
  }

  try {
    const token = await getTwitchToken();

    // Rechercher des channels sur Twitch
    const response = await fetch(
      `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(query)}&first=8`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Twitch API request failed");
    }

    const data = await response.json();

    // Formater les résultats
    const channels = data.data.map((channel: {
      id: string;
      broadcaster_login: string;
      display_name: string;
      is_live: boolean;
      thumbnail_url: string;
      game_id: string;
      game_name: string;
    }) => ({
      id: channel.id,
      login: channel.broadcaster_login,
      displayName: channel.display_name,
      isLive: channel.is_live,
      thumbnailUrl: channel.thumbnail_url,
      gameId: channel.game_id,
      gameName: channel.game_name,
    }));

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Error searching Twitch channels:", error);
    return NextResponse.json(
      { error: "Failed to search channels" },
      { status: 500 }
    );
  }
}

