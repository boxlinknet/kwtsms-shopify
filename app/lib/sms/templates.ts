export interface TemplateData {
  [key: string]: string;
}

export function renderTemplate(template: string, data: TemplateData): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key in data) {
      return data[key];
    }
    console.warn(`Template placeholder not found: ${match}`);
    return match;
  });
}

export interface DefaultTemplate {
  eventType: string;
  templateEn: string;
  templateAr: string;
  recipientType: string;
}

export function getDefaultTemplates(): DefaultTemplate[] {
  return [
    {
      eventType: "order_created",
      templateEn:
        "Hi {customer_name}, your order {order_number} has been received! Total: {total_price} {currency}. Thank you for shopping with {shop_name}.",
      templateAr:
        "مرحبا {customer_name}، تم استلام طلبك {order_number}! المجموع: {total_price} {currency}. شكرا لتسوقك من {shop_name}.",
      recipientType: "customer",
    },
    {
      eventType: "order_paid",
      templateEn:
        "Payment confirmed for order {order_number}. Amount: {total_price} {currency}. We are preparing your order. - {shop_name}",
      templateAr:
        "تم تأكيد الدفع للطلب {order_number}. المبلغ: {total_price} {currency}. جاري تجهيز طلبك. - {shop_name}",
      recipientType: "customer",
    },
    {
      eventType: "order_shipped",
      templateEn:
        "Your order {order_number} has been shipped via {carrier}. Track: {tracking_url} - {shop_name}",
      templateAr:
        "تم شحن طلبك {order_number} عبر {carrier}. تتبع: {tracking_url} - {shop_name}",
      recipientType: "customer",
    },
    {
      eventType: "order_cancelled",
      templateEn:
        "Order {order_number} has been cancelled. If you have questions, please contact us. - {shop_name}",
      templateAr:
        "تم إلغاء الطلب {order_number}. إذا كان لديك أي استفسار، يرجى التواصل معنا. - {shop_name}",
      recipientType: "customer",
    },
    {
      eventType: "order_partially_fulfilled",
      templateEn:
        "Part of your order {order_number} has been shipped. Track: {tracking_url} - {shop_name}",
      templateAr:
        "تم شحن جزء من طلبك {order_number}. تتبع: {tracking_url} - {shop_name}",
      recipientType: "customer",
    },
    {
      eventType: "fulfillment_created",
      templateEn:
        "Your order {order_number} has been shipped via {carrier}. Tracking: {tracking_number}. - {shop_name}",
      templateAr:
        "تم شحن طلبك {order_number} عبر {carrier}. رقم التتبع: {tracking_number}. - {shop_name}",
      recipientType: "customer",
    },
  ];
}
