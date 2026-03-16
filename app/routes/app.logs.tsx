import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { getLogs, getLogStats, clearLogs } from "../lib/db/logs";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);

  const rawStatus = url.searchParams.get("status");
  const rawEventType = url.searchParams.get("eventType");
  const rawRecipientType = url.searchParams.get("recipientType");
  const status = rawStatus && rawStatus !== "all" ? rawStatus : undefined;
  const eventType = rawEventType && rawEventType !== "all" ? rawEventType : undefined;
  const recipientType = rawRecipientType && rawRecipientType !== "all" ? rawRecipientType : undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const [logsResult, stats] = await Promise.all([
    getLogs(session.shop, { status, eventType, recipientType, page, pageSize: 20 }),
    getLogStats(session.shop),
  ]);

  return {
    logs: logsResult.logs,
    total: logsResult.total,
    stats,
    currentPage: page,
    totalPages: Math.ceil(logsResult.total / 20),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "clear_logs") {
    const deleted = await clearLogs(session.shop);
    return { success: true, deleted };
  }

  return { success: false };
};

export default function LogsPage() {
  const { logs, total, stats, currentPage, totalPages } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const statusFilter = searchParams.get("status") || "all";
  const eventTypeFilter = searchParams.get("eventType") || "all";
  const recipientTypeFilter = searchParams.get("recipientType") || "all";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        params.delete("page");
        return params;
      });
    },
    [setSearchParams],
  );

  const goToPage = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", String(page));
        return params;
      });
    },
    [setSearchParams],
  );

  const handleClearLogs = useCallback(() => {
    const formData = new FormData();
    formData.set("intent", "clear_logs");
    submit(formData, { method: "post" });
    setClearModalOpen(false);
  }, [submit]);

  const statusBadgeTone = (status: string) => {
    switch (status) {
      case "sent":
        return "success";
      case "failed":
        return "critical";
      case "test":
        return "info";
      case "skipped":
        return "caution";
      default:
        return "auto";
    }
  };

  return (
    <s-page heading="SMS Logs">
      <div style={{ marginTop: "16px" }} />
      {/* Summary cards */}
      <s-section>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>This Month</h2>
        <s-grid gridTemplateColumns="1fr 1fr 1fr">
          <s-grid-item>
            <s-box padding="base">
              <strong>Total SMS</strong>
              <s-paragraph>
                <s-text>
                  {stats.totalSent + stats.totalFailed}
                </s-text>
              </s-paragraph>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box padding="base">
              <strong>Credits Used</strong>
              <s-paragraph>
                <s-text>
                  {stats.totalCredits}
                </s-text>
              </s-paragraph>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box padding="base">
              <strong>Success Rate</strong>
              <s-paragraph>
                <s-text>
                  {stats.successRate}%
                </s-text>
              </s-paragraph>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-section>

      {/* Filters and actions */}
      <s-section>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>Filters</h2>
        <s-grid gridTemplateColumns="1fr 1fr 1fr 1fr" gap="base">
          <s-grid-item>
            <s-select
              label="Status"
              value={statusFilter}
              onChange={(e: Event) => {
                const target = e.target as HTMLSelectElement;
                updateFilter("status", target.value);
              }}
            >
              <s-option value="all">All Statuses</s-option>
              <s-option value="sent">Sent</s-option>
              <s-option value="failed">Failed</s-option>
              <s-option value="skipped">Skipped</s-option>
            </s-select>
          </s-grid-item>
          <s-grid-item>
            <s-select
              label="Event Type"
              value={eventTypeFilter}
              onChange={(e: Event) => {
                const target = e.target as HTMLSelectElement;
                updateFilter("eventType", target.value);
              }}
            >
              <s-option value="all">All Events</s-option>
              <s-option value="order_created">Order Created</s-option>
              <s-option value="order_paid">Order Paid</s-option>
              <s-option value="order_shipped">Order Shipped</s-option>
              <s-option value="order_partially_fulfilled">Partially Fulfilled</s-option>
              <s-option value="order_cancelled">Order Cancelled</s-option>
              <s-option value="customer_created">New Customer</s-option>
              <s-option value="test">Gateway Test</s-option>
            </s-select>
          </s-grid-item>
          <s-grid-item>
            <s-select
              label="Recipient"
              value={recipientTypeFilter}
              onChange={(e: Event) => {
                const target = e.target as HTMLSelectElement;
                updateFilter("recipientType", target.value);
              }}
            >
              <s-option value="all">All Recipients</s-option>
              <s-option value="customer">Customer</s-option>
              <s-option value="admin">Admin</s-option>
            </s-select>
          </s-grid-item>
          <s-grid-item>
            <s-box padding="base">
              <s-button
                variant="primary"
                tone="critical"
                onClick={() => setClearModalOpen(true)}
                disabled={logs.length === 0}
              >
                Clear All Logs
              </s-button>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-section>

      {/* Logs table */}
      <s-section>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>Logs ({total} total)</h2>
        {logs.length === 0 ? (
          <s-box padding="base">
            <s-paragraph>
              No SMS logs found. Logs will appear here once notifications are
              sent.
            </s-paragraph>
          </s-box>
        ) : (
          <s-table
            paginate
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onNextPage={() => goToPage(currentPage + 1)}
            onPreviousPage={() => goToPage(currentPage - 1)}
          >
            <s-table-header-row>
              <s-table-header listSlot="kicker">Date</s-table-header>
              <s-table-header listSlot="primary">Sender ID</s-table-header>
              <s-table-header listSlot="secondary">Phone</s-table-header>
              <s-table-header listSlot="labeled">To</s-table-header>
              <s-table-header listSlot="labeled">Event</s-table-header>
              <s-table-header listSlot="labeled">Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {logs.map((log) => (
                <s-table-row key={log.id}>
                  <s-table-cell>
                    {new Date(log.createdAt).toLocaleString()}
                  </s-table-cell>
                  <s-table-cell>{log.senderId}</s-table-cell>
                  <s-table-cell>{log.phoneMasked}</s-table-cell>
                  <s-table-cell>{log.recipientType ?? "customer"}</s-table-cell>
                  <s-table-cell>{log.eventType}</s-table-cell>
                  <s-table-cell>
                    <span title={log.status === "failed" || log.status === "skipped" ? (log.errorDescription ?? "Unknown error") : ""}>
                      <s-badge tone={statusBadgeTone(log.status)}>
                        {log.status}
                      </s-badge>
                    </span>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {/* Clear confirmation */}
      {clearModalOpen && (
        <s-section>
          <s-banner tone="critical">
            Are you sure you want to delete all SMS logs? This cannot be undone.
          </s-banner>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <s-button variant="primary" tone="critical" onClick={handleClearLogs}>
              Yes, Delete All Logs
            </s-button>
            <s-button onClick={() => setClearModalOpen(false)}>
              Cancel
            </s-button>
          </div>
        </s-section>
      )}
    </s-page>
  );
}
