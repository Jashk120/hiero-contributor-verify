# hiero-contributor-verify

A GitHub App prototype for contributor identity verification, 
built as a pre-application spike for the Hiero LFX Mentorship 
(Contributor Identity Verification, Issue #87).

## What it does
- Listens to pull_request webhook events
- Checks the PR author against a contributor registry (stub for Heka Identity Service)
- Posts a Check Run result directly on the PR

## What the full system looks like
[embed your onboarding_flow.png and verification_flow.png here]

## Relation to the mentorship project
The registry check would be replaced by a real OID4VP presentation 
request to Heka Identity Service. The contributor would need to have 
completed onboarding (GitHub OAuth + GPG key linking + VC issuance) 
before their PR passes verification.

## Stack
Node.js, TypeScript, Fastify, @octokit/auth-app
