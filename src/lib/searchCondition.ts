export async function buildSearchCondition(
  page: number,
  limit: number,
  searchKeyword?: string,
  additionalCondition?: Record<string, any>
): Promise<{
  whereCondition: Record<string, { contains: string }> | {};
  pageCondition: { skip: number; take: number };
  bothCondition: {
    skip: number;
    take: number;
    where: Record<string, { contains: string }> | {};
  };
}> {
  const pageCondition = {
    skip: (page - 1) * limit,
    take: limit,
  };

  let whereCondition: Record<string, { contains: string }> | {} = {};

  //제목과 내용 검색 조건
  if (searchKeyword) {
    whereCondition = {
      ...whereCondition,
      OR: [
        { title: { contains: searchKeyword, mode: "insensitive" } },
        { content: { contains: searchKeyword, mode: "insensitive" } },
      ],
    };
  }

  if (additionalCondition) {
    whereCondition = {
      ...whereCondition,
      ...additionalCondition,
    };
  }

  const bothCondition = {
    ...pageCondition,
    where: whereCondition,
  };

  return {
    whereCondition,
    pageCondition,
    bothCondition,
  };
}
