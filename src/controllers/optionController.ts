import { Request, Response } from "express";
import { create } from "superstruct";
import { AuthenticatedRequest } from "@/types/express";
import { VoteBodyStruct } from "@/structs/optionStructs";
import optionService from "@/services/optionService";
import { ResponseOptionDTO, ResponseWinnerOptionDTO } from "@/dto/optionDTO";

/**
 * @openapi
 * /api/options/{optionId}/vote:
 *   post:
 *     summary: 투표 옵션에 투표하기
 *     description: 인증된 사용자가 특정 투표 옵션에 투표를 합니다. 중복 투표는 허용되지 않습니다.(테스트용 투표id는 관리자 기준)
 *     tags:
 *       - Pollsvote
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "33ec83f9-fd3c-4596-9825-65774f4b06fe"
 *         description: 투표할 옵션 ID
 *     responses:
 *       201:
 *         description: 투표 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseWinnerOptionDTO'
 *       400:
 *         description: 잘못된 요청 예 optionId 형식 오류
 *       401:
 *         description: 인증 실패
 *       409:
 *         description: 이미 투표한 경우 중복 투표 오류
 */
export async function voteOption(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { optionId } = create(req.params, VoteBodyStruct);
  const option = await optionService.createVote(
    optionId,
    reqWithPayload.user.userId,
    reqWithPayload.user.apartmentId
  );

  res
    .status(201)
    .send(new ResponseWinnerOptionDTO(option!, "Vote created successfully"));
}

/**
 * @openapi
 * /api/options/{optionId}/vote:
 *   delete:
 *     summary: 투표 옵션에 대한 투표 취소
 *     description: 인증된 사용자가 특정 투표 옵션에 대해 이미 한 투표를 취소합니다.(테스트용 취소id는 입주민 기준)
 *     tags:
 *       - Pollsvote
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "33ec83f9-fd3c-4596-9825-65774f4b06fe"
 *         description: 투표 취소할 옵션 ID
 *     responses:
 *       200:
 *         description: 투표 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseOptionDTO'
 *       400:
 *         description: 잘못된 요청 예 optionId 형식 오류
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 해당 투표가 존재하지 않거나, 본인의 투표가 아닙니다.
 */
export async function removeOption(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { optionId } = create(req.params, VoteBodyStruct);
  const option = await optionService.removeVote(
    optionId,
    reqWithPayload.user.userId
  );
  res
    .status(200)
    .send(new ResponseOptionDTO(option!, "Vote removed successfully"));
}
