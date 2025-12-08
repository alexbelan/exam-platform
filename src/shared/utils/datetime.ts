/**
 * Date formatting utility functions
 */

export type DateInput = Date | string | number;

export type DateFormat = "short" | "medium" | "long" | "datetime" | "date";

/**
 * Converts various date inputs to Date object
 */
const toDate = (input: DateInput): Date => {
  if (input instanceof Date) {
    return input;
  }
  if (typeof input === "number") {
    return new Date(input);
  }
  return new Date(input);
};

/**
 * Universal date formatting function
 * @param input - Date, string, or timestamp
 * @param format - Format type: 'short' (default), 'medium', 'long', 'datetime', 'date'
 * @returns Formatted date string in Russian locale
 */
export const formatDate = (
  input: DateInput,
  format: DateFormat = "short",
): string => {
  const date = toDate(input);

  const formatOptions: Record<DateFormat, Intl.DateTimeFormatOptions> = {
    short: {
      // Default format: 01.01.2024, 12:00
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
    medium: {
      // Medium format: 1 января 2024, 12:00
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    long: {
      // Long format: 1 января 2024 г., 12:00
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    datetime: {
      // Date and time: 1 января 2024, 12:00
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    date: {
      // Date only: 1 января 2024
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  };

  return new Intl.DateTimeFormat("ru-RU", formatOptions[format]).format(date);
};
