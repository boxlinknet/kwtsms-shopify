import { useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getSettings, setSetting } from "../lib/db/settings";
import { getCredentials } from "../lib/db/credentials";
import { getLogStats } from "../lib/db/logs";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const settings = await getSettings(shop);
  const creds = await getCredentials(shop);
  const stats = await getLogStats(shop);
  const coverage: string[] = creds?.coverage ? JSON.parse(creds.coverage as string) : [];

  return {
    shop,
    settings,
    coverage,
    balanceAvailable: creds?.balanceAvailable ?? 0,
    credentialsVerified: creds?.credentialsVerified ?? false,
    totalSent: stats.totalSent,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const checkboxKeys = [
    "sms_enabled",
    "notify_order_created",
    "notify_order_paid",
    "notify_order_shipped",
    "notify_order_partially_fulfilled",
    "notify_order_cancelled",
    "test_mode",
    "debug_logging",
  ];

  for (const key of checkboxKeys) {
    const value = formData.has(key) ? "true" : "false";
    await setSetting(session.shop, key, value);
  }

  const textKeys = ["admin_phone", "default_country_code", "default_language"];
  for (const key of textKeys) {
    const value = (formData.get(key) as string) ?? "";
    await setSetting(session.shop, key, value);
  }

  return { success: true };
};

export default function SettingsPage() {
  const { shop, settings, coverage, balanceAvailable, credentialsVerified, totalSent } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [smsEnabled, setSmsEnabled] = useState(settings.sms_enabled !== "false");
  const [orderCreated, setOrderCreated] = useState(settings.notify_order_created !== "false");
  const [orderPaid, setOrderPaid] = useState(settings.notify_order_paid !== "false");
  const [orderShipped, setOrderShipped] = useState(settings.notify_order_shipped !== "false");
  const [orderPartiallyFulfilled, setOrderPartiallyFulfilled] = useState(
    settings.notify_order_partially_fulfilled !== "false",
  );
  const [orderCancelled, setOrderCancelled] = useState(settings.notify_order_cancelled !== "false");
  const [adminPhone, setAdminPhone] = useState(settings.admin_phone ?? "");
  const [countryCode, setCountryCode] = useState(settings.default_country_code ?? "965");
  const [language, setLanguage] = useState(settings.default_language ?? "en");
  const [testMode, setTestMode] = useState(settings.test_mode !== "false");
  const [debugLogging, setDebugLogging] = useState(settings.debug_logging === "true");

  return (
    <s-page heading="kwtSMS Settings">
      <s-section heading="Welcome to kwtSMS">
        <s-paragraph>
          kwtSMS lets you send automated SMS notifications to your customers
          through the kwtSMS gateway. Order confirmations, shipping updates, and
          more can all be sent directly to your customers' phones.
        </s-paragraph>
        <s-paragraph>
          Connected shop: <strong>{shop}</strong>
        </s-paragraph>
        {!credentialsVerified && (
          <s-paragraph>
            To get started, configure your{" "}
            <s-link href="/app/gateway">Gateway Settings</s-link> with your
            kwtSMS API credentials.
          </s-paragraph>
        )}
      </s-section>

      <s-section slot="aside" heading="Quick Status">
        <s-paragraph>
          <strong>SMS Balance:</strong>{" "}
          {credentialsVerified ? `${balanceAvailable.toFixed(2)} credits` : "Not configured"}
        </s-paragraph>
        <s-paragraph>
          <strong>Messages Sent:</strong> {totalSent}
        </s-paragraph>
      </s-section>

      {actionData?.success && (
        <s-banner tone="success" dismissible>
          Settings saved successfully.
        </s-banner>
      )}

      <Form method="post">
        {smsEnabled && <input type="hidden" name="sms_enabled" value="1" />}
        {orderCreated && <input type="hidden" name="notify_order_created" value="1" />}
        {orderPaid && <input type="hidden" name="notify_order_paid" value="1" />}
        {orderShipped && <input type="hidden" name="notify_order_shipped" value="1" />}
        {orderPartiallyFulfilled && (
          <input type="hidden" name="notify_order_partially_fulfilled" value="1" />
        )}
        {orderCancelled && <input type="hidden" name="notify_order_cancelled" value="1" />}
        {testMode && <input type="hidden" name="test_mode" value="1" />}
        {debugLogging && <input type="hidden" name="debug_logging" value="1" />}

        <div style={{ marginTop: "16px" }} />
        <s-section heading="Global SMS Toggle">
          <s-checkbox
            label="Enable SMS notifications"
            checked={smsEnabled || undefined}
            onChange={() => setSmsEnabled(!smsEnabled)}
          />
          <s-paragraph>
            When disabled, no SMS messages will be sent from this app.
          </s-paragraph>
        </s-section>

        <div style={{ marginTop: "16px" }} />
        <s-section heading="Notification Events">
          <s-paragraph>
            Choose which order events should trigger SMS notifications.
          </s-paragraph>
          <s-checkbox
            label="Order Created"
            checked={orderCreated || undefined}
            onChange={() => setOrderCreated(!orderCreated)}
          />
          <s-checkbox
            label="Order Paid"
            checked={orderPaid || undefined}
            onChange={() => setOrderPaid(!orderPaid)}
          />
          <s-checkbox
            label="Order Shipped"
            checked={orderShipped || undefined}
            onChange={() => setOrderShipped(!orderShipped)}
          />
          <s-checkbox
            label="Order Partially Fulfilled"
            checked={orderPartiallyFulfilled || undefined}
            onChange={() => setOrderPartiallyFulfilled(!orderPartiallyFulfilled)}
          />
          <s-checkbox
            label="Order Cancelled"
            checked={orderCancelled || undefined}
            onChange={() => setOrderCancelled(!orderCancelled)}
          />
        </s-section>

        <div style={{ marginTop: "16px" }} />
        <s-section heading="Admin Notifications">
          <s-text-field
            label="Admin phone number"
            name="admin_phone"
            value={adminPhone}
            onInput={(e: Event) => setAdminPhone((e.target as HTMLInputElement).value)}
          />
        </s-section>

        <div style={{ marginTop: "16px" }} />
        <s-section heading="Defaults">
          {coverage.length > 0 ? (
            <s-select
              label="Default country code"
              name="default_country_code"
              value={countryCode}
              onChange={(e: Event) => setCountryCode((e.target as HTMLSelectElement).value)}
            >
              {coverage.map((prefix: string) => (
                <s-option key={prefix} value={prefix}>+{prefix}</s-option>
              ))}
            </s-select>
          ) : (
            <s-text-field
              label="Default country code"
              name="default_country_code"
              value={countryCode}
              onInput={(e: Event) => setCountryCode((e.target as HTMLInputElement).value)}
            />
          )}
          <s-select
            label="Fallback language"
            name="default_language"
            value={language}
            onChange={(e: Event) => setLanguage((e.target as HTMLSelectElement).value)}
          >
            <s-option value="en">English</s-option>
            <s-option value="ar">Arabic</s-option>
          </s-select>
        </s-section>

        <div style={{ marginTop: "16px" }} />
        <s-section heading="Developer Options">
          <s-checkbox
            label="Test mode"
            checked={testMode || undefined}
            onChange={() => setTestMode(!testMode)}
          />
          <s-paragraph>
            When enabled, SMS messages are logged but not actually sent.
          </s-paragraph>
          <s-checkbox
            label="Debug logging"
            checked={debugLogging || undefined}
            onChange={() => setDebugLogging(!debugLogging)}
          />
          <s-paragraph>
            When enabled, detailed logs are recorded for troubleshooting.
          </s-paragraph>
        </s-section>

        <div style={{ marginTop: "16px" }} />
        <s-section>
          <s-button variant="primary" type="submit">
            Save Settings
          </s-button>
        </s-section>
      </Form>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
