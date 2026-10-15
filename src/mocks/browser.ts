import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { initDB } from "./db";
import { realtimeHandler } from "./realtime";
export async function startMocks() {
  await initDB();
  const worker = setupWorker(...handlers, realtimeHandler);
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}
