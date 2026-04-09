import Midtrans from "midtrans-client";

export const snap = new Midtrans.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-YOUR-SANDBOX-KEY",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-YOUR-SANDBOX-KEY",
});
