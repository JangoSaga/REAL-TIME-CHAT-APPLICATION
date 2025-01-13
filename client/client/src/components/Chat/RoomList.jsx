/* eslint-disable react/prop-types */
// src/components/Chat/RoomList.jsx
const RoomList = ({ rooms, onRoomSelect }) => {
  return (
    <div className="p-4 text-center  text-white border ">
      <h3 className="mb-4 text-lg font-bold ">Available Rooms</h3>
      <div className="space-y-2 text">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() =>
              onRoomSelect({ roomId: room.id, roomName: room.name })
            }
            className="w-full rounded bg-slate-800 p-2 hover:bg-slate-600 text-center "
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
};
export default RoomList;
