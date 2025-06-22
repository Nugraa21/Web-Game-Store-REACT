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