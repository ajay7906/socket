import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function PlayerDashboard() {
  const [clickCount, setClickCount] = useState(0);
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit('playerConnected', { token: localStorage.getItem('token') });
    socket.on('updateClickCount', (data) => {
      setClickCount(data.clickCount);
    });
    socket.on('updateRankings', (data) => {
      setPlayers(data);
    });

    return () => {
      socket.off('updateClickCount');
      socket.off('updateRankings');
    };
  }, []);

  const handleBananaClick = () => {
    socket.emit('bananaClick', { token: localStorage.getItem('token') });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Player Dashboard</h2>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
      <div className="flex flex-col items-center">
        <button
          onClick={handleBananaClick}
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg text-lg font-bold mb-4 hover:bg-yellow-500"
        >
          🍌 Click Banana
        </button>
        <p className="text-xl">Your Banana Clicks: {clickCount}</p>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Rankings</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Rank</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player._id}>
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{player.email}</td>
                  <td className="p-2">{player.clickCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PlayerDashboard;