import db from "../../db.server";

export async function getCredentials(shop: string) {
  return db.gatewayCredentials.findUnique({ where: { shop } });
}

export async function saveCredentials(
  shop: string,
  data: {
    username?: string;
    password?: string;
    senderId?: string;
    testMode?: boolean;
    senderIds?: string[];
    coverage?: Array<{ prefix: string; country: string; rate: number }>;
    balanceAvailable?: number;
    balancePurchased?: number;
    credentialsVerified?: boolean;
  },
) {
  const updateData: Record<string, unknown> = {};

  if (data.username !== undefined) updateData.username = data.username;
  if (data.password !== undefined) updateData.password = data.password;
  if (data.senderId !== undefined) updateData.senderId = data.senderId;
  if (data.testMode !== undefined) updateData.testMode = data.testMode;
  if (data.senderIds !== undefined) updateData.senderIds = JSON.stringify(data.senderIds);
  if (data.coverage !== undefined) updateData.coverage = JSON.stringify(data.coverage);
  if (data.balanceAvailable !== undefined) updateData.balanceAvailable = data.balanceAvailable;
  if (data.balancePurchased !== undefined) updateData.balancePurchased = data.balancePurchased;
  if (data.credentialsVerified !== undefined) updateData.credentialsVerified = data.credentialsVerified;
  if (data.balanceAvailable !== undefined || data.balancePurchased !== undefined) {
    updateData.balanceUpdatedAt = new Date();
  }

  await db.gatewayCredentials.upsert({
    where: { shop },
    create: {
      shop,
      username: data.username ?? "",
      password: data.password ?? "",
      ...updateData,
    },
    update: updateData,
  });
}
