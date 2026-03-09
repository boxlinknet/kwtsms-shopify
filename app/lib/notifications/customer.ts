import { sendNotification, type SendResult } from "../sms/sender";

interface CustomerPayload {
  phone?: string;
  first_name?: string;
  last_name?: string;
}

export async function handleCustomerCreated(
  shop: string,
  payload: CustomerPayload,
): Promise<SendResult> {
  const phone = payload.phone;
  if (!phone) {
    console.log("Customer created: no phone, skipping SMS");
    return { success: false, error: "No customer phone number" };
  }

  const customerName =
    `${payload.first_name ?? ""} ${payload.last_name ?? ""}`.trim() || "Customer";

  return sendNotification({
    shop,
    eventType: "customer_created",
    phone,
    templateData: {
      customer_name: customerName,
      shop_name: shop.replace(".myshopify.com", ""),
    },
  });
}
