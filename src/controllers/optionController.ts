import { Request, Response } from "express";
import { create } from "superstruct";
import { AuthenticatedRequest } from "@/types/express";
import { VoteBodyStruct } from "@/structs/optionStructs";
import optionService from "@/services/optionService";
import { ResponseOptionDTO, ResponseWinnerOptionDTO } from "@/dto/optionDTO";

/**
 * @swagger
 * /api/options/:optionId/vote:
 *   post:
 *     summary: 특정 투표 항목에 투표하기
 *     tags:
 *       - Votes
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 선택된 투표 항목의 ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 투표 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Vote created successfully
 *                 data:
 *                   type: object
 *                   description: 선택된 투표 옵션 객체
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
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
 * @swagger
 * /api/options/:optionId/vote:
 *   delete:
 *     summary: 투표 취소
 *     description: 사용자가 특정 옵션에 대해 했던 투표를 취소합니다.
 *     tags:
 *       - Votes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         description: 투표 옵션의 고유 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 투표 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Vote removed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Option'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 해당 옵션이 존재하지 않거나 투표한 적 없음
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
