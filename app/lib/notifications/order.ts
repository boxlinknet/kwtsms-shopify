import { sendNotification, type SendResult } from "../sms/sender";

interface OrderPayload {
  name?: string;
  order_number?: number;
  total_price?: string;
  currency?: string;
  line_items?: Array<unknown>;
  cancel_reason?: string;
  payment_gateway_names?: string[];
  customer?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  shipping_address?: {
    phone?: string;
  };
  billing_address?: {
    phone?: string;
  };
  fulfillments?: Array<{
    tracking_number?: string;
    tracking_url?: string;
    tracking_company?: string;
  }>;
}

function getCustomerPhone(payload: OrderPayload): string | null {
  return (
    payload.shipping_address?.phone ??
    payload.customer?.phone ??
    payload.billing_address?.phone ??
    null
  );
}

function getCustomerName(payload: OrderPayload): string {
  const first = payload.customer?.first_name ?? "";
  const last = payload.customer?.last_name ?? "";
  return `${first} ${last}`.trim() || "Customer";
}

function getShopName(shop: string): string {
  return shop.replace(".myshopify.com", "");
}

export async function handleOrderCreated(
  shop: string,
  payload: OrderPayload,
): Promise<SendResult> {
  const phone = getCustomerPhone(payload);
  if (!phone) {
    console.log("Order created: no customer phone, skipping SMS");
    return { success: false, error: "No customer phone number" };
  }

  return sendNotification({
    shop,
    eventType: "order_created",
    phone,
    templateData: {
      order_number: payload.name ?? `#${payload.order_number ?? ""}`,
      customer_name: getCustomerName(payload),
      total_price: payload.total_price ?? "0",
      currency: payload.currency ?? "KWD",
      item_count: String(payload.line_items?.length ?? 0),
      shop_name: getShopName(shop),
    },
  });
}

export async function handleOrderPaid(
  shop: string,
  payload: OrderPayload,
): Promise<SendResult> {
  const phone = getCustomerPhone(payload);
  if (!phone) {
    return { success: false, error: "No customer phone number" };
  }

  return sendNotification({
    shop,
    eventType: "order_paid",
    phone,
    templateData: {
      order_number: payload.name ?? `#${payload.order_number ?? ""}`,
      customer_name: getCustomerName(payload),
      total_price: payload.total_price ?? "0",
      currency: payload.currency ?? "KWD",
      payment_method: payload.payment_gateway_names?.[0] ?? "N/A",
      shop_name: getShopName(shop),
    },
  });
}

export async function handleOrderFulfilled(
  shop: string,
  payload: OrderPayload,
): Promise<SendResult> {
  const phone = getCustomerPhone(payload);
  if (!phone) {
    return { success: false, error: "No customer phone number" };
  }

  const fulfillment = payload.fulfillments?.[0];

  return sendNotification({
    shop,
    eventType: "order_shipped",
    phone,
    templateData: {
      order_number: payload.name ?? `#${payload.order_number ?? ""}`,
      customer_name: getCustomerName(payload),
      tracking_number: fulfillment?.tracking_number ?? "N/A",
      tracking_url: fulfillment?.tracking_url ?? "",
      carrier: fulfillment?.tracking_company ?? "N/A",
      shop_name: getShopName(shop),
    },
  });
}

export async function handleOrderPartiallyFulfilled(
  shop: string,
  payload: OrderPayload,
): Promise<SendResult> {
  const phone = getCustomerPhone(payload);
  if (!phone) {
    return { success: false, error: "No customer phone number" };
  }

  const fulfillment = payload.fulfillments?.[0];

  return sendNotification({
    shop,
    eventType: "order_partially_fulfilled",
    phone,
    templateData: {
      order_number: payload.name ?? `#${payload.order_number ?? ""}`,
      customer_name: getCustomerName(payload),
      tracking_url: fulfillment?.tracking_url ?? "",
      shop_name: getShopName(shop),
    },
  });
}

export async function handleOrderCancelled(
  shop: string,
  payload: OrderPayload,
): Promise<SendResult> {
  const phone = getCustomerPhone(payload);
  if (!phone) {
    return { success: false, error: "No customer phone number" };
  }

  return sendNotification({
    shop,
    eventType: "order_cancelled",
    phone,
    templateData: {
      order_number: payload.name ?? `#${payload.order_number ?? ""}`,
      customer_name: getCustomerName(payload),
      cancel_reason: payload.cancel_reason ?? "N/A",
      shop_name: getShopName(shop),
    },
  });
}
