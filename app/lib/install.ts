import { initDefaults } from "./db/settings";
import { seedDefaultTemplates } from "./db/templates";

export async function onInstall(shop: string): Promise<void> {
  await initDefaults(shop);
  await seedDefaultTemplates(shop);
  console.log("App installed and defaults seeded", { shop });
}
