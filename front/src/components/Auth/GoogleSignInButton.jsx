import React, { useEffect, useRef, useState, useCallback } from "react";

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
  const buttonRef = useRef(null);
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
        if (!isMounted || !buttonRef.current || !window.google?.accounts?.id)
          return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        });

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
          Google sign-in is not configured.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`google-auth-card ${disabled ? "google-auth-disabled" : ""}`}
    >
      <div className="google-auth-label">Continue with Google</div>
      <div
        className={`google-auth-button ${isReady ? "ready" : "loading"}`}
        ref={buttonRef}
      />
    </div>
  );
};

export default GoogleSignInButton;
