const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const CACHE_TTL = 5 * 60 * 1000;
const WEATHER_CACHE_TTL = 10 * 60 * 1000;
const RECENT_NEWS_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_NEWS_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const cache = new Map();
const weatherCache = new Map();

const TOPICS = {
  ai: { label: 'AI', query: '(ChatGPT OR OpenAI OR "Claude AI" OR Anthropic OR "Google Gemini" OR "Gemini AI" OR DeepMind OR LLM)' },
  electrification: { label: 'Electrification', query: '(electrification OR electric grid OR battery storage)' },
  datacenter_cooling: { label: 'Data center cooling', query: '("data center cooling" OR "data centre cooling" OR "liquid cooling" OR "immersion cooling" OR "direct-to-chip cooling" OR "AI cooling")' },
  wearables: { label: 'Wearable tech', query: '(wearable technology OR smart ring OR smart glasses OR health wearable)' },
  temple: { label: 'Temple by Deepinder Goyal', query: '(Temple Deepinder Goyal OR Deepinder Goyal health startup)' },
  bci: { label: 'Brain–computer interfaces', query: '(brain computer interface OR Neuralink OR neurotechnology)' },
  neurotech: { label: 'NeuroTech & brain–computer interfaces', query: '(neurotechnology OR neurotech OR brain computer interface OR Neuralink OR neural implant OR neuroprosthetic OR neuromodulation OR neuroengineering)' },
  isro: { label: 'ISRO', query: '(ISRO OR Indian Space Research Organisation)' },
  space: { label: 'Space Tech', query: '("Indian spacetech" OR "India space tech" OR "space technology India" OR satellite India OR propulsion India OR private space company India)' },
  startups: { label: 'Deep Tech Startups', query: '("deep tech startup India" OR "deeptech startup India" OR "AI startup India" OR "robotics startup India" OR "semiconductor startup India" OR "defence tech startup India" OR "climate tech startup India" OR "medtech startup India")' },
  evs: { label: 'Electric vehicles', query: '(electric vehicle India OR EV battery OR electric mobility)' },
  glp: { label: 'GLP-1 & diabetes', query: '(GLP-1 OR diabetes drug OR semaglutide OR tirzepatide)' },
  cancer: { label: 'Cancer research', query: '(cancer treatment breakthrough OR cancer clinical trial OR oncology research)' },
  robotics: { label: 'Humanoids & robotics', query: '(humanoid robot OR robotics breakthrough OR industrial robotics)' },
  drones: { label: 'Drone Tech', query: '(drone technology OR UAV innovation OR drone startup)' },
  metro: { label: 'India metro development', query: '(India metro rail development OR metro corridor India)' },
  markets: { label: 'India market movers', query: '(India stock market major impact OR Sensex major move OR Nifty major move OR RBI market impact)' },
  semiconductors: { label: 'Electronics & chips', query: '(India semiconductor manufacturing OR chip fab India OR electronics manufacturing India)' },
  commodities: { label: 'Strategic commodities', query: '(gold silver copper uranium rare earth prices market)' },
  fertility: { label: 'IVF & fertility tech', query: '(IVF technology OR fertility treatment innovation)' },
  hiv: { label: 'HIV research', query: '(HIV cure research OR HIV treatment trial)' },
  digital_wellbeing: { label: 'Digital wellbeing', query: '(doomscrolling OR brain rot OR social media mental health OR digital wellbeing)' },
  convenience_apps: { label: 'Convenience economy', query: '(Swiggy OR Zomato OR Blinkit OR quick commerce India)' },
  micronutrients: { label: 'Vitamins & minerals', query: '(vitamin D OR vitamin B12 OR iron deficiency OR magnesium health)' },
  travel: { label: 'Travel & luxury', query: '(luxury travel India OR luxury hospitality OR premium travel)' },
  cars: { label: 'New cars in India', query: '(new car launch India OR upcoming cars India)' },
  cricket: { label: 'Indian cricket', query: '(India cricket team OR IPL OR MS Dhoni)' },
  football: { label: 'Football, FIFA & Messi', query: '(FIFA OR Lionel Messi OR India football)' }
  , screen_releases: { label: 'Movies & series this week', query: '("movies releasing this week" OR "series releasing this week" OR "OTT releases this week" OR "new streaming this week" OR "new on Netflix this week" OR "new on Prime Video this week")' }
};

const BING_QUERIES = {
  ai: 'ChatGPT Claude Gemini AI', electrification: 'electrification battery grid',
  datacenter_cooling: 'data center cooling', wearables: 'wearable tech',
  temple: 'Temple Deepinder Goyal', bci: 'brain computer interface', neurotech: ['neurotechnology', 'brain computer interface', 'neural implant'],
  isro: 'ISRO', space: ['Indian spacetech', 'India space technology satellite propulsion'], startups: ['deep tech startups India', 'AI robotics semiconductor startup India'], evs: 'electric vehicle India',
  glp: 'GLP-1 diabetes', cancer: 'cancer breakthrough', robotics: 'humanoid robotics',
  drones: 'drone technology India', metro: 'India metro rail development', markets: 'India stock market major RBI',
  semiconductors: 'India semiconductor manufacturing', commodities: 'gold silver copper market',
  fertility: 'IVF technology', hiv: 'HIV cure research', digital_wellbeing: 'doomscrolling',
  convenience_apps: 'Swiggy Zomato Blinkit quick commerce', micronutrients: 'vitamin D supplements',
  travel: 'luxury travel India', cars: 'car launch India', cricket: 'India cricket',
  football: 'FIFA Messi football', screen_releases: 'OTT releases this week India'
};

