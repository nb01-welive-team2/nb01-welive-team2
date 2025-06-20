import { parse } from "csv-parse/sync";

export interface RawResidentRow {
  name: string;
  building: number;
  unitNumber: number;
  contact: string;
  email: string;
  isHouseholder: string;
}

export const parseResidentsCsv = (csvText: string): RawResidentRow[] => {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ",",
    bom: true,
  });
};
