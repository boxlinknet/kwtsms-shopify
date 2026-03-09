import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { handleCustomerCreated } from "../lib/notifications/customer";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  await handleCustomerCreated(shop, payload);

  return new Response();
};
