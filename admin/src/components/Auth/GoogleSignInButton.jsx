import React, { useEffect, useState, useCallback } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let googleScriptPromise;

const loadGoogleScript = () => {
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const GoogleSignInButton = ({ onSuccess, onError, disabled = false }) => {
  const [isReady, setIsReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback(
    (response) => {
      if (!response?.credential) {
        onError?.("Google sign-in did not return a credential.");
        return;
      }
      onSuccess?.(response.credential);
    },
    [onError, onSuccess],
  );

  useEffect(() => {
    let isMounted = true;

    if (!clientId) {
      setIsReady(false);
      return undefined;
    }

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
        });

        window.google.accounts.id.prompt();
        setIsReady(true);
      })
      .catch((error) => {
        if (!isMounted) return;
        setIsReady(false);
        onError?.(error.message || "Google sign-in failed to load.");
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, handleCredential, onError]);

  if (!clientId) {
    return (
      <div className="google-auth-card google-auth-disabled">
        <div className="google-auth-label">
          <span className="google-auth-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img" focusable="false">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.72 1.22 9.22 3.61l6.86-6.86C35.91 2.36 30.43 0 24 0 14.62 0 6.55 5.38 2.73 13.2l7.98 6.2C12.66 13.07 17.9 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.14 24.56c0-1.64-.15-2.84-.47-4.09H24v7.74h12.7c-.26 2.07-1.67 5.18-4.8 7.27l7.38 5.73c4.42-4.08 6.86-10.09 6.86-16.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.71 28.4c-.5-1.49-.78-3.08-.78-4.71s.28-3.22.76-4.71l-7.98-6.2C.94 16.47 0 20.13 0 24c0 3.87.94 7.53 2.71 11.22l8-6.82z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.43 0 11.82-2.11 15.76-5.73l-7.38-5.73c-1.97 1.37-4.62 2.33-8.38 2.33-6.1 0-11.32-3.56-13.25-8.57l-8 6.82C6.55 42.62 14.62 48 24 48z"
              />
            </svg>
          </span>
          Google sign-in is not configured.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`google-auth-card ${disabled ? "google-auth-disabled" : ""} ${
        isReady ? "google-auth-ready" : "google-auth-waiting"
      }`}
    >
      <div className="google-auth-label">
        <span className="google-auth-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="img" focusable="false">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.72 1.22 9.22 3.61l6.86-6.86C35.91 2.36 30.43 0 24 0 14.62 0 6.55 5.38 2.73 13.2l7.98 6.2C12.66 13.07 17.9 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.14 24.56c0-1.64-.15-2.84-.47-4.09H24v7.74h12.7c-.26 2.07-1.67 5.18-4.8 7.27l7.38 5.73c4.42-4.08 6.86-10.09 6.86-16.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.71 28.4c-.5-1.49-.78-3.08-.78-4.71s.28-3.22.76-4.71l-7.98-6.2C.94 16.47 0 20.13 0 24c0 3.87.94 7.53 2.71 11.22l8-6.82z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.43 0 11.82-2.11 15.76-5.73l-7.38-5.73c-1.97 1.37-4.62 2.33-8.38 2.33-6.1 0-11.32-3.56-13.25-8.57l-8 6.82C6.55 42.62 14.62 48 24 48z"
            />
          </svg>
        </span>
        Continue with Google
      </div>
      <div className="google-auth-subtext">
        {isReady
          ? "Tap the Google prompt to continue."
          : "Loading Google sign-in..."}
      </div>
    </div>
  );
};

export default GoogleSignInButton;
