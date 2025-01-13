import { useState } from "react";

/* eslint-disable react/prop-types */
const ChatRoom = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState("");
  const currentUser = localStorage.getItem("username"); // Get current user's username

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex h-96 flex-col">
      <div className="flex-1 overflow-y-scroll p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 rounded p-2 w-fit ${
              msg.username === currentUser
                ? "mr-auto bg-green-100"
                : "ml-auto bg-gray-200"
            }`}
          >
            <p className="text-sm font-bold">
              {msg.username === currentUser ? "You" : msg.username}
            </p>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded border p-2"
          />
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
export default ChatRoom;
