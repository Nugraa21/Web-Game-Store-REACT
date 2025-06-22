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