import React, { useState, useEffect } from "react";
import ViewIncome from "./ViewIncome";
import CreateIncome from "./CreateIncome";
import ModifyIncome from "./ModifyIncome";

const IncomeManagementApp = ({ initialView }) => {
  const [currentView, setCurrentView] = useState("VIEW");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const handleEditTrigger = (record) => {
    setSelectedRecord(record);
    setCurrentView("MODIFY");
  };

  const handleCreateTrigger = () => {
    setSelectedRecord(null);
    setCurrentView("CREATE");
  };

  const handleReturnToList = () => {
    setSelectedRecord(null);
    setCurrentView("VIEW");
  };

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #eee" }}>
      {currentView === "VIEW" && (
        <ViewIncome 
          onModifyTrigger={handleEditTrigger} 
          onCreateTrigger={handleCreateTrigger} 
        />
      )}

      {currentView === "CREATE" && (
        <CreateIncome 
          onSave={handleReturnToList} 
          onCancel={handleReturnToList} 
        />
      )}

      {currentView === "MODIFY" && (
        <ModifyIncome 
          activeRecord={selectedRecord} 
          onSave={handleReturnToList} 
          onCancel={handleReturnToList} 
        />
      )}
    </div>
  );
};

export default IncomeManagementApp;