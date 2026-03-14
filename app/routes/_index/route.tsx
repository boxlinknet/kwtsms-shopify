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
    <div className={styles.index}>
      <div className={styles.content}>
        <div className={styles.logo}>SMS</div>
        <h1 className={styles.heading}>kwtSMS for Shopify</h1>
        <p className={styles.text}>
          Automated SMS notifications for your Shopify store via the kwtSMS
          gateway. Reach your customers in Kuwait and the Middle East with
          bilingual Arabic and English messages.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-store.myshopify.com"
              />
            </label>
            <button className={styles.button} type="submit">
              Install App
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Order Notifications</strong>. Automatically send SMS for
            order confirmations, payments, shipping updates, and cancellations.
          </li>
          <li>
            <strong>Bilingual Templates</strong>. Customizable Arabic and
            English templates with auto-detection of customer language
            preference.
          </li>
          <li>
            <strong>Real-time Monitoring</strong>. Track SMS delivery, monitor
            your balance, and view detailed logs for every message sent.
          </li>
        </ul>
        <p className={styles.footer}>
          Powered by <a href="https://kwtsms.com" target="_blank" rel="noopener noreferrer">kwtsms.com</a>
        </p>
      </div>
    </div>
  );
}
