import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroPattern} />
        <div className={styles.heroGlow} />

        <img
          src="https://www.kwtsms.com/images/kwtsms_logo_30.png"
          alt="kwtSMS"
          className={styles.heroLogo}
        />

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Free on Shopify App Store
        </div>

        <h1 className={styles.heroTitle}>
          SMS Notifications for{" "}
          <span className={styles.heroTitleAccent}>Shopify Stores</span>
        </h1>

        <p className={styles.heroSub}>
          Connect your Shopify store to the kwtSMS gateway. Send order
          confirmations, shipping updates, and more to your customers in
          Kuwait and the Middle East, in Arabic and English.
        </p>

        <a href="#install" className={styles.heroCta}>
          Install Free
          <span className={styles.heroCtaArrow}>&rarr;</span>
        </a>

        <span className={styles.priceTag}>
          No subscription. No hidden fees. You only pay for SMS credits.
        </span>
      </section>

      {/* ── Stats ── */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNumber}>6</div>
          <div className={styles.statLabel}>Notification Events</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>2</div>
          <div className={styles.statLabel}>Languages (AR / EN)</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>33</div>
          <div className={styles.statLabel}>Error Codes Handled</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>0</div>
          <div className={styles.statLabel}>Monthly Fee</div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>
          Everything you need to keep your customers informed
        </h2>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>&#9993;</div>
            <h3 className={styles.featureTitle}>Automatic SMS</h3>
            <p className={styles.featureDesc}>
              Trigger SMS automatically on order creation, payment, shipping,
              partial fulfillment, cancellation, and new customer signup.
            </p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>&#1645;</div>
            <h3 className={styles.featureTitle}>Arabic + English</h3>
            <p className={styles.featureDesc}>
              Bilingual templates with automatic language detection based on
              customer locale. Full RTL Arabic support.
            </p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>&#9881;</div>
            <h3 className={styles.featureTitle}>Customizable Templates</h3>
            <p className={styles.featureDesc}>
              Edit every SMS template with placeholders for order number,
              customer name, total, tracking URL, and more.
            </p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>&#9742;</div>
            <h3 className={styles.featureTitle}>Smart Phone Handling</h3>
            <p className={styles.featureDesc}>
              Automatic country code prepending, local format validation,
              and coverage checking before every send.
            </p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>&#9783;</div>
            <h3 className={styles.featureTitle}>SMS Logs</h3>
            <p className={styles.featureDesc}>
              Complete send history with status, error codes, cost tracking,
              and filters by event type, date, and phone number.
            </p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>&#9888;</div>
            <h3 className={styles.featureTitle}>Balance Monitoring</h3>
            <p className={styles.featureDesc}>
              Real-time SMS credit balance displayed on every page. Daily
              auto-sync keeps your balance up to date.
            </p>
          </div>
        </div>
      </section>

      {/* ── Notification Events ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Notifications</div>
        <h2 className={styles.sectionTitle}>
          6 events live, more coming soon
        </h2>

        <div className={styles.events}>
          <div className={styles.event}>
            <span className={styles.eventDot} />
            Order Created
          </div>
          <div className={styles.event}>
            <span className={styles.eventDot} />
            Order Paid
          </div>
          <div className={styles.event}>
            <span className={styles.eventDot} />
            Order Shipped
          </div>
          <div className={styles.event}>
            <span className={styles.eventDot} />
            Partially Fulfilled
          </div>
          <div className={styles.event}>
            <span className={styles.eventDot} />
            Order Cancelled
          </div>
          <div className={styles.event}>
            <span className={styles.eventDot} />
            Customer Created
          </div>
          <div className={`${styles.event} ${styles.eventSoon}`}>
            <span className={styles.eventDotSoon} />
            Low Stock Alert (soon)
          </div>
          <div className={`${styles.event} ${styles.eventSoon}`}>
            <span className={styles.eventDotSoon} />
            Abandoned Cart (soon)
          </div>
          <div className={`${styles.event} ${styles.eventSoon}`}>
            <span className={styles.eventDotSoon} />
            Fulfillment Tracking (soon)
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Setup</div>
        <h2 className={styles.sectionTitle}>Up and running in 3 minutes</h2>

        <div className={styles.steps}>
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Install the App</h3>
            <p className={styles.stepDesc}>
              Find kwtSMS in the Shopify App Store and click Install. No
              payment required.
            </p>
          </div>
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Connect kwtSMS</h3>
            <p className={styles.stepDesc}>
              Enter your kwtSMS API credentials. The app verifies your
              account and loads your sender IDs and coverage.
            </p>
          </div>
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Customize Templates</h3>
            <p className={styles.stepDesc}>
              Edit the Arabic and English SMS templates for each event, or
              use the defaults. Enable or disable events as needed.
            </p>
          </div>
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Start Sending</h3>
            <p className={styles.stepDesc}>
              That's it. Every new order, shipment, or cancellation
              automatically triggers an SMS to your customer.
            </p>
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Roadmap</div>
        <h2 className={styles.sectionTitle}>What's coming next</h2>

        <div className={styles.roadmap}>
          <div className={styles.roadmapCard}>
            <div className={styles.roadmapPhase}>Phase 2</div>
            <h3 className={styles.roadmapTitle}>Enhanced Notifications</h3>
            <ul className={styles.roadmapList}>
              <li>Low stock alerts for admins</li>
              <li>Abandoned cart recovery SMS</li>
              <li>Fulfillment tracking updates</li>
              <li>Shopify Flow integration</li>
            </ul>
          </div>
          <div className={styles.roadmapCard}>
            <div className={styles.roadmapPhase}>Phase 3</div>
            <h3 className={styles.roadmapTitle}>OTP + Security</h3>
            <ul className={styles.roadmapList}>
              <li>OTP login verification</li>
              <li>Password reset via SMS</li>
              <li>CAPTCHA integration</li>
              <li>Rate limiting per phone/IP</li>
            </ul>
          </div>
          <div className={styles.roadmapCard}>
            <div className={styles.roadmapPhase}>Phase 4</div>
            <h3 className={styles.roadmapTitle}>Marketing + Analytics</h3>
            <ul className={styles.roadmapList}>
              <li>SMS marketing campaigns</li>
              <li>Scheduled sending</li>
              <li>Customer segmentation</li>
              <li>Analytics dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Install CTA ── */}
      <section className={styles.install} id="install">
        <div className={styles.installGlow} />
        <h2 className={styles.installTitle}>Ready to connect your store?</h2>
        <p className={styles.installSub}>
          Enter your Shopify store domain to install the app.
        </p>

        {showForm && (
          <Form
            className={styles.installForm}
            method="post"
            action="/auth/login"
          >
            <input
              className={styles.installInput}
              type="text"
              name="shop"
              placeholder="your-store.myshopify.com"
            />
            <button className={styles.installButton} type="submit">
              Install Free
            </button>
          </Form>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a
            href="https://kwtsms.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            kwtsms.com
          </a>
          <a
            href="https://kwtsms.com/en/contact-us"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
        </div>
        <p>
          kwtSMS for Shopify is a free app by kwtSMS. You only pay for SMS
          credits through your kwtSMS account.
        </p>
      </footer>
    </div>
  );
}
