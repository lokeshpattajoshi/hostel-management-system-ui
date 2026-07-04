import React, { useState, useEffect } from "react";
// ✅ Imported createBedApi alongside room endpoints
import { createRoomApi, updateRoomApi, deleteRoomApi, createBedApi } from "../services/api";
import ViewRooms from "./ViewRooms";
import CreateRoom from "./CreateRoom";
import ModifyRoom from "./ModifyRoom";

const RoomManagementApp = ({ initialView = "VIEW" }) => {
  const [view, setView] = useState(initialView);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  // Lifted up state to track and reset dropdown selection positions globally
  const [selectedHostelId, setSelectedHostelId] = useState("");

  // Sync internal view when changed from Dashboard
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleSave = async (data) => {
    try {
      if (view === "CREATE") {
        // 1. Send the request to create the base room object
        const newRoom = await createRoomApi(data);
        
        // 2. Automate bed generation if the room was created successfully and has a capacity
        if (newRoom && newRoom.roomId && data.capacity) {
          const bedCapacity = parseInt(data.capacity, 10) || 0;
          
          console.log(`Room created with ID: ${newRoom.roomId}. Generating ${bedCapacity} beds...`);
          
          // Use a strict sequential for-loop to keep database operations synchronized
          for (let i = 1; i <= bedCapacity; i++) {
            const bedPayload = {
              roomId: newRoom.roomId,
              bedNumber: `Bed-${i}`, // Creates "Bed-1", "Bed-2", "Bed-3", etc.
              isAvailable: true      // Default active status
            };
            
            await createBedApi(bedPayload);
          }
        }
        
        alert(`Room created successfully along with its ${data.capacity || 0} automated beds!`);
      } else {
        await updateRoomApi(data.roomId, data);
        alert("Room updated successfully!");
      }
      
      // FIXED: Reset active counts and dropdown picker index back to empty defaults
      setRooms([]);
      setSelectedHostelId(""); 
      setView("VIEW");
    } catch (err) {
      alert(err.message || "Failed to save room details.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }
    
    try {
      await deleteRoomApi(id);
      alert("Room deleted successfully!");
      
      // Optimistically remove the deleted room from the active UI list immediately
      setRooms((prevRooms) => prevRooms.filter((room) => room.roomId !== id));
    } catch (err) {
      alert(err.message || "Failed to delete the selected room.");
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
          setRooms={setRooms}
          selectedHostelId={selectedHostelId}     // Passed down to manage state
          setSelectedHostelId={setSelectedHostelId} // Passed down to alter state
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