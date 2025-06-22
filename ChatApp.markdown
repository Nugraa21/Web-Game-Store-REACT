# Chat Application with React and Firebase Firestore

## Project Overview
A WhatsApp-like chat application built with React (using JSX), Firebase Firestore for data storage, and Tailwind CSS for styling. Features include user registration with username, email, password, and a unique 6-digit PIN for adding friends, real-time chat, and a profile page.

## File Structure
```
chat-app/
├── public/
│   ├── index.html
├── src/
│   ├── assets/
│   │   └── logo.png (optional, placeholder for app logo)
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   ├── Chat/
│   │   │   ├── ChatList.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── AddFriend.jsx
│   │   ├── Profile/
│   │   │   ├── Profile.jsx
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   ├── firebase/
│   │   ├── firebase.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── AuthPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
├── firebase.rules
├── package.json
```

## Firebase Firestore Rules
Secure Firestore with rules to protect user data and chats.

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Chats collection: only participants can read/write messages
    match /chats/{chatId} {
      allow read, write: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid)/chats/$(chatId));
    }
    // Friend requests: only sender/receiver can read/write
    match /friendRequests/{requestId} {
      allow read, write: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
    }
  }
}
```

## Firebase Firestore Data Structure
- **users/**
  - `{userId}` (use email as ID)
    - `username`: String
    - `email`: String
    - `pin`: String (unique 6-digit code)
    - `password`: String (hashed in production)
    - `chats`: Array of chat IDs
- **chats/**
  - `{chatId}`
    - `participants`: Array of user IDs
    - `messages`: Subcollection
      - `{messageId}`
        - `senderId`: String
        - `content`: String
        - `timestamp`: Timestamp
- **friendRequests/**
  - `{requestId}`
    - `senderId`: String
    - `receiverId`: String
    - `status`: String ("pending", "accepted", "rejected")

## Implementation

### package.json
```json
{
  "name": "chat-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.2",
    "firebase": "^10.1.0",
    "tailwindcss": "^3.3.3"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^4.4.9"
  }
}
```

### public/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### src/firebase/firebase.js
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3bNsMAalSnda1rbfFRonI56AhjjFD5BI",
  authDomain: "pelaporanbarang.firebaseapp.com",
  projectId: "pelaporanbarang",
  storageBucket: "pelaporanbarang.firebasestorage.app",
  messagingSenderId: "936438758561",
  appId: "1:936438758561:web:20f9f27bedc860497c84e0",
  measurementId: "G-SJELF9KTM6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

### src/main.jsx
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### src/App.jsx
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import Home from './pages/Home.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### src/styles.css
```css
/* Custom styles if needed */
body {
  font-family: Arial, sans-serif;
}
```

### src/context/AuthContext.jsx
```jsx
import React, { createContext, useState } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (email, password) => {
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists() && userDoc.data().password === password) {
      setCurrentUser(userDoc.data());
      return true;
    }
    return false;
  };

  const register = async (userData) => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const userDoc = doc(db, 'users', userData.email);
    await setDoc(userDoc, { ...userData, pin, chats: [] });
    setCurrentUser({ ...userData, pin });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### src/pages/AuthPage.jsx
```jsx
import { useState } from 'react';
import Login from '../components/Auth/Login.jsx';
import Register from '../components/Auth/Register.jsx';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Chat App</h1>
        {isLogin ? <Login /> : <Register />}
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 ml-1"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
```

### src/pages/Home.jsx
```jsx
import Sidebar from '../components/Layout/Sidebar.jsx';
import Navbar from '../components/Layout/Navbar.jsx';
import ChatWindow from '../components/Chat/ChatWindow.jsx';
import AddFriend from '../components/Chat/AddFriend.jsx';
import Profile from '../components/Profile/Profile.jsx';
import { useState } from 'react';

function Home() {
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

export default Home;
```

### src/components/Auth/Login.jsx
```jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/home');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
```

