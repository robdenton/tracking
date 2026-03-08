import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date))
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "never"
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export function daysSince(date: Date | string | null | undefined): number {
  if (!date) return 9999
  const d = new Date(date)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export const CATEGORIES = ["founder", "marketer", "investor", "operator", "other"] as const
export const STATUSES = ["active", "dormant", "watchlist"] as const
export const CHANNELS = ["email", "linkedin", "twitter", "whatsapp", "phone", "in_person"] as const
export const INTERACTION_TYPES = ["email", "whatsapp", "coffee", "call", "intro", "dm", "meeting", "note", "other"] as const
export const VALUE_EVENT_TYPES = ["intro", "feedback", "support", "advice", "referral", "promotion", "other"] as const
export const SIGNAL_TYPES = ["funding", "product_launch", "hiring", "linkedin_post", "tweet", "podcast", "blog", "job_change", "speaking", "time_based", "news", "other"] as const

export const categoryLabel: Record<string, string> = {
  founder: "Founder", marketer: "Marketer", investor: "Investor", operator: "Operator", other: "Other"
}
export const statusLabel: Record<string, string> = {
  active: "Active", dormant: "Dormant", watchlist: "Watchlist"
}
export const signalTypeLabel: Record<string, string> = {
  funding: "Funding", product_launch: "Product Launch", hiring: "Hiring", linkedin_post: "LinkedIn Post",
  tweet: "Tweet", podcast: "Podcast", blog: "Blog Post", job_change: "Job Change",
  speaking: "Speaking", time_based: "Time-based", news: "News", other: "Other"
}
