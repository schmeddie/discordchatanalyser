import type { ChatData, Message } from '../types';

/**
 * Parse Discord chat export files
 * Format:
 * ==============================================================
 * Guild: Direct Messages
 * Channel: Edwood
 * ==============================================================
 *
 * [09/12/2023 11:42] sir_eddie
 * message content
 */
export function parseDiscordChat(fileContent: string): ChatData {
  const lines = fileContent.split('\n');

  let guild = '';
  let channel = '';
  const messages: Message[] = [];

  let currentMessage: Partial<Message> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Parse guild
    if (line.startsWith('Guild:')) {
      guild = line.replace('Guild:', '').trim();
      continue;
    }

    // Parse channel
    if (line.startsWith('Channel:')) {
      channel = line.replace('Channel:', '').trim();
      continue;
    }

    // Skip separator lines
    if (line.startsWith('====')) continue;

    // Parse message header: [DD/MM/YYYY HH:MM] username
    const messageHeaderMatch = line.match(/^\[(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})\]\s+(.+)$/);

    if (messageHeaderMatch) {
      // Save previous message if exists
      if (currentMessage && currentMessage.timestamp && currentMessage.username) {
        messages.push({
          timestamp: currentMessage.timestamp,
          username: currentMessage.username,
          content: currentMessage.content || ''
        });
      }

      // Start new message
      const [, timestampStr, username] = messageHeaderMatch;
      const timestamp = parseTimestamp(timestampStr);

      currentMessage = {
        timestamp,
        username,
        content: ''
      };
    } else if (currentMessage) {
      // This is message content (continuation)
      // Skip embed markers and URLs that are part of embeds
      if (line === '{Embed}' || line.startsWith('http')) {
        // Check if it's the first line of content
        if (!currentMessage.content) {
          currentMessage.content = line;
        } else {
          currentMessage.content += '\n' + line;
        }
      } else {
        // Regular message content
        if (!currentMessage.content) {
          currentMessage.content = line;
        } else {
          currentMessage.content += '\n' + line;
        }
      }
    }
  }

  // Save last message
  if (currentMessage && currentMessage.timestamp && currentMessage.username) {
    messages.push({
      timestamp: currentMessage.timestamp,
      username: currentMessage.username,
      content: currentMessage.content || ''
    });
  }

  return {
    guild,
    channel,
    messages
  };
}

/**
 * Parse timestamp from Discord format: DD/MM/YYYY HH:MM
 */
function parseTimestamp(timestampStr: string): Date {
  const [datePart, timePart] = timestampStr.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Parse multiple files
 */
export function parseMultipleFiles(files: File[]): Promise<ChatData[]> {
  const promises = files.map(file => {
    return new Promise<ChatData>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const chatData = parseDiscordChat(content);
          resolve(chatData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
  });

  return Promise.all(promises);
}
