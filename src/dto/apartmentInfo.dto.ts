import { APPROVAL_STATUS } from "@prisma/client";

export class ApartmentsListResponseDto {
  id!: string;
  name!: string;
  address!: string;
  officeNumber!: string;
  description!: string;
  dongRange!: {
    start: number;
    end: number;
  };
  hoRange!: {
    start: number;
    end: number;
  };
  startComplexNumber!: number;
  endComplexNumber!: number;
  startDongNumber!: number;
  endDongNumber!: number;
  startFloorNumber!: number;
  endFloorNumber!: number;
  startHoNumber!: number;
  endHoNumber!: number;
  apartmentStatus!: APPROVAL_STATUS;

  constructor(partial: Partial<ApartmentsListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ApartmentsListPublicResponseDto {
  id!: string;
  name!: string;
  address!: string;

  constructor(partial: Partial<ApartmentsListPublicResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ApartmentResponseDto {
  id!: string;
  name!: string;
  address!: string;
  officeNumber!: string;
  description!: string;
  dongRange!: {
    start: number;
    end: number;
  };
  hoRange!: {
    start: number;
    end: number;
  };
  startComplexNumber!: number;
  endComplexNumber!: number;
  startDongNumber!: number;
  endDongNumber!: number;
  startFloorNumber!: number;
  endFloorNumber!: number;
  startHoNumber!: number;
  endHoNumber!: number;
  apartmentStatus!: APPROVAL_STATUS;

  constructor(partial: Partial<ApartmentResponseDto>) {
    Object.assign(this, partial);
  }
}
