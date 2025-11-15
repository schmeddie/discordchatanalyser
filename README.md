# Discord Chat Analyzer

A powerful web-based tool to analyze Discord chat exports and generate insightful visualizations and statistics.

## Features

### File Upload
- **Drag-and-drop** or browse to upload one or more `.txt` files containing Discord chat exports
- Support for multiple files to analyze conversations across different channels or time periods

### Analytics & Insights

#### User Activity Leaderboard
- Top 5 most active users by message count
- Visual percentage bars showing contribution to total messages
- Medal rankings for top contributors

#### Word & Phrase Analysis
- **Word Cloud**: Visual representation of the top 50 most frequently used words (excluding common stop words)
- **Top Phrases**: Lists of the top 10 most common 2-word and 3-word phrases

#### Message Volume Analytics
- **Time Series Chart**: Line chart showing total message volume over time (daily granularity)
- **User Activity Chart**: Stacked area chart breaking down message volume by individual users over time

#### Activity Heatmap
- Visual heatmap showing message frequency by:
  - Hour of day (0-23)
  - Day of week (Sunday-Saturday)
- Helps identify peak activity times and patterns

## File Format

The tool expects Discord chat export files in the following format:

```
==============================================================
Guild: Direct Messages
Channel: ChannelName
==============================================================

[DD/MM/YYYY HH:MM] username
message content line 1
message content line 2

[DD/MM/YYYY HH:MM] another_user
another message

{Embed}
https://example.com/embedded-link
```

### Format Details:
- **Header**: Guild and Channel information separated by equal signs
- **Message Format**: `[DD/MM/YYYY HH:MM] username` followed by message content
- **Multi-line Messages**: Supported - content continues until the next timestamp
- **Embeds**: Marked with `{Embed}` tag (handled automatically)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discordchatanalyser
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Upload Files**:
   - Click the upload area or drag-and-drop your Discord chat export `.txt` files
   - Multiple files can be uploaded at once for combined analysis

2. **Generate Insights**:
   - Click the "Generate Insights" button
   - Wait for the analysis to complete (usually a few seconds)

3. **Explore Results**:
   - Scroll through the dashboard to view all analytics
   - Hover over charts and visualizations for detailed information
   - Click "Analyze New Files" to start over with different data

## Technology Stack

- **React 19**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Recharts**: Interactive chart library
- **date-fns**: Date manipulation and formatting
- **stopword**: Natural language processing for word filtering

## Project Structure

```
src/
├── components/          # React components
│   ├── ActivityHeatmap.tsx
│   ├── FileUploader.tsx
│   ├── MessageVolumeChart.tsx
│   ├── TopPhrases.tsx
│   ├── UserLeaderboard.tsx
│   ├── UserVolumeChart.tsx
│   └── WordCloud.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── analysis.ts     # Data analysis logic
│   └── parser.ts       # Discord chat parser
├── App.tsx             # Main application component
├── App.css             # Application styles
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

## Features in Detail

### Parser
The Discord chat parser (`src/utils/parser.ts`) handles:
- Multi-line messages
- Various timestamp formats
- Embedded content
- Multiple file processing
- Error handling and validation

### Analysis Engine
The analysis engine (`src/utils/analysis.ts`) provides:
- User statistics and rankings
- Word frequency analysis with stopword filtering
- N-gram phrase extraction (2-word and 3-word)
- Time-series data aggregation
- Heatmap data generation
- URL filtering to avoid noise in word analysis

### Visualizations
All visualizations are:
- **Responsive**: Adapts to different screen sizes
- **Interactive**: Hover effects and tooltips
- **Accessible**: Proper ARIA labels and semantic HTML
- **Performant**: Optimized rendering with React hooks

## Performance

- **Client-side Processing**: All analysis happens in the browser - no server required
- **Fast Analysis**: Handles thousands of messages in seconds
- **Memory Efficient**: Streaming file parsing with minimal memory footprint
- **Optimized Rendering**: React optimization techniques for smooth UX

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Future Enhancements

Potential features for future releases:
- Export analysis results as PDF or image
- Sentiment analysis
- Emoji usage statistics
- Response time analytics
- Conversation thread detection
- Custom date range filtering
- Dark mode support
- Download sample data for testing

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
