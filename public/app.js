const TOPIC_GROUPS = {
  'AI & Compute': [
    ['ai', 'AI labs & models'], ['datacenter_cooling', 'Data center cooling'],
    ['semiconductors', 'Electronics & chips'], ['robotics', 'Humanoids & robotics']
  ],
  'NeuroTech & BCI': [
    ['neurotech', 'NeuroTech & brain–computer interfaces'],
    ['temple', 'Temple by Deepinder Goyal']
  ],
  'Personal Tech & Habits': [
    ['wearables', 'Wearable tech'], ['digital_wellbeing', 'Digital wellbeing'],
    ['convenience_apps', 'Convenience economy']
  ],
  'SpaceTech, Startups': [
    ['isro', 'ISRO'], ['space', 'Space Tech'], ['startups', 'Deep Tech Startups'], ['drones', 'Drone Tech']
  ],
  'Mobility & Cities': [
    ['electrification', 'Electrification'], ['evs', 'Electric vehicles'],
    ['metro', 'India metro development'], ['cars', 'New car launches']
  ],
  'Health & Longevity': [
    ['glp', 'GLP-1 & diabetes'], ['cancer', 'Cancer research'],
    ['fertility', 'IVF technology'], ['hiv', 'HIV research'], ['micronutrients', 'Vitamins & minerals']
  ],
  'Markets & Materials': [
    ['markets', 'Major India market movers'], ['commodities', 'Strategic commodities']
  ],
  'Life & Sport': [
    ['travel', 'Travel & luxury'], ['cricket', 'Indian cricket & Dhoni'], ['football', 'FIFA, Messi & football']
  ],
  'Movies & Series': [['screen_releases', 'Releasing this week']]
};

const GROUP_CODES = { 'AI & Compute': 'AI', 'NeuroTech & BCI': 'NX', 'Personal Tech & Habits': 'PH', 'SpaceTech, Startups': 'SS', 'Mobility & Cities': 'GO', 'Health & Longevity': 'HL', 'Markets & Materials': '₹', 'Life & Sport': 'LS', 'Movies & Series': '▶' };

const TOPIC_CONTEXT = {
  ai: 'Talent, model and product shifts at frontier labs can quickly reshape the AI competitive map.',
  electrification: 'Grid capacity, storage economics and industrial electrification determine how quickly clean power can scale.',
  datacenter_cooling: 'Cooling is becoming a hard constraint on AI compute density, water use and data-center expansion.',
  wearables: 'The next wearable cycle is moving from notifications toward continuous, clinically useful sensing.',
  temple: 'Deepinder Goyal’s new venture is a useful signal for where consumer health and preventive care may be heading.',
  neurotech: 'Neural sensing, stimulation, implants and brain–computer interfaces are turning neuroscience into practical medical technology.',
  isro: 'ISRO missions shape India’s strategic capability, commercial launch market and deep-space ambitions.',
  space: 'Space technology matters for satellites, launch systems, propulsion, payloads and strategic infrastructure.',
  startups: 'Deep-tech startups matter when their science or engineering can create durable advantages in AI, robotics, semiconductors, climate, defence or health.',
  evs: 'Battery cost, charging access and localization will decide the pace of India’s electric transition.',
  glp: 'GLP-1 research is changing diabetes and obesity care while raising major questions about access and long-term use.',
  cancer: 'The most important advances combine earlier detection, targeted treatment and evidence from human trials.',
  robotics: 'Humanoids are moving from polished demos toward the harder test: reliable work in real environments.',
  drones: 'Autonomy, regulation and manufacturing are turning drones into infrastructure rather than gadgets.',
  metro: 'Metro expansion changes commute time, land value and the economic geography of Indian cities.',
  markets: 'Only developments capable of moving broad Indian indices, sectors or capital flows qualify for this signal.',
  semiconductors: 'Fabs, packaging and component ecosystems are central to India’s manufacturing and strategic resilience.',
  commodities: 'Gold, copper, uranium and rare earths reveal shifts in risk, electrification and supply security.',
  fertility: 'Better lab methods and diagnostics could improve IVF outcomes while reducing physical and financial strain.',
  hiv: 'The signal to watch is durable remission or prevention backed by rigorous human evidence.',
  digital_wellbeing: 'Design choices that capture attention can quietly alter focus, mood and everyday agency.',
  convenience_apps: 'Quick commerce trades minutes saved for new habits, labor pressures and a different urban retail system.',
  micronutrients: 'Useful updates separate measured deficiencies and clinical evidence from supplement marketing.',
  travel: 'Premium travel demand is reshaping hospitality, aviation and the meaning of luxury for Indian consumers.',
  cars: 'New launches matter when they shift value, safety, technology or an important Indian segment.',
  cricket: 'Form, selection and tournament context matter more than the daily churn around the Indian team.',
  football: 'The focus is consequential movement around FIFA, Messi and the global game.'
  , screen_releases: 'A weekly watchlist of notable new films and series arriving in cinemas and on major streaming platforms.'
};

const TOPIC_CODES = { ai: 'AI', electrification: 'E+', datacenter_cooling: '°C', wearables: 'WR', temple: 'TM', bci: 'BCI', neurotech: 'NT', isro: 'ISRO', space: 'SP', startups: 'SU', evs: 'EV', glp: 'GLP', cancer: 'CR', robotics: 'RX', drones: 'DR', metro: 'M', markets: '₹', semiconductors: 'SI', commodities: 'AU', fertility: 'IVF', hiv: 'HIV', digital_wellbeing: 'DW', convenience_apps: '10′', micronutrients: 'D3', travel: 'LX', cars: 'CAR', cricket: 'IND', football: '10', screen_releases: '▶' };

const TOPIC_HUES = { ai: 9, electrification: 145, datacenter_cooling: 195, wearables: 278, temple: 33, bci: 318, neurotech: 286, isro: 21, space: 232, startups: 38, evs: 116, glp: 171, cancer: 345, robotics: 260, drones: 201, metro: 42, markets: 8, semiconductors: 205, commodities: 45, fertility: 329, hiv: 355, digital_wellbeing: 265, convenience_apps: 24, micronutrients: 72, travel: 188, cars: 12, cricket: 220, football: 161, screen_releases: 352 };

const DEFAULT_TOPICS = Object.values(TOPIC_GROUPS).flat().map(([id]) => id);
const TOPIC_LABELS = new Map(Object.values(TOPIC_GROUPS).flat().map(([id, label]) => [id, label]));
const HOME_EXCLUDED_TOPICS = new Set(['screen_releases']);
const storedTopicsRaw = JSON.parse(localStorage.getItem('signal-topics') || 'null');
const storedTopics = storedTopicsRaw
  ? [...new Set(storedTopicsRaw.map((topic) => topic === 'bci' ? 'neurotech' : topic))]
  : null;
