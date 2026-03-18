import type {
  ExecuteSubmissionInput,
  ExecuteSubmissionResponse,
  SubmissionHistoryResponse,
} from "@cpv/contracts/execution";
import { webEnv } from "@cpv/config/web";
import { getStoredAuthToken } from "./auth";

export const executeSubmission = async (
  payload: ExecuteSubmissionInput,
): Promise<ExecuteSubmissionResponse> => {
  const token = getStoredAuthToken();

  if (!token) {
    throw new Error("Please sign in to run code submissions.");
  }

  const response = await fetch(
    `${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/submissions/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? "Unable to execute the submission.");
  }

  return body as ExecuteSubmissionResponse;
};

export const fetchSubmissionHistory =
  async (): Promise<SubmissionHistoryResponse> => {
    const token = getStoredAuthToken();

    if (!token) {
      throw new Error("Please sign in to view your submission history.");
    }

    const response = await fetch(
      `${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/submissions?limit=10`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.message ?? "Unable to load recent submissions.");
    }

    return body as SubmissionHistoryResponse;
  };
