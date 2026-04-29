"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleProviderWrapper({ children }: { children: React.ReactNode }) {
  // Hardcoded for reliability because NEXT_PUBLIC_ variables are often stripped 
  // during cloud builds if the .env file is gitignored.
  const clientId = "675213668084-p7kl65120l21ctiiogoaa96ec1fbno9r.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
