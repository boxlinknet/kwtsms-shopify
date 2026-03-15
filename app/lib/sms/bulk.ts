import { KwtSmsClient, normalize, cleanMessage } from "../kwtsms";
import { getCredentials } from "../db/credentials";
import { createLog } from "../db/logs";
import { updateBalanceFromResponse } from "./balance";

export interface BulkSendResult {
  totalSent: number;
  totalFailed: number;
  totalPoints: number;
}

export async function bulkSend(params: {
  shop: string;
  phones: string[];
  message: string;
  eventType: string;
  senderId?: string;
}): Promise<BulkSendResult> {
  const { shop, phones, message, eventType } = params;

  // Normalize and deduplicate
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const phone of phones) {
    const result = normalize(phone);
    if (result.valid && !seen.has(result.normalized)) {
      seen.add(result.normalized);
      normalized.push(result.normalized);
    }
  }

  if (normalized.length === 0) {
    return { totalSent: 0, totalFailed: 0, totalPoints: 0 };
  }

  const creds = await getCredentials(shop);
  if (!creds || !creds.credentialsVerified) {
    return { totalSent: 0, totalFailed: phones.length, totalPoints: 0 };
  }

  const client = new KwtSmsClient({
    username: creds.username,
    password: creds.password,
    senderId: params.senderId ?? creds.senderId,
    testMode: creds.testMode,
  });

  const cleanedMessage = cleanMessage(message);
  const sender = params.senderId ?? creds.senderId;

  // send() handles chunking into 200-number batches internally
  const result = await client.send(normalized, cleanedMessage, {
    senderId: sender,
    test: creds.testMode,
  });

  if (result.ok) {
    await updateBalanceFromResponse(shop, result.data["balance-after"]);

    await createLog({
      shop,
      eventType,
      phone: normalized.join(","),
      message: cleanedMessage,
      senderId: sender,
      status: "sent",
      msgId: result.data["msg-id"],
      pointsCharged: result.data["points-charged"],
      balanceAfter: result.data["balance-after"],
      apiResponse: JSON.stringify(result.data),
      testMode: creds.testMode,
    });

    return {
      totalSent: result.data.numbers,
      totalFailed: 0,
      totalPoints: result.data["points-charged"],
    };
  }

  await createLog({
    shop,
    eventType,
    phone: normalized.join(","),
    message: cleanedMessage,
    senderId: sender,
    status: "failed",
    errorCode: result.error.code,
    errorDescription: result.error.description,
    apiResponse: JSON.stringify(result.error),
    testMode: creds.testMode,
  });

  return {
    totalSent: 0,
    totalFailed: normalized.length,
    totalPoints: 0,
  };
}
