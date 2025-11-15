import { useState, useCallback } from 'react';
import './App.css';
import { FileUploader } from './components/FileUploader';
import { UserLeaderboard } from './components/UserLeaderboard';
import { WordCloud } from './components/WordCloud';
import { TopPhrases } from './components/TopPhrases';
import { MessageVolumeChart } from './components/MessageVolumeChart';
import { UserVolumeChart } from './components/UserVolumeChart';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { parseMultipleFiles } from './utils/parser';
import { analyzeChat } from './utils/analysis';
import type { AnalysisResults } from './types';

function App() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse files
      const chatDataList = await parseMultipleFiles(files);

      // Analyze data
      const results = analyzeChat(chatDataList);
      setAnalysisResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing files');
      console.error('Error processing files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisResults(null);
    setError(null);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>💬 Discord Chat Analyzer</h1>
        <p>Upload your Discord chat exports to gain powerful insights</p>
      </header>

      <main className="app-main">
        {!analysisResults && !isLoading && (
          <FileUploader onFilesSelected={handleFilesSelected} />
        )}

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing your chat data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={handleReset} className="reset-button">
              Try Again
            </button>
          </div>
        )}

        {analysisResults && (
          <>
            <div className="results-header">
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Total Messages</span>
                  <span className="stat-value">{analysisResults.totalMessages.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Users</span>
                  <span className="stat-value">{analysisResults.topUsers.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique Words</span>
                  <span className="stat-value">{analysisResults.wordFrequencies.length}</span>
                </div>
              </div>
              <button onClick={handleReset} className="reset-button">
                🔄 Analyze New Files
              </button>
            </div>

            <div className="dashboard">
              <UserLeaderboard users={analysisResults.topUsers} />

              <WordCloud words={analysisResults.wordFrequencies} />

              <TopPhrases
                twoWordPhrases={analysisResults.topPhrases.twoWord}
                threeWordPhrases={analysisResults.topPhrases.threeWord}
              />

              <MessageVolumeChart data={analysisResults.messageVolumeOverTime} />

              <UserVolumeChart data={analysisResults.userMessageVolume} />

              <ActivityHeatmap data={analysisResults.heatmapData} />
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript + Recharts</p>
      </footer>
    </div>
  );
}

export default App;
