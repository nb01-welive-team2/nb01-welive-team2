import apartmentInfoService from "@/services/apartmentInfoService";
import { Request, Response } from "express";
import {
  ApartmentsListPublicResponseDto,
  ApartmentsListResponseDto,
  ApartmentResponseDto,
  ApartmentsListResponseDtoProps,
  ApartmentDtoBaseProps,
  ApartmentDetailResponseDtoProps,
} from "@/dto/apartmentInfo.dto";

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

  res.status(200).json(apartments);
}

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
