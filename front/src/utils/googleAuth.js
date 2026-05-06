const API_BASE_URL = import.meta.env.VITE_API_URL;
const GOOGLE_AUTH_ENDPOINT =
  import.meta.env.VITE_GOOGLE_AUTH_ENDPOINT ||
  (API_BASE_URL ? `${API_BASE_URL}/athlete/oauth/google` : "");

export const exchangeGoogleCredential = async (credential) => {
  if (!GOOGLE_AUTH_ENDPOINT) {
    return { success: false, message: "Google sign-in is not configured." };
  }

  try {
    const response = await fetch(GOOGLE_AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: credential }),
    });

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: result?.message || "Google sign-in failed.",
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: "Unable to reach the server. Please try again.",
    };
  }
};
