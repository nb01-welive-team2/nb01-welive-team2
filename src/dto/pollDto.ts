import { $Enums } from "@prisma/client";

export interface CreatePollRequestDto {
  title: string;
  description?: string;
  status: $Enums.POLL_STATUS;
  startDate: string;
  endDate: string;
  options: string[];
  buildingPermission: number;
  apartmentId: string;
} // 투표 생성 시 보내는 데이터

export interface PollResponseDto {
  id: string;
  title: string;
  author: string;
  status: string;
  buildingPermission: number;
  description: string;
  startDate: string;
  endDate: string;
  options: string[];
} // 생성된 투표의 응답 데이터

export interface PollOptionResultDto {
  content: string;
  voteCount?: number;
}

export interface PollDetailResponseDto {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  options: PollOptionResultDto[];
  canVote: boolean;
  showResult: boolean;
  isEligible: boolean;
}

export interface GetPollListParams {
  page: number;
  limit: number;
  keyword?: string;
  status?: string;
  userId?: string; // 권한 필터링(userInfo, residents 조인 필요)
  role?: string;
}
