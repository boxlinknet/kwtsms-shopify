import db from "../../db.server";

interface DataRequestPayload {
  customer?: {
    id?: number;
    email?: string;
    phone?: string;
  };
  orders_requested?: number[];
}

interface RedactPayload {
  customer?: {
    id?: number;
    email?: string;
    phone?: string;
  };
  orders_to_redact?: number[];
}

interface ShopRedactPayload {
  shop_id?: number;
  shop_domain?: string;
}

export async function handleCustomerDataRequest(
  shop: string,
  payload: DataRequestPayload,
): Promise<void> {
  const phone = payload.customer?.phone;
  console.log("Customer data request", { shop, phone: phone ? "***" : "none" });

  // In a full implementation, this would compile and return all stored
  // customer data. For now, we log the request. The data is in SmsLog.
}

export async function handleCustomerRedact(
  shop: string,
  payload: RedactPayload,
): Promise<void> {
  const phone = payload.customer?.phone;
  console.log("Customer redact request", { shop, phone: phone ? "***" : "none" });

  if (phone) {
    // Delete all SMS logs containing this phone number
    await db.smsLog.deleteMany({
      where: { shop, phone: { contains: phone.replace(/\D/g, "") } },
    });
  }
}

export async function handleShopRedact(
  shop: string,
  _payload: ShopRedactPayload,
): Promise<void> {
  console.log("Shop redact request", { shop });

  // Delete ALL data for this shop (48h after uninstall)
  await Promise.all([
    db.smsLog.deleteMany({ where: { shop } }),
    db.smsTemplate.deleteMany({ where: { shop } }),
    db.settings.deleteMany({ where: { shop } }),
    db.gatewayCredentials.deleteMany({ where: { shop } }),
  ]);
}
