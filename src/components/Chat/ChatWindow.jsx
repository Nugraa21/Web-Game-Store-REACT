import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import ChatList from './ChatList.jsx';

function ChatWindow({ activeChat, setActiveChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        participantName: doc.data().participants.find((p) => p !== currentUser.email),
        lastMessage: doc.data().messages?.[0]?.content || '',
      }));
      setChats(chatList);
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [activeChat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
      senderId: currentUser.email,
      content: newMessage,
      timestamp: new Date(),
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-1">
      <div className="w-1/3">
        <ChatList chats={chats} setActiveChat={setActiveChat} />
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{activeChat.participantName}</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 p-2 rounded-lg max-w-xs ${
                    msg.senderId === currentUser.email
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 border rounded-l"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white p-2 rounded-r"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;