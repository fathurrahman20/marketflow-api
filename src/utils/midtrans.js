import midtransClient from "midtrans-client";

// Create Snap API instance, empty config
const snap = new midtransClient.Snap();
snap.apiConfig.set({
  isProduction: false,
  serverKey: Bun.env.MIDTRANS_SERVER_KEY,
});

export default snap;
