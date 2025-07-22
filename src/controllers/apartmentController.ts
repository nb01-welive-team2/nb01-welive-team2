import apartmentInfoService from "@/services/apartmentInfoService";
import { Request, Response } from "express";
import {
  ApartmentResponseDto,
  ApartmentDetailResponseDtoProps,
} from "@/dto/apartmentInfo.dto";

/**
 * @swagger
 * /api/apartments:
 *   get:
 *     summary: "[슈퍼관리자/관리자/입주민(회원가입 시 사용)] 아파트 목록 조회 (미가입자는 제한된 정보만 반환)"
 *     description: |
 *       로그인 여부에 따라 반환되는 데이터 구조가 다름
 *       - 로그인 상태: 상세 정보 포함 (officeNumber, description, 범위 정보 등)
 *       - 비로그인 상태: 기본 정보만 제공 (id, name, address)
 *     tags:
 *       - Apartments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentName
 *         schema:
 *           type: string
 *         description: 아파트 이름 (검색용)
 *       - in: query
 *         name: apartmentAddress
 *         schema:
 *           type: string
 *         description: 아파트 주소 (검색용)
 *     responses:
 *       200:
 *         description: 아파트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apartments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "2149430f-2892-463f-b3e7-4e893548c6d6"
 *                       name:
 *                         type: string
 *                         example: "선샤인 아파트"
 *                       address:
 *                         type: string
 *                         example: "서울시 강남구 선릉로 123"
 *                       officeNumber:
 *                         type: string
 *                         example: "02-345-6789"
 *                       description:
 *                         type: string
 *                         example: "쾌적한 환경의 고급 아파트입니다."
 *                       dongRange:
 *                         type: object
 *                         properties:
 *                           start:
 *                             type: number
 *                             example: 101
 *                           end:
 *                             type: number
 *                             example: 110
 *                       hoRange:
 *                         type: object
 *                         properties:
 *                           start:
 *                             type: number
 *                             example: 101
 *                           end:
 *                             type: number
 *                             example: 1002
 *                       startComplexNumber:
 *                         type: number
 *                         example: 1
 *                       endComplexNumber:
 *                         type: number
 *                         example: 5
 *                       startDongNumber:
 *                         type: number
 *                         example: 101
 *                       endDongNumber:
 *                         type: number
 *                         example: 110
 *                       startFloorNumber:
 *                         type: number
 *                         example: 1
 *                       endFloorNumber:
 *                         type: number
 *                         example: 10
 *                       startHoNumber:
 *                         type: number
 *                         example: 101
 *                       endHoNumber:
 *                         type: number
 *                         example: 1002
 *                       apartmentStatus:
 *                         type: string
 *                         enum: [PENDING, APPROVED, REJECTED]
 *                         example: APPROVED
 *       401:
 *         description: 인증되지 않음
 */
export async function getApartmentsListController(req: Request, res: Response) {
  const apartmentName = req.query.apartmentName as string | undefined;
  const apartmentAddress = req.query.apartmentAddress as string | undefined;
  const isAuthenticated = !!req.user;
  const apartments = await apartmentInfoService.getApartmentsList(
    {
      apartmentName,
      apartmentAddress,
    },
    isAuthenticated
  );

  res.status(200).json({ apartments });
}

/**
 * @swagger
 * /api/apartments/{id}:
 *   get:
 *     summary: "[슈퍼관리자/관리자/입주민] 아파트 상세 정보 조회"
 *     description: 아파트의 ID를 기반으로 상세 정보를 조회합니다.
 *     tags:
 *       - Apartments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 조회할 아파트의 고유 ID (UUID)
 *         schema:
 *           type: string
 *           example: "2149430f-2892-463f-b3e7-4e893548c6d6"
 *     responses:
 *       200:
 *         description: 아파트 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "2149430f-2892-463f-b3e7-4e893548c6d6"
 *                 name:
 *                   type: string
 *                   example: "선샤인 아파트"
 *                 address:
 *                   type: string
 *                   example: "서울시 강남구 선릉로 123"
 *                 officeNumber:
 *                   type: string
 *                   example: "02-345-6789"
 *                 description:
 *                   type: string
 *                   example: "쾌적한 환경의 고급 아파트입니다."
 *                 dongRange:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: number
 *                       example: 101
 *                     end:
 *                       type: number
 *                       example: 110
 *                 hoRange:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: number
 *                       example: 101
 *                     end:
 *                       type: number
 *                       example: 1002
 *                 startComplexNumber:
 *                   type: number
 *                   example: 1
 *                 endComplexNumber:
 *                   type: number
 *                   example: 5
 *                 startDongNumber:
 *                   type: number
 *                   example: 101
 *                 endDongNumber:
 *                   type: number
 *                   example: 110
 *                 startFloorNumber:
 *                   type: number
 *                   example: 1
 *                 endFloorNumber:
 *                   type: number
 *                   example: 10
 *                 startHoNumber:
 *                   type: number
 *                   example: 101
 *                 endHoNumber:
 *                   type: number
 *                   example: 1002
 *                 apartmentStatus:
 *                   type: string
 *                   enum: [PENDING, APPROVED, REJECTED]
 *                   example: APPROVED
 *       404:
 *         description: 해당 ID의 아파트를 찾을 수 없습니다.
 *       401:
 *         description: 인증되지 않음
 */
export async function getApartmentDetailController(
  req: Request,
  res: Response
) {
  const id = req.params.id;
  const apartment = await apartmentInfoService.getApartmentDetail(id);
  res
    .status(200)
    .json(
      new ApartmentResponseDto(apartment as ApartmentDetailResponseDtoProps)
    );
}
