import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility kết hợp class names với tailwind-merge để tránh xung đột Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng diện tích theo chuẩn Việt Nam (vd: 125,50 m²)
 */
export function formatArea(area: number): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(area) + ' m²';
}

/**
 * Định dạng tiền tệ VNĐ
 */
export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Định dạng ngày giờ chuẩn hành chính Việt Nam (DD/MM/YYYY HH:mm:ss)
 */
export function formatDateTimeVN(date: string | Date | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}