const TRUSTED_DOMAINS = new Set([
  'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk', 'theguardian.com', 'ft.com',
  'bloomberg.com', 'cnbc.com', 'aljazeera.com', 'economist.com', 'forbes.com',
  'thehindu.com', 'indianexpress.com', 'economictimes.indiatimes.com', 'business-standard.com',
  'livemint.com', 'moneycontrol.com', 'ndtv.com', 'hindustantimes.com', 'deccanherald.com',
  'scroll.in', 'theprint.in', 'pib.gov.in', 'isro.gov.in', 'rbi.org.in', 'sebi.gov.in',
  'nasa.gov', 'esa.int', 'space.com', 'spacenews.com', 'techcrunch.com', 'theverge.com',
  'wired.com', 'arstechnica.com', 'technologyreview.com', 'ieee.org', 'spectrum.ieee.org',
  'nature.com', 'science.org', 'scientificamerican.com', 'nejm.org', 'thelancet.com',
  'bmj.com', 'who.int', 'nih.gov', 'cdc.gov', 'fda.gov', 'medicalnewstoday.com',
  'espncricinfo.com', 'espn.com', 'fifa.com', 'olympics.com', 'skysports.com',
  'autocarindia.com', 'carandbike.com', 'overdrive.in', 'autocar.co.uk'
  , 'datacenterdynamics.com', 'datacenterknowledge.com', 'networkworld.com', 'tomshardware.com',
  'servethehome.com', 'inc42.com', 'yourstory.com', 'entrackr.com', 'medianama.com', 'thehindubusinessline.com'
  , 'variety.com', 'hollywoodreporter.com', 'deadline.com', 'rottentomatoes.com', 'netflix.com',
  'primevideo.com', 'disneyplus.com', 'jiohotstar.com', 'ottplay.com', 'gadgets360.com',
  'wionews.com', 'm.economictimes.com', 'timesofindia.indiatimes.com', 'myvi.in', 'news18.com', 'aboutamazon.in'
  , 'digit.in', 'indiatoday.in', 'financialexpress.com', 'businesstoday.in', 'indiatimes.com', 'gqindia.com', 'vogue.in',
  'firstpost.com', 'indiatvnews.com', 'timesnownews.com', 'zeenews.india.com', 'outlookbusiness.com', 'cardekho.com', 'cartoq.com', 'thestar.com.my'
]);

const TRUSTED_SYNDICATED_SOURCES = /^(TechRadar|Tech Xplore|News18|Hindustan Times|Mint|Zee News|The Economic Times|Business Standard|NDTV|India Today|Times Now|Reuters)(?:\s+on MSN)?$/i;

const PREVIEW_SOURCES = {
  ai: ['Reuters', 'https://www.reuters.com/technology/'], electrification: ['IEEE Spectrum', 'https://spectrum.ieee.org/'],
  isro: ['ISRO', 'https://www.isro.gov.in/'], space: ['SpaceNews', 'https://spacenews.com/'], startups: ['Inc42', 'https://inc42.com/'],
  semiconductors: ['The Hindu', 'https://www.thehindu.com/sci-tech/technology/'], robotics: ['MIT Technology Review', 'https://www.technologyreview.com/'],
  markets: ['Reuters', 'https://www.reuters.com/markets/asia/'], glp: ['Nature', 'https://www.nature.com/subjects/diabetes'],
  neurotech: ['Nature', 'https://www.nature.com/subjects/neuroscience'],
  screen_releases: ['Variety', 'https://variety.com/'],
  evs: ['Autocar India', 'https://www.autocarindia.com/'], cancer: ['Nature', 'https://www.nature.com/subjects/cancer'],
  cricket: ['ESPNcricinfo', 'https://www.espncricinfo.com/'], football: ['FIFA', 'https://www.fifa.com/']
};

function previewArticles(requested) {
  const topics = [...requested, ...Object.keys(PREVIEW_SOURCES)].filter((topic, index, list) => TOPICS[topic] && list.indexOf(topic) === index).slice(0, 12);
  const patterns = [
    'Your live {topic} briefing will lead with the strongest trusted report',
    'Source transparency stays visible on every {topic} story',
    'Fresh, credible {topic} reporting—without the noise'
  ];
  return topics.flatMap((topic, topicIndex) => patterns.slice(0, topicIndex < 3 ? 2 : 1).map((pattern, index) => {
    const [source, sourceUrl] = PREVIEW_SOURCES[topic] || ['Reuters', 'https://www.reuters.com/'];
    return {
      id: `preview-${topic}-${index}`,
      title: pattern.replace('{topic}', TOPICS[topic].label),
      url: sourceUrl,
      source,
      sourceUrl,
      publisherDomain: domainFrom(sourceUrl),
      publishedAt: new Date(Date.now() - (topicIndex * 37 + index * 19 + 8) * 60_000).toISOString(),
      topic,
      topicLabel: TOPICS[topic].label,
      live: false
    };
  }));
}

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
}

