import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Sidebar({ setView }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>
      <div className="flex-1">
        <button
          onClick={() => setView('chat')}
          className="w-full text-left p-4 hover:bg-gray-100"
        >
          Chats
        </button>
        <button
          onClick={() => setView('addFriend')}
          className="w-full text-left p-4 hover:bg-gray-100"
        >
          Add Friend
        </button>
        <button
          onClick={() => setView('profile')}
          className="w-full text-left p-4 hover:bg-gray-100"
        >
          Profile
        </button>
      </div>
      <button
        onClick={handleLogout}
        className="p-4 text-red-500 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;