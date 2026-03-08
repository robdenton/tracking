// News / RSS integration stub
// Future: monitor company names via RSS, Google Alerts API, or news APIs

export interface NewsArticle {
  title: string
  url: string
  source: string
  publishedAt: Date
  summary: string
}

export async function fetchNewsForCompany(_company: string): Promise<NewsArticle[]> {
  // TODO: integrate with NewsAPI, GDELT, or custom RSS feeds
  console.warn("News integration not yet implemented")
  return []
}

export async function scanForFundingAnnouncements(_company: string): Promise<NewsArticle[]> {
  // TODO: filter for funding keywords: "raises", "series A", "seed round", etc.
  return []
}