function domainFrom(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); }
  catch { return ''; }
}

function trustedDomain(domain) {
  return [...TRUSTED_DOMAINS].some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
}

function cleanTitle(title, source) {
  const suffix = source ? new RegExp(`\\s+-\\s+${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') : null;
  return suffix ? title.replace(suffix, '').trim() : title;
}

function directBingUrl(link) {
  const decoded = decodeXml(link);
  try {
    const parsed = new URL(decoded);
    const target = /(^|\.)bing\.com$/i.test(parsed.hostname) ? parsed.searchParams.get('url') : null;
    return target || decoded;
  } catch {
    return decoded;
  }
}

function cleanArticleSummary(value) {
  const text = decodeXml(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\bhttps?:\/\/\S+\s*(?:Copy\s*)?/gi, '')
    .replace(/\s+/g, ' ').trim();
  if (text.length < 45) return '';
  const sourceWasClipped = /(?:\.{3}|…)\s*$/.test(text);
  const unclipped = text.replace(/(?:\.{3}|…)\s*$/, '').trim();
  if (sourceWasClipped) {
    const completeSentence = Math.max(unclipped.lastIndexOf('. '), unclipped.lastIndexOf('? '), unclipped.lastIndexOf('! '));
    if (completeSentence >= 100) return polishSummaryEnding(unclipped.slice(0, completeSentence + 1).trim());
  }
  if (unclipped.length <= 620) return polishSummaryEnding(unclipped);
  const clipped = unclipped.slice(0, 620);
  const sentenceEnd = Math.max(clipped.lastIndexOf('. '), clipped.lastIndexOf('? '), clipped.lastIndexOf('! '));
  if (sentenceEnd >= 220) return polishSummaryEnding(clipped.slice(0, sentenceEnd + 1).trim());
  const wordEnd = clipped.lastIndexOf(' ');
  return polishSummaryEnding(clipped.slice(0, wordEnd > 480 ? wordEnd : 600));
}

function polishSummaryEnding(value) {
  let text = String(value || '').replace(/\s+/g, ' ').trim();
  text = text.replace(/(?:\.{3}|…)\s*$/, '').trim();
  text = text.replace(/[,:;\-\s]+$/g, '').trim();
  text = text.replace(/\b(?:and|or|but|with|for|to|of|in|on|at|by|from|including|such as|as)\s*$/i, '').trim();
  text = text.replace(/[,:;\-\s]+$/g, '').trim();
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function articleIsRecent(article) {
  const published = new Date(article.publishedAt).getTime();
  return Number.isFinite(published) && published >= Date.now() - MAX_NEWS_AGE_MS;
}

function articleMatchesTopic(article, topic) {
  const title = article.title;
  if (topic === 'ai') {
    if (/horoscope|astrology|zodiac|tarot|Assassin['’]s Creed|Ubisoft|Claude Guillemot|plane crash/i.test(title)) return false;
    if (/\b(ChatGPT|OpenAI|Anthropic|DeepMind|LLM|large language model|artificial intelligence|AI model|AI agent)\b/i.test(title)) return true;
    if (/\bGemini\b/i.test(title)) return true;
    if (/\bClaude\b/i.test(title) && /\b(AI|model|chatbot|Anthropic|Code|Opus|Sonnet|Haiku|agent|coding|memory|API|voice|web search)\b/i.test(title)) return true;
    return false;
  }
  if (topic === 'markets') return /RBI|interest rate|rate cut|rate hike|budget|war|tariff|sanction|crash|plunge|surge|record (high|low)|election|oil shock|rupee|inflation|GDP|recession|trade deal/i.test(title);
  if (topic === 'datacenter_cooling') return /data cent(er|re)|AI hardware|liquid cooling|immersion cooling|cold plate|direct-to-chip/i.test(title);
  if (topic === 'temple') return /Temple|Deepinder Goyal/i.test(title);
  if (topic === 'space') return !/\bISRO\b|Indian Space Research Organisation/i.test(title)
    && /space|spacetech|satellite|rocket|launch vehicle|propulsion|payload|orbit|private space/i.test(title);
  if (topic === 'startups') return /deep[\s-]?tech|deeptech|AI startup|robotics startup|semiconductor startup|defen[cs]e tech|climate tech|medtech|biotech|quantum startup|space tech startup|spacetech startup/i.test(title);
  if (topic === 'screen_releases') return /(OTT|streaming).*(release|watch)|(?:release|new).*(?:this week|weekend).*(Netflix|Prime Video|JioHotstar|ZEE5|movies?|shows?)|(?:movies?|films?|shows?).*(?:releasing|to watch|this week)/i.test(title);
  return true;
}

const TITLE_STOP_WORDS = new Set('a an and are as at be been by for from has have in into is it its of on or that the this to was were will with world news today latest update company maker'.split(' '));
const GENERIC_ENTITY_TOKENS = new Set('indian india market markets startup startups technology technologies government company companies business series season release releases cricket football update updates official source sources video watch live latest today report reports news model models people says said after before first amid across record major minor'.split(' '));

function storyTokens(title) {
  return title.toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/co[\s-]?founder/g, 'founder')
    .replace(/\b(killed|dies|died|dead|death)\b/g, 'death')
    .replace(/\b(launches|launched|launching|unveils|unveiled|releases|released)\b/g, 'launch')
    .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
    .filter((word) => (word.length > 1 || /^\d+$/.test(word)) && !TITLE_STOP_WORDS.has(word));
}

function storyCoreTokens(title) {
  const focused = title
    .replace(/^\s*(video|watch|photos?|explained|live)\s*\|\s*/i, '')
    .split(/\s+[|]\s+|:\s+|,\s+/)[0];
  return storyTokens(focused);
}

function articleTokenSet(article) {
  return new Set(storyTokens(`${article.title} ${article.summary || ''}`));
}

function entityLikeTokens(article) {
  return new Set([...articleTokenSet(article)].filter((token) => token.length >= 7 && !GENERIC_ENTITY_TOKENS.has(token)));
}

function sameEntityEvent(left, right) {
  if (left.topic !== right.topic) return false;
  const timeGap = Math.abs(new Date(left.publishedAt) - new Date(right.publishedAt));
  if (timeGap > 3 * 24 * 60 * 60 * 1000) return false;
  const leftEntities = entityLikeTokens(left);
  const rightEntities = entityLikeTokens(right);
  let sharedEntities = 0;
  leftEntities.forEach((token) => { if (rightEntities.has(token)) sharedEntities += 1; });
  if (!sharedEntities) return false;
  const eventA = articleTokenSet(left);
  const eventB = articleTokenSet(right);
  let sharedEvent = 0;
  eventA.forEach((token) => { if (eventB.has(token) && !GENERIC_ENTITY_TOKENS.has(token)) sharedEvent += 1; });
  return sharedEvent >= 4;
}

function sameStory(left, right) {
  if (left.url && left.url === right.url) return true;
  if (sameEntityEvent(left, right)) return true;
  const a = new Set(storyTokens(left.title));
  const b = new Set(storyTokens(right.title));
  if (!a.size || !b.size) return false;
  const coreA = storyCoreTokens(left.title);
  const coreB = storyCoreTokens(right.title);
  if (coreA.length >= 4 && coreB.length >= 4 && coreA.join(' ') === coreB.join(' ')) return true;
  let shared = 0;
  a.forEach((token) => { if (b.has(token)) shared += 1; });
  if (shared >= 4 && shared / Math.min(a.size, b.size) >= 0.4) return true;

  const eventA = new Set(storyTokens(`${left.title} ${left.summary || ''}`).filter((token) => token.length >= 4));
  const eventB = new Set(storyTokens(`${right.title} ${right.summary || ''}`).filter((token) => token.length >= 4));
  let eventShared = 0;
  eventA.forEach((token) => { if (eventB.has(token)) eventShared += 1; });
  const timeGap = Math.abs(new Date(left.publishedAt) - new Date(right.publishedAt));
  return timeGap <= 4 * 24 * 60 * 60 * 1000
    && eventShared >= 8
    && eventShared / Math.min(eventA.size, eventB.size) >= 0.46;
}

function deduplicateStories(articles) {
  const unique = [];
  articles
    .filter(articleIsRecent)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .forEach((article) => {
      if (!unique.some((existing) => sameStory(article, existing))) unique.push(article);
    });
  return unique;
}

function parseFeed(xml, topic, days) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  return items.map((item) => {
    const url = directBingUrl(textBetween(item, 'link'));
    const publisherDomain = domainFrom(url);
    const source = textBetween(item, 'News:Source') || publisherDomain;
    const trustedSyndication = (publisherDomain === 'msn.com' || publisherDomain.endsWith('.msn.com')) && TRUSTED_SYNDICATED_SOURCES.test(source);
    if (!trustedDomain(publisherDomain) && !trustedSyndication) return null;
    let sourceUrl = '';
    try { sourceUrl = new URL(url).origin; } catch {}
    const publishedAt = textBetween(item, 'pubDate');
    const date = new Date(publishedAt);
    if (Number.isNaN(date.getTime())) return null;
    if (date.getTime() < Date.now() - days * 24 * 60 * 60 * 1000) return null;
    const summary = cleanArticleSummary(textBetween(item, 'description'));
    if (!summary) return null;
    return {
      id: Buffer.from(`${topic}:${url}`).toString('base64url').slice(0, 32),
      title: cleanTitle(textBetween(item, 'title'), source),
      url,
      source,
      sourceUrl,
      publisherDomain,
      publishedAt: date.toISOString(),
      topic,
      topicLabel: TOPICS[topic].label,
      summary,
      summaryKind: 'publisher_excerpt',
      live: true
    };
  }).filter(Boolean)
    .filter(articleIsRecent)
    .filter((article) => articleMatchesTopic(article, topic));
}

async function fetchFeedWindow(topic, days) {
  const config = TOPICS[topic];
  const searchTerms = BING_QUERIES[topic] || config.query.replace(/[()\"]/g, ' ').replace(/\bOR\b/gi, ' ').replace(/\s+/g, ' ').trim();
  const queries = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  const settled = await Promise.allSettled(queries.map(async (query) => {
    const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=RSS&setlang=en-in`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SignalPersonalNews/1.0 (+personal reader)' },
      signal: AbortSignal.timeout(9000)
    });
    if (!response.ok) throw new Error(`News feed returned ${response.status}`);
    return parseFeed(await response.text(), topic, days);
  }));
  const articles = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  if (!articles.length && settled.every((result) => result.status === 'rejected')) throw settled[0].reason;
  return deduplicateStories(articles).slice(0, 18);
}

