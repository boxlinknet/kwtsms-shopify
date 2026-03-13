import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function IntegrationsPage() {
  return (
    <s-page heading="Integrations">
      <div style={{ marginTop: "16px" }} />
      {/* Active integrations */}
      <s-section>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>Active</h2>
        <s-box padding="base" border="base" borderRadius="base">
          <s-grid gridTemplateColumns="1fr auto" alignItems="center">
            <s-grid-item>
              <strong>Order Notifications</strong>
              <s-paragraph>
                Automatically send SMS notifications to customers when orders
                are created, paid, fulfilled, or cancelled. Configure which
                events trigger notifications in the Settings page.
              </s-paragraph>
            </s-grid-item>
            <s-grid-item>
              <s-badge tone="success" icon="check-circle">Active</s-badge>
            </s-grid-item>
          </s-grid>
        </s-box>
      </s-section>

      {/* Coming Soon integrations */}
      <s-section>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>Coming Soon</h2>
        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
          <s-grid-item>
            <s-box padding="base" border="base" borderRadius="base">
              <s-grid gridTemplateColumns="1fr auto" alignItems="start">
                <s-grid-item>
                  <strong>Shopify Flow</strong>
                  <s-paragraph>
                    Create custom automation workflows with Shopify Flow
                    triggers and actions. Send SMS based on any Flow event or
                    condition.
                  </s-paragraph>
                </s-grid-item>
                <s-grid-item>
                  <s-badge tone="info" icon="clock">Coming Soon</s-badge>
                </s-grid-item>
              </s-grid>
            </s-box>
          </s-grid-item>

          <s-grid-item>
            <s-box padding="base" border="base" borderRadius="base">
              <s-grid gridTemplateColumns="1fr auto" alignItems="start">
                <s-grid-item>
                  <strong>Abandoned Cart Recovery</strong>
                  <s-paragraph>
                    Send automated SMS reminders to customers who leave items in
                    their cart without completing checkout. Recover lost sales
                    with timely nudges.
                  </s-paragraph>
                </s-grid-item>
                <s-grid-item>
                  <s-badge tone="info" icon="clock">Coming Soon</s-badge>
                </s-grid-item>
              </s-grid>
            </s-box>
          </s-grid-item>

          <s-grid-item>
            <s-box padding="base" border="base" borderRadius="base">
              <s-grid gridTemplateColumns="1fr auto" alignItems="start">
                <s-grid-item>
                  <strong>Marketing Campaigns</strong>
                  <s-paragraph>
                    Send bulk SMS marketing campaigns to your customer list.
                    Promote sales, new products, and special offers directly to
                    your audience.
                  </s-paragraph>
                </s-grid-item>
                <s-grid-item>
                  <s-badge tone="info" icon="clock">Coming Soon</s-badge>
                </s-grid-item>
              </s-grid>
            </s-box>
          </s-grid-item>

          <s-grid-item>
            <s-box padding="base" border="base" borderRadius="base">
              <s-grid gridTemplateColumns="1fr auto" alignItems="start">
                <s-grid-item>
                  <strong>OTP Phone Verification</strong>
                  <s-paragraph>
                    Verify customer phone numbers with one-time passwords during
                    checkout or account registration. Reduce fraud and ensure
                    accurate contact information.
                  </s-paragraph>
                </s-grid-item>
                <s-grid-item>
                  <s-badge tone="info" icon="clock">Coming Soon</s-badge>
                </s-grid-item>
              </s-grid>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-section>
    </s-page>
  );
}
