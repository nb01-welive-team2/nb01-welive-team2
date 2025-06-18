import { PageParamsType } from "../structs/commonStructs";
import { prisma } from "./prisma";

export async function buildSearchCondition(
  params: PageParamsType,
  args?: Record<string, any>
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
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };

  let whereCondition: Record<string, { contains: string }> | {} = {};

  if (args && "userId" in args && "role" in args) {
    if (args.role === "ADMIN") {
      whereCondition = {
        user: {
          id: args.userId,
        },
      };
    } else if (args.role === "USER") {
      const adminId = await prisma.userInfo.findFirst({
        where: {
          userId: args.userId,
        },
        include: {
          apartmentInfo: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      whereCondition = {
        user: {
          id: adminId,
        },
      };
    }
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
