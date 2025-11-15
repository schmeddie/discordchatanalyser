import type { WordFrequency } from '../types';
import { useMemo } from 'react';

interface Props {
  words: WordFrequency[];
}

export function WordCloud({ words }: Props) {
  // Calculate font sizes based on frequency
  const styledWords = useMemo(() => {
    if (words.length === 0) return [];

    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));

    return words.map((word) => {
      // Scale font size between 12px and 48px
      const normalized = (word.value - minValue) / (maxValue - minValue || 1);
      const fontSize = 12 + normalized * 36;

      // Generate a color based on frequency (blue shades)
      const hue = 210 + normalized * 30; // Blue to cyan
      const saturation = 60 + normalized * 30;
      const lightness = 40 + normalized * 20;

      return {
        ...word,
        fontSize,
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`
      };
    });
  }, [words]);

  return (
    <div className="card">
      <h2>🗣️ Word Cloud - Top 50 Words</h2>
      <div className="word-cloud">
        {styledWords.map((word, index) => (
          <span
            key={`${word.text}-${index}`}
            className="word-cloud-item"
            style={{
              fontSize: `${word.fontSize}px`,
              color: word.color
            }}
            title={`${word.text}: ${word.value} occurrences`}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
}
