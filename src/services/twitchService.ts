import fetch from "node-fetch";

// Twitch API credentials from environment variables
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

// Ensure client ID and secret are provided
if (!clientId || !clientSecret) {
  console.error(
    "Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables."
  );
  process.exit(1);
}

let appAccessToken: string | null = null;
let tokenExpiry: number | null = null;

// Define TypeScript interfaces for the Twitch API responses
interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  // Optionally include other fields
  view_count?: number;
  email?: string;
  created_at?: string;
}

interface TwitchUserResponse {
  data: TwitchUser[];
}

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
* Fetches a new app access token from Twitch API
*/
async function getAppAccessToken(): Promise<void> {
  const params = new URLSearchParams();
  params.append("client_id", clientId!);
  params.append("client_secret", clientSecret!);
  params.append("grant_type", "client_credentials");
  
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });
  
  if (!response.ok) {
    throw new Error("Failed to get app access token");
  }
  
  const data = (await response.json()) as AccessTokenResponse;
  
  appAccessToken = data.access_token;
  const expiresIn = data.expires_in; // Token validity in seconds
  tokenExpiry = Date.now() + expiresIn * 1000;
}

/**
* Retrieves user information from Twitch API
* @param username - Twitch username
*/
export async function getUserInfo(username: string): Promise<TwitchUser | null> {
  // Refresh the app access token if it doesn't exist or is expired
  if (!appAccessToken || (tokenExpiry && Date.now() >= tokenExpiry)) {
    await getAppAccessToken();
  }
  
  const response = await fetch(
    `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`,
    {
      headers: {
        "Client-ID": clientId!,
        Authorization: `Bearer ${appAccessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch ${username} information from Twitch API");
  }
  
  const data = (await response.json()) as TwitchUserResponse;
  
  if (data.data.length === 0) {
    return null; // User not found
  }
  
  const userData = data.data[0];
  
  // Remove 'view_count' from the data
  delete userData.view_count;

  console.log(`Serving for user: ${username}`);
  
  return userData;
}
