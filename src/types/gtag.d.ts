// Type declarations for Google Analytics gtag
interface Window {
  gtag: (
    command: "config" | "event" | "js" | "set",
    targetId: string | Date,
    params?: {
      [key: string]: string | number | boolean | undefined;
    }
  ) => void;
  dataLayer: unknown[];
}