async function fetchTopic(topic) {
  const existing = cache.get(topic);
  if (existing && Date.now() - existing.time < CACHE_TTL) return existing.articles;

  try {
    const available = await fetchFeedWindow(topic, 14);
    let articles = available.filter((article) => Date.now() - new Date(article.publishedAt).getTime() <= RECENT_NEWS_AGE_MS);
    let fallbackDays = null;
    if (!articles.length) {
      articles = available;
      fallbackDays = 14;
    }
    articles = articles.map((article) => {
      const isOlderFallback = Boolean(fallbackDays) && Date.now() - new Date(article.publishedAt).getTime() > RECENT_NEWS_AGE_MS;
      return { ...article, latestAvailable: isOlderFallback, fallbackDays: isOlderFallback ? fallbackDays : null };
    });
    cache.set(topic, { time: Date.now(), articles });
    return articles;
  } catch (error) {
    if (existing?.articles?.length) {
      return existing.articles.filter(articleIsRecent).map((article) => ({ ...article, latestAvailable: true, stale: true }));
    }
    throw error;
  }
}

async function handleNews(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = (url.searchParams.get('topics') || 'ai,electrification,isro,semiconductors,markets,robotics')
    .split(',').filter((topic) => TOPICS[topic]).slice(0, 8);
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get('limit')) || 36));
  const forceRefresh = url.searchParams.get('refresh') === '1';

  if (forceRefresh) requested.forEach((topic) => cache.delete(topic));

  if (url.searchParams.get('preview') === '1') {
    return sendJson(res, 200, {
      articles: previewArticles(requested).slice(0, limit),
      meta: { requestedTopics: requested, trustedPublisherCount: TRUSTED_DOMAINS.size, fetchedAt: new Date().toISOString(), partial: false, preview: true, failedFeeds: 0, cacheSeconds: CACHE_TTL / 1000 }
    });
  }

  const settled = await Promise.allSettled(requested.map(fetchTopic));
  const articles = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const failures = settled.filter((result) => result.status === 'rejected').length;
  const failureReasons = settled
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason?.message || 'Unknown feed error');
  const unique = deduplicateStories(articles).slice(0, limit);

  sendJson(res, 200, {
    articles: unique,
    meta: {
      requestedTopics: requested,
      trustedPublisherCount: TRUSTED_DOMAINS.size,
      fetchedAt: new Date().toISOString(),
      partial: failures > 0,
      failedFeeds: failures,
      failureReasons,
      forced: forceRefresh,
      latestAvailableCount: unique.filter((article) => article.latestAvailable).length,
      cacheSeconds: CACHE_TTL / 1000
    }
  });
}

