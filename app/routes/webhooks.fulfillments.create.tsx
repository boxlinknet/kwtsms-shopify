import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { handleFulfillmentCreated } from "../lib/notifications/fulfillment";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const result = await handleFulfillmentCreated(shop, payload);
    console.log(`[webhook] ${topic} result:`, result);
  } catch (err) {
    console.error(`[webhook] ${topic} handler failed for ${shop}:`, err);
  }

  return new Response();
};
