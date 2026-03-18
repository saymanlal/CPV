import type { ProblemDetailResponse, ProblemListResponse } from '@cpv/contracts/problem';
import { webEnv } from '@cpv/config/web';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const fetchProblems = async (): Promise<ProblemListResponse> => {
  const response = await fetch(`${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/problems`, {
    headers: defaultHeaders,
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Unable to load problems.');
  }

  return (await response.json()) as ProblemListResponse;
};

export const fetchProblem = async (slug: string): Promise<ProblemDetailResponse> => {
  const response = await fetch(`${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/problems/${slug}`, {
    headers: defaultHeaders,
    cache: 'no-store',
  });

  if (response.status === 404) {
    throw new Error('Problem not found.');
  }

  if (!response.ok) {
    throw new Error('Unable to load problem details.');
  }

  return (await response.json()) as ProblemDetailResponse;
};
