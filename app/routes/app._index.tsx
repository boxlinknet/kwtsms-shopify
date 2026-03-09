import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return { shop: session.shop };
};

export default function Dashboard() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <s-page heading="kwtSMS Dashboard">
      <s-section heading="Welcome to kwtSMS">
        <s-paragraph>
          kwtSMS lets you send automated SMS notifications to your customers
          through the kwtSMS gateway. Order confirmations, shipping updates, and
          more can all be sent directly to your customers' phones.
        </s-paragraph>
        <s-paragraph>
          Connected shop: <strong>{shop}</strong>
        </s-paragraph>
        <s-paragraph>
          To get started, configure your{" "}
          <s-link href="/app/gateway">Gateway Settings</s-link> with your
          kwtSMS API credentials.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Quick Status">
        <s-paragraph>
          <strong>SMS Balance:</strong> Not configured
        </s-paragraph>
        <s-paragraph>
          <strong>Messages Sent:</strong> 0
        </s-paragraph>
        <s-paragraph>
          Configure your gateway credentials to view your live balance and
          message count.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
