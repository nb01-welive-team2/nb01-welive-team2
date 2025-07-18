import { parse } from "csv-parse/sync";
import CommonError from "@/errors/CommonError";

export interface RawResidentRow {
  name: string;
  building: number;
  unitNumber: number;
  contact: string;
  email: string;
  isHouseholder: string;
}

export const parseResidentsCsv = (csvText: string): RawResidentRow[] => {
  try {
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ",",
      bom: true,
    });
    if (!Array.isArray(records)) {
      throw new CommonError("CSV 파싱 결과가 유효하지 않음", 400);
    }
    return records;
  } catch (error) {
    throw new CommonError("CSV 형식 오류: " + (error as Error).message, 400);
  }
};
