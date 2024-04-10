import type { NextApiRequest, NextApiResponse } from 'next'

type ApiResponse = {
  hasApiKey: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  res.status(200).json({ hasApiKey });
}