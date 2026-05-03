// Stub registry — maps GitHub usernames to verification status
// In the real system this would query Heka Identity Service

const verifiedContributors: Record<string, boolean> = {
  "": true,
};

export function isVerified(githubUsername: string): boolean {
  return verifiedContributors[githubUsername] === true;
}