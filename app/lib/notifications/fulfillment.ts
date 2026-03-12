import { sendNotification, type SendResult } from "../sms/sender";

interface FulfillmentPayload {
  order_id?: number;
  name?: string;
  tracking_number?: string;
  tracking_numbers?: string[];
  tracking_url?: string;
  tracking_urls?: string[];
  tracking_company?: string;
  destination?: {
    phone?: string;
    first_name?: string;
    last_name?: string;
  };
  // Shopify does not include locale on fulfillment payloads
}

export async function handleFulfillmentCreated(
  shop: string,
  payload: FulfillmentPayload,
): Promise<SendResult> {
  const phone = payload.destination?.phone;
  if (!phone) {
    console.log("Fulfillment created: no destination phone, skipping SMS");
    return { success: false, error: "No destination phone number" };
  }

  const customerName =
    `${payload.destination?.first_name ?? ""} ${payload.destination?.last_name ?? ""}`.trim() ||
    "Customer";

  return sendNotification({
    shop,
    eventType: "fulfillment_created",
    phone,
    templateData: {
      order_number: payload.name ?? `#${payload.order_id ?? ""}`,
      customer_name: customerName,
      tracking_number: payload.tracking_number ?? payload.tracking_numbers?.[0] ?? "N/A",
      tracking_url: payload.tracking_url ?? payload.tracking_urls?.[0] ?? "",
      carrier: payload.tracking_company ?? "N/A",
      shop_name: shop.replace(".myshopify.com", ""),
    },
  });
}

export async function handleFulfillmentUpdated(
  shop: string,
  payload: FulfillmentPayload,
): Promise<SendResult> {
  // Same as created for now, re-sends tracking info on update
  return handleFulfillmentCreated(shop, payload);
}
