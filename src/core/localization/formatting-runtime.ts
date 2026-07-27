import type { SupportedTimezone, SupportedLocale } from "@/lib/localization/types";

export interface FormattingRuntime {
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string;
  formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string;
  formatRelativeTime(date: Date | string): string;
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
  formatCurrency(amount: number, currency?: string, options?: Intl.NumberFormatOptions): string;
  getTimezone(): SupportedTimezone;
  setTimezone(timezone: SupportedTimezone): void;
}

export class DefaultFormattingRuntime implements FormattingRuntime {
  private timezone: SupportedTimezone;
  private locale: SupportedLocale;

  constructor(timezone: SupportedTimezone = "UTC", locale: SupportedLocale = "en") {
    this.timezone = timezone;
    this.locale = locale;
  }

  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.locale, {
      timeZone: this.timezone,
      ...options,
    }).format(d);
  }

  formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.locale, {
      timeZone: this.timezone,
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    }).format(d);
  }

  formatRelativeTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return this.formatDate(d);
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  formatCurrency(amount: number, currency = "USD", options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency,
      ...options,
    }).format(amount);
  }

  getTimezone(): SupportedTimezone {
    return this.timezone;
  }

  setTimezone(timezone: SupportedTimezone): void {
    this.timezone = timezone;
  }
}