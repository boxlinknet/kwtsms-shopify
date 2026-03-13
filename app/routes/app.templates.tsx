import { useState, useCallback, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getTemplates, saveTemplate } from "../lib/db/templates";
import { TEMPLATE_ORDER } from "../lib/sms/templates";
import { countPages } from "../lib/kwtsms/message";

const EVENT_TYPE_LABELS: Record<string, string> = {
  order_created: "Order Created",
  order_paid: "Order Paid",
  order_shipped: "Order Shipped",
  order_cancelled: "Order Cancelled",
  order_partially_fulfilled: "Order Partially Fulfilled",
  customer_created: "New Customer (Welcome SMS)",
};

const RECIPIENT_OPTIONS = [
  { label: "Customer", value: "customer" },
  { label: "Admin", value: "admin" },
  { label: "Both", value: "both" },
];

const EVENT_PLACEHOLDERS: Record<string, string[]> = {
  customer_created: ["customer_name", "shop_name"],
  order_created: ["order_number", "customer_name", "total_price", "currency", "item_count", "shop_name"],
  order_paid: ["order_number", "customer_name", "total_price", "currency", "payment_method", "shop_name"],
  order_partially_fulfilled: ["order_number", "customer_name", "tracking_url", "shop_name"],
  order_shipped: ["order_number", "customer_name", "tracking_number", "tracking_url", "carrier", "shop_name"],
  order_cancelled: ["order_number", "customer_name", "cancel_reason", "shop_name"],
};

interface TemplateRecord {
  eventType: string;
  templateEn: string;
  templateAr: string;
  recipientType: string;
}

interface ActionData {
  ok: boolean;
  message?: string;
  error?: string;
  savedEventTypes?: string[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const templates = await getTemplates(shop);

  const mapped = templates
    .filter((t) => TEMPLATE_ORDER.includes(t.eventType))
    .map((t) => ({
      eventType: t.eventType,
      templateEn: t.templateEn,
      templateAr: t.templateAr,
      recipientType: t.recipientType,
    }))
    .sort((a, b) => TEMPLATE_ORDER.indexOf(a.eventType) - TEMPLATE_ORDER.indexOf(b.eventType));

  return { templates: mapped };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  // Collect all event types from the form
  const eventTypes = formData.getAll("eventType") as string[];

  if (eventTypes.length === 0) {
    return {
      ok: false,
      error: "No templates to save.",
    } satisfies ActionData;
  }

  const savedEventTypes: string[] = [];

  try {
    for (const eventType of eventTypes) {
      const templateEn = (formData.get(`templateEn_${eventType}`) as string) ?? "";
      const templateAr = (formData.get(`templateAr_${eventType}`) as string) ?? "";
      const recipientType = (formData.get(`recipientType_${eventType}`) as string) ?? "customer";

      await saveTemplate(shop, eventType, {
        templateEn,
        templateAr,
        recipientType,
      });

      savedEventTypes.push(eventType);
    }

    return {
      ok: true,
      message: `Saved ${savedEventTypes.length} template(s) successfully.`,
      savedEventTypes,
    } satisfies ActionData;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save templates.",
    } satisfies ActionData;
  }
};

function CharCounter({ text }: { text: string }) {
  const { chars, pages, isUnicode } = countPages(text);
  const encoding = isUnicode ? "Unicode" : "GSM-7";

  return (
    <s-text>
      {chars} chars, {pages} page{pages !== 1 ? "s" : ""} ({encoding})
    </s-text>
  );
}

