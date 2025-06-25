import apartmentInfoService from "@/services/apartmentInfoService";
import { Request, Response } from "express";

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
