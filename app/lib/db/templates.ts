import db from "../../db.server";
import { getDefaultTemplates } from "../sms/templates";

export async function getTemplates(shop: string) {
  return db.smsTemplate.findMany({ where: { shop } });
}

export async function getTemplate(shop: string, eventType: string) {
  return db.smsTemplate.findUnique({
    where: { shop_eventType: { shop, eventType } },
  });
}

export async function saveTemplate(
  shop: string,
  eventType: string,
  data: {
    enabled?: boolean;
    templateEn?: string;
    templateAr?: string;
    recipientType?: string;
  },
) {
  await db.smsTemplate.upsert({
    where: { shop_eventType: { shop, eventType } },
    create: {
      shop,
      eventType,
      enabled: data.enabled ?? true,
      templateEn: data.templateEn ?? "",
      templateAr: data.templateAr ?? "",
      recipientType: data.recipientType ?? "customer",
    },
    update: data,
  });
}

export async function seedDefaultTemplates(shop: string): Promise<void> {
  const existing = await getTemplates(shop);
  const existingTypes = new Set(existing.map((t) => t.eventType));

  const defaults = getDefaultTemplates();
  for (const tpl of defaults) {
    if (!existingTypes.has(tpl.eventType)) {
      await db.smsTemplate.create({
        data: {
          shop,
          eventType: tpl.eventType,
          templateEn: tpl.templateEn,
          templateAr: tpl.templateAr,
          recipientType: tpl.recipientType,
        },
      });
    }
  }
}
