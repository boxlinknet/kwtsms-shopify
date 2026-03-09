import { KwtSmsClient, normalize, cleanMessage, maskPhone } from "../kwtsms";
import type { Result, SendResponse } from "../kwtsms";
import { getCredentials } from "../db/credentials";
import { getSetting } from "../db/settings";
import { getTemplate } from "../db/templates";
import { createLog } from "../db/logs";
import { renderTemplate, type TemplateData } from "./templates";
import { checkBalance, updateBalanceFromResponse } from "./balance";

export interface SendResult {
  success: boolean;
  msgId?: string;
  pointsCharged?: number;
  error?: string;
}

export async function sendSms(params: {
  shop: string;
  phone: string;
  message: string;
  eventType: string;
  senderId?: string;
  testMode?: boolean;
}): Promise<SendResult> {
  const { shop, phone, message, eventType } = params;

  // Normalize phone
  const phoneResult = normalize(phone);
  if (!phoneResult.valid) {
    await createLog({
      shop,
      eventType,
      phone: phone,
      message,
      senderId: params.senderId ?? "",
      status: "failed",
      errorCode: "PHONE_INVALID",
      errorDescription: phoneResult.error,
    });
    return { success: false, error: phoneResult.error };
  }

  // Check balance
  const balance = await checkBalance(shop);
  if (!balance.sufficient) {
    await createLog({
      shop,
      eventType,
      phone: phoneResult.normalized,
      message,
      senderId: params.senderId ?? "",
      status: "failed",
      errorCode: "ZERO_BALANCE",
      errorDescription: "Insufficient balance",
    });
    return { success: false, error: "Insufficient balance" };
  }

  // Get credentials
  const creds = await getCredentials(shop);
  if (!creds || !creds.credentialsVerified) {
    return { success: false, error: "Gateway credentials not configured" };
  }

  // Check coverage
  const coverage = JSON.parse(creds.coverage) as Array<{ prefix: string }>;
  if (coverage.length > 0) {
    const hasRoute = coverage.some((c) =>
      phoneResult.normalized.startsWith(c.prefix),
    );
    if (!hasRoute) {
      await createLog({
        shop,
        eventType,
        phone: phoneResult.normalized,
        message,
        senderId: params.senderId ?? creds.senderId,
        status: "skipped",
        errorCode: "NO_COVERAGE",
        errorDescription: "Country not in coverage list",
      });
      return { success: false, error: "Country not in coverage list" };
    }
  }

  const client = new KwtSmsClient({
    username: creds.username,
    password: creds.password,
    senderId: params.senderId ?? creds.senderId,
    testMode: params.testMode ?? creds.testMode,
  });

  const result = await client.send(phoneResult.normalized, message, {
    senderId: params.senderId ?? creds.senderId,
    test: params.testMode ?? creds.testMode,
  });

  if (result.ok) {
    await createLog({
      shop,
      eventType,
      phone: phoneResult.normalized,
      message: cleanMessage(message),
      senderId: params.senderId ?? creds.senderId,
      status: "sent",
      msgId: result.data["msg-id"],
      pointsCharged: result.data["points-charged"],
      balanceAfter: result.data["balance-after"],
      apiResponse: JSON.stringify(result.data),
      testMode: params.testMode ?? creds.testMode,
    });

    await updateBalanceFromResponse(shop, result.data["balance-after"]);

    console.log("SMS sent", {
      shop,
      eventType,
      phone: maskPhone(phoneResult.normalized),
      msgId: result.data["msg-id"],
      points: result.data["points-charged"],
    });

    return {
      success: true,
      msgId: result.data["msg-id"],
      pointsCharged: result.data["points-charged"],
    };
  }

  await createLog({
    shop,
    eventType,
    phone: phoneResult.normalized,
    message: cleanMessage(message),
    senderId: params.senderId ?? creds.senderId,
    status: "failed",
    errorCode: result.error.code,
    errorDescription: result.error.description,
    apiResponse: JSON.stringify(result.error),
    testMode: params.testMode ?? creds.testMode,
  });

  console.error("SMS send failed", {
    shop,
    eventType,
    errorCode: result.error.code,
    errorDescription: result.error.description,
  });

  return { success: false, error: result.error.description };
}

export async function sendNotification(params: {
  shop: string;
  eventType: string;
  phone: string;
  templateData: TemplateData;
}): Promise<SendResult> {
  const { shop, eventType, phone, templateData } = params;

  // Check if SMS is enabled globally
  const smsEnabled = await getSetting(shop, "sms_enabled");
  if (smsEnabled === "false") {
    return { success: false, error: "SMS notifications disabled" };
  }

  // Check if this event type is enabled
  const eventKey = `notify_${eventType}`;
  const eventEnabled = await getSetting(shop, eventKey);
  if (eventEnabled === "false") {
    return { success: false, error: `Notification type ${eventType} disabled` };
  }

  // Load template
  const template = await getTemplate(shop, eventType);
  if (!template || !template.enabled) {
    return { success: false, error: `No active template for ${eventType}` };
  }

  // Get language preference
  const language = (await getSetting(shop, "default_language")) ?? "en";
  const templateText =
    language === "ar" ? template.templateAr : template.templateEn;

  // Render template
  const message = renderTemplate(templateText, templateData);

  return sendSms({ shop, phone, message, eventType });
}
