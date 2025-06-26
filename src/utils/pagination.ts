export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export const getPagination = ({
  page = 1,
  limit = 10,
}: PaginationParams): PaginationResult => {
  const parsedPage = Math.max(1, parseInt(page as string));
  const parsedLimit = Math.max(1, parseInt(limit as string));

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
  };
};
