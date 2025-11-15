export interface Message {
  timestamp: Date;
  username: string;
  content: string;
}

export interface ChatData {
  guild: string;
  channel: string;
  messages: Message[];
}

export interface UserStats {
  username: string;
  messageCount: number;
  percentage: number;
}

export interface WordFrequency {
  text: string;
  value: number;
}

export interface PhraseFrequency {
  phrase: string;
  count: number;
}

export interface MessageVolumeData {
  date: string;
  count: number;
}

export interface UserMessageVolumeData {
  date: string;
  [username: string]: string | number;
}

export interface HeatmapData {
  hour: number;
  day: number;
  count: number;
}

export interface AnalysisResults {
  topUsers: UserStats[];
  wordFrequencies: WordFrequency[];
  topPhrases: {
    twoWord: PhraseFrequency[];
    threeWord: PhraseFrequency[];
  };
  messageVolumeOverTime: MessageVolumeData[];
  userMessageVolume: UserMessageVolumeData[];
  heatmapData: HeatmapData[];
  totalMessages: number;
}
