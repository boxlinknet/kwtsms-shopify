import { KwtSmsClient, normalize, cleanMessage, maskPhone } from "../kwtsms";
import { getCredentials } from "../db/credentials";
import { createLog } from "../db/logs";
import { updateBalanceFromResponse } from "./balance";

export interface BulkSendResult {
  totalSent: number;
  totalFailed: number;
  totalPoints: number;
  batches: BatchResult[];
}

interface BatchResult {
  batchIndex: number;
  success: boolean;
  numbers: number;
  pointsCharged: number;
  msgId?: string;
  error?: string;
}

const BATCH_SIZE = 200;
const BATCH_DELAY_MS = 200;
const MAX_RETRIES = 3;
const BACKOFF_DELAYS = [30_000, 60_000, 120_000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    return { totalSent: 0, totalFailed: 0, totalPoints: 0, batches: [] };
  }

  const creds = await getCredentials(shop);
  if (!creds || !creds.credentialsVerified) {
    return { totalSent: 0, totalFailed: phones.length, totalPoints: 0, batches: [] };
  }

  const client = new KwtSmsClient({
    username: creds.username,
    password: creds.password,
    senderId: params.senderId ?? creds.senderId,
    testMode: creds.testMode,
  });

  const cleanedMessage = cleanMessage(message);

  // Split into batches
  const batches: string[][] = [];
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    batches.push(normalized.slice(i, i + BATCH_SIZE));
  }

  const results: BatchResult[] = [];
  let totalSent = 0;
  let totalFailed = 0;
  let totalPoints = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    let batchResult: BatchResult | null = null;

    for (let retry = 0; retry <= MAX_RETRIES; retry++) {
      const sendResult = await client.sendBatch(batch, cleanedMessage, {
        senderId: params.senderId ?? creds.senderId,
        test: creds.testMode,
      });

      if (sendResult.ok) {
        batchResult = {
          batchIndex: i,
          success: true,
          numbers: sendResult.data.numbers,
          pointsCharged: sendResult.data["points-charged"],
          msgId: sendResult.data["msg-id"],
        };

        totalSent += sendResult.data.numbers;
        totalPoints += sendResult.data["points-charged"];

        await updateBalanceFromResponse(shop, sendResult.data["balance-after"]);

        await createLog({
          shop,
          eventType,
          phone: batch.join(","),
          message: cleanedMessage,
          senderId: params.senderId ?? creds.senderId,
          status: "sent",
          msgId: sendResult.data["msg-id"],
          pointsCharged: sendResult.data["points-charged"],
          balanceAfter: sendResult.data["balance-after"],
          apiResponse: JSON.stringify(sendResult.data),
          testMode: creds.testMode,
        });

        break;
      }

      // ERR013: queue full, retry with backoff
      if (sendResult.error.code === "ERR013" && retry < MAX_RETRIES) {
        console.warn(
          `Batch ${i}: Queue full, retrying in ${BACKOFF_DELAYS[retry] / 1000}s`,
        );
        await sleep(BACKOFF_DELAYS[retry]);
        continue;
      }

      // Other error or max retries reached
      batchResult = {
        batchIndex: i,
        success: false,
        numbers: 0,
        pointsCharged: 0,
        error: sendResult.error.description,
      };

      totalFailed += batch.length;

      await createLog({
        shop,
        eventType,
        phone: batch.join(","),
        message: cleanedMessage,
        senderId: params.senderId ?? creds.senderId,
        status: "failed",
        errorCode: sendResult.error.code,
        errorDescription: sendResult.error.description,
        apiResponse: JSON.stringify(sendResult.error),
        testMode: creds.testMode,
      });

      break;
    }

    if (batchResult) results.push(batchResult);

    // Wait between batches
    if (i < batches.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return { totalSent, totalFailed, totalPoints, batches: results };
}
