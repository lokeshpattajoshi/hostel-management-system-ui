import React, { useState, useEffect } from "react";
import { fetchHostelsApi, createHostelApi, updateHostelApi, deleteHostelApi } from "../services/api";
import ViewHostels from "./ViewHostels";
import CreateHostel from "./CreateHostel";
import ModifyHostel from "./ModifyHostel";

const HostelManagementApp = ({ initialView = "VIEW" }) => {
  const [view, setView] = useState(initialView);
  const [hostels, setHostels] = useState([]);
  const [currentHostel, setCurrentHostel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fix: Sync internal view state when initialView prop changes from Dashboard
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const loadHostels = async (name = "") => {
    try {
      const data = await fetchHostelsApi(name);
      setHostels(data);
    } catch (err) { 
      console.error("Load Error:", err);
      alert(err.message); 
    }
  };

  // Load hostels on initial mount
  useEffect(() => { 
    loadHostels(); 
  }, []);

  // ✅ Optimization: Auto-refresh list if user clears the search bar
  useEffect(() => {
    if (searchQuery === "") {
      loadHostels();
    }
  }, [searchQuery]);

  const handleSave = async (data) => {
    try {
      if (view === "CREATE") {
        await createHostelApi(data);
      } else {
        await updateHostelApi(data.hostelId, data);
      }
      setView("VIEW");
      loadHostels(); // Refresh the list after save
    } catch (err) { 
      alert(err.message); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hostel?")) {
      try {
        await deleteHostelApi(id);
        loadHostels();
      } catch (err) { 
        alert(err.message); 
      }
    }
  };

  return (
    <div style={{ background: "#fdfdfd", padding: "10px", borderRadius: "8px" }}>
      {view === "VIEW" && (
        <ViewHostels 
          hostels={hostels} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSearch={() => loadHostels(searchQuery)}
          onDelete={handleDelete}
          onEdit={(h) => { 
            setCurrentHostel(h); 
            setView("MODIFY"); 
          }} 
        />
      )}
      
      {view === "CREATE" && (
        <CreateHostel onSave={handleSave} onCancel={() => setView("VIEW")} />
      )}
      
      {view === "MODIFY" && (
        <ModifyHostel 
          hostel={currentHostel} 
          onUpdate={handleSave} 
          onCancel={() => setView("VIEW")} 
        />
      )}
    </div>
  );
};

export default HostelManagementApp;