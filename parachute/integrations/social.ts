// Social media integration stub
// Future: ingest LinkedIn posts and tweets/threads as Signal records

export interface SocialPost {
  platform: "linkedin" | "twitter"
  authorHandle: string
  content: string
  url: string
  publishedAt: Date
  engagementScore?: number
}

export async function fetchLinkedInPosts(_linkedinUrl: string): Promise<SocialPost[]> {
  // TODO: use LinkedIn API or scraping service (Proxycurl, etc.)
  console.warn("LinkedIn integration not yet implemented")
  return []
}

export async function fetchTweets(_twitterHandle: string): Promise<SocialPost[]> {
  // TODO: use Twitter/X API v2
  console.warn("Twitter integration not yet implemented")
  return []
}

export async function ingestSocialSignals(_personId: string): Promise<void> {
  // TODO: fetch posts, score relevance, create Signal records
}
