/**
 * Time utility for Indian Standard Time (IST, UTC+5:30) and 12-hour formatting
 */

export const INDIA_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns formatted 12-hour time in India Standard Time
 * e.g., "08:25:37 AM"
 */
export function formatIndia12HourTime(dateInput?: string | number | Date | null, includeSeconds: boolean = true): string {
  if (!dateInput) return '--:-- --';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '--:-- --';

  return d.toLocaleTimeString('en-IN', {
    timeZone: INDIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true
  });
}

/**
 * Returns formatted date in Indian format
 * e.g., "31 Oct 2026"
 */
export function formatIndiaDate(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '--';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '--';

  return d.toLocaleDateString('en-IN', {
    timeZone: INDIA_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Returns combined Date & 12-hour time with IST suffix
 * e.g., "31 Oct 2026, 08:25 AM IST"
 */
export function formatIndiaDateTime(dateInput?: string | number | Date | null, includeSeconds: boolean = false): string {
  if (!dateInput) return '--';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '--';

  const timePart = formatIndia12HourTime(d, includeSeconds);
  const datePart = formatIndiaDate(d);
  return `${datePart}, ${timePart} IST`;
}
