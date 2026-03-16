import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e1e3e5",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  gap: "8px",
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#202223",
  margin: 0,
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

function IntegrationCard({
  title,
  description,
  badge,
  badgeTone,
}: {
  title: string;
  description: string;
  badge: string;
  badgeTone: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={titleRow}>
        <p style={titleStyle}>{title}</p>
        <s-badge
          tone={badgeTone}
          icon={badgeTone === "success" ? "check-circle" : "clock"}
        >
          {badge}
        </s-badge>
      </div>
      <p style={descStyle}>{description}</p>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <s-page heading="Integrations">
      <div style={{ marginTop: "16px" }} />
      <s-section>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            margin: "0 0 12px 0",
          }}
        >
          Active
        </h2>
        <IntegrationCard
          title="Order Notifications"
          description="Automatically send SMS notifications to customers when orders are created, paid, fulfilled, or cancelled. Configure which events trigger notifications in the Settings page."
          badge="Active"
          badgeTone="success"
        />
      </s-section>

      <s-section>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            margin: "0 0 12px 0",
          }}
        >
          Coming Soon
        </h2>
        <div style={gridStyle}>
          <IntegrationCard
            title="Shopify Flow"
            description="Create custom automation workflows with Shopify Flow triggers and actions. Send SMS based on any Flow event or condition."
            badge="Coming Soon"
            badgeTone="info"
          />
          <IntegrationCard
            title="Abandoned Cart"
            description="Send automated SMS reminders to customers who leave items in their cart without completing checkout. Recover lost sales with timely nudges."
            badge="Coming Soon"
            badgeTone="info"
          />
          <IntegrationCard
            title="SMS Campaigns"
            description="Send bulk SMS marketing campaigns to your customer list. Promote sales, new products, and special offers directly to your audience."
            badge="Coming Soon"
            badgeTone="info"
          />
          <IntegrationCard
            title="OTP Verification"
            description="Verify customer phone numbers with one-time passwords during checkout or account registration. Reduce fraud and ensure accurate contact information."
            badge="Coming Soon"
            badgeTone="info"
          />
        </div>
      </s-section>
    </s-page>
  );
}