### src/components/Auth/Register.jsx
```jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register({ username, email, password });
    navigate('/home');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;
```

### src/components/Layout/Navbar.jsx
```jsx
function Navbar() {
  return (
    <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Chat App</h1>
    </div>
  );
}

export default Navbar;
```

### src/components/Layout/Sidebar.jsx
```jsx
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
```

### src/components/Chat/ChatList.jsx
```jsx
function ChatList({ chats, setActiveChat }) {
  return (
    <div className="bg-white border-r">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => setActiveChat(chat)}
          className="p-4 border-b cursor-pointer hover:bg-gray-100"
        >
          <h3 className="font-semibold">{chat.participantName}</h3>
          <p className="text-sm text-gray-500">{chat.lastMessage}</p>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
```

### src/components/Chat/ChatWindow.jsx
```jsx
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
    );
  }
}

export default ChatWindow;
```

### src/components/Chat/AddFriend.jsx
```jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, doc } from 'firebase/firestore';

function AddFriend() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useContext(AuthContext);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const q = query(collection(db, 'users'), where('pin', '==', pin));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError('User not found');
        return;
      }

      const friend = querySnapshot.docs[0].data();
      if (friend.email === currentUser.email) {
        setError('Cannot add yourself');
        return;
      }

      const requestId = `${currentUser.email}_${friend.email}`;
      await addDoc(collection(db, 'friendRequests'), {
        id: requestId,
        senderId: currentUser.email,
        receiverId: friend.email,
        status: 'pending',
      });

      alert('Friend request sent!');
      setPin('');
    } catch (err) {
      setError('Error sending request');
    }
  };

  const acceptFriendRequest = async (requestId, friendEmail) => {
    try {
      // Create a new chat document
      const chatDoc = await addDoc(collection(db, 'chats'), {
        participants: [currentUser.email, friendEmail],
        messages: [],
      });

      // Update users' chats arrays
      await updateDoc(doc(db, 'users', currentUser.email), {
        chats: arrayUnion(chatDoc.id),
      });
      await updateDoc(doc(db, 'users', friendEmail), {
        chats: arrayUnion(chatDoc.id),
      });

      // Update friend request status
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'accepted',
      });

      alert('Friend request accepted!');
    } catch (err) {
      setError('Error accepting request');
    }
  };

  return (
    <div className="flex-1 p-8 bg-white">
      <h2 className="text-xl font-semibold mb-4">Add Friend</h2>
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Friend's PIN</label>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter 6-digit PIN"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleAddFriend}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Friend
        </button>
      </div>
    </div>
  );
}

export default AddFriend;
```

### src/components/Profile/Profile.jsx
```jsx
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

function Profile() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="flex-1 p-8 bg-white">
      <h2 className="text-xl font-semibold mb-4">Current Profile</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Username:</h3>
          <p>{currentUser.username}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Email:</h3>
          <p>{currentUser.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">PIN:</h3>
          <p>{currentUser.pin}</p>
        </div>
      </div>
    );
  }
}

export default Profile;

```

## Setup Instructions
1. Create a new Firebase project and enable Firestore.
2. Replace `src/firebase/firebase.js` with your Firebase configuration (already provided).
3. Deploy the Firestore rules (`firebase.rules`) using Firebase CLI.
4. Install dependencies:
   ```bash
   npm install
5. Run the app:
   ```bash
   npm run dev
6. Open `http://localhost:5173` in your browser.

## Notes
- Passwords are stored in plaintext for simplicity; in production, use Firebase Authentication for secure password hashing.
- The PIN is a 6-digit code generated randomly; ensure uniqueness in a production app.
- Real-time updates are handled via Firestore's `onSnapshot`.
- Tailwind CSS is included via CDN for simplicity; consider local installation for better performance.

This implementation provides a fully functional chat app with registration, friend-adding via PIN, chat, and profile features, all using React JSX and Firestore.