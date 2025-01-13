import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/SocketProvider";

const Login = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { socket } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("check_username", username, (response) => {
      if (response.exists) {
        setError("Username already exists. Please choose another.");
      } else {
        socket.emit("user_login", username);
        localStorage.setItem("username", username);
        navigate("/chat");
      }
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-center">
      <div className="w-96 rounded-lg bg-stone-800 p-8 shadow-md m-auto">
        <h2 className="mb-6 text-2xl font-bold text-white">Start Chatting</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="mb-4 w-full rounded border-none p-2 bg-stone-700 text-white"
            required
          />
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
