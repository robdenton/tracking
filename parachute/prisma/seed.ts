import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000)

async function main() {
  await prisma.$transaction([
    prisma.note.deleteMany(), prisma.suggestion.deleteMany(), prisma.valueEvent.deleteMany(),
    prisma.signal.deleteMany(), prisma.interaction.deleteMany(), prisma.identity.deleteMany(),
    prisma.personTag.deleteMany(), prisma.tag.deleteMany(), prisma.person.deleteMany(),
  ])

  const tagNames = ["angel","advisor","vip","b2b","saas","growth","design","ex-founder","portfolio","yc","ls","ops","content"]
  const tags: Record<string, string> = {}
  for (const name of tagNames) {
    const t = await prisma.tag.create({ data: { name } })
    tags[name] = t.id
  }

  const tag = (...names: string[]) => names.filter(n => tags[n]).map(n => ({ tagId: tags[n] }))

  const p = await Promise.all([
    // 0 Tom Fairbanks
    prisma.person.create({ data: { fullName: "Tom Fairbanks", company: "Draftly", role: "CEO & Co-founder", category: "founder", relationshipStrength: 5, status: "active", email: "tom@draftly.io", linkedinUrl: "https://linkedin.com/in/tomfairbanks", twitterUrl: "https://twitter.com/tomfairbanks", location: "London, UK", preferredChannel: "linkedin", introducedBy: "Charlie Reid", topics: "product-led growth, B2B SaaS, fundraising", lastInteractionAt: d(4), notes: "Met at SaaStr London. Building doc-automation for finance teams. Thoughtful operator.", tags: { create: tag("yc","saas","b2b","vip") } } }),
    // 1 Sarah Chen
    prisma.person.create({ data: { fullName: "Sarah Chen", company: "GrowthLab", role: "Head of Growth", category: "marketer", relationshipStrength: 4, status: "active", email: "sarah@growthlab.co", linkedinUrl: "https://linkedin.com/in/sarahchen", location: "Berlin, Germany", preferredChannel: "email", topics: "PLG, activation, pricing, retention", lastInteractionAt: d(104), notes: "Brilliant growth thinker. Collaborated on a pricing teardown last year. Must reconnect.", tags: { create: tag("growth","advisor") } } }),
    // 2 Marcus Webb
    prisma.person.create({ data: { fullName: "Marcus Webb", company: "Lightspeed", role: "Partner", category: "investor", relationshipStrength: 3, status: "watchlist", email: "marcus@lsvp.com", linkedinUrl: "https://linkedin.com/in/marcuswebb", twitterUrl: "https://twitter.com/marcuswebb", location: "San Francisco, CA", preferredChannel: "twitter", topics: "B2B SaaS, developer tools, AI infrastructure", lastInteractionAt: d(38), notes: "Met at YC Demo Day. Focused on Series A. Warm but slow to respond.", tags: { create: tag("ls","angel") } } }),
    // 3 Priya Nair
    prisma.person.create({ data: { fullName: "Priya Nair", company: "Segment", role: "Product Marketing Lead", category: "marketer", relationshipStrength: 4, status: "active", email: "priya@segment.com", linkedinUrl: "https://linkedin.com/in/priyanair", location: "New York, NY", preferredChannel: "linkedin", topics: "data storytelling, ICP definition, PMM", lastInteractionAt: d(22), notes: "Sharp PMM. Very generous with her time. Introduced me to 3 people.", tags: { create: tag("content","growth") } } }),
    // 4 Jake Lawson
    prisma.person.create({ data: { fullName: "Jake Lawson", company: "Relay", role: "Co-founder & CTO", category: "founder", relationshipStrength: 5, status: "active", email: "jake@relay.app", linkedinUrl: "https://linkedin.com/in/jakelawson", twitterUrl: "https://twitter.com/jakelawson", location: "London, UK", preferredChannel: "whatsapp", topics: "API design, fintech infrastructure, hiring engineers", lastInteractionAt: d(12), notes: "Close friend. Talk every few weeks. Currently scaling hard post-seed.", tags: { create: tag("vip","b2b","saas") } } }),
    // 5 Laura Briggs
    prisma.person.create({ data: { fullName: "Laura Briggs", company: "Notion", role: "Senior Content Strategist", category: "marketer", relationshipStrength: 3, status: "active", email: "laura@notion.so", linkedinUrl: "https://linkedin.com/in/laurabriggs", location: "Remote (UK)", preferredChannel: "linkedin", topics: "content systems, SEO, community building", lastInteractionAt: d(61), notes: "Posts consistently great content. Haven't connected much this year.", tags: { create: tag("content") } } }),
    // 6 Alex Petrov
    prisma.person.create({ data: { fullName: "Alex Petrov", company: "Klarna", role: "VP Product", category: "operator", relationshipStrength: 4, status: "active", email: "alex@klarna.com", linkedinUrl: "https://linkedin.com/in/alexpetrov", location: "Stockholm, Sweden", preferredChannel: "email", topics: "fintech, payments, consumer UX, large-scale product", lastInteractionAt: d(7), notes: "Ex-Spotify. Deep product thinker. Looking for a growth consultant.", tags: { create: tag("ops","b2b") } } }),
    // 7 Nina Torres
    prisma.person.create({ data: { fullName: "Nina Torres", company: "Figma", role: "Design Lead", category: "operator", relationshipStrength: 3, status: "active", email: "nina@figma.com", linkedinUrl: "https://linkedin.com/in/ninatorres", twitterUrl: "https://twitter.com/ninatorres_d", location: "San Francisco, CA", preferredChannel: "twitter", topics: "design systems, product craftsmanship, accessibility", lastInteractionAt: d(55), notes: "Replied warmly to a thread I wrote about design systems.", tags: { create: tag("design") } } }),
    // 8 Charlie Reid
    prisma.person.create({ data: { fullName: "Charlie Reid", company: "Seedcamp", role: "Principal", category: "investor", relationshipStrength: 5, status: "active", email: "charlie@seedcamp.com", linkedinUrl: "https://linkedin.com/in/charliereid", location: "London, UK", preferredChannel: "email", topics: "seed investing, European startups, founder wellbeing", lastInteractionAt: d(3), notes: "Introduced me to Tom. Very well-connected. Responds same day.", tags: { create: tag("angel","vip","advisor") } } }),
    // 9 Yemi Adeyemi
    prisma.person.create({ data: { fullName: "Yemi Adeyemi", company: "PayHQ", role: "CEO", category: "founder", relationshipStrength: 2, status: "watchlist", email: "yemi@payhq.com", linkedinUrl: "https://linkedin.com/in/yemiadeyemi", location: "Lagos, Nigeria", preferredChannel: "linkedin", topics: "African fintech, Series A, hiring", lastInteractionAt: d(130), notes: "Met at Web Summit. Building interesting payroll infrastructure for Africa.", tags: { create: tag("b2b") } } }),
    // 10 Hannah Müller
    prisma.person.create({ data: { fullName: "Hannah Müller", company: "Personio", role: "CMO", category: "marketer", relationshipStrength: 3, status: "dormant", email: "hannah@personio.de", linkedinUrl: "https://linkedin.com/in/hannahmuller", location: "Munich, Germany", preferredChannel: "email", topics: "HR tech, demand gen, European SaaS marketing", lastInteractionAt: d(200), notes: "Ex-Hubspot. Was a warm connection two years ago. Has gone quiet.", tags: { create: tag("growth") } } }),
    // 11 Ben Ashford
    prisma.person.create({ data: { fullName: "Ben Ashford", company: "Loom", role: "Senior Growth PM", category: "operator", relationshipStrength: 4, status: "active", email: "ben@loom.com", linkedinUrl: "https://linkedin.com/in/benashford", twitterUrl: "https://twitter.com/benashford", location: "London, UK", preferredChannel: "twitter", topics: "virality, activation, async work, B2B growth", lastInteractionAt: d(19), notes: "Very tactical and generous. Good sparring partner on growth mechanics.", tags: { create: tag("growth","ops") } } }),
    // 12 Cleo Pascal
    prisma.person.create({ data: { fullName: "Cleo Pascal", company: "Typeform", role: "Brand & Content Director", category: "marketer", relationshipStrength: 3, status: "dormant", email: "cleo@typeform.com", linkedinUrl: "https://linkedin.com/in/cleopascal", location: "Barcelona, Spain", preferredChannel: "linkedin", topics: "brand strategy, creative direction, human-centred design", lastInteractionAt: d(245), notes: "Wonderful person. Collaborated on a thought piece two years ago.", tags: { create: tag("content","design") } } }),
    // 13 Daniel Osei
    prisma.person.create({ data: { fullName: "Daniel Osei", company: "Deliveroo", role: "Head of Ops, UK", category: "operator", relationshipStrength: 2, status: "dormant", email: "daniel@deliveroo.com", linkedinUrl: "https://linkedin.com/in/danielosei", location: "London, UK", preferredChannel: "email", topics: "operations, logistics, marketplace dynamics", lastInteractionAt: d(180), notes: "Good connection but we've drifted. Worth re-engaging.", tags: { create: tag("ops") } } }),
    // 14 Mei Lin
    prisma.person.create({ data: { fullName: "Mei Lin", company: "Canva", role: "Growth Marketing Manager", category: "marketer", relationshipStrength: 4, status: "active", email: "mei@canva.com", linkedinUrl: "https://linkedin.com/in/meilin", location: "Sydney, Australia", preferredChannel: "linkedin", topics: "paid acquisition, content experiments, PLG funnels", lastInteractionAt: d(16), notes: "Referred a potential client to me last quarter. Collaborative.", tags: { create: tag("growth","content") } } }),
    // 15 Rory MacPherson
    prisma.person.create({ data: { fullName: "Rory MacPherson", company: "Skyscanner", role: "Engineering Manager", category: "operator", relationshipStrength: 3, status: "active", email: "rory@skyscanner.net", linkedinUrl: "https://linkedin.com/in/rorymacpherson", location: "Edinburgh, UK", preferredChannel: "email", topics: "eng culture, remote teams, platform engineering", lastInteractionAt: d(44), notes: "Thoughtful leader. Mentioned they might need a consultant for their platform reorg.", tags: { create: tag("ops") } } }),
    // 16 Fatima Al-Rashid
    prisma.person.create({ data: { fullName: "Fatima Al-Rashid", company: "Miro", role: "Product Manager", category: "operator", relationshipStrength: 3, status: "active", email: "fatima@miro.com", linkedinUrl: "https://linkedin.com/in/fatimaalrashid", location: "Amsterdam, Netherlands", preferredChannel: "linkedin", topics: "collaboration tools, enterprise PM, roadmapping", lastInteractionAt: d(33), notes: "Met at ProductCon. Connected in the Amsterdam startup scene.", tags: { create: tag("ops","b2b") } } }),
    // 17 Oliver Grant
    prisma.person.create({ data: { fullName: "Oliver Grant", company: "Stripe", role: "Developer Advocate", category: "operator", relationshipStrength: 2, status: "watchlist", email: "oliver@stripe.com", linkedinUrl: "https://linkedin.com/in/olivergrant", twitterUrl: "https://twitter.com/olivergrant_dev", location: "Dublin, Ireland", preferredChannel: "twitter", topics: "fintech APIs, developer experience, open source", lastInteractionAt: d(77), notes: "Followed me on Twitter. Replied to a few threads. Worth nurturing.", tags: { create: tag("b2b","saas") } } }),
    // 18 Isabelle Fontaine
    prisma.person.create({ data: { fullName: "Isabelle Fontaine", company: "Alan", role: "VP Marketing", category: "marketer", relationshipStrength: 4, status: "active", email: "isabelle@alan.eu", linkedinUrl: "https://linkedin.com/in/isabellefontaine", location: "Paris, France", preferredChannel: "linkedin", topics: "health tech, brand-led growth, French tech ecosystem", lastInteractionAt: d(28), notes: "Super sharp. Has a strong POV on brand vs. demand. Great network in France.", tags: { create: tag("growth","vip") } } }),
    // 19 Sam Okafor
    prisma.person.create({ data: { fullName: "Sam Okafor", company: "Wise", role: "Senior Analyst, Strategy", category: "operator", relationshipStrength: 2, status: "dormant", email: "sam@wise.com", linkedinUrl: "https://linkedin.com/in/samokafor", location: "London, UK", preferredChannel: "email", topics: "fintech, international expansion, strategy", lastInteractionAt: d(310), notes: "Strong analyst. Haven't spoken since a shared event in 2023.", tags: { create: tag("ops") } } }),
    // 20 Nadia Karim
    prisma.person.create({ data: { fullName: "Nadia Karim", company: "Selfridges", role: "Digital Product Director", category: "operator", relationshipStrength: 3, status: "watchlist", email: "nadia@selfridges.com", linkedinUrl: "https://linkedin.com/in/nadiakarim", location: "London, UK", preferredChannel: "email", topics: "retail tech, customer experience, digital transformation", lastInteractionAt: d(95), notes: "Exploring a move to SaaS. Potential consulting client.", tags: { create: tag("ops","design") } } }),
    // 21 Lucas Ferreira
    prisma.person.create({ data: { fullName: "Lucas Ferreira", company: "Rock Content", role: "CEO", category: "founder", relationshipStrength: 3, status: "active", email: "lucas@rockcontent.com", linkedinUrl: "https://linkedin.com/in/lucasferreira", twitterUrl: "https://twitter.com/lucasferreira", location: "Belo Horizonte, Brazil", preferredChannel: "linkedin", topics: "content marketing, LatAm SaaS, remote culture", lastInteractionAt: d(50), notes: "Building at scale in LatAm. Thoughtful on content-led growth.", tags: { create: tag("saas","content") } } }),
    // 22 Elena Sokolov
    prisma.person.create({ data: { fullName: "Elena Sokolov", company: "Pitch", role: "VP Product", category: "operator", relationshipStrength: 4, status: "active", email: "elena@pitch.com", linkedinUrl: "https://linkedin.com/in/elenasokolov", location: "Berlin, Germany", preferredChannel: "linkedin", topics: "product strategy, design-led culture, storytelling tools", lastInteractionAt: d(8), notes: "Smart and direct. Loves talking craft. Just promoted.", tags: { create: tag("design","ops") } } }),
    // 23 Kwame Asante
    prisma.person.create({ data: { fullName: "Kwame Asante", company: "Paystack", role: "Co-founder", category: "founder", relationshipStrength: 4, status: "active", email: "kwame@paystack.com", linkedinUrl: "https://linkedin.com/in/kwameasante", twitterUrl: "https://twitter.com/kwameasante", location: "Lagos, Nigeria", preferredChannel: "twitter", topics: "African fintech, payments infrastructure, scaling ops", lastInteractionAt: d(35), notes: "Rare combination of builder and thinker. Very visible in the ecosystem.", tags: { create: tag("yc","vip","b2b") } } }),
    // 24 Jess Park
    prisma.person.create({ data: { fullName: "Jess Park", company: "Intercom", role: "Growth Lead", category: "marketer", relationshipStrength: 3, status: "active", email: "jess@intercom.com", linkedinUrl: "https://linkedin.com/in/jesspark", location: "Dublin, Ireland", preferredChannel: "email", topics: "customer lifecycle, conversational marketing, retention loops", lastInteractionAt: d(41), notes: "Thoughtful growth practitioner. Posts useful teardowns on LinkedIn.", tags: { create: tag("growth","saas") } } }),
  ])

  await prisma.interaction.createMany({ data: [
    { personId: p[0].id, type: "coffee", occurredAt: d(4), summary: "Caught up in Shoreditch. Discussed their Series A plan and GTM challenges.", direction: "mutual" },
    { personId: p[0].id, type: "dm", occurredAt: d(60), summary: "He shared a draft of their pricing page. I gave detailed feedback.", direction: "inbound" },
    { personId: p[1].id, type: "call", occurredAt: d(104), summary: "30-min call on retention benchmarks. She mentioned wanting to write more publicly.", direction: "mutual", requiresFollowUp: true, followUpDueAt: d(-7) },
    { personId: p[2].id, type: "linkedin", occurredAt: d(38), summary: "He commented on my post about pricing tiers. Short exchange.", direction: "inbound" },
    { personId: p[3].id, type: "email", occurredAt: d(22), summary: "She shared their internal GTM framework. I asked about her upcoming talk.", direction: "mutual" },
    { personId: p[4].id, type: "whatsapp", occurredAt: d(12), summary: "Voice note about their Series B process. Asked if I knew any CTPO candidates.", direction: "inbound", requiresFollowUp: true, followUpDueAt: d(3) },
    { personId: p[5].id, type: "dm", occurredAt: d(61), summary: "I replied to a thread she posted about SEO moats. She said it was useful.", direction: "outbound" },
    { personId: p[6].id, type: "email", occurredAt: d(7), summary: "Intro call set up by Charlie. Good chemistry. Looking for a growth consultant.", direction: "mutual" },
    { personId: p[8].id, type: "coffee", occurredAt: d(3), summary: "Monthly catch-up. Warm intros discussed. He mentioned Yemi might be raising.", direction: "mutual" },
    { personId: p[11].id, type: "twitter", occurredAt: d(19), summary: "Replied to his thread on viral loops. Good back-and-forth.", direction: "mutual" },
    { personId: p[14].id, type: "linkedin", occurredAt: d(16), summary: "She messaged to say her referral had signed. Thanked me.", direction: "inbound" },
    { personId: p[18].id, type: "meeting", occurredAt: d(28), summary: "Strategy call about their rebrand. Lots of overlap on brand voice thinking.", direction: "mutual" },
    { personId: p[22].id, type: "dm", occurredAt: d(8), summary: "I sent feedback on their onboarding flow. She loved it and shared with the team.", direction: "outbound" },
    { personId: p[23].id, type: "twitter", occurredAt: d(35), summary: "Thread about payment infrastructure. He tagged me in a follow-up.", direction: "mutual" },
  ]})

  await prisma.signal.createMany({ data: [
    { personId: p[0].id, type: "funding", title: "Draftly raises £4M Seed led by Seedcamp", source: "TechCrunch", sourceUrl: "https://techcrunch.com/draftly-seed", occurredAt: d(2), summary: "Tom's company closed a £4M seed round. Seedcamp and two angels. Fast for the space.", relevanceScore: 9, unread: true, needsAction: true },
    { personId: p[1].id, type: "linkedin_post", title: "Sarah posted about retention benchmarks for PLG products", source: "LinkedIn", occurredAt: d(3), summary: "Detailed post on retention curves in PLG. Discussion about activation gaps.", relevanceScore: 8, unread: true, needsAction: true },
    { personId: p[2].id, type: "tweet", title: "Marcus shared why he passed on 3 seed deals this week", source: "Twitter", sourceUrl: "https://twitter.com/marcuswebb", occurredAt: d(1), summary: "Thread about what he looks for at seed. Team distribution and distribution moat.", relevanceScore: 7, unread: true, needsAction: false },
    { personId: p[4].id, type: "hiring", title: "Relay is hiring a Senior Backend Engineer (Rust)", source: "LinkedIn", sourceUrl: "https://relay.app/careers", occurredAt: d(5), summary: "Jake's team posted for a backend engineer with Rust experience. Growing fast.", relevanceScore: 7, unread: true, needsAction: true },
    { personId: p[6].id, type: "news", title: "Klarna files for US IPO", source: "FT", sourceUrl: "https://ft.com/klarna-ipo", occurredAt: d(4), summary: "Klarna announced their S-1. Alex's team will be under huge scrutiny.", relevanceScore: 8, unread: true, needsAction: false },
    { personId: p[8].id, type: "speaking", title: "Charlie speaking at SeedSummit Berlin", source: "SeedSummit", sourceUrl: "https://seedsummit.eu", occurredAt: d(10), summary: "Keynote on European seed landscape. Worth watching and sharing.", relevanceScore: 6, unread: false, needsAction: false },
    { personId: p[9].id, type: "funding", title: "PayHQ rumoured to be in Series A talks", source: "Techpoint Africa", occurredAt: d(7), summary: "Techpoint reports PayHQ is in final diligence with a pan-African VC.", relevanceScore: 8, unread: true, needsAction: true },
    { personId: p[14].id, type: "linkedin_post", title: "Mei posted about a failed paid experiment and what she learned", source: "LinkedIn", occurredAt: d(6), summary: "Honest post about a $30k paid test that failed. Transparency about what they changed.", relevanceScore: 7, unread: true, needsAction: false },
    { personId: p[18].id, type: "blog", title: "Isabelle published: 'Why we killed our demand gen team'", source: "Medium", sourceUrl: "https://medium.com/@isabellealan", occurredAt: d(3), summary: "Essay about Alan's pivot to brand-only growth. Controversial and well-argued.", relevanceScore: 9, unread: true, needsAction: true },
    { personId: p[22].id, type: "job_change", title: "Elena promoted to VP Product at Pitch", source: "LinkedIn", occurredAt: d(8), summary: "She just got promoted. Big milestone.", relevanceScore: 7, unread: true, needsAction: true },
    { personId: p[23].id, type: "podcast", title: "Kwame on The Invest Africa Podcast", source: "Spotify", sourceUrl: "https://spotify.com/investafrica", occurredAt: d(9), summary: "45-min interview on scaling Paystack post-Stripe acquisition. Very candid.", relevanceScore: 8, unread: false, needsAction: false },
    { personId: p[1].id, type: "time_based", title: "104 days since last contact with Sarah Chen", source: "Parachute", occurredAt: d(0), summary: "You last spoke to Sarah 104 days ago. Active on LinkedIn. Strong relationship.", relevanceScore: 8, unread: true, needsAction: true },
    { personId: p[20].id, type: "time_based", title: "Over 90 days since contact with Nadia Karim", source: "Parachute", occurredAt: d(0), summary: "Nadia flagged as potential consulting client. 95 days of silence.", relevanceScore: 7, unread: true, needsAction: true },
  ]})

  await prisma.valueEvent.createMany({ data: [
    { personId: p[0].id, type: "feedback", occurredAt: d(60), summary: "Gave detailed feedback on Tom's pricing page — highlighted three structural issues and suggested an annual anchor.", outcome: "He rewrote the page and conversion improved." },
    { personId: p[3].id, type: "intro", occurredAt: d(45), summary: "Introduced Priya to a VP Sales at a Series B company looking for a PMM consultant.", outcome: "She had the call — didn't convert but appreciated the intro." },
    { personId: p[4].id, type: "advice", occurredAt: d(30), summary: "30-min call on Jake's CTPO hiring process — what to look for and how to structure it.", outcome: "He said it shaped how they ran the interviews." },
    { personId: p[8].id, type: "referral", occurredAt: d(5), summary: "Charlie referred a founder to me for a growth strategy engagement.", outcome: "Signed a 3-month retainer." },
    { personId: p[14].id, type: "intro", occurredAt: d(90), summary: "Introduced Mei to a designer who could help with landing page experimentation.", outcome: "They worked together on two projects." },
    { personId: p[22].id, type: "feedback", occurredAt: d(8), summary: "Sent unsolicited but detailed feedback on Pitch's onboarding flow with mockups.", outcome: "Elena shared it with the product team and thanked me publicly." },
    { personId: p[1].id, type: "support", occurredAt: d(200), summary: "Shared Sarah's activation teardown to 2,000+ people in my newsletter.", outcome: "Got her 300+ new followers and multiple consulting inquiries." },
    { personId: p[18].id, type: "promotion", occurredAt: d(10), summary: "Reshared Isabelle's essay on brand-only growth with my own commentary to 3k followers.", outcome: "Her post got 10x normal reach that day." },
  ]})

  await prisma.suggestion.createMany({ data: [
    { personId: p[0].id, title: "Tom raised £4M Seed — congratulate him and ask what they're hiring for", reason: "Draftly just closed their seed round. Major milestone and a warm moment to reach out.", priority: 1, suggestedAction: "Send a short, genuine message. Congratulate and ask about their hiring priorities.", suggestedChannel: "linkedin", status: "open", generatedFrom: JSON.stringify({ rule: "funding_signal" }) },
    { personId: p[1].id, title: "104 days since last contact with Sarah — send a warm check-in", reason: "You haven't spoken in over 100 days. She's active and your last conversation was genuinely valuable.", priority: 1, suggestedAction: "Reference her recent LinkedIn post on retention. Ask how the article idea is going.", suggestedChannel: "email", status: "open", generatedFrom: JSON.stringify({ rule: "recency" }) },
    { personId: p[9].id, title: "Yemi may be raising a Series A — reconnect before they close", reason: "Techpoint reports PayHQ is in final diligence. You haven't spoken in 130 days.", priority: 2, suggestedAction: "Drop a brief note. Congratulate on the traction and leave an open door.", suggestedChannel: "linkedin", status: "open", generatedFrom: JSON.stringify({ rule: "funding_signal" }) },
    { personId: p[18].id, title: "Isabelle published a bold essay — engage with it publicly", reason: "Her post on killing demand gen is getting traction. A thoughtful public reply builds goodwill.", priority: 2, suggestedAction: "Leave a substantive comment on Medium and share it with your own take.", suggestedChannel: "linkedin", status: "open", generatedFrom: JSON.stringify({ rule: "challenge_signal" }) },
    { personId: p[22].id, title: "Elena was promoted — congratulate her", reason: "She just became VP Product. You recently gave her useful product feedback she acted on.", priority: 2, suggestedAction: "Send a short congratulations. Mention you'd love to hear how the new role is going.", suggestedChannel: "linkedin", status: "open", generatedFrom: JSON.stringify({ rule: "job_change" }) },
    { personId: p[4].id, title: "Jake is hiring a senior backend engineer — send candidates", reason: "Relay just posted a Rust backend role. You may know engineers in your network.", priority: 2, suggestedAction: "Think of 1–2 engineers and offer to intro them to Jake.", suggestedChannel: "whatsapp", status: "open", generatedFrom: JSON.stringify({ rule: "hiring_signal" }) },
    { personId: p[20].id, title: "Reconnect with Nadia — potential consulting client going quiet", reason: "You flagged Nadia as watchlist and she hinted at needing help with digital transformation. 95 days of silence.", priority: 3, suggestedAction: "Brief check-in. Ask if the digital transformation project is still moving forward.", suggestedChannel: "email", status: "open", generatedFrom: JSON.stringify({ rule: "recency" }) },
  ]})

  console.log("✅ Seeded 25 people with interactions, signals, value events, and suggestions.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
