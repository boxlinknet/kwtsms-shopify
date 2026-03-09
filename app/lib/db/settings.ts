import db from "../../db.server";

export async function getSetting(shop: string, key: string): Promise<string | null> {
  const row = await db.settings.findUnique({
    where: { shop_key: { shop, key } },
  });
  return row?.value ?? null;
}

export async function setSetting(shop: string, key: string, value: string): Promise<void> {
  await db.settings.upsert({
    where: { shop_key: { shop, key } },
    create: { shop, key, value },
    update: { value },
  });
}

export async function getSettings(shop: string): Promise<Record<string, string>> {
  const rows = await db.settings.findMany({ where: { shop } });
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

const DEFAULT_SETTINGS: Record<string, string> = {
  sms_enabled: "true",
  default_country_code: "965",
  default_language: "en",
  debug_logging: "false",
  test_mode: "true",
  admin_phone: "",
  notify_order_created: "true",
  notify_order_paid: "true",
  notify_order_shipped: "true",
  notify_order_partially_shipped: "true",
  notify_order_cancelled: "true",
  notify_customer_created: "false",
  notify_low_stock: "false",
};

export async function initDefaults(shop: string): Promise<void> {
  const existing = await getSettings(shop);
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (!(key in existing)) {
      await setSetting(shop, key, value);
    }
  }
}
