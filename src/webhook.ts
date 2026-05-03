import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { readFileSync } from "fs";
import { createHmac, timingSafeEqual } from "crypto";
import { isVerified } from "./registry.js";

const privateKey = readFileSync(process.env.PRIVATE_KEY_PATH!, "utf-8");

export function verifyWebhookSignature(secret: string, payload: string, signature: string): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const digest = Buffer.from("sha256=" + hmac.digest("hex"), "utf-8");
  const checksum = Buffer.from(signature, "utf-8");
  if (digest.length !== checksum.length) return false;
  return timingSafeEqual(digest, checksum);
}

export async function handlePullRequest(payload: any) {
  const installationId = payload.installation?.id;
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const sha = payload.pull_request.head.sha;
  const sender = payload.sender.login;

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID!,
      privateKey,
      installationId,
    },
  });

  // Create check run in pending state
  const { data: checkRun } = await octokit.checks.create({
    owner,
    repo,
    name: "Contributor Identity Verification",
    head_sha: sha,
    status: "in_progress",
  });

  const verified = isVerified(sender);

  // Update check run with result
  await octokit.checks.update({
    owner,
    repo,
    check_run_id: checkRun.id,
    status: "completed",
    conclusion: verified ? "success" : "failure",
    output: {
      title: verified ? "Identity Verified" : "Identity Not Verified",
      summary: verified
        ? `@${sender} is a verified contributor in the Heka registry.`
        : `@${sender} has not completed contributor verification. Please onboard via Heka Identity Platform.`,
    },
  });
}