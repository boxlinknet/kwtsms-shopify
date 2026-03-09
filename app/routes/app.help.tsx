import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getAllErrors } from "../lib/kwtsms/errors";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const errors = getAllErrors();
  const errorList = Object.values(errors).map((e) => ({
    code: e.code,
    description: e.description,
    action: e.action,
  }));

  return { errors: errorList };
};

type SectionKey =
  | "setup"
  | "faq"
  | "troubleshooting"
  | "errorCodes"
  | "links";

export default function HelpPage() {
  const { errors } = useLoaderData<typeof loader>();
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      setup: false,
      faq: false,
      troubleshooting: false,
      errorCodes: false,
      links: false,
    },
  );

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <s-page heading="Help and Documentation">
      {/* Setup Guide */}
      <s-section heading="Setup Guide">
        <s-button
          variant="tertiary"
          onClick={() => toggleSection("setup")}
          icon={openSections.setup ? "chevron-up" : "chevron-down"}
        >
          {openSections.setup ? "Hide Setup Guide" : "Show Setup Guide"}
        </s-button>
        {openSections.setup && (
          <s-box padding="base">
            <s-ordered-list>
              <s-list-item>
                <strong>Create a kwtSMS account.</strong>{" "}
                Visit{" "}
                <s-link href="https://www.kwtsms.com" target="_blank">
                  kwtsms.com
                </s-link>{" "}
                and register for an account if you do not have one yet.
              </s-list-item>
              <s-list-item>
                <strong>Get your API credentials.</strong> Log
                in to your kwtSMS dashboard and navigate to the API settings
                page to find your username and password.
              </s-list-item>
              <s-list-item>
                <strong>Enter credentials in Gateway Settings.</strong>{" "}
                Go to the{" "}
                <s-link href="/app/gateway">Gateway Settings</s-link> page in
                this app and enter your kwtSMS API username and password.
              </s-list-item>
              <s-list-item>
                <strong>Register a Sender ID.</strong> In your
                kwtSMS dashboard, register a Sender ID (up to 11 characters).
                This is the name recipients will see when they receive your SMS.
              </s-list-item>
              <s-list-item>
                <strong>Customize your templates.</strong>{" "}
                Visit the{" "}
                <s-link href="/app/templates">Templates</s-link> page to
                customize the SMS content for each notification event (order
                confirmation, shipping update, etc.).
              </s-list-item>
              <s-list-item>
                <strong>Enable notifications.</strong> Go to{" "}
                <s-link href="/app/settings">Settings</s-link> and enable the
                notification events you want to send SMS for.
              </s-list-item>
            </s-ordered-list>
          </s-box>
        )}
      </s-section>

      {/* FAQ */}
      <s-section heading="Frequently Asked Questions">
        <s-button
          variant="tertiary"
          onClick={() => toggleSection("faq")}
          icon={openSections.faq ? "chevron-up" : "chevron-down"}
        >
          {openSections.faq ? "Hide FAQ" : "Show FAQ"}
        </s-button>
        {openSections.faq && (
          <s-box padding="base">
            <s-paragraph>
              <strong>
                Q: How much does each SMS cost?
              </strong>
            </s-paragraph>
            <s-paragraph>
              A: SMS pricing depends on your kwtSMS account plan and the
              destination country. Check your kwtSMS dashboard for current
              rates. Each SMS uses "points" (credits) from your balance.
            </s-paragraph>
            <s-divider />

            <s-paragraph>
              <strong>
                Q: Can I send SMS to international numbers?
              </strong>
            </s-paragraph>
            <s-paragraph>
              A: Yes, kwtSMS supports international delivery. Make sure your
              account has international sending enabled and that the destination
              country is covered. Contact kwtSMS support to activate coverage
              for specific countries.
            </s-paragraph>
            <s-divider />

            <s-paragraph>
              <strong>
                Q: What is Test Mode?
              </strong>
            </s-paragraph>
            <s-paragraph>
              A: Test Mode lets you simulate sending SMS without actually
              delivering messages or using credits. It is useful for verifying
              your templates and integration before going live.
            </s-paragraph>
            <s-divider />

            <s-paragraph>
              <strong>
                Q: How do I check my SMS balance?
              </strong>
            </s-paragraph>
            <s-paragraph>
              A: Once your API credentials are configured, your current balance
              is displayed on the Dashboard and in the Gateway Settings page.
              You can also check your balance directly in the kwtSMS dashboard.
            </s-paragraph>
            <s-divider />

            <s-paragraph>
              <strong>
                Q: Can I use Arabic text in my messages?
              </strong>
            </s-paragraph>
            <s-paragraph>
              A: Yes, kwtSMS fully supports Arabic (Unicode) messages. Note
              that Unicode messages have a shorter character limit per page (70
              characters for the first page, 67 for subsequent pages) compared
              to English (160/153).
            </s-paragraph>
            <s-divider />

            <s-paragraph>
              <strong>
                Q: What template variables can I use?
              </strong>
            </s-paragraph>
            <s-paragraph>
              A: Templates support variables like {"{"}order_number{"}"},{" "}
              {"{"}customer_name{"}"}, {"{"}total_price{"}"},{" "}
              {"{"}tracking_number{"}"}, {"{"}shop_name{"}"}, and more. See the
              Templates page for the full list of available variables for each
              event type.
            </s-paragraph>
          </s-box>
        )}
      </s-section>

      {/* Troubleshooting */}
      <s-section heading="Troubleshooting">
        <s-button
          variant="tertiary"
          onClick={() => toggleSection("troubleshooting")}
          icon={
            openSections.troubleshooting ? "chevron-up" : "chevron-down"
          }
        >
          {openSections.troubleshooting
            ? "Hide Troubleshooting"
            : "Show Troubleshooting"}
        </s-button>
        {openSections.troubleshooting && (
          <s-box padding="base">
            <s-paragraph>
              <strong>
                Message not received by customer
              </strong>
            </s-paragraph>
            <s-unordered-list>
              <s-list-item>
                Verify the phone number is correct and includes the country
                code (e.g., 965 for Kuwait).
              </s-list-item>
              <s-list-item>
                Check the SMS Logs page for error details on the specific
                message.
              </s-list-item>
              <s-list-item>
                Ensure your kwtSMS account has sufficient balance.
              </s-list-item>
              <s-list-item>
                Confirm that your Sender ID is approved and not blocked.
              </s-list-item>
              <s-list-item>
                Verify that the destination country is covered by your
                account.
              </s-list-item>
            </s-unordered-list>
            <s-divider />

            <s-paragraph>
              <strong>Arabic text appears garbled</strong>
            </s-paragraph>
            <s-unordered-list>
              <s-list-item>
                Ensure the message template contains only Arabic or mixed
                Arabic/English text without special encoding characters.
              </s-list-item>
              <s-list-item>
                The app automatically handles UTF-8 encoding for Arabic
                messages.
              </s-list-item>
              <s-list-item>
                Avoid copying text from PDFs or scanned documents, as they
                may contain hidden characters.
              </s-list-item>
            </s-unordered-list>
            <s-divider />

            <s-paragraph>
              <strong>Balance shows zero</strong>
            </s-paragraph>
            <s-unordered-list>
              <s-list-item>
                Verify your API credentials are correct in the Gateway
                Settings page.
              </s-list-item>
              <s-list-item>
                Log in to your kwtSMS dashboard directly to confirm your
                actual balance.
              </s-list-item>
              <s-list-item>
                If credentials are correct but balance still shows zero,
                your account may need to be topped up.
              </s-list-item>
              <s-list-item>
                Contact kwtSMS support if the balance shown in the app does
                not match your actual account balance.
              </s-list-item>
            </s-unordered-list>
          </s-box>
        )}
      </s-section>

      {/* Error Codes */}
      <s-section heading="Error Codes" padding="none">
        <s-box padding="base">
          <s-button
            variant="tertiary"
            onClick={() => toggleSection("errorCodes")}
            icon={openSections.errorCodes ? "chevron-up" : "chevron-down"}
            >
            {openSections.errorCodes
              ? "Hide Error Codes"
              : `Show All Error Codes (${errors.length})`}
          </s-button>
        </s-box>
        {openSections.errorCodes && (
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="kicker">Code</s-table-header>
              <s-table-header listSlot="primary">Description</s-table-header>
              <s-table-header listSlot="secondary">
                Recommended Action
              </s-table-header>
            </s-table-header-row>
            <s-table-body>
              {errors.map((error) => (
                <s-table-row key={error.code}>
                  <s-table-cell>
                    <s-badge tone="critical">{error.code}</s-badge>
                  </s-table-cell>
                  <s-table-cell>{error.description}</s-table-cell>
                  <s-table-cell>{error.action}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {/* Useful Links */}
      <s-section heading="Useful Links">
        <s-button
          variant="tertiary"
          onClick={() => toggleSection("links")}
          icon={openSections.links ? "chevron-up" : "chevron-down"}
        >
          {openSections.links ? "Hide Links" : "Show Links"}
        </s-button>
        {openSections.links && (
          <s-box padding="base">
            <s-unordered-list>
              <s-list-item>
                <s-link href="https://www.kwtsms.com/docs" target="_blank">
                  kwtSMS API Documentation
                </s-link>{" "}
                - Official API reference and guides.
              </s-list-item>
              <s-list-item>
                <s-link
                  href="https://wa.me/96522282188"
                  target="_blank"
                >
                  kwtSMS Support (WhatsApp)
                </s-link>{" "}
                - Contact kwtSMS support directly via WhatsApp.
              </s-list-item>
              <s-list-item>
                <s-link
                  href="https://github.com/jibla/kwtsms_shopify/issues"
                  target="_blank"
                >
                  GitHub Issues
                </s-link>{" "}
                - Report bugs or request features for this Shopify plugin.
              </s-list-item>
            </s-unordered-list>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}
