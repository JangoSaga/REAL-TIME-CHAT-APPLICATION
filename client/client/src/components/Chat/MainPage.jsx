import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/SocketProvider";
import RoomList from "./RoomList";
import ChatRoom from "./ChatRoom";

const MainPage = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }

    socket.emit("get_rooms", (response) => {
      setRooms(response);
    });

    socket.emit("get_active_users", (users) => {
      setActiveUsers(users);
    });

    socket.on("new_room", (room) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on("message_received", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("prev_messages", (old_messages) => {
      setMessages((prev) => [...prev, ...old_messages]);
    });

    socket.on("user_status_change", ({ username, status, room }) => {
      setActiveUsers((prev) => {
        const updatedUsers = prev.filter((user) => user.username !== username);
        if (status === "online") {
          updatedUsers.push({ username, room });
        }
        return updatedUsers;
      });
    });

    return () => {
      socket.off("new_room");
      socket.off("message_received");
      socket.off("user_status_change");
      socket.off("prev_messages"); // Added
    };
  }, [socket, navigate, username]);

  const handleRoomSelect = ({ roomId, roomName }) => {
    socket.emit("join_room", { roomId: roomId, roomName: roomName });
    setCurrentRoom(roomId);
    console.log(roomName);
    setCurrentRoomName(roomName);
    // setMessages([]);
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      socket.emit("leave_room", currentRoom);
      setCurrentRoom(null);
      setMessages([]);
      setCurrentRoomName("");
    }
  };

  const handleLogout = () => {
    socket.emit("user_logout", username);
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleSendMessage = (message) => {
    if (currentRoom) {
      socket.emit("send_message", {
        room: currentRoom,
        message,
        username,
      });
    }
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      socket.emit("create_room", newRoomName);
      setNewRoomName("");
    }
  };
  console.log(activeUsers);
  return (
    <div className="flex h-screen bg-black">
      {!currentRoom && (
        <div className="bg-stone-900 p-5 border-r">
          <RoomList rooms={rooms} onRoomSelect={handleRoomSelect} />
          <div className="mt-4 grid-2 items-center space-x-2 p-2 border">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
              className="rounded border px-4 py-2 bg-slate-700 text-white"
            />
            <button
              onClick={handleCreateRoom}
              className="rounded bg-blue-500 px-2 py-2 text-white hover:bg-blue-600"
            >
              Create Room
            </button>
            <div className="m-4 border p-2">
              <h3 className="text-lg font-bold text-white">Active Users</h3>
              <ul>
                {activeUsers.map((user, index) => (
                  <li
                    key={index}
                    className={`${
                      user.room ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {user.username} (Online{" "}
                    {user.room ? `in ${user.room.roomName}` : "without a room"})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col mx-20">
        <div className="flex items-center justify-between border-b p-4 text-white">
          <h2 className="text-xl font-bold">
            {currentRoom ? `Room: ${currentRoomName}` : "Select a Room"}
          </h2>
          <div className="space-x-2">
            {currentRoom && (
              <button
                onClick={handleLeaveRoom}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Leave Room
              </button>
            )}
            {!currentRoom && (
              <button
                onClick={handleLogout}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        {currentRoom ? (
          <ChatRoom messages={messages} onSendMessage={handleSendMessage} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-gray-500">Select a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
