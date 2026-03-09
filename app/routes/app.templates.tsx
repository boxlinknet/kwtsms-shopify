import { useState, useCallback, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getTemplates, saveTemplate } from "../lib/db/templates";
import { countPages } from "../lib/kwtsms/message";

const EVENT_TYPE_LABELS: Record<string, string> = {
  order_created: "Order Created",
  order_paid: "Order Paid",
  order_shipped: "Order Shipped",
  order_cancelled: "Order Cancelled",
  order_partially_fulfilled: "Order Partially Fulfilled",
  fulfillment_created: "Fulfillment Created",
};

const RECIPIENT_OPTIONS = [
  { label: "Customer", value: "customer" },
  { label: "Admin", value: "admin" },
  { label: "Both", value: "both" },
];

interface TemplateRecord {
  eventType: string;
  enabled: boolean;
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

  return {
    templates: templates.map((t) => ({
      eventType: t.eventType,
      enabled: t.enabled,
      templateEn: t.templateEn,
      templateAr: t.templateAr,
      recipientType: t.recipientType,
    })),
  };
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
      const enabled = formData.get(`enabled_${eventType}`) === "true";
      const templateEn = (formData.get(`templateEn_${eventType}`) as string) ?? "";
      const templateAr = (formData.get(`templateAr_${eventType}`) as string) ?? "";
      const recipientType = (formData.get(`recipientType_${eventType}`) as string) ?? "customer";

      await saveTemplate(shop, eventType, {
        enabled,
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

function TemplateCard({
  template,
  onChange,
}: {
  template: TemplateRecord;
  onChange: (eventType: string, field: string, value: string | boolean) => void;
}) {
  const label = EVENT_TYPE_LABELS[template.eventType] ?? template.eventType;

  return (
    <s-section heading={label}>
      {/* Hidden field to track this event type in the form */}
      <input type="hidden" name="eventType" value={template.eventType} />
      <input
        type="hidden"
        name={`enabled_${template.eventType}`}
        value={template.enabled ? "true" : "false"}
      />

      <s-stack direction="block" gap="base">
        <s-checkbox
          label="Enabled"
          checked={template.enabled || undefined}
          onChange={(e: Event) =>
            onChange(template.eventType, "enabled", (e.target as HTMLInputElement).checked)
          }
        />

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
    </s-section>
  );
}

export default function Templates() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  const [templates, setTemplates] = useState<TemplateRecord[]>(loaderData.templates);

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

  return (
    <s-page heading="SMS Templates">
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
          <s-stack direction="block" gap="base">
            {templates.map((template) => (
              <TemplateCard
                key={template.eventType}
                template={template}
                onChange={handleChange}
              />
            ))}

            <s-button variant="primary" type="submit">
              Save All Templates
            </s-button>
          </s-stack>
        </Form>
      )}
    </s-page>
  );
}