const storedArticles = JSON.parse(localStorage.getItem('signal-last-articles') || '[]').map((article) => {
  const topic = article.topic === 'bci' ? 'neurotech' : article.topic;
  return { ...article, topic, topicLabel: TOPIC_LABELS.get(topic) || article.topicLabel };
});
const state = {
  articles: [], visible: 8, activeTopic: null, loading: true,
  requestId: 0, retryTimer: null, emptyKind: 'network',
  selectedTopics: storedTopics ? [...new Set([...storedTopics, 'neurotech', 'isro', 'space', 'startups', 'drones', 'screen_releases'])] : DEFAULT_TOPICS,
  saved: JSON.parse(localStorage.getItem('signal-saved') || '[]'),
  lastArticles: storedArticles,
  weatherLocation: JSON.parse(localStorage.getItem('signal-weather-location') || 'null') || { lat: 28.6139, lon: 77.2090, name: 'New Delhi' }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let weatherSearchTimer = null;

function relativeTime(dateString) {
  const seconds = Math.max(0, (Date.now() - new Date(dateString)) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function initials(name) {
  return name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
}

function allTopicEntries() { return Object.values(TOPIC_GROUPS).flat(); }
function topicLabel(slug) { return TOPIC_LABELS.get(slug) || slug; }

function buildTopicNav() {
  const nav = $('#topicNav');
  nav.innerHTML = '';
  const home = document.createElement('button');
  home.className = `topic-button home-topic ${state.activeTopic ? '' : 'active'}`;
  home.innerHTML = '<span class="topic-glyph">✦</span><span>Today’s briefing</span><small>LIVE</small>';
  home.addEventListener('click', () => setTopic(null));
  nav.append(home);
  const rememberedGroup = localStorage.getItem('signal-open-group');
  Object.entries(TOPIC_GROUPS).forEach(([group, topics], groupIndex) => {
    const selected = topics.filter(([id]) => state.selectedTopics.includes(id));
    if (!selected.length) return;
    const section = document.createElement('details');
    section.className = 'topic-section';
    section.dataset.group = group;
    section.open = selected.some(([id]) => id === state.activeTopic) || (!state.activeTopic && (rememberedGroup ? rememberedGroup === group : groupIndex === 0));
    section.innerHTML = `<summary><span class="group-code">${GROUP_CODES[group] || group[0]}</span><span>${group}</span><small>${selected.length}</small><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary><div class="group-topics"></div>`;
    selected.forEach(([id, label]) => {
      const button = document.createElement('button');
      button.className = `topic-button ${state.activeTopic === id ? 'active' : ''}`;
      button.dataset.topic = id;
      button.innerHTML = `<span class="topic-dot" style="--dot-hue:${TOPIC_HUES[id] || 180}"></span><span>${label}</span>`;
      button.addEventListener('click', () => setTopic(id));
      $('.group-topics', section).append(button);
    });
    section.addEventListener('toggle', () => {
      if (!section.open) return;
      localStorage.setItem('signal-open-group', group);
      $$('.topic-section', nav).forEach((other) => { if (other !== section) other.open = false; });
    });
    nav.append(section);
  });
  buildMobileTopicSelect();
}

function buildMobileTopicSelect() {
  const select = $('#mobileTopicSelect');
  if (!select) return;
  const activeValue = state.activeTopic || '';
  select.innerHTML = '<option value="">Today’s briefing — all topics</option>';
  Object.entries(TOPIC_GROUPS).forEach(([group, topics]) => {
    const selected = topics.filter(([id]) => state.selectedTopics.includes(id));
    if (!selected.length) return;
    const optionGroup = document.createElement('optgroup');
    optionGroup.label = group;
    selected.forEach(([id, label]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = label;
      optionGroup.append(option);
    });
    select.append(optionGroup);
  });
  select.value = activeValue;
  $('#mobileTopicCurrent').textContent = activeValue ? topicLabel(activeValue) : 'Today’s briefing';
}

function buildPicker() {
  const picker = $('#topicPicker'); picker.innerHTML = '';
  Object.entries(TOPIC_GROUPS).forEach(([group, topics]) => {
    const section = document.createElement('section'); section.className = 'picker-group';
    section.innerHTML = `<h3>${group}</h3><div class="picker-options"></div>`;
    topics.forEach(([id, label]) => {
      const button = document.createElement('button');
      button.className = `picker-option ${state.selectedTopics.includes(id) ? 'selected' : ''}`;
      button.dataset.topic = id; button.innerHTML = `<span>${label}</span><i></i>`;
      button.addEventListener('click', () => {
        const exists = state.selectedTopics.includes(id);
        if (exists && state.selectedTopics.length === 1) return;
        state.selectedTopics = exists ? state.selectedTopics.filter((item) => item !== id) : [...state.selectedTopics, id];
        button.classList.toggle('selected'); updateSelectedCount();
      });
      $('.picker-options', section).append(button);
    });
    picker.append(section);
  });
  updateSelectedCount();
}

function updateSelectedCount() { $('#selectedCount').textContent = `${state.selectedTopics.length} signals selected`; }

const MAX_CACHED_NEWS_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const CLIENT_TITLE_STOP_WORDS = new Set('a an and are as at be been by for from has have in into is it its of on or that the this to was were will with world news today latest update company maker'.split(' '));
const CLIENT_GENERIC_ENTITY_TOKENS = new Set('indian india market markets startup startups technology technologies government company companies business series season release releases cricket football update updates official source sources video watch live latest today report reports news model models people says said after before first amid across record major minor'.split(' '));

function cachedArticleAllowed(article) {
  const published = new Date(article.publishedAt).getTime();
  if (!Number.isFinite(published) || published < Date.now() - MAX_CACHED_NEWS_AGE_MS) return false;
  if (article.live !== false && !article.summary) return false;
  if (article.topic !== 'ai') return true;
  return !/horoscope|astrology|zodiac|tarot|Assassin['’]s Creed|Ubisoft|Claude Guillemot|plane crash/i.test(article.title);
}

function clientStoryTokens(title) {
  return title.toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/co[\s-]?founder/g, 'founder')
    .replace(/\b(killed|dies|died|dead|death)\b/g, 'death')
    .replace(/\b(launches|launched|launching|unveils|unveiled|releases|released)\b/g, 'launch')
    .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
    .filter((word) => (word.length > 1 || /^\d+$/.test(word)) && !CLIENT_TITLE_STOP_WORDS.has(word));
}

function clientStoryCoreTokens(title) {
  const focused = title
    .replace(/^\s*(video|watch|photos?|explained|live)\s*\|\s*/i, '')
    .split(/\s+[|]\s+|:\s+|,\s+/)[0];
  return clientStoryTokens(focused);
}

function clientArticleTokenSet(article) {
  return new Set(clientStoryTokens(`${article.title} ${article.summary || ''}`));
}

function clientEntityLikeTokens(article) {
  return new Set([...clientArticleTokenSet(article)].filter((token) => token.length >= 7 && !CLIENT_GENERIC_ENTITY_TOKENS.has(token)));
}

function clientSameEntityEvent(left, right) {
  if (left.topic !== right.topic) return false;
  const timeGap = Math.abs(new Date(left.publishedAt) - new Date(right.publishedAt));
  if (timeGap > 3 * 24 * 60 * 60 * 1000) return false;
  const leftEntities = clientEntityLikeTokens(left);
  const rightEntities = clientEntityLikeTokens(right);
  let sharedEntities = 0;
  leftEntities.forEach((token) => { if (rightEntities.has(token)) sharedEntities += 1; });
  if (!sharedEntities) return false;
  const eventA = clientArticleTokenSet(left);
  const eventB = clientArticleTokenSet(right);
  let sharedEvent = 0;
  eventA.forEach((token) => { if (eventB.has(token) && !CLIENT_GENERIC_ENTITY_TOKENS.has(token)) sharedEvent += 1; });
  return sharedEvent >= 4;
}

function clientSameStory(left, right) {
  if (left.url && left.url === right.url) return true;
  if (clientSameEntityEvent(left, right)) return true;
  const a = new Set(clientStoryTokens(left.title));
  const b = new Set(clientStoryTokens(right.title));
  if (!a.size || !b.size) return false;
  const coreA = clientStoryCoreTokens(left.title);
  const coreB = clientStoryCoreTokens(right.title);
  if (coreA.length >= 4 && coreB.length >= 4 && coreA.join(' ') === coreB.join(' ')) return true;
  let shared = 0;
  a.forEach((token) => { if (b.has(token)) shared += 1; });
  if (shared >= 4 && shared / Math.min(a.size, b.size) >= 0.4) return true;

  const eventA = new Set(clientStoryTokens(`${left.title} ${left.summary || ''}`).filter((token) => token.length >= 4));
  const eventB = new Set(clientStoryTokens(`${right.title} ${right.summary || ''}`).filter((token) => token.length >= 4));
  let eventShared = 0;
  eventA.forEach((token) => { if (eventB.has(token)) eventShared += 1; });
  const timeGap = Math.abs(new Date(left.publishedAt) - new Date(right.publishedAt));
  return timeGap <= 4 * 24 * 60 * 60 * 1000
    && eventShared >= 8
    && eventShared / Math.min(eventA.size, eventB.size) >= 0.46;
}

function deduplicateClientStories(articles) {
  const unique = [];
  articles.filter(cachedArticleAllowed)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .forEach((article) => {
      if (!unique.some((existing) => clientSameStory(article, existing))) unique.push(article);
    });
  return unique;
}

function rememberArticles(articles) {
  if (!articles.length) return;
  state.lastArticles = deduplicateClientStories([...articles, ...state.lastArticles]).slice(0, 180);
  localStorage.setItem('signal-last-articles', JSON.stringify(state.lastArticles));
}

function cachedArticlesFor(topic) {
  const allowed = topic ? [topic] : state.selectedTopics.filter((item) => !HOME_EXCLUDED_TOPICS.has(item));
  return deduplicateClientStories(state.lastArticles).filter((article) => allowed.includes(article.topic)).slice(0, 48)
    .map((article) => ({ ...article, latestAvailable: true, clientCached: true }));
}

function topicsForCurrentView(topic) {
  return topic ? [topic] : state.selectedTopics.filter((item) => !HOME_EXCLUDED_TOPICS.has(item));
}

function setRefreshState(refreshing) {
  const button = $('#refreshNow');
  button.disabled = refreshing;
  button.classList.toggle('refreshing', refreshing);
  $('span', button).textContent = refreshing ? 'Refreshing…' : 'Refresh now';
}

async function fetchNews(topic = null, force = false, quiet = false) {
  const requestId = ++state.requestId;
  state.loading = true;
  if (!quiet && !force) showSkeletons();
  if (force) setRefreshState(true);
  const allTopics = topicsForCurrentView(topic);
  if (!allTopics.length) {
    state.articles = [];
    state.emptyKind = 'no_matches';
    state.loading = false;
    render();
    if (force) setRefreshState(false);
    return;
  }
  const topicChunks = [];
  for (let index = 0; index < allTopics.length; index += 8) topicChunks.push(allTopics.slice(index, index + 8));
  const topics = topicChunks.shift() || [];
  try {
    const preview = new URLSearchParams(location.search).get('preview') === '1' ? '&preview=1' : '';
    const refresh = force ? `&refresh=1&t=${Date.now()}` : '';
    const response = await fetch(`/api/news?topics=${topics.join(',')}&limit=48${preview}${refresh}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Feed unavailable');
    const data = await response.json();
    if (requestId !== state.requestId) return;
    state.articles = deduplicateClientStories(data.articles || []);
    if (!state.articles.length) state.articles = cachedArticlesFor(topic);
    rememberArticles(state.articles);
    state.emptyKind = state.articles.length ? null : (data.meta.failedFeeds === topics.length ? 'network' : 'no_matches');
    $('#updatedAt').textContent = data.meta.preview ? 'Sample content only' : `Updated ${relativeTime(data.meta.fetchedAt)}`;
    const onlyAvailable = state.articles.length && state.articles.every((article) => article.latestAvailable);
    $('#editionLabel').textContent = data.meta.preview ? 'Design preview' : (onlyAvailable ? 'Latest within 14 days' : data.meta.partial ? 'Partial live edition' : 'Live edition');
    state.loading = false; state.visible = 8; render();
    if (topicChunks.length) loadRemainingTopics(topicChunks, preview, requestId, force);
  } catch {
    if (requestId !== state.requestId) return;
    state.articles = cachedArticlesFor(topic);
    state.emptyKind = state.articles.length ? null : 'network';
    $('#editionLabel').textContent = state.articles.length ? 'Saved within 14 days' : 'Connection paused';
    $('#updatedAt').textContent = state.articles.length ? 'Saved from your last update' : 'Retry in a moment';
  } finally {
    if (requestId === state.requestId && state.loading) { state.loading = false; state.visible = 8; render(); }
    if (force) setRefreshState(false);
  }
}

async function loadRemainingTopics(chunks, preview, requestId, force = false) {
  const refresh = force ? `&refresh=1&t=${Date.now()}` : '';
  const responses = await Promise.allSettled(chunks.map(async (topics) => {
    const response = await fetch(`/api/news?topics=${topics.join(',')}&limit=48${preview}${refresh}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Feed unavailable');
    return (await response.json()).articles || [];
  }));
  if (requestId !== state.requestId) return;
  const incoming = responses.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  state.articles = deduplicateClientStories([...state.articles, ...incoming]);
  rememberArticles(incoming);
  if (!state.articles.length && responses.some((result) => result.status === 'fulfilled')) state.emptyKind = 'no_matches';
  render();
}

function sentenceCase(value) {
  const text = String(value || '').trim();
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

function cleanDanglingEnding(value) {
  let text = String(value || '').replace(/\s+/g, ' ').trim();
  text = text.replace(/(?:\.{3}|…)\s*$/, '').trim();
  text = text.replace(/[,:;\-–—\s]+$/g, '').trim();
  text = text.replace(/\b(?:and|or|but|with|for|to|of|in|on|at|by|from|including|such as|as)\s*$/i, '').trim();
  text = text.replace(/[,:;\-–—\s]+$/g, '').trim();
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function titleCaseHeadline(value) {
  const known = new Map([
    ['ai', 'AI'], ['aqi', 'AQI'], ['bci', 'BCI'], ['ev', 'EV'], ['evs', 'EVs'], ['fifa', 'FIFA'],
    ['glp-1', 'GLP-1'], ['hiv', 'HIV'], ['ios', 'iOS'], ['iphone', 'iPhone'], ['isro', 'ISRO'],
    ['ivf', 'IVF'], ['naqi', 'NAQI'], ['ott', 'OTT'], ['pm2.5', 'PM2.5'], ['pm10', 'PM10'],
    ['chatgpt', 'ChatGPT'], ['deepmind', 'DeepMind'], ['openai', 'OpenAI']
  ]);
  const small = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'via', 'with']);
  let wordIndex = 0;
  return String(value || '').split(/(\s+)/).map((word) => {
    if (/^\s+$/.test(word)) return word;
    wordIndex += 1;
    const lower = word.toLowerCase();
    const bare = lower.replace(/^[^\w₹$]+|[^\w₹$.-]+$/g, '');
    if (known.has(bare)) return word.replace(new RegExp(bare, 'i'), known.get(bare));
    if (wordIndex > 1 && small.has(bare)) return lower;
    return word.replace(/[A-Za-zÀ-ÖØ-öø-ÿ][^\s-]*/g, (part) => part[0].toUpperCase() + part.slice(1).toLowerCase());
  }).join('');
}

function cleanDisplayHeadline(value) {
  return String(value || '')
    .replace(/^\s*(video|watch|photos?|explained|live updates?|highlights?)\s*(?:\||:|-)\s*/i, '')
    .replace(/\s+-\s+[^-]{2,35}$/i, '')
    .replace(/\s*\|\s*(Astrology|Horoscope|World News|Latest News)\s*$/i, '')
    .replace(/\bRead\s+(?:latest\s+)?(?:politics|current affairs|news)\s+news.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function polishDisplayHeadline(value, topic) {
  let title = cleanDisplayHeadline(value).replace(/[.!?]+$/g, '').trim();
  if (!title) return '';
  if (topic === 'travel' && /^rainy[\s-]+season[\s-]+travel[\s-]+india$/i.test(title)) {
    title = 'Rainy-season travel ideas for India';
  } else if (title === title.toLowerCase() && /[a-z]/.test(title)) {
    title = titleCaseHeadline(title);
  }
  return cleanDanglingEnding(title).replace(/[.!?]$/, '');
}

function articleHeadline(article) {
  const raw = polishDisplayHeadline(article.title, article.topic);
  const lower = raw.toLowerCase();
  if (article.topic === 'screen_releases') return 'This week’s notable OTT and series releases';
  if (article.topic === 'cricket' && /sooryavanshi|suryavanshi/.test(lower) && /jersey|donning|india blues/.test(lower)) {
    return 'Vaibhav Sooryavanshi gets his first India jersey moment';
  }
  if (article.topic === 'space' && /deep[\s-]?tech/.test(lower) && /funding|sovereign/.test(lower)) {
    return 'India’s deep-tech funding push gets a sovereign-capital tailwind';
  }
  if (article.topic === 'semiconductors' && /semiconductor|chip/.test(lower) && /incentive|crore|buildout/.test(lower)) {
    return 'India lines up fresh incentives for its semiconductor buildout';
  }
  if (article.topic === 'ai' && /chatgpt|claude|gemini|anthropic|openai/i.test(raw)) {
    return raw.replace(/^(.{95}).+$/, '$1…');
  }
  return raw || article.title;
}

function summarySentences(text, limit = 3) {
  const sentences = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\bRead\s+(?:latest\s+)?(?:politics|current affairs|news)\s+news.*?(?:today|online)\.?\s*/ig, '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => cleanDanglingEnding(sentence.trim()))
    .filter((sentence) => sentence.length >= 28);
  return sentences.slice(0, limit).join(' ');
}

function articlePreview(article) {
  const context = TOPIC_CONTEXT[article.topic] || `This is a consequential update in ${article.topicLabel}.`;
  const sourceBrief = summarySentences(article.summary, 3);
  const title = polishDisplayHeadline(article.title, article.topic);
  const titleDetail = title.split(/:\s+|\s+[—–]\s+/).slice(1).join(': ').trim();
  let brief = sourceBrief;
  if (!brief && titleDetail.length >= 24) brief = `${sentenceCase(titleDetail)}.`;
  if (!brief) {
    const planned = title.match(/^(.{2,90}?)\s+to\s+(launch|leave|build|open|release|start|acquire|invest|raise|expand|develop|introduce|unveil|buy|sell)(.*)$/i);
    brief = planned
      ? `${planned[1]} is set to ${planned[2].toLowerCase()}${planned[3]}, according to ${article.source}.`
      : `${article.source} is reporting a new development on this topic.`;
  }
  brief = cleanDanglingEnding(brief);
  if (brief.length < 190 && article.topic !== 'screen_releases') {
    brief = `${brief.replace(/\s+$/, '')} Why it matters: ${context}`;
  }
  if (article.topic === 'screen_releases') {
    brief = brief.replace(/\bnew films? & series\b/ig, 'new releases');
  }
  return cleanDanglingEnding(brief);
}

function showSkeletons() {
  $('#releaseGuide').hidden = true;
  $('#leadGrid').innerHTML = '<div class="lead-story skeleton-card skeleton-lead"></div><div class="side-leads"><div class="skeleton-card"></div><div class="skeleton-card"></div></div>';
  $('#briefingGrid').innerHTML = '';
  $('#storyCount').textContent = 'Curating stories…';
}

function render() {
  buildTopicNav();
  if (!state.articles.length) return renderEmpty();
  clearTimeout(state.retryTimer);
  renderSignalRibbon();
  renderReleaseGuide();
  const [lead, ...rest] = state.articles;
  const leadHue = TOPIC_HUES[lead.topic] || 9;
  const leadHeadline = articleHeadline(lead);
  $('#leadGrid').innerHTML = `
    <article class="lead-story">
      <div class="lead-copy">
        <div class="lead-kicker">Top signal · ${lead.topicLabel}${lead.latestAvailable ? ' · Within 14 days' : ''}</div>
        <h2><a href="${escapeAttr(lead.url)}" target="_blank" rel="noopener noreferrer" title="Source headline: ${escapeAttr(lead.title)}">${escapeHtml(leadHeadline)}</a></h2>
        <p class="lead-excerpt"><span>BRIEF</span>${escapeHtml(articlePreview(lead))}</p>
        <div class="lead-byline"><div class="source-lockup"><span class="source-badge">${initials(lead.source)}</span><div><strong>${escapeHtml(lead.source)}</strong><span>${relativeTime(lead.publishedAt)} · Original reporting</span></div></div><a class="read-link" href="${escapeAttr(lead.url)}" target="_blank" rel="noopener noreferrer">READ STORY →</a></div>
      </div>
      <div class="lead-visual" style="--topic-hue:${leadHue}" aria-hidden="true"><i class="orbit orbit-one"></i><i class="orbit orbit-two"></i><span class="visual-code">${TOPIC_CODES[lead.topic] || 'S'}</span><div class="visual-caption"><b>SIGNAL / 01</b><small>${escapeHtml(lead.topicLabel)}</small></div></div>
    </article>
    <div class="side-leads">${rest.slice(0, 2).map(renderSideLead).join('')}</div>`;

  const briefing = rest.slice(2, state.visible + 2);
  const grid = $('#briefingGrid'); grid.innerHTML = '';
  briefing.forEach((article) => grid.append(createArticleCard(article)));
  $('#storyCount').textContent = `${state.articles.length} trusted stories in this edition`;
  $('#loadMore').hidden = state.visible + 3 >= state.articles.length;
  renderQueue(); updateMarketSignal();
}

function renderSignalRibbon() {
  const counts = state.articles.reduce((map, article) => map.set(article.topic, (map.get(article.topic) || 0) + 1), new Map());
  const leaders = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  $('#pulseTopics').innerHTML = leaders.map(([topic, count], index) => `<button data-pulse-topic="${topic}" style="--pulse-hue:${TOPIC_HUES[topic] || 9}"><span>${String(index + 1).padStart(2, '0')}</span><b>${escapeHtml(topicLabel(topic))}</b><i>${count}</i></button>`).join('');
  $('#pulseCount').textContent = state.articles.length;
}

function cleanReleaseName(value) {
  const name = value
    .replace(/^[\s'‘’“”"—–-]+|[\s'‘’“”"—–,.;:-]+$/g, '')
    .replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 58 || name.split(' ').length > 9) return null;
  if (/^(what'?s new|what to watch|watch|appl|films? and shows?|movies? and shows?|new (?:films?|movies?)(?:\s*&\s*|\s+and\s+)(?:series|shows?)|new movies?|latest movies?|more)$/i.test(name)) return null;
  if (/(films?|movies?|shows?).*(genres?|to watch|across)/i.test(name)) return null;
  if (/Netflix|Prime Video|JioHotstar|Hotstar|ZEE5|Apple TV|OTT releases?|streaming|this week|weekend|June \d/i.test(name)) return null;
  return name;
}

function releaseNamesFromHeadline(title) {
  const names = [];
  for (const match of title.matchAll(/[‘“]([^’”]{2,58})[’”]/g)) {
    const cleaned = cleanReleaseName(match[1]);
    if (cleaned) names.push(cleaned);
  }
  const colon = title.indexOf(':');
  if (colon >= 0) {
    const tail = title.slice(colon + 1)
      .replace(/\b(?:latest|new) movies? and (?:TV )?shows?.*$/i, '')
      .replace(/\b(?:and )?more\b.*$/i, '')
      .replace(/\.{3}.*$/, '');
    tail.split(/,|\s+to\s+/i).forEach((part) => {
      const cleaned = cleanReleaseName(part);
      if (cleaned) names.push(cleaned);
    });
  }
  return [...new Set(names)];
}

function renderReleaseGuide() {
  const guide = $('#releaseGuide');
  if (state.activeTopic !== 'screen_releases') { guide.hidden = true; return; }
  const releaseArticles = state.articles.filter((article) => article.topic === 'screen_releases');
  const releases = new Map();
  releaseArticles.forEach((article) => {
    releaseNamesFromHeadline(article.title).forEach((name) => {
      const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      if (!key) return;
      const existing = releases.get(key) || { name, sources: new Set(), url: article.url };
      existing.sources.add(article.source);
      releases.set(key, existing);
    });
  });
  const items = [...releases.values()].slice(0, 10);
  if (!items.length) { guide.hidden = true; return; }
  const platformMatches = releaseArticles.flatMap((article) => article.title.match(/Netflix|Prime Video|JioHotstar|Hotstar|ZEE5|Apple TV\+?/gi) || []);
  const platforms = [...new Set(platformMatches.map((name) => name.replace(/^Hotstar$/i, 'JioHotstar')))];
  $('#releaseGuideMeta').textContent = `${items.length} named releases · ${platforms.length ? platforms.join(' · ') : 'OTT & cinema'}`;
  $('#releaseGuideItems').innerHTML = items.map((item, index) => {
    const sources = [...item.sources];
    return `<article class="release-item"><span>${String(index + 1).padStart(2, '0')} · THIS WEEK</span><h3>${escapeHtml(item.name)}</h3><p>Included in this week’s trusted India release coverage from ${escapeHtml(sources.join(' and '))}.</p><a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">Source details →</a></article>`;
  }).join('');
  guide.hidden = false;
}

function renderSideLead(article) {
  if (!article) return '';
  return `<article class="side-lead"><div class="story-meta"><span class="story-topic">${escapeHtml(article.topicLabel)}</span><span class="meta-dot">•</span><time>${relativeTime(article.publishedAt)}</time>${article.latestAvailable ? '<span class="availability-badge">Within 14 days</span>' : ''}</div><h3><a href="${escapeAttr(article.url)}" target="_blank" rel="noopener noreferrer" title="Source headline: ${escapeAttr(article.title)}">${escapeHtml(articleHeadline(article))}</a></h3><p class="side-preview">${escapeHtml(articlePreview(article))}</p><div class="story-footer"><span class="source-name">${escapeHtml(article.source)}</span><button class="bookmark ${isSaved(article.id) ? 'saved' : ''}" data-id="${escapeAttr(article.id)}" aria-label="Save to reading queue"><svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z"/></svg></button></div></article>`;
}

function createArticleCard(article) {
  const node = $('#articleTemplate').content.cloneNode(true);
  const card = $('.story-card', node); card.dataset.id = article.id;
  $('.story-topic', node).textContent = article.topicLabel;
  $('time', node).textContent = relativeTime(article.publishedAt);
  const link = $('h3 a', node); link.textContent = articleHeadline(article); link.href = article.url; link.title = `Source headline: ${article.title}`;
  $('.story-preview', node).textContent = articlePreview(article);
  const availability = $('.availability-badge', node); availability.hidden = !article.latestAvailable;
  $('.source-name', node).textContent = article.source;
  const button = $('.bookmark', node); button.dataset.id = article.id; button.classList.toggle('saved', isSaved(article.id));
  return node;
}

function renderEmpty() {
  $('#releaseGuide').hidden = true;
  const isPreview = new URLSearchParams(location.search).get('preview') === '1';
  const noMatches = state.emptyKind === 'no_matches' && state.activeTopic;
  $('#leadGrid').innerHTML = noMatches
    ? `<div class="empty-state"><div class="empty-mark">${TOPIC_CODES[state.activeTopic] || 'S'}</div><span class="empty-eyebrow">LAST 14 DAYS CHECKED</span><h3>No recent trusted match.</h3><p>Signal found no qualifying ${escapeHtml(topicLabel(state.activeTopic))} story published in the last two weeks. Older stories are intentionally excluded.</p><div class="empty-actions"><button class="primary-button" id="showAllNews">Show all news</button><button class="secondary-button" id="retryFeed">Check again</button></div></div>`
    : `<div class="empty-state"><div class="empty-mark">S</div><h3>The live feed is quiet.</h3><p>Signal could not reach a trusted live source just now. No stale or unverified stories have been substituted. ${isPreview ? 'Try reloading the preview.' : 'It will retry automatically in a few seconds.'}</p><button class="primary-button" id="retryFeed" style="margin-top:20px">Retry live feed</button></div>`;
  $('#briefingGrid').innerHTML = '';
  $('#pulseTopics').innerHTML = '<span class="pulse-loading">No qualifying stories in this view</span>';
  $('#pulseCount').textContent = '0';
  $('#storyCount').textContent = 'No live stories available'; $('#loadMore').hidden = true;
  $('#retryFeed')?.addEventListener('click', () => fetchNews(state.activeTopic));
  $('#showAllNews')?.addEventListener('click', () => setTopic(null));
  clearTimeout(state.retryTimer);
  if (!isPreview && !noMatches) state.retryTimer = setTimeout(() => fetchNews(state.activeTopic), 15_000);
}

function setTopic(topic) {
  state.activeTopic = topic;
  $('#activeFilter').hidden = !topic;
  $('#activeFilterName').textContent = topic ? topicLabel(topic) : '';
  buildMobileTopicSelect();
  fetchNews(topic); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function isSaved(id) { return state.saved.some((article) => article.id === id); }
function toggleSaved(id) {
  const article = state.articles.find((item) => item.id === id);
  if (!article) return;
  state.saved = isSaved(id) ? state.saved.filter((item) => item.id !== id) : [article, ...state.saved].slice(0, 12);
  localStorage.setItem('signal-saved', JSON.stringify(state.saved));
  $$(`.bookmark[data-id="${CSS.escape(id)}"]`).forEach((button) => button.classList.toggle('saved', isSaved(id)));
  renderQueue();
}

function renderQueue() {
  const list = $('#queueList');
  if (!state.saved.length) { list.innerHTML = '<p class="queue-empty">Stories you save will wait here—calmly, without notifications.</p>'; return; }
  list.innerHTML = state.saved.slice(0, 4).map((article, index) => `<div class="queue-item"><span class="queue-index">${String(index + 1).padStart(2, '0')}</span><a href="${escapeAttr(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a><button data-remove="${escapeAttr(article.id)}" aria-label="Remove from queue">×</button></div>`).join('');
}

function updateMarketSignal() {
  const marketArticles = state.articles.filter((article) => article.topic === 'markets');
  const strongWords = /crash|surge|plunge|record|rbi|rate cut|rate hike|war|tariff|sanction|election|budget/i;
  const seismic = marketArticles.filter((article) => strongWords.test(article.title)).length;
  const baseline = marketArticles.length ? Math.min(38, 12 + marketArticles.length * 4) : 10;
  const intensity = Math.min(100, baseline + seismic * 18);
  const score = (intensity / 10).toFixed(1);
  const scoreLabel = intensity >= 80 ? 'Seismic' : intensity >= 60 ? 'High' : intensity >= 35 ? 'Elevated' : 'Quiet';
  $('#marketGauge').style.width = `${intensity}%`;
  $('#marketScore').textContent = score;
  $('#marketScoreLabel').textContent = scoreLabel;
  $('#marketSummary').textContent = seismic ? `${seismic} potentially high-impact ${seismic === 1 ? 'event' : 'events'} detected in trusted coverage.` : 'No seismic India-market event detected in this edition.';
}

function weatherIcon(code) {
  if (code === 0) return '☀';
  if (code <= 3) return '◒';
  if (code === 45 || code === 48) return '≋';
  if (code >= 51 && code <= 67) return '☂';
  if (code >= 71 && code <= 77) return '✣';
  if (code >= 80 && code <= 82) return '☔';
  if (code >= 85 && code <= 86) return '❄';
  if (code >= 95) return 'ϟ';
  return '◌';
}

function aqiCategory(aqi) {
  if (!Number.isFinite(aqi)) return ['Unavailable', 'unknown'];
  if (aqi <= 50) return ['Good', 'good'];
  if (aqi <= 100) return ['Satisfactory', 'moderate'];
  if (aqi <= 200) return ['Moderate', 'sensitive'];
  if (aqi <= 300) return ['Poor', 'unhealthy'];
  if (aqi <= 400) return ['Very poor', 'very-unhealthy'];
  return ['Severe', 'hazardous'];
}

const INDIA_AQI_BANDS = {
  'PM2.5': [[0, 30, 0, 50], [31, 60, 51, 100], [61, 90, 101, 200], [91, 120, 201, 300], [121, 250, 301, 400], [251, 500, 401, 500]],
  PM10: [[0, 50, 0, 50], [51, 100, 51, 100], [101, 250, 101, 200], [251, 350, 201, 300], [351, 430, 301, 400], [431, 600, 401, 500]],
  NO2: [[0, 40, 0, 50], [41, 80, 51, 100], [81, 180, 101, 200], [181, 280, 201, 300], [281, 400, 301, 400], [401, 800, 401, 500]],
  SO2: [[0, 40, 0, 50], [41, 80, 51, 100], [81, 380, 101, 200], [381, 800, 201, 300], [801, 1600, 301, 400], [1601, 2400, 401, 500]],
  CO: [[0, 1, 0, 50], [1.1, 2, 51, 100], [2.1, 10, 101, 200], [10.1, 17, 201, 300], [17.1, 34, 301, 400], [34.1, 50, 401, 500]],
  O3: [[0, 50, 0, 50], [51, 100, 51, 100], [101, 168, 101, 200], [169, 208, 201, 300], [209, 748, 301, 400], [749, 1000, 401, 500]]
};

function indiaAqiSubIndex(pollutant, concentration) {
  if (concentration === null || concentration === undefined || concentration === '') return null;
  const value = Number(concentration);
  if (!Number.isFinite(value) || value < 0) return null;
  const bands = INDIA_AQI_BANDS[pollutant];
  if (!bands) return null;
  const [low, high, indexLow, indexHigh] = bands.find((band) => value >= band[0] && value <= band[1]) || bands[bands.length - 1];
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

function geoDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function weatherConditionLabel(code) {
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

async function loadWeatherDirect(latitude, longitude, place, accuracy) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,apparent_temperature,weather_code&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&hourly=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&past_days=1&forecast_days=1&timezone=auto`;
  const [forecastResponse, airResponse] = await Promise.all([
    fetch(forecastUrl, { cache: 'no-store' }),
    fetch(airUrl, { cache: 'no-store' }).catch(() => null)
  ]);
  if (!forecastResponse.ok) throw new Error('Direct weather unavailable');
  const forecast = await forecastResponse.json();
  const air = airResponse?.ok ? await airResponse.json().catch(() => null) : null;
  const currentHour = `${forecast.current.time.slice(0, 13)}:00`;
  let rainIndex = forecast.hourly.time.indexOf(currentHour);
  if (rainIndex < 0) rainIndex = forecast.hourly.time.findIndex((time) => time > forecast.current.time);
  if (rainIndex < 0) rainIndex = 0;
  const rainWindow = forecast.hourly.precipitation_probability.slice(rainIndex, rainIndex + 3)
    .map((value) => Number(value)).filter(Number.isFinite);
  const pm25Value = air?.current?.pm2_5;
  const pm25Current = Number.isFinite(Number(pm25Value)) ? Math.round(Number(pm25Value) * 10) / 10 : null;
  const pm10Value = air?.current?.pm10;
  const pm10Current = Number.isFinite(Number(pm10Value)) ? Math.round(Number(pm10Value) * 10) / 10 : null;
  const airHour = air?.current?.time ? `${air.current.time.slice(0, 13)}:00` : currentHour;
  const pm25 = recentHourlyAverage(air?.hourly, 'pm2_5', airHour, 24) ?? pm25Current;
  const pm10 = recentHourlyAverage(air?.hourly, 'pm10', airHour, 24) ?? pm10Current;
  const modelReadings = [
    ['PM2.5', pm25], ['PM10', pm10]
  ].map(([pollutant, concentration]) => ({ pollutant, subIndex: indiaAqiSubIndex(pollutant, concentration) }))
    .filter((reading) => reading.subIndex !== null);
  const pm25Reading = modelReadings.find((reading) => reading.pollutant === 'PM2.5');
  const modelDominant = pm25Reading || modelReadings.reduce((best, reading) => !best || reading.subIndex > best.subIndex ? reading : best, null);
  const aqi = modelDominant?.subIndex ?? null;
  return {
    place,
    resolvedPlace: place === 'Current location' ? 'Your location' : place,
    latitude,
    longitude,
    accuracyMeters: accuracy || null,
    temperature: Math.round(forecast.current.temperature_2m),
    feelsLike: Math.round(forecast.current.apparent_temperature),
    condition: weatherConditionLabel(forecast.current.weather_code),
    weatherCode: forecast.current.weather_code,
    rainChance: rainWindow.length ? Math.max(...rainWindow) : Math.round(forecast.hourly.precipitation_probability[rainIndex] || 0),
    aqi,
    aqiDisplay: aqi === null ? '--' : String(aqi),
    aqiScale: 'India AQI',
    aqiModelEstimate: aqi !== null,
    aqiSourceType: aqi === null ? 'unavailable' : 'model_estimate',
    aqiStation: null,
    aqiStationDistanceKm: null,
    dominantPollutant: modelDominant?.pollutant || null,
    pm25,
    pm10,
    aqiModelDistanceKm: air && Number.isFinite(Number(air.latitude)) && Number.isFinite(Number(air.longitude))
      ? Math.round(geoDistanceKm(latitude, longitude, Number(air.latitude), Number(air.longitude)) * 10) / 10
      : null,
    updatedAt: new Date().toISOString(),
    provider: aqi === null ? 'AQI temporarily unavailable' : 'Open-Meteo CAMS PM2.5 24h estimate on CPCB scale',
    sourceUrl: 'https://airquality.cpcb.gov.in/AQI_India/'
  };
}

function renderWeather(data) {
  const [aqiLabel, aqiLevel] = aqiCategory(data.aqi);
  const aqiUnavailable = data.aqiSourceType === 'unavailable';
  const aqiDescription = aqiUnavailable ? 'Temporarily unavailable' : (data.aqiModelEstimate ? `${aqiLabel} · model estimate` : `${aqiLabel} · nearest station`);
  const accuracy = data.accuracyMeters
    ? ` · ±${data.accuracyMeters >= 1000 ? `${(data.accuracyMeters / 1000).toFixed(1)} km` : `${data.accuracyMeters} m`}`
    : '';
  $$('[data-weather-card]').forEach((card) => {
    card.dataset.aqiLevel = aqiLevel;
    $('[data-weather-temp]', card).textContent = data.temperature;
    $('[data-weather-feels]', card).textContent = data.feelsLike;
    $('[data-weather-condition]', card).textContent = data.condition;
    $('[data-weather-place]', card).textContent = data.resolvedPlace || data.place;
    $('[data-weather-coordinates]', card).textContent = `${Number(data.latitude).toFixed(2)}°, ${Number(data.longitude).toFixed(2)}°${accuracy}`;
    $('[data-weather-aqi]', card).textContent = data.aqiDisplay ?? data.aqi ?? '--';
    $('[data-weather-aqi-label]', card).textContent = aqiDescription;
    $('[data-weather-aqi-type]', card).textContent = aqiUnavailable ? 'UNAVAILABLE' : (data.aqiModelEstimate ? 'MODEL EST.' : 'CPCB STATION');
    $('[data-weather-aqi-note]', card).textContent = aqiUnavailable
      ? 'Weather remains live'
      : data.aqiStation
      ? `${data.aqiStation}${Number.isFinite(data.aqiStationDistanceKm) ? ` · ${data.aqiStationDistanceKm} km` : ''}`
      : `${data.dominantPollutant || 'PM2.5'} · 24h model${Number.isFinite(data.aqiModelDistanceKm) ? ` · ${data.aqiModelDistanceKm} km grid` : ''}`;
    $('[data-weather-pollutants]', card).textContent = `24h PM2.5 ${Number.isFinite(data.pm25) ? data.pm25 : '--'} · PM10 ${Number.isFinite(data.pm10) ? data.pm10 : '--'} µg/m³`;
    $('[data-weather-rain]', card).textContent = data.rainChance;
    $('[data-weather-icon]', card).textContent = weatherIcon(data.weatherCode);
    $('[data-weather-updated]', card).textContent = `${data.stale ? 'Last available' : 'Updated'} ${relativeTime(data.updatedAt)}`;
    $('[data-weather-source]', card).textContent = data.aqiSourceType === 'cpcb_station' ? 'CPCB · data.gov.in ↗' : 'Check CPCB stations ↗';
    $('[data-weather-source]', card).href = data.sourceUrl || 'https://airquality.cpcb.gov.in/AQI_India/';
  });
}

function setWeatherMessage(message) {
  $$('[data-weather-updated]').forEach((element) => { element.textContent = message; });
}

async function loadWeather(force = false) {
  const { lat, lon, name, accuracy } = state.weatherLocation;
  const refresh = force ? `&refresh=1&t=${Date.now()}` : '';
  const accuracyQuery = accuracy ? `&accuracy=${encodeURIComponent(accuracy)}` : '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&name=${encodeURIComponent(name)}${accuracyQuery}${refresh}`, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error('Weather unavailable');
    renderWeather(await response.json());
  } catch {
    try {
      renderWeather(await loadWeatherDirect(lat, lon, name, accuracy));
    } catch {
      setWeatherMessage('Weather temporarily unavailable');
    }
  } finally {
    clearTimeout(timeout);
  }
}

function closeWeatherResults() {
  $$('[data-weather-results]').forEach((element) => {
    element.hidden = true;
    element.innerHTML = '';
  });
}

function showWeatherResults(form, results) {
  const card = form.closest('[data-weather-card]');
  const panel = $('[data-weather-results]', card);
  if (!results.length) {
    panel.hidden = false;
    panel.innerHTML = '<button type="button" disabled>No matching Indian place found</button>';
    return;
  }
  panel.hidden = false;
  panel.innerHTML = results.map((result, index) => `
    <button type="button" data-weather-result="${index}">
      ${escapeHtml(result.name)}
      <small>${escapeHtml(result.displayName || `${result.lat.toFixed(3)}, ${result.lon.toFixed(3)}`)}</small>
    </button>
  `).join('');
  panel._signalResults = results;
}

async function searchWeatherLocation(form) {
  const input = $('[data-weather-query]', form);
  const button = $('button[type="submit"]', form);
  const query = input.value.trim();
  if (query.length < 2) return;
  const { lat, lon } = state.weatherLocation;
  const bias = Number.isFinite(lat) && Number.isFinite(lon) ? `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}` : '';
  button.disabled = true;
  button.textContent = '...';
  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}${bias}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Location search unavailable');
    const data = await response.json();
    showWeatherResults(form, data.results || []);
  } catch {
    showWeatherResults(form, []);
  } finally {
    button.disabled = false;
    button.textContent = 'Set';
  }
}

function scheduleWeatherSearch(input) {
  const form = input.closest('[data-weather-search]');
  clearTimeout(weatherSearchTimer);
  const query = input.value.trim();
  if (query.length < 3) {
    closeWeatherResults();
    return;
  }
  weatherSearchTimer = setTimeout(() => searchWeatherLocation(form), 420);
}

function chooseWeatherResult(button) {
  const panel = button.closest('[data-weather-results]');
  const result = panel?._signalResults?.[Number(button.dataset.weatherResult)];
  if (!result) return;
  state.weatherLocation = { lat: result.lat, lon: result.lon, name: result.name, accuracy: null };
  localStorage.setItem('signal-weather-location', JSON.stringify(state.weatherLocation));
  $$('[data-weather-query]').forEach((input) => { input.value = result.name; });
  closeWeatherResults();
  setWeatherMessage(`Loading ${result.name}`);
  loadWeather(true);
}

function useCurrentLocation(button) {
  if (!navigator.geolocation) { setWeatherMessage('Location is not supported here'); return; }
  const original = button.textContent;
  $$('[data-use-location]').forEach((item) => { item.disabled = true; item.textContent = 'Locating…'; });
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      state.weatherLocation = { lat: coords.latitude, lon: coords.longitude, name: 'Current location', accuracy: coords.accuracy };
      localStorage.setItem('signal-weather-location', JSON.stringify(state.weatherLocation));
      $$('[data-use-location]').forEach((item) => { item.disabled = false; item.textContent = 'Location updated'; });
      loadWeather(true);
    },
    () => {
      $$('[data-use-location]').forEach((item) => { item.disabled = false; item.textContent = original; });
      setWeatherMessage('Location permission was not granted');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5 * 60 * 1000 }
  );
}

function openOverlay(id) { const element = $(`#${id}`); element.hidden = false; document.body.style.overflow = 'hidden'; }
function closeOverlay(id) { const element = $(`#${id}`); element.hidden = true; document.body.style.overflow = ''; }

function doSearch(query) {
  const value = query.trim().toLowerCase();
  if (!value) { $('#searchResults').innerHTML = '<p class="search-hint">Try “ISRO”, “semiconductors” or “Reuters”</p>'; return; }
  const results = state.articles.filter((article) => `${article.title} ${article.source} ${article.topicLabel}`.toLowerCase().includes(value));
  $('#searchResults').innerHTML = results.length ? results.slice(0, 12).map((article) => `<div class="search-result"><a href="${escapeAttr(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a><span>${escapeHtml(article.source)} · ${relativeTime(article.publishedAt)}</span></div>`).join('') : '<p class="no-results">No matching stories in this edition.</p>';
}

function escapeHtml(value) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }
function escapeAttr(value) { return escapeHtml(String(value)).replace(/`/g, '&#96;'); }

function bindEvents() {
  $('#todayDate').textContent = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()).toUpperCase();
  $('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('signal-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); });
  if (localStorage.getItem('signal-theme') === 'dark') document.body.classList.add('dark');
  $('#searchTrigger').addEventListener('click', () => { openOverlay('searchOverlay'); setTimeout(() => $('#searchInput').focus(), 30); });
  $('#searchInput').addEventListener('input', (event) => doSearch(event.target.value));
  $('#mobileTopicSelect')?.addEventListener('change', (event) => setTopic(event.target.value || null));
  ['editTopics', 'openTopicsMobile', 'profileButton'].forEach((id) => $(`#${id}`)?.addEventListener('click', () => { buildPicker(); openOverlay('topicsOverlay'); }));
  $('#viewStandards').addEventListener('click', () => openOverlay('standardsOverlay'));
  $('#clearFilter').addEventListener('click', () => setTopic(null));
  $('#refreshNow').addEventListener('click', () => { fetchNews(state.activeTopic, true, true); loadWeather(true); });
  $$('[data-weather-search]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); searchWeatherLocation(form); }));
  $$('[data-weather-query]').forEach((input) => {
    input.addEventListener('input', () => scheduleWeatherSearch(input));
    input.addEventListener('focus', () => { if (input.value.trim().length >= 3) scheduleWeatherSearch(input); });
  });
  $('#loadMore').addEventListener('click', () => { state.visible += 6; render(); });
  $('#saveTopics').addEventListener('click', () => { localStorage.setItem('signal-topics', JSON.stringify(state.selectedTopics)); state.activeTopic = null; closeOverlay('topicsOverlay'); buildTopicNav(); fetchNews(); });
  $('#clearQueue').addEventListener('click', () => { state.saved = []; localStorage.setItem('signal-saved', '[]'); renderQueue(); $$('.bookmark').forEach((button) => button.classList.remove('saved')); });
  document.addEventListener('click', (event) => {
    const close = event.target.closest('[data-close]'); if (close) closeOverlay(close.dataset.close);
    const bookmark = event.target.closest('.bookmark'); if (bookmark) toggleSaved(bookmark.dataset.id);
    const remove = event.target.closest('[data-remove]'); if (remove) toggleSaved(remove.dataset.remove);
    const marketLink = event.target.closest('[data-topic]'); if (marketLink && marketLink.classList.contains('text-link')) setTopic(marketLink.dataset.topic);
    const pulseTopic = event.target.closest('[data-pulse-topic]'); if (pulseTopic) setTopic(pulseTopic.dataset.pulseTopic);
    const weatherResult = event.target.closest('[data-weather-result]'); if (weatherResult) chooseWeatherResult(weatherResult);
    const locationButton = event.target.closest('[data-use-location]'); if (locationButton) useCurrentLocation(locationButton);
    if (event.target.classList.contains('overlay')) closeOverlay(event.target.id);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { event.preventDefault(); openOverlay('searchOverlay'); $('#searchInput').focus(); }
    if (event.key === 'Escape') $$('.overlay:not([hidden])').forEach((overlay) => closeOverlay(overlay.id));
  });
}

bindEvents(); buildTopicNav(); renderQueue(); fetchNews(); loadWeather();
setInterval(() => {
  if (!document.hidden) { fetchNews(state.activeTopic, false, true); loadWeather(); }
}, 5 * 60 * 1000);
