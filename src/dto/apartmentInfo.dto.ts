import { APPROVAL_STATUS } from "@prisma/client";
export interface ApartmentDtoBaseProps {
  id: string;
  name: string;
  address: string;
}
export interface ApartmentDetailResponseDtoProps
  extends ApartmentsListResponseDtoProps {}

export interface ApartmentsListResponseDtoProps extends ApartmentDtoBaseProps {
  officeNumber: string;
  description: string;
  dongRange: {
    start: number;
    end: number;
  };
  hoRange: {
    start: number;
    end: number;
  };
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
  apartmentStatus: APPROVAL_STATUS;
}

export class ApartmentsListResponseDto
  implements ApartmentsListResponseDtoProps
{
  id: string;
  name: string;
  address: string;
  officeNumber: string;
  description: string;
  dongRange: { start: number; end: number };
  hoRange: { start: number; end: number };
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
  apartmentStatus: APPROVAL_STATUS;

  constructor(props: ApartmentsListResponseDtoProps) {
    this.id = props.id;
    this.name = props.name;
    this.address = props.address;
    this.officeNumber = props.officeNumber;
    this.description = props.description;
    this.dongRange = props.dongRange;
    this.hoRange = props.hoRange;
    this.startComplexNumber = props.startComplexNumber;
    this.endComplexNumber = props.endComplexNumber;
    this.startDongNumber = props.startDongNumber;
    this.endDongNumber = props.endDongNumber;
    this.startFloorNumber = props.startFloorNumber;
    this.endFloorNumber = props.endFloorNumber;
    this.startHoNumber = props.startHoNumber;
    this.endHoNumber = props.endHoNumber;
    this.apartmentStatus = props.apartmentStatus;
  }
}

export class ApartmentsListPublicResponseDto implements ApartmentDtoBaseProps {
  id: string;
  name: string;
  address: string;

  constructor(props: ApartmentDtoBaseProps) {
    this.id = props.id;
    this.name = props.name;
    this.address = props.address;
  }
}

export class ApartmentResponseDto implements ApartmentsListResponseDtoProps {
  id: string;
  name: string;
  address: string;
  officeNumber: string;
  description: string;
  dongRange: { start: number; end: number };
  hoRange: { start: number; end: number };
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
  apartmentStatus: APPROVAL_STATUS;

  constructor(props: ApartmentsListResponseDtoProps) {
    this.id = props.id;
    this.name = props.name;
    this.address = props.address;
    this.officeNumber = props.officeNumber;
    this.description = props.description;
    this.dongRange = props.dongRange;
    this.hoRange = props.hoRange;
    this.startComplexNumber = props.startComplexNumber;
    this.endComplexNumber = props.endComplexNumber;
    this.startDongNumber = props.startDongNumber;
    this.endDongNumber = props.endDongNumber;
    this.startFloorNumber = props.startFloorNumber;
    this.endFloorNumber = props.endFloorNumber;
    this.startHoNumber = props.startHoNumber;
    this.endHoNumber = props.endHoNumber;
    this.apartmentStatus = props.apartmentStatus;
  }
}
