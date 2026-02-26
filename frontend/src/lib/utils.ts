// 共通ユーティリティ関数（Next.js/shadcn/ui用）
// cn: tailwind-merge + clsxでクラス名を合成
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formatDate: 日付を日本語表記に整形（例: 2024/2/24）
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP')
}
