import "dotenv/config";
import Fastify from "fastify";
import { handlePullRequest, verifyWebhookSignature } from "./webhook";


const app = Fastify({ logger: true });

app.post("/webhook", async (request, reply) => {
  const signature = request.headers["x-hub-signature-256"] as string;
  const event = request.headers["x-github-event"] as string;
  const payload = JSON.stringify(request.body);

  console.log("EVENT:", event, "ACTION:", (request.body as any).action);

  if (!signature) {
    return reply.status(400).send({ error: "Missing signature" });
  }

  const valid = verifyWebhookSignature(
    process.env.WEBHOOK_SECRET!,
    payload,
    signature
  );

  if (!valid) {
    return reply.status(401).send({ error: "Invalid signature" });
  }

  if (event === "pull_request") {
    const action = (request.body as any).action;
    if (action === "opened" || action === "synchronize") {
      await handlePullRequest(request.body);
    }
  }

  return reply.status(200).send({ ok: true });
});

app.listen({ port: Number(process.env.PORT) || 8080 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});