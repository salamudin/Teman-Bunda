export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// ─────────────────────────────────────────────
// Core: Page View
// ─────────────────────────────────────────────
export const pageview = (url: string) => {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// ─────────────────────────────────────────────
// Core: Generic Event
// ─────────────────────────────────────────────
type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

export const event = ({ action, category, label, value, ...rest }: GTagEvent) => {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    ...rest,
  });
};

// ─────────────────────────────────────────────
// Shorthand: Button Click
// ─────────────────────────────────────────────
export const trackButtonClick = (label: string, pagePath?: string) => {
  event({
    action: "button_click",
    category: "Button",
    label,
    page_path: pagePath,
  });
};

// ─────────────────────────────────────────────
// Shorthand: Link Click
// ─────────────────────────────────────────────
export const trackLinkClick = (label: string, destination?: string) => {
  event({
    action: "link_click",
    category: "Navigation",
    label,
    destination: destination,
  });
};

// ─────────────────────────────────────────────
// Shorthand: CTA Click (e.g. "Mulai Konsultasi")
// ─────────────────────────────────────────────
export const trackCTA = (label: string, section?: string) => {
  event({
    action: "cta_click",
    category: "CTA",
    label,
    section: section,
  });
};

// ─────────────────────────────────────────────
// Shorthand: Form Submit
// ─────────────────────────────────────────────
export const trackFormSubmit = (formName: string) => {
  event({
    action: "form_submit",
    category: "Form",
    label: formName,
  });
};

// ─────────────────────────────────────────────
// Shorthand: User Auth
// ─────────────────────────────────────────────
export const trackAuth = (method: string, action: "login" | "register") => {
  event({
    action,
    category: "Auth",
    label: method,
  });
};

// ─────────────────────────────────────────────
// Shorthand: Booking Actions
// ─────────────────────────────────────────────
export const trackBooking = (action: string, bidanName?: string) => {
  event({
    action: "booking_" + action,
    category: "Booking",
    label: bidanName || "Unknown Bidan",
  });
};

// ─────────────────────────────────────────────
// Shorthand: Payment
// ─────────────────────────────────────────────
export const trackPayment = (action: string, packageName?: string, value?: number) => {
  event({
    action: "payment_" + action,
    category: "Payment",
    label: packageName || "Unknown Package",
    value,
  });
};
