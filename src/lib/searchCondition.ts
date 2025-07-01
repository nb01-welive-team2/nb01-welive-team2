import { PageParamsType } from "../structs/commonStructs";
import NotFoundError from "@/errors/NotFoundError";
import apartmentInfoRepository from "@/repositories/apartmentInfoRepository";
import userInfoRepository from "@/repositories/userInfoRepository";

//TODO : 현재 프론트와 명세의 검색상황이 다르기 때문에, 추후 명세가 명확해지면 유닛테스트 작성
export async function buildSearchCondition(
  page: number,
  limit: number,
  searchKeyword?: string,
  args?: Record<string, any>,
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

  //접속자의 아이디와 역할에 따른 게시글의 아파트ID 조건
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
