import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../server/app";

// Vercel Serverless Function entry point. The Express app is built once per
// cold start and reused across warm invocations of this function.
const appPromise = createApp().then(({ app }) => app);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await appPromise;
  app(req, res);
}
