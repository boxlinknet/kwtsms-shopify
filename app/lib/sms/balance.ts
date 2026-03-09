import { KwtSmsClient, type Result, type BalanceResponse } from "../kwtsms";
import { getCredentials, saveCredentials } from "../db/credentials";

export async function checkBalance(
  shop: string,
): Promise<{ available: number; sufficient: boolean }> {
  const creds = await getCredentials(shop);
  if (!creds) {
    return { available: 0, sufficient: false };
  }
  return {
    available: creds.balanceAvailable,
    sufficient: creds.balanceAvailable > 0,
  };
}

export async function updateBalanceFromResponse(
  shop: string,
  balanceAfter: number,
): Promise<void> {
  await saveCredentials(shop, { balanceAvailable: balanceAfter });
}

export async function syncBalance(
  shop: string,
): Promise<Result<BalanceResponse>> {
  const creds = await getCredentials(shop);
  if (!creds) {
    return {
      ok: false,
      error: {
        code: "NO_CREDENTIALS",
        description: "No gateway credentials configured",
        action: "Configure credentials in Gateway Settings",
      },
    };
  }

  const client = new KwtSmsClient({
    username: creds.username,
    password: creds.password,
  });

  const result = await client.balance();
  if (result.ok) {
    await saveCredentials(shop, {
      balanceAvailable: result.data.available,
      balancePurchased: result.data.purchased,
    });
  }

  return result;
}