function weatherCondition(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorms';
  return 'Variable weather';
}

async function reverseGeocode(latitude, longitude) {
  const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
  const response = await fetch(reverseUrl, {
    headers: { 'User-Agent': 'SignalPersonalNews/1.0 (https://github.com/abhishekch08/signal-personal-news)' },
    signal: AbortSignal.timeout(7000)
  });
  if (!response.ok) throw new Error('Location lookup unavailable');
  const result = await response.json();
  const address = result.address || {};
  const locality = address.city || address.town || address.village || address.municipality || address.county || address.state_district;
  const region = address.state;
  return [...new Set([locality, region].filter(Boolean))].join(', ') || result.name || null;
}

const CPCB_AQI_BANDS = {
  'PM2.5': [[0, 30, 0, 50], [31, 60, 51, 100], [61, 90, 101, 200], [91, 120, 201, 300], [121, 250, 301, 400], [251, 500, 401, 500]],
  PM10: [[0, 50, 0, 50], [51, 100, 51, 100], [101, 250, 101, 200], [251, 350, 201, 300], [351, 430, 301, 400], [431, 600, 401, 500]],
  NO2: [[0, 40, 0, 50], [41, 80, 51, 100], [81, 180, 101, 200], [181, 280, 201, 300], [281, 400, 301, 400], [401, 800, 401, 500]],
  SO2: [[0, 40, 0, 50], [41, 80, 51, 100], [81, 380, 101, 200], [381, 800, 201, 300], [801, 1600, 301, 400], [1601, 2400, 401, 500]],
  CO: [[0, 1, 0, 50], [1.1, 2, 51, 100], [2.1, 10, 101, 200], [10.1, 17, 201, 300], [17.1, 34, 301, 400], [34.1, 50, 401, 500]],
  OZONE: [[0, 50, 0, 50], [51, 100, 51, 100], [101, 168, 101, 200], [169, 208, 201, 300], [209, 748, 301, 400], [749, 1000, 401, 500]],
  O3: [[0, 50, 0, 50], [51, 100, 51, 100], [101, 168, 101, 200], [169, 208, 201, 300], [209, 748, 301, 400], [749, 1000, 401, 500]]
};

