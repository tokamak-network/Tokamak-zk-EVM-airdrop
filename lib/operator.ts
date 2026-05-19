import { getConfig } from "@/lib/config";

export function assertOperatorRequest(request: Request): void {
  const { operatorToken } = getConfig();

  if (!operatorToken) {
    throw new OperatorAuthError(
      "OPERATOR_TOKEN is not configured.",
      503,
    );
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const headerToken = request.headers.get("x-operator-token") ?? undefined;

  if (bearerToken !== operatorToken && headerToken !== operatorToken) {
    throw new OperatorAuthError("Unauthorized.", 401);
  }
}

export class OperatorAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
