import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const cardStyle: React.CSSProperties = {
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  background: "#f6f6f7",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
  gap: "8px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#202223",
  margin: 0,
  flex: 1,
  minWidth: 0,
};

const descStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#6d7175",
  lineHeight: 1.5,
  margin: 0,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

export default function IntegrationsPage() {
  return (
    <s-page heading="Integrations">
      <div style={{ padding: "16px 20px" }}>
        {/* Active integrations */}
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "16px 0 12px 0" }}>Active</h2>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <p style={titleStyle}>Order Notifications</p>
            <s-badge tone="success" icon="check-circle">Active</s-badge>
          </div>
          <p style={descStyle}>
            Automatically send SMS notifications to customers when orders
            are created, paid, fulfilled, or cancelled. Configure which
            events trigger notifications in the Settings page.
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e1e3e5", margin: "24px 0" }} />

        {/* Coming Soon integrations */}
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>Coming Soon</h2>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={headerStyle}>
              <p style={titleStyle}>Shopify Flow</p>
              <s-badge tone="info" icon="clock">Coming Soon</s-badge>
            </div>
            <p style={descStyle}>
              Create custom automation workflows with Shopify Flow
              triggers and actions. Send SMS based on any Flow event or
              condition.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={headerStyle}>
              <p style={titleStyle}>Abandoned Cart Recovery</p>
              <s-badge tone="info" icon="clock">Coming Soon</s-badge>
            </div>
            <p style={descStyle}>
              Send automated SMS reminders to customers who leave items in
              their cart without completing checkout. Recover lost sales
              with timely nudges.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={headerStyle}>
              <p style={titleStyle}>Marketing Campaigns</p>
              <s-badge tone="info" icon="clock">Coming Soon</s-badge>
            </div>
            <p style={descStyle}>
              Send bulk SMS marketing campaigns to your customer list.
              Promote sales, new products, and special offers directly to
              your audience.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={headerStyle}>
              <p style={titleStyle}>OTP Phone Verification</p>
              <s-badge tone="info" icon="clock">Coming Soon</s-badge>
            </div>
            <p style={descStyle}>
              Verify customer phone numbers with one-time passwords during
              checkout or account registration. Reduce fraud and ensure
              accurate contact information.
            </p>
          </div>
        </div>
      </div>
    </s-page>
  );
}
