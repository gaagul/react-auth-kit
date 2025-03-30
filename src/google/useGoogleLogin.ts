import { useEffect, useRef, useState, useCallback } from "react";

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

interface UseGoogleLoginProps {
  useFedcm?: boolean;
  onSuccess?: (response: GoogleCredentialResponse) => void;
  onError?: (error: Error) => void;
  clientId?: string;
}

interface UseGoogleLoginReturn {
  signIn: () => void;
  isGoogleReady: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            use_fedcm_for_prompt?: boolean;
            use_fedcm_for_button?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type: string;
              shape: string;
              theme: string;
              text: string;
              size: string;
              logo_alignment: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
    onGoogleLibraryLoad?: () => void;
  }
}

const useGoogleLogin = ({
  useFedcm = true,
  onSuccess = () => {},
  onError = () => {},
  clientId = "",
}: UseGoogleLoginProps = {}): UseGoogleLoginReturn => {
  const [isGoogleReady, setIsGoogleReady] = useState<boolean>(false);

  const googleButtonRef = useRef<HTMLElement | null>(null);
  const googleButtonContainerRef = useRef<HTMLDivElement | null>(null);

  const handleCredentialResponse = useCallback(
    (response: GoogleCredentialResponse) => {
      if (response && response.credential) {
        if (onSuccess && typeof onSuccess === "function") {
          onSuccess(response);
        }
      } else {
        if (onError && typeof onError === "function") {
          onError(new Error("Invalid credential response"));
        }
      }
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    if (!googleButtonContainerRef.current) {
      const container = document.createElement("div");
      container.style.display = "none";
      document.body.appendChild(container);
      googleButtonContainerRef.current = container;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    window.onGoogleLibraryLoad = () => {
      if (!window.google) {
        console.error("Google library failed to load");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: useFedcm,
        use_fedcm_for_button: useFedcm,
      });

      window.google.accounts.id.renderButton(googleButtonContainerRef.current as HTMLElement, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "continue_with",
        size: "large",
        logo_alignment: "left",
      });

      window.google.accounts.id.prompt();

      googleButtonRef.current =
        googleButtonContainerRef.current?.querySelector("div[role='button']") as HTMLElement;

      setIsGoogleReady(true);
    };

    return () => {
      document.body.removeChild(script);

      if (googleButtonContainerRef.current) {
        document.body.removeChild(googleButtonContainerRef.current);
      }
    };
  }, [clientId, handleCredentialResponse, useFedcm]);

  const signIn = useCallback(() => {
    if (googleButtonRef.current) {
      googleButtonRef.current.click();
    } else {
      console.error("Google Sign-In button not initialized yet");
    }
  }, []);

  return { signIn, isGoogleReady };
};

export default useGoogleLogin;