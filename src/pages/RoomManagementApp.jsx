import React, { useState, useEffect } from "react";
import { fetchRoomsByHostelApi, createRoomApi, updateRoomApi, deleteRoomApi } from "../services/api";
import ViewRooms from "./ViewRooms";
import CreateRoom from "./CreateRoom";
import ModifyRoom from "./ModifyRoom";

const RoomManagementApp = ({ initialView = "VIEW" }) => {
  const [view, setView] = useState(initialView);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync internal view when changed from Dashboard
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const loadRooms = async (hostelName = "") => {
    try {
      const data = await fetchRoomsByHostelApi(hostelName);
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSave = async (data) => {
    try {
      if (view === "CREATE") {
        await createRoomApi(data);
      } else {
        await updateRoomApi(data.roomId, data);
      }
      setView("VIEW");
      loadRooms();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await deleteRoomApi(id);
        loadRooms();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (room) => {
    setCurrentRoom(room);
    setView("MODIFY");
  };

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      {view === "VIEW" && (
        <ViewRooms
          rooms={rooms}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={() => loadRooms(searchQuery)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      {view === "CREATE" && (
        <CreateRoom onSave={handleSave} onCancel={() => setView("VIEW")} />
      )}

      {view === "MODIFY" && (
        <ModifyRoom 
          room={currentRoom} 
          onUpdate={handleSave} 
          onCancel={() => setView("VIEW")} 
        />
      )}
    </div>
  );
};

export default RoomManagementApp;