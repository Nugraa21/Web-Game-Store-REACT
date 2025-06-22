import Sidebar from '../components/Layout/Sidebar.jsx';
import Navbar from '../components/Layout/Navbar.jsx';
import ChatWindow from '../components/Chat/ChatWindow.jsx';
import AddFriend from '../components/Chat/AddFriend.jsx';
import Profile from '../components/Profile/Profile.jsx';
import { useState } from 'react';

function Homee() {
  const [activeChat, setActiveChat] = useState(null);
  const [view, setView] = useState('chat');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setView={setView} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        {view === 'chat' && <ChatWindow activeChat={activeChat} setActiveChat={setActiveChat} />}
        {view === 'addFriend' && <AddFriend />}
        {view === 'profile' && <Profile />}
      </div>
    </div>
  );
}

export default Homee;