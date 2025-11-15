import type { PhraseFrequency } from '../types';

interface Props {
  twoWordPhrases: PhraseFrequency[];
  threeWordPhrases: PhraseFrequency[];
}

export function TopPhrases({ twoWordPhrases, threeWordPhrases }: Props) {
  return (
    <div className="card">
      <h2>💬 Top Phrases</h2>
      <div className="phrases-container">
        <div className="phrases-section">
          <h3>Top 10 Two-Word Phrases</h3>
          <div className="phrases-list">
            {twoWordPhrases.map((phrase, index) => (
              <div key={`${phrase.phrase}-${index}`} className="phrase-item">
                <span className="phrase-rank">#{index + 1}</span>
                <span className="phrase-text">"{phrase.phrase}"</span>
                <span className="phrase-count">{phrase.count}×</span>
              </div>
            ))}
          </div>
        </div>

        <div className="phrases-section">
          <h3>Top 10 Three-Word Phrases</h3>
          <div className="phrases-list">
            {threeWordPhrases.map((phrase, index) => (
              <div key={`${phrase.phrase}-${index}`} className="phrase-item">
                <span className="phrase-rank">#{index + 1}</span>
                <span className="phrase-text">"{phrase.phrase}"</span>
                <span className="phrase-count">{phrase.count}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
