import { format, startOfWeek } from 'date-fns';
import { removeStopwords } from 'stopword';
import type {
  Message,
  ChatData,
  UserStats,
  WordFrequency,
  PhraseFrequency,
  MessageVolumeData,
  UserMessageVolumeData,
  HeatmapData,
  AnalysisResults
} from '../types';

/**
 * Analyze chat data and generate all insights
 */
export function analyzeChat(chatDataList: ChatData[]): AnalysisResults {
  // Combine all messages from all files
  const allMessages = chatDataList.flatMap(data => data.messages);

  return {
    topUsers: analyzeTopUsers(allMessages),
    wordFrequencies: analyzeWordFrequency(allMessages),
    topPhrases: analyzeTopPhrases(allMessages),
    messageVolumeOverTime: analyzeMessageVolumeOverTime(allMessages),
    userMessageVolume: analyzeUserMessageVolume(allMessages),
    heatmapData: analyzeActivityHeatmap(allMessages),
    totalMessages: allMessages.length
  };
}

/**
 * Analyze top users by message count
 */
export function analyzeTopUsers(messages: Message[]): UserStats[] {
  const userCounts = new Map<string, number>();

  messages.forEach(msg => {
    userCounts.set(msg.username, (userCounts.get(msg.username) || 0) + 1);
  });

  const totalMessages = messages.length;
  const userStats: UserStats[] = Array.from(userCounts.entries())
    .map(([username, messageCount]) => ({
      username,
      messageCount,
      percentage: (messageCount / totalMessages) * 100
    }))
    .sort((a, b) => b.messageCount - a.messageCount);

  return userStats.slice(0, 5);
}

/**
 * Analyze word frequency (excluding stopwords)
 */
export function analyzeWordFrequency(messages: Message[]): WordFrequency[] {
  const wordCounts = new Map<string, number>();

  messages.forEach(msg => {
    const words = msg.content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter short words

    // Remove stopwords
    const filteredWords = removeStopwords(words);

    filteredWords.forEach(word => {
      if (word && !isUrl(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });
  });

  return Array.from(wordCounts.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
}

/**
 * Analyze top 2-word and 3-word phrases
 */
export function analyzeTopPhrases(messages: Message[]): {
  twoWord: PhraseFrequency[];
  threeWord: PhraseFrequency[];
} {
  const twoWordCounts = new Map<string, number>();
  const threeWordCounts = new Map<string, number>();

  messages.forEach(msg => {
    const words = msg.content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    // 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (!isUrlPhrase(phrase)) {
        twoWordCounts.set(phrase, (twoWordCounts.get(phrase) || 0) + 1);
      }
    }

    // 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (!isUrlPhrase(phrase)) {
        threeWordCounts.set(phrase, (threeWordCounts.get(phrase) || 0) + 1);
      }
    }
  });

  return {
    twoWord: Array.from(twoWordCounts.entries())
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    threeWord: Array.from(threeWordCounts.entries())
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  };
}

/**
 * Analyze message volume over time (weekly)
 */
export function analyzeMessageVolumeOverTime(messages: Message[]): MessageVolumeData[] {
  const weeklyCounts = new Map<string, number>();

  messages.forEach(msg => {
    const weekStart = startOfWeek(msg.timestamp, { weekStartsOn: 1 }); // Monday
    const dateKey = format(weekStart, 'yyyy-MM-dd');
    weeklyCounts.set(dateKey, (weeklyCounts.get(dateKey) || 0) + 1);
  });

  return Array.from(weeklyCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Analyze message volume over time by user (weekly, stacked area chart data)
 */
export function analyzeUserMessageVolume(messages: Message[]): UserMessageVolumeData[] {
  const weeklyUserCounts = new Map<string, Map<string, number>>();
  const allUsers = new Set<string>();

  messages.forEach(msg => {
    const weekStart = startOfWeek(msg.timestamp, { weekStartsOn: 1 }); // Monday
    const dateKey = format(weekStart, 'yyyy-MM-dd');
    allUsers.add(msg.username);

    if (!weeklyUserCounts.has(dateKey)) {
      weeklyUserCounts.set(dateKey, new Map());
    }

    const userCounts = weeklyUserCounts.get(dateKey)!;
    userCounts.set(msg.username, (userCounts.get(msg.username) || 0) + 1);
  });

  // Convert to array format
  return Array.from(weeklyUserCounts.entries())
    .map(([date, userCounts]) => {
      const dataPoint: UserMessageVolumeData = { date };
      allUsers.forEach(user => {
        dataPoint[user] = userCounts.get(user) || 0;
      });
      return dataPoint;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Analyze activity heatmap (hour of day × day of week)
 */
export function analyzeActivityHeatmap(messages: Message[]): HeatmapData[] {
  const heatmapCounts = new Map<string, number>();

  messages.forEach(msg => {
    const hour = msg.timestamp.getHours();
    const day = msg.timestamp.getDay(); // 0 = Sunday, 6 = Saturday
    const key = `${hour}-${day}`;
    heatmapCounts.set(key, (heatmapCounts.get(key) || 0) + 1);
  });

  const data: HeatmapData[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      const key = `${hour}-${day}`;
      data.push({
        hour,
        day,
        count: heatmapCounts.get(key) || 0
      });
    }
  }

  return data;
}

/**
 * Check if a string is a URL or URL-related
 */
function isUrl(str: string): boolean {
  // Common URL patterns and indicators
  const urlPatterns = [
    'http', 'https', 'www', 'ftp',
    '.com', '.net', '.org', '.io', '.co', '.uk', '.de', '.fr',
    'discord', 'discordapp', 'tenor', 'giphy', 'imgur',
    'cdn', 'attachments', 'media'
  ];

  // Check if string contains URL patterns
  if (urlPatterns.some(pattern => str.includes(pattern))) {
    return true;
  }

  // Check if it's a long numeric ID (likely from Discord attachments)
  if (/^\d{10,}$/.test(str)) {
    return true;
  }

  return false;
}

/**
 * Check if a phrase contains URL-like content or attachment IDs
 */
function isUrlPhrase(phrase: string): boolean {
  // Common URL and platform patterns
  const urlPatterns = [
    'http', 'https', 'www', 'ftp',
    '.com', '.net', '.org', '.io', '.co',
    'discord', 'discordapp', 'tenor', 'giphy', 'imgur',
    'cdn', 'attachments', 'media', 'embed',
    'view', 'watch', 'channel', 'servers'
  ];

  // Check for URL patterns
  if (urlPatterns.some(pattern => phrase.includes(pattern))) {
    return true;
  }

  // Check if phrase contains long numeric IDs (Discord attachment IDs)
  if (/\d{10,}/.test(phrase)) {
    return true;
  }

  // Filter out phrases that are mostly just domain extensions
  const words = phrase.split(' ');
  if (words.some(word => ['com', 'net', 'org', 'io', 'co', 'uk', 'de', 'fr'].includes(word))) {
    return true;
  }

  return false;
}
