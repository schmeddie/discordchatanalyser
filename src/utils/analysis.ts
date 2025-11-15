import { format, startOfDay } from 'date-fns';
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
 * Analyze message volume over time (daily)
 */
export function analyzeMessageVolumeOverTime(messages: Message[]): MessageVolumeData[] {
  const dailyCounts = new Map<string, number>();

  messages.forEach(msg => {
    const dateKey = format(startOfDay(msg.timestamp), 'yyyy-MM-dd');
    dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);
  });

  return Array.from(dailyCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Analyze message volume over time by user (stacked area chart data)
 */
export function analyzeUserMessageVolume(messages: Message[]): UserMessageVolumeData[] {
  const dailyUserCounts = new Map<string, Map<string, number>>();
  const allUsers = new Set<string>();

  messages.forEach(msg => {
    const dateKey = format(startOfDay(msg.timestamp), 'yyyy-MM-dd');
    allUsers.add(msg.username);

    if (!dailyUserCounts.has(dateKey)) {
      dailyUserCounts.set(dateKey, new Map());
    }

    const userCounts = dailyUserCounts.get(dateKey)!;
    userCounts.set(msg.username, (userCounts.get(msg.username) || 0) + 1);
  });

  // Convert to array format
  return Array.from(dailyUserCounts.entries())
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
 * Check if a string is a URL
 */
function isUrl(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://') || str.includes('.com') || str.includes('.net');
}

/**
 * Check if a phrase contains URL-like content
 */
function isUrlPhrase(phrase: string): boolean {
  return phrase.includes('http') || phrase.includes('www') || phrase.includes('.com');
}
