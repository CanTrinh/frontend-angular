declare module 'amlich' {
  /**
   * Convert a Gregorian date (Dương lịch) to Vietnamese lunar date (Âm lịch).
   * @param dd - Day (1–31)
   * @param mm - Month (1–12)
   * @param yy - Year (e.g. 2026)
   * @param timeZone - Time zone offset (Vietnam = 7)
   * @returns [lunarDay, lunarMonth, lunarYear, lunarLeap]
   */
  export function convertSolar2Lunar(
    dd: number,
    mm: number,
    yy: number,
    timeZone: number
  ): [number, number, number, number];

  /**
   * Convert a Vietnamese lunar date (Âm lịch) to Gregorian date (Dương lịch).
   * @param lunarDay - Lunar day
   * @param lunarMonth - Lunar month
   * @param lunarYear - Lunar year
   * @param lunarLeap - 1 if leap month, 0 otherwise
   * @param timeZone - Time zone offset (Vietnam = 7)
   * @returns [day, month, year]
   */
  export function convertLunar2Solar(
    lunarDay: number,
    lunarMonth: number,
    lunarYear: number,
    lunarLeap: number,
    timeZone: number
  ): [number, number, number];

  /**
   * Get the Julian day number for a Gregorian date.
   */
  export function jdFromDate(dd: number, mm: number, yy: number): number;

  /**
   * Convert a Julian day number back to Gregorian date.
   * @returns { day, month, year }
   */
  export function jdToDate(
    jd: number
  ): { day: number; month: number; year: number };
}
