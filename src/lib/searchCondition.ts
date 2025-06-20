import { PageParamsType } from "../structs/commonStructs";
import NotFoundError from "@/errors/NotFoundError";
import apartmentInfoRepository from "@/repositories/apartmentInfoRepository";
import userInfoRepository from "@/repositories/userInfoRepository";

//TODO : 현재 프론트와 명세의 검색상황이 다르기 때문에, 추후 명세가 명확해지면 유닛테스트 작성
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
      const apartmentInfo = await apartmentInfoRepository.findUnique({
        where: { userId: args.userId },
        select: {
          id: true,
        },
      });
      if (!apartmentInfo?.id) {
        throw new NotFoundError("ApartmentInfo", "admin : " + args.userId);
      }
      whereCondition = {
        apartmentId: apartmentInfo.id,
      };
    } else if (args.role === "USER") {
      const userInfo = await userInfoRepository.findUnique({
        where: {
          userId: args.userId,
        },
        select: {
          apartmentId: true,
        },
      });
      if (!userInfo?.apartmentId) {
        throw new NotFoundError("UserInfo", args.userId);
      }
      whereCondition = {
        apartmentId: userInfo.apartmentId,
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
