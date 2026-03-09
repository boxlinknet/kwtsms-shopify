import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { handleFulfillmentUpdated } from "../lib/notifications/fulfillment";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  await handleFulfillmentUpdated(shop, payload);

  return new Response();
};
