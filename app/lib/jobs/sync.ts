import { KwtSmsClient } from "../kwtsms";
import db from "../../db.server";
import { saveCredentials } from "../db/credentials";

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function syncShopIfStale(shop: string): Promise<void> {
  const creds = await db.gatewayCredentials.findUnique({ where: { shop } });
  if (!creds || !creds.credentialsVerified || !creds.username || !creds.password) {
    return;
  }

  const lastSync = creds.balanceUpdatedAt?.getTime() ?? 0;
  if (Date.now() - lastSync < SYNC_INTERVAL_MS) {
    return;
  }

  // Run sync in background, don't block page load
  syncShop(shop, creds.username, creds.password).catch((err) => {
    console.error(`[sync] Failed for ${shop}:`, err);
  });
}

async function syncShop(
  shop: string,
  username: string,
  password: string,
): Promise<void> {
  const client = new KwtSmsClient({ username, password });

  const [balanceResult, senderResult, coverageResult] = await Promise.all([
    client.balance(),
    client.senderIds(),
    client.coverage(),
  ]);

  const update: Record<string, unknown> = {};

  if (balanceResult.ok) {
    update.balanceAvailable = balanceResult.data.available;
    update.balancePurchased = balanceResult.data.purchased;
  }

  if (senderResult.ok) {
    update.senderIds = senderResult.data.senderid;
  }

  if (coverageResult.ok) {
    update.coverage = coverageResult.data.prefixes;
  }

  if (Object.keys(update).length > 0) {
    await saveCredentials(shop, update as Parameters<typeof saveCredentials>[1]);
  }
}
