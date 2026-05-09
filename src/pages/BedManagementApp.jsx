import React, { useState, useEffect } from "react";
import { fetchBedsByHostelApi, createBedApi, updateBedApi, deleteBedApi } from "../services/api";
import ViewBeds from "./ViewBeds";
import CreateBed from "./CreateBed";
import AvailableBeds from "./AvailableBeds";

const BedManagementApp = ({ initialView = "VIEW" }) => {
  const [view, setView] = useState(initialView);
  const [beds, setBeds] = useState([]);
  const [currentBed, setCurrentBed] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setView(initialView); }, [initialView]);

 const loadBeds = async (hostelName = "") => {
  const data = await fetchBedsByHostelApi(hostelName);
  // Ensure we always set an array, even if the API failed (returned null)
  setBeds(data || []); 
 };

  useEffect(() => { loadBeds(); }, []);

  const handleSave = async (data) => {
    if (view === "CREATE") await createBedApi(data);
    else await updateBedApi(data.bedId, data);
    setView("VIEW");
    loadBeds();
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setView("VIEW")} style={tabStyle(view === "VIEW")}>All Beds</button>
        <button onClick={() => setView("AVAILABLE")} style={tabStyle(view === "AVAILABLE")}>Check Availability</button>
        <button onClick={() => setView("CREATE")} style={tabStyle(view === "CREATE")}>+ Add Bed</button>
      </div>

      {view === "VIEW" && <ViewBeds beds={beds} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={() => loadBeds(searchQuery)} onEdit={(b) => { setCurrentBed(b); setView("MODIFY"); }} onDelete={(id) => deleteBedApi(id).then(() => loadBeds())} />}
      {view === "AVAILABLE" && <AvailableBeds />}
      {(view === "CREATE" || view === "MODIFY") && <CreateBed onSave={handleSave} onCancel={() => setView("VIEW")} existingBed={currentBed} />}
    </div>
  );
};

const tabStyle = (active) => ({ padding: "10px 20px", cursor: "pointer", background: active ? "#007bff" : "#eee", color: active ? "white" : "black", border: "none", marginRight: "5px", borderRadius: "4px" });

export default BedManagementApp;