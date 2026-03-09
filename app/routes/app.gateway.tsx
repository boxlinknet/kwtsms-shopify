import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getCredentials, saveCredentials } from "../lib/db/credentials";
import { KwtSmsClient } from "../lib/kwtsms";

interface LoaderData {
  username: string;
  senderId: string;
  testMode: boolean;
  senderIds: string[];
  coverage: Array<{ prefix: string; country: string; rate: number }>;
  balanceAvailable: number;
  balancePurchased: number;
  credentialsVerified: boolean;
}

interface ActionData {
  intent: string;
  ok: boolean;
  message?: string;
  error?: string;
  balance?: { available: number; purchased: number };
  senderIds?: string[];
  coverage?: Array<{ prefix: string; country: string; rate: number }>;
  credentialsVerified?: boolean;
  senderId?: string;
  testResult?: { msgId: string; numbers: number; pointsCharged: number };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const creds = await getCredentials(session.shop);

  return {
    username: creds?.username ?? "",
    senderId: creds?.senderId ?? "",
    testMode: creds?.testMode ?? true,
    senderIds: creds?.senderIds ? JSON.parse(creds.senderIds as string) : [],
    coverage: creds?.coverage ? JSON.parse(creds.coverage as string) : [],
    balanceAvailable: creds?.balanceAvailable ?? 0,
    balancePurchased: creds?.balancePurchased ?? 0,
    credentialsVerified: creds?.credentialsVerified ?? false,
  } satisfies LoaderData;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "verify") {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { intent, ok: false, error: "Username and password are required." } satisfies ActionData;
    }

    const client = new KwtSmsClient({ username, password });
    const balanceResult = await client.balance();
    if (!balanceResult.ok) {
      return { intent, ok: false, error: "Invalid credentials. Please check your API username and password." } satisfies ActionData;
    }

    const senderResult = await client.senderIds();
    const senderIds = senderResult.ok ? senderResult.data.senderid : [];

    const coverageResult = await client.coverage();
    const coverage = coverageResult.ok ? coverageResult.data.coverage : [];

    await saveCredentials(shop, {
      username, password, senderIds, coverage,
      balanceAvailable: balanceResult.data.available,
      balancePurchased: balanceResult.data.purchased,
      credentialsVerified: true,
    });

    return {
      intent, ok: true, message: "Credentials verified successfully.",
      balance: { available: balanceResult.data.available, purchased: balanceResult.data.purchased },
      senderIds, coverage, credentialsVerified: true,
    } satisfies ActionData;
  }

  if (intent === "save_sender") {
    const senderId = formData.get("senderId") as string;
    const testMode = formData.get("testMode") === "true";
    await saveCredentials(shop, { senderId, testMode });
    return { intent, ok: true, message: "Sender ID and settings saved.", senderId } satisfies ActionData;
  }

  if (intent === "refresh_balance") {
    const creds = await getCredentials(shop);
    if (!creds?.username || !creds?.password) {
      return { intent, ok: false, error: "Credentials not configured." } satisfies ActionData;
    }
    const client = new KwtSmsClient({ username: creds.username, password: creds.password });
    const result = await client.balance();
    if (!result.ok) {
      return { intent, ok: false, error: `Failed to refresh: ${result.error.description}` } satisfies ActionData;
    }
    await saveCredentials(shop, { balanceAvailable: result.data.available, balancePurchased: result.data.purchased });
    return {
      intent, ok: true, message: "Balance refreshed.",
      balance: { available: result.data.available, purchased: result.data.purchased },
    } satisfies ActionData;
  }

  if (intent === "send_test") {
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    if (!phone || !message) {
      return { intent, ok: false, error: "Phone number and message are required." } satisfies ActionData;
    }
    const creds = await getCredentials(shop);
    if (!creds?.username || !creds?.password) {
      return { intent, ok: false, error: "Credentials not configured." } satisfies ActionData;
    }
    const client = new KwtSmsClient({ username: creds.username, password: creds.password, senderId: creds.senderId ?? undefined });
    const result = await client.send(phone, message, { test: true });
    if (!result.ok) {
      return { intent, ok: false, error: `Test SMS failed: ${result.error.description}` } satisfies ActionData;
    }
    return {
      intent, ok: true, message: "Test SMS sent successfully.",
      testResult: { msgId: result.data["msg-id"], numbers: result.data.numbers, pointsCharged: result.data["points-charged"] },
    } satisfies ActionData;
  }

  return { intent: "", ok: false, error: "Unknown action." } satisfies ActionData;
};

export default function GatewaySettings() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  const [username, setUsername] = useState(loaderData.username);
  const [password, setPassword] = useState("");
  const [senderId, setSenderId] = useState(loaderData.senderId);
  const [testMode, setTestMode] = useState(loaderData.testMode);
  const [phone, setPhone] = useState("");
  const [testMessage, setTestMessage] = useState("This is a test SMS from your Shopify store.");

  const [senderIds, setSenderIds] = useState<string[]>(loaderData.senderIds);
  const [coverage, setCoverage] = useState(loaderData.coverage);
  const [balanceAvailable, setBalanceAvailable] = useState(loaderData.balanceAvailable);
  const [balancePurchased, setBalancePurchased] = useState(loaderData.balancePurchased);
  const [credentialsVerified, setCredentialsVerified] = useState(loaderData.credentialsVerified);

  useEffect(() => {
    if (!actionData) return;
    if (actionData.intent === "verify" && actionData.ok) {
      if (actionData.senderIds) setSenderIds(actionData.senderIds);
      if (actionData.coverage) setCoverage(actionData.coverage);
      if (actionData.balance) {
        setBalanceAvailable(actionData.balance.available);
        setBalancePurchased(actionData.balance.purchased);
      }
      if (actionData.credentialsVerified) setCredentialsVerified(true);
    }
    if (actionData.intent === "refresh_balance" && actionData.ok && actionData.balance) {
      setBalanceAvailable(actionData.balance.available);
      setBalancePurchased(actionData.balance.purchased);
    }
  }, [actionData]);

  return (
    <s-page heading="Gateway Settings">
      <s-section heading="API Credentials">
        {actionData?.intent === "verify" && actionData.ok && (
          <s-banner tone="success">{actionData.message}</s-banner>
        )}
        {actionData?.intent === "verify" && !actionData.ok && (
          <s-banner tone="critical">{actionData.error}</s-banner>
        )}
        <Form method="post">
          <input type="hidden" name="intent" value="verify" />
          <s-text-field
            label="Username"
            name="username"
            value={username}
            onInput={(e: Event) => setUsername((e.target as HTMLInputElement).value)}
            autocomplete="off"
          />
          <s-text-field
            label="Password"
            name="password"
            value={password}
            onInput={(e: Event) => setPassword((e.target as HTMLInputElement).value)}
            autocomplete="off"
            {...{ type: "password" } as Record<string, string>}
          />
          <s-checkbox
            label="Test mode (SMS will not be delivered)"
            checked={testMode || undefined}
            onChange={(e: Event) => setTestMode((e.target as HTMLInputElement).checked)}
          />
          <br />
          <s-button variant="primary" type="submit">Verify Credentials</s-button>
        </Form>
      </s-section>

      {credentialsVerified && (
        <>
          <s-section heading="Sender Settings">
            {actionData?.intent === "save_sender" && actionData.ok && (
              <s-banner tone="success">{actionData.message}</s-banner>
            )}
            {actionData?.intent === "save_sender" && !actionData.ok && (
              <s-banner tone="critical">{actionData.error}</s-banner>
            )}
            <Form method="post">
              <input type="hidden" name="intent" value="save_sender" />
              <input type="hidden" name="testMode" value={testMode ? "true" : "false"} />
              {senderIds.length > 0 ? (
                <s-select
                  label="Sender ID"
                  name="senderId"
                  value={senderId}
                  onChange={(e: Event) => setSenderId((e.target as HTMLSelectElement).value)}
                >
                  {senderIds.map((id) => (
                    <s-option key={id} value={id}>{id}</s-option>
                  ))}
                </s-select>
              ) : (
                <s-text>No sender IDs available. Contact kwtSMS to register a sender ID.</s-text>
              )}
              <br />
              <s-button variant="primary" type="submit">Save Settings</s-button>
            </Form>
          </s-section>

          <s-section heading="Account Balance">
            {actionData?.intent === "refresh_balance" && actionData.ok && (
              <s-banner tone="success">{actionData.message}</s-banner>
            )}
            {actionData?.intent === "refresh_balance" && !actionData.ok && (
              <s-banner tone="critical">{actionData.error}</s-banner>
            )}
            <s-paragraph>
              <strong>Available:</strong> {balanceAvailable.toFixed(2)} credits
            </s-paragraph>
            <s-paragraph>
              <strong>Purchased:</strong> {balancePurchased.toFixed(2)} credits
            </s-paragraph>
            <Form method="post">
              <input type="hidden" name="intent" value="refresh_balance" />
              <s-button type="submit">Refresh Balance</s-button>
            </Form>
          </s-section>

          {coverage.length > 0 && (
            <s-section heading="Coverage">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>Country</th>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>Prefix</th>
                    <th style={{ textAlign: "right", padding: "4px 8px" }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((c: { prefix: string; country: string; rate: number }) => (
                    <tr key={c.prefix}>
                      <td style={{ padding: "4px 8px" }}>{c.country}</td>
                      <td style={{ padding: "4px 8px" }}>+{c.prefix}</td>
                      <td style={{ textAlign: "right", padding: "4px 8px" }}>{c.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </s-section>
          )}

          <s-section heading="Test SMS">
            {actionData?.intent === "send_test" && actionData.ok && (
              <s-banner tone="success">{actionData.message}</s-banner>
            )}
            {actionData?.intent === "send_test" && !actionData.ok && (
              <s-banner tone="critical">{actionData.error}</s-banner>
            )}
            <Form method="post">
              <input type="hidden" name="intent" value="send_test" />
              <s-text-field
                label="Phone Number"
                name="phone"
                value={phone}
                onInput={(e: Event) => setPhone((e.target as HTMLInputElement).value)}
                autocomplete="off"
              />
              <s-text>Enter with country code, e.g. 96598765432</s-text>
              <s-text-field
                label="Message"
                name="message"
                value={testMessage}
                onInput={(e: Event) => setTestMessage((e.target as HTMLInputElement).value)}
                autocomplete="off"
              />
              <s-text>Test mode is always enabled. No actual message will be delivered.</s-text>
              <br />
              <s-button type="submit">Send Test SMS</s-button>
            </Form>

            {actionData?.intent === "send_test" && actionData.ok && actionData.testResult && (
              <s-section heading="Test Result">
                <s-paragraph>Message ID: {actionData.testResult.msgId}</s-paragraph>
                <s-paragraph>Numbers: {actionData.testResult.numbers}</s-paragraph>
                <s-paragraph>Points charged: {actionData.testResult.pointsCharged}</s-paragraph>
              </s-section>
            )}
          </s-section>
        </>
      )}
    </s-page>
  );
}