function cpcbSubIndex(pollutant, concentration) {
  const bands = CPCB_AQI_BANDS[String(pollutant || '').toUpperCase()];
  if (concentration === null || concentration === undefined || concentration === '') return null;
  const value = Number(concentration);
  if (!bands || !Number.isFinite(value) || value < 0) return null;
  const band = bands.find(([low, high]) => value >= low && value <= high) || bands[bands.length - 1];
  const [low, high, indexLow, indexHigh] = band;
  if (value > high) return 500;
  return Math.max(0, Math.min(500, Math.round(((indexHigh - indexLow) / (high - low)) * (value - low) + indexLow)));
}

function recentHourlyAverage(hourly, field, currentTime, hours = 24) {
  if (!hourly?.time || !Array.isArray(hourly[field])) return null;
  let index = hourly.time.findIndex((time) => time === currentTime);
  if (index < 0) index = hourly.time.findIndex((time) => time > currentTime) - 1;
  if (index < 0) index = hourly.time.length - 1;
  const values = [];
  for (let cursor = Math.max(0, index - hours + 1); cursor <= index; cursor += 1) {
    const value = Number(hourly[field][cursor]);
    if (Number.isFinite(value)) values.push(value);
  }
  if (!values.length) return null;
  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseIndianTimestamp(value) {
  const match = String(value || '').match(/(\d{2})[-/](\d{2})[-/](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const [, day, month, year, hour, minute, second = '00'] = match;
  const date = new Date(`${year}-${month}-${day}T${hour.padStart(2, '0')}:${minute}:${second}+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formattedArea(address = {}) {
  return [address.suburb || address.neighbourhood, address.city || address.town || address.village || address.county, address.state]
    .filter(Boolean);
}

function normalizeLocationName(name, area, fallback) {
  return [...new Set([name || fallback, ...area].filter(Boolean))].slice(0, 3).join(', ');
}

async function googleGeocode(query, latitude, longitude) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  searchUrl.searchParams.set('address', query);
  searchUrl.searchParams.set('components', 'country:IN');
  searchUrl.searchParams.set('key', apiKey);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const delta = 0.18;
    searchUrl.searchParams.set('bounds', `${latitude - delta},${longitude - delta}|${latitude + delta},${longitude + delta}`);
  }
  const response = await fetch(searchUrl, { signal: AbortSignal.timeout(9000) });
  if (!response.ok) return null;
  const payload = await response.json();
  if (payload.status !== 'OK' || !Array.isArray(payload.results)) return null;
  return payload.results.slice(0, 6).map((item) => {
    const components = item.address_components || [];
    const component = (type) => components.find((entry) => entry.types?.includes(type))?.long_name;
    const name = component('premise') || component('point_of_interest') || component('establishment') || component('route') || component('sublocality') || query;
    const area = [component('sublocality_level_1') || component('sublocality'), component('locality') || component('administrative_area_level_2'), component('administrative_area_level_1')]
      .filter(Boolean);
    return {
      name: normalizeLocationName(name, area, query),
      displayName: item.formatted_address,
      lat: item.geometry?.location?.lat,
      lon: item.geometry?.location?.lng,
      provider: 'google'
    };
  }).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
}

async function googlePlaceDetails(placeId, apiKey) {
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('fields', 'name,formatted_address,geometry');
  detailsUrl.searchParams.set('key', apiKey);
  const response = await fetch(detailsUrl, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) return null;
  const payload = await response.json();
  if (payload.status !== 'OK' || !payload.result) return null;
  const result = payload.result;
  return {
    name: result.name || result.formatted_address,
    displayName: result.formatted_address,
    lat: result.geometry?.location?.lat,
    lon: result.geometry?.location?.lng,
    provider: 'google'
  };
}

async function googlePlacesGeocode(query, latitude, longitude) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  searchUrl.searchParams.set('input', query);
  searchUrl.searchParams.set('components', 'country:in');
  searchUrl.searchParams.set('key', apiKey);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    searchUrl.searchParams.set('location', `${latitude},${longitude}`);
    searchUrl.searchParams.set('radius', '35000');
  }
  const response = await fetch(searchUrl, { signal: AbortSignal.timeout(7000) });
  if (!response.ok) return null;
  const payload = await response.json();
  if (payload.status !== 'OK' || !Array.isArray(payload.predictions)) return null;
  const details = await Promise.allSettled(payload.predictions.slice(0, 6).map((item) => googlePlaceDetails(item.place_id, apiKey)));
  return details
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map((result) => result.value)
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
}

async function nominatimGeocode(query, latitude, longitude) {
  const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
  searchUrl.searchParams.set('format', 'jsonv2');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('limit', '6');
  searchUrl.searchParams.set('addressdetails', '1');
  searchUrl.searchParams.set('countrycodes', 'in');
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const delta = 0.18;
    searchUrl.searchParams.set('viewbox', `${longitude - delta},${latitude + delta},${longitude + delta},${latitude - delta}`);
    searchUrl.searchParams.set('bounded', '0');
  }
  const response = await fetch(searchUrl, {
    headers: { 'User-Agent': 'SignalPersonalNews/1.0 (https://github.com/abhishekch08/signal-personal-news)' },
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error('Location search unavailable');
  const payload = await response.json();
  const results = (Array.isArray(payload) ? payload : []).map((item) => {
    const address = item.address || {};
    const name = item.name || address.building || address.office || address.suburb || address.city || address.town || address.village || query;
    const area = formattedArea(address);
    return {
      name: normalizeLocationName(name, area, query),
      displayName: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
      provider: 'osm'
    };
  }).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
  return results;
}

async function handleGeocode(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = String(url.searchParams.get('q') || '').trim().slice(0, 120);
  const latitude = Number(url.searchParams.get('lat'));
  const longitude = Number(url.searchParams.get('lon'));
  if (query.length < 2) return sendJson(res, 400, { error: 'Enter a place or landmark.' });
  let googleResults = await googlePlacesGeocode(query, latitude, longitude).catch(() => null);
  if (!googleResults?.length) googleResults = await googleGeocode(query, latitude, longitude).catch(() => null);
  const results = googleResults?.length ? googleResults : await nominatimGeocode(query, latitude, longitude);
  sendJson(res, 200, { results, provider: googleResults?.length ? 'google' : 'osm' });
}

async function fetchCpcbStationAqi(latitude, longitude, place) {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) return null;
  const city = String(place || '').split(',')[0].trim();
  const endpoint = new URL('https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69');
  endpoint.searchParams.set('api-key', apiKey);
  endpoint.searchParams.set('format', 'json');
  endpoint.searchParams.set('limit', '1000');
  if (city) endpoint.searchParams.set('filters[city]', city);
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const payload = await response.json();
  const records = Array.isArray(payload.records) ? payload.records : [];
  const stations = new Map();
  records.forEach((record) => {
    const stationName = record.station || record.station_name;
    if (!stationName) return;
    const key = `${stationName}|${record.latitude || ''}|${record.longitude || ''}`;
    const station = stations.get(key) || { name: stationName, latitude: Number(record.latitude), longitude: Number(record.longitude), readings: [], updatedAt: null };
    const pollutant = String(record.pollutant_id || '').toUpperCase();
    const concentration = Number(record.pollutant_avg);
    const subIndex = cpcbSubIndex(pollutant, concentration);
    if (subIndex !== null) station.readings.push({ pollutant, concentration, subIndex });
    const observed = parseIndianTimestamp(record.last_update);
    if (observed && (!station.updatedAt || observed > station.updatedAt)) station.updatedAt = observed;
    stations.set(key, station);
  });
  const viable = [...stations.values()].filter((station) => station.readings.length && station.updatedAt && Date.now() - station.updatedAt.getTime() < 8 * 60 * 60 * 1000);
  if (!viable.length) return null;
  viable.forEach((station) => {
    station.distance = Number.isFinite(station.latitude) && Number.isFinite(station.longitude)
      ? distanceKm(latitude, longitude, station.latitude, station.longitude)
      : Number.POSITIVE_INFINITY;
  });
  viable.sort((left, right) => left.distance - right.distance);
  const station = viable[0];
  const strongest = station.readings.reduce((best, reading) => reading.subIndex > best.subIndex ? reading : best);
  const pm25Reading = station.readings.find((reading) => reading.pollutant === 'PM2.5');
  const pm10Reading = station.readings.find((reading) => reading.pollutant === 'PM10');
  return {
    aqi: strongest.subIndex,
    pm25: pm25Reading?.concentration ?? null,
    pm10: pm10Reading?.concentration ?? null,
    station: station.name,
    distanceKm: Number.isFinite(station.distance) ? Math.round(station.distance * 10) / 10 : null,
    updatedAt: station.updatedAt.toISOString(),
    dominantPollutant: strongest.pollutant
  };
}

async function handleWeather(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const latitude = Number(url.searchParams.get('lat') || 28.6139);
  const longitude = Number(url.searchParams.get('lon') || 77.2090);
  const place = String(url.searchParams.get('name') || 'New Delhi').slice(0, 60);
  const requestedAccuracy = Number(url.searchParams.get('accuracy'));
  const accuracyMeters = Number.isFinite(requestedAccuracy) && requestedAccuracy > 0 ? Math.round(requestedAccuracy) : null;
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return sendJson(res, 400, { error: 'Invalid coordinates' });
  }
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  if (url.searchParams.get('refresh') === '1') weatherCache.delete(key);
  const existing = weatherCache.get(key);
  if (existing && Date.now() - existing.time < WEATHER_CACHE_TTL) return sendJson(res, 200, existing.data);

  try {
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&hourly=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&past_days=1&forecast_days=1&timezone=auto`;
    const locationPromise = place.toLowerCase() === 'current location'
      ? reverseGeocode(latitude, longitude).catch(() => null)
      : Promise.resolve(place);
    const [forecastResponse, airResponse, resolvedPlace] = await Promise.all([
      fetch(forecastUrl, { signal: AbortSignal.timeout(15000) }),
      fetch(airUrl, { signal: AbortSignal.timeout(15000) }).catch(() => null),
      locationPromise
    ]);
    if (!forecastResponse.ok) throw new Error('Weather provider unavailable');
    const forecast = await forecastResponse.json();
    const air = airResponse?.ok ? await airResponse.json().catch(() => null) : null;
    const currentHour = `${forecast.current.time.slice(0, 13)}:00`;
    let rainIndex = forecast.hourly.time.indexOf(currentHour);
    if (rainIndex < 0) rainIndex = forecast.hourly.time.findIndex((time) => time > forecast.current.time);
    if (rainIndex < 0) rainIndex = 0;
    const rainWindow = forecast.hourly.precipitation_probability.slice(rainIndex, rainIndex + 3)
      .map((value) => Number(value)).filter(Number.isFinite);
    const pm25Value = air?.current?.pm2_5;
    const pm25Current = pm25Value !== null && pm25Value !== undefined && Number.isFinite(Number(pm25Value))
      ? Math.round(Number(pm25Value) * 10) / 10
      : null;
    const pm10Value = air?.current?.pm10;
    const pm10Current = pm10Value !== null && pm10Value !== undefined && Number.isFinite(Number(pm10Value))
      ? Math.round(Number(pm10Value) * 10) / 10
      : null;
    const airHour = air?.current?.time ? `${air.current.time.slice(0, 13)}:00` : currentHour;
    const pm25 = recentHourlyAverage(air?.hourly, 'pm2_5', airHour, 24) ?? pm25Current;
    const pm10 = recentHourlyAverage(air?.hourly, 'pm10', airHour, 24) ?? pm10Current;
    const cpcbStation = await fetchCpcbStationAqi(latitude, longitude, resolvedPlace || place).catch(() => null);
    const modelReadings = [
      ['PM2.5', pm25], ['PM10', pm10]
    ].map(([pollutant, concentration]) => ({ pollutant, subIndex: cpcbSubIndex(pollutant, concentration) }))
      .filter((reading) => reading.subIndex !== null);
    const pm25Reading = modelReadings.find((reading) => reading.pollutant === 'PM2.5');
    const modelDominant = pm25Reading || modelReadings.reduce((best, reading) => !best || reading.subIndex > best.subIndex ? reading : best, null);
    const modelAqi = modelDominant?.subIndex ?? null;
    const selectedAqi = cpcbStation?.aqi ?? modelAqi;
    const aqiSourceType = cpcbStation ? 'cpcb_station' : (modelAqi !== null ? 'model_estimate' : 'unavailable');
    const data = {
      place,
      resolvedPlace: resolvedPlace || place,
      latitude,
      longitude,
      accuracyMeters,
      temperature: Math.round(forecast.current.temperature_2m),
      feelsLike: Math.round(forecast.current.apparent_temperature),
      condition: weatherCondition(forecast.current.weather_code),
      weatherCode: forecast.current.weather_code,
      rainChance: rainWindow.length ? Math.max(...rainWindow) : Math.round(forecast.hourly.precipitation_probability[rainIndex] || 0),
      aqi: selectedAqi,
      aqiDisplay: selectedAqi === null ? '--' : String(selectedAqi),
      aqiRaw: selectedAqi,
      aqiBeyondScale: false,
      aqiOfficialMax: 500,
      aqiScale: 'India AQI',
      aqiModelEstimate: aqiSourceType === 'model_estimate',
      aqiSourceType,
      aqiStation: cpcbStation?.station || null,
      aqiStationDistanceKm: cpcbStation?.distanceKm ?? null,
      dominantPollutant: cpcbStation?.dominantPollutant || modelDominant?.pollutant || null,
      pm25: cpcbStation?.pm25 ?? pm25,
      pm10: cpcbStation?.pm10 ?? pm10,
      aqiModelDistanceKm: air && Number.isFinite(Number(air.latitude)) && Number.isFinite(Number(air.longitude))
        ? Math.round(distanceKm(latitude, longitude, Number(air.latitude), Number(air.longitude)) * 10) / 10
        : null,
      updatedAt: cpcbStation?.updatedAt || new Date().toISOString(),
      provider: cpcbStation ? 'CPCB via data.gov.in' : (modelAqi !== null ? 'Open-Meteo CAMS PM2.5 24h estimate on CPCB scale' : 'AQI temporarily unavailable'),
      sourceUrl: cpcbStation
        ? 'https://www.data.gov.in/resource/real-time-air-quality-index-various-locations'
        : 'https://airquality.cpcb.gov.in/AQI_India/'
    };
    weatherCache.set(key, { time: Date.now(), data });
    sendJson(res, 200, data);
  } catch (error) {
    if (existing?.data) return sendJson(res, 200, { ...existing.data, stale: true });
    sendJson(res, 503, { error: 'Live weather is temporarily unavailable.' });
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  const urlPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) return sendJson(res, 403, { error: 'Forbidden' });
  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === 'ENOENT') return serveIndex(res);
      res.writeHead(500); return res.end('Server error');
    }
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
    res.writeHead(200, {
      'Content-Type': `${types[ext] || 'application/octet-stream'}; charset=utf-8`,
      'Cache-Control': 'no-cache, must-revalidate'
    });
    res.end(data);
  });
}

function serveIndex(res) {
  fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (error, data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
  if (req.url === '/api/health') return sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
  if (req.url.startsWith('/api/news')) return handleNews(req, res).catch((error) => sendJson(res, 503, { error: 'Live news is temporarily unavailable.', detail: error.message }));
  if (req.url.startsWith('/api/weather')) return handleWeather(req, res);
  if (req.url.startsWith('/api/geocode')) return handleGeocode(req, res).catch((error) => sendJson(res, 503, { error: 'Location search is temporarily unavailable.', detail: error.message }));
  if (req.url === '/api/topics') return sendJson(res, 200, { topics: TOPICS, trustedPublisherCount: TRUSTED_DOMAINS.size });
  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Signal is reading on http://${HOST}:${PORT}`);
});
