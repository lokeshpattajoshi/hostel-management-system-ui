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

  const loadHostels = async (name = "") => {
    try {
      const data = await fetchHostelsApi(name);
      setHostels(data);
    } catch (err) { alert(err.message); }
  };

  useEffect(() => { loadHostels(); }, []);

  const handleSave = async (data) => {
    try {
      if (view === "CREATE") {
        await createHostelApi(data);
      } else {
        await updateHostelApi(data.hostelId, data);
      }
      setView("VIEW");
      loadHostels();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this hostel?")) {
      try {
        await deleteHostelApi(id);
        loadHostels();
      } catch (err) { alert(err.message); }
    }
  };

  return (
    <div>
      {view === "VIEW" && (
        <ViewHostels 
          hostels={hostels} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSearch={() => loadHostels(searchQuery)}
          onDelete={handleDelete}
          onEdit={(h) => { setCurrentHostel(h); setView("MODIFY"); }} 
        />
      )}
      {view === "CREATE" && <CreateHostel onSave={handleSave} onCancel={() => setView("VIEW")} />}
      {view === "MODIFY" && <ModifyHostel hostel={currentHostel} onUpdate={handleSave} onCancel={() => setView("VIEW")} />}
    </div>
  );
};

export default HostelManagementApp;