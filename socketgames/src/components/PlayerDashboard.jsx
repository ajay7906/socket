










import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function PlayerDashboard() {
  const [clickCount, setClickCount] = useState(0);
  const [players, setPlayers] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit('playerConnected', { token: localStorage.getItem('token') });
    socket.on('updateClickCount', (data) => {
      setClickCount(data.clickCount);
    });
    socket.on('updateRankings', (data) => {
      setPlayers(data);
    });
    socket.on('userBlocked', (data) => {
      setIsBlocked(true);
      setStatusMessage(data.message);
    });
    socket.on('userUnblocked', (data) => {
      setIsBlocked(false);
      setStatusMessage(data.message);
      setTimeout(() => setStatusMessage(''), 3000);
    });

    return () => {
      socket.off('updateClickCount');
      socket.off('updateRankings');
      socket.off('userBlocked');
      socket.off('userUnblocked');
    };
  }, []);

  const handleBananaClick = () => {
    if (!isBlocked) {
      socket.emit('bananaClick', { token: localStorage.getItem('token') });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Banana Clicker
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Logout
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-8 p-4 rounded-xl ${
            isBlocked ? 'bg-red-500/20 border-2 border-red-500/50' : 'bg-green-500/20 border-2 border-green-500/50'
          }`}>
            <p className={`text-lg font-semibold ${
              isBlocked ? 'text-red-100' : 'text-green-100'
            }`}>
              {isBlocked ? '🔴 ' : '🟢 '}{statusMessage}
            </p>
          </div>
        )}

        {/* Game Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-8">
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={handleBananaClick}
              disabled={isBlocked}
              className={`relative transform transition-all duration-200 ${
                isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-full shadow-2xl animate-pulse-slow">
                <span className="text-8xl">🍌</span>
              </div>
              <div className="absolute -bottom-6 right-0 bg-black/50 text-white px-4 py-1 rounded-full text-sm">
                Click Me!
              </div>
            </button>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-2">Your Score</p>
              <div className="bg-white/20 px-8 py-4 rounded-xl">
                <span className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {clickCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6">Leaderboard 🏆</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/10">
                  <th className="text-left py-4 px-6 text-yellow-400 font-bold">Rank</th>
                  <th className="text-left py-4 px-6 text-yellow-400 font-bold">Player</th>
                  <th className="text-left py-4 px-6 text-yellow-400 font-bold">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr 
                    key={player._id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-white font-semibold">
                      #{index + 1}
                    </td>
                    <td className="py-4 px-6 text-white">
                      <div className="flex items-center">
                        <span className="mr-2">👤</span>
                        {player.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="text-yellow-400 font-bold mr-2">🍌</span>
                        <span className="text-white font-semibold">
                          {player.clickCount}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerDashboard;