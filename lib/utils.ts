import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g
  return text.match(hashtagRegex) || []
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    INSTAGRAM: 'from-purple-600 to-pink-600',
    FACEBOOK: 'from-blue-600 to-blue-700',
    TWITTER: 'from-sky-500 to-blue-600',
    LINKEDIN: 'from-blue-700 to-blue-800',
    TIKTOK: 'from-black to-gray-900',
  }
  return colors[platform] || 'from-gray-600 to-gray-700'
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    INSTAGRAM: '📷',
    FACEBOOK: '👥',
    TWITTER: '🐦',
    LINKEDIN: '💼',
    TIKTOK: '🎵',
  }
  return icons[platform] || '📱'
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
