import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { handleShopRedact } from "../lib/notifications/privacy";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  await handleShopRedact(shop, payload);

  return new Response();
};