function TemplateEditor({
  template,
  onChange,
}: {
  template: TemplateRecord;
  onChange: (eventType: string, field: string, value: string | boolean) => void;
}) {
  return (
    <div>
      {/* Hidden field to track this event type in the form */}
      <input type="hidden" name="eventType" value={template.eventType} />

      <s-stack direction="block" gap="base">
        <div>
          <strong>Available Placeholders</strong>
          <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(EVENT_PLACEHOLDERS[template.eventType] ?? []).map((p) => (
              <code
                key={p}
                style={{
                  padding: "2px 8px",
                  background: "#f6f6f7",
                  border: "1px solid #e1e3e5",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#202223",
                }}
              >
                {`{${p}}`}
              </code>
            ))}
          </div>
        </div>

        <div>
          <strong>English Template</strong>
          <textarea
            name={`templateEn_${template.eventType}`}
            value={template.templateEn}
            onChange={(e) => onChange(template.eventType, "templateEn", e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontFamily: "inherit",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
          <CharCounter text={template.templateEn} />
        </div>

        <div>
          <strong>Arabic Template</strong>
          <textarea
            name={`templateAr_${template.eventType}`}
            value={template.templateAr}
            onChange={(e) => onChange(template.eventType, "templateAr", e.target.value)}
            dir="rtl"
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontFamily: "inherit",
              fontSize: "14px",
              resize: "vertical",
              textAlign: "right",
            }}
          />
          <CharCounter text={template.templateAr} />
        </div>

        <s-select
          label="Recipient"
          name={`recipientType_${template.eventType}`}
          value={template.recipientType}
          onChange={(e: Event) =>
            onChange(template.eventType, "recipientType", (e.target as HTMLSelectElement).value)
          }
        >
          {RECIPIENT_OPTIONS.map((opt) => (
            <s-option key={opt.value} value={opt.value}>{opt.label}</s-option>
          ))}
        </s-select>
      </s-stack>
    </div>
  );
}

export default function Templates() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  const [templates, setTemplates] = useState<TemplateRecord[]>(loaderData.templates);
  const [activeTab, setActiveTab] = useState(0);

  // Sync with loader data on navigation
  useEffect(() => {
    setTemplates(loaderData.templates);
  }, [loaderData.templates]);

  const handleChange = useCallback(
    (eventType: string, field: string, value: string | boolean) => {
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.eventType !== eventType) return t;
          return { ...t, [field]: value };
        }),
      );
    },
    [],
  );

  const activeTemplate = templates[activeTab];

  return (
    <s-page heading="SMS Templates" {...{ fullWidth: true } as Record<string, unknown>}>
      <div style={{ marginTop: "16px" }} />
      {/* Success banner */}
      {actionData?.ok && actionData.message && (
        <s-banner tone="success">
          {actionData.message}
        </s-banner>
      )}

      {/* Error banner */}
      {actionData && !actionData.ok && actionData.error && (
        <s-banner tone="critical">
          {actionData.error}
        </s-banner>
      )}

      {templates.length === 0 ? (
        <s-section>
          <s-text>
            No templates found. Templates are created automatically when webhooks are
            registered. Please visit the Gateway Settings page first to configure your
            credentials.
          </s-text>
        </s-section>
      ) : (
        <Form method="post">
          <s-section>
            <div style={{ display: "flex", gap: "0", minHeight: "420px" }}>
              {/* Sidebar */}
              <div
                style={{
                  width: "220px",
                  flexShrink: 0,
                  borderRight: "1px solid #e1e3e5",
                  paddingRight: "0",
                }}
              >
                {templates.map((t, idx) => {
                  const label = EVENT_TYPE_LABELS[t.eventType] ?? t.eventType;
                  const isActive = idx === activeTab;
                  return (
                    <button
                      key={t.eventType}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "10px 14px",
                        border: "none",
                        borderRight: isActive ? "3px solid #008060" : "3px solid transparent",
                        background: isActive ? "#f1f8f5" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#004c3f" : "#202223",
                        lineHeight: "1.3",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Editor */}
              <div style={{ flex: 1, paddingLeft: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 16px 0" }}>
                  {EVENT_TYPE_LABELS[activeTemplate.eventType] ?? activeTemplate.eventType}
                </h2>
                <TemplateEditor
                  template={activeTemplate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Hidden fields for non-active templates so they're included in form submission */}
            {templates.map((t, idx) => {
              if (idx === activeTab) return null;
              return (
                <div key={t.eventType} style={{ display: "none" }}>
                  <input type="hidden" name="eventType" value={t.eventType} />
                  <input type="hidden" name={`templateEn_${t.eventType}`} value={t.templateEn} />
                  <input type="hidden" name={`templateAr_${t.eventType}`} value={t.templateAr} />
                  <input type="hidden" name={`recipientType_${t.eventType}`} value={t.recipientType} />
                </div>
              );
            })}
          </s-section>

          <div style={{ marginTop: "16px" }} />
          <s-button variant="primary" type="submit">
            Save All Templates
          </s-button>
        </Form>
      )}
    </s-page>
  );
}
