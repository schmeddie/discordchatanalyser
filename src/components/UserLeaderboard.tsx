import type { UserStats } from '../types';

interface Props {
  users: UserStats[];
}

export function UserLeaderboard({ users }: Props) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="card">
      <h2>🏆 User Activity Leaderboard</h2>
      <div className="leaderboard">
        {users.map((user, index) => (
          <div key={user.username} className="leaderboard-item">
            <div className="leaderboard-rank">
              {index < 3 ? medals[index] : `#${index + 1}`}
            </div>
            <div className="leaderboard-user">{user.username}</div>
            <div className="leaderboard-stats">
              <div className="message-count">{user.messageCount.toLocaleString()} messages</div>
              <div className="percentage">{user.percentage.toFixed(1)}%</div>
            </div>
            <div className="leaderboard-bar">
              <div
                className="leaderboard-bar-fill"
                style={{ width: `${user.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
