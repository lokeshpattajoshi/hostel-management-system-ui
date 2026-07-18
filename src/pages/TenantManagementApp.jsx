import React, { useState, useEffect } from "react";
import ViewTenants from "./ViewTenants";
import CreateTenant from "./CreateTenant";
import ModifyTenant from "./ModifyTenant";

// ✅ Added userRole to the component props extraction
const TenantManagementApp = ({ initialView, userRole }) => {
  const [view, setView] = useState(initialView || "VIEW");
  const [selectedTenant, setSelectedTenant] = useState(null);

  // This ensures that when you click "Create" or "View All" 
  // from the Dashboard, the state actually updates here.
  useEffect(() => {
    if (initialView) setView(initialView);
  }, [initialView]);

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setView("MODIFY");
  };

  const handleBack = () => {
    setSelectedTenant(null);
    setView("VIEW");
  };

  // ✅ Added a placeholder handler for your Income navigation actions
  const handleViewIncome = (tenant) => {
    console.log("Navigating to income summary interface metrics for:", tenant);
    // Add logic here if you want to swap modules or open a custom ledger layout view modal
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* ✅ Forwarding userRole and passing down the view income handler to ViewTenants */}
      {view === "VIEW" && (
        <ViewTenants 
          onEdit={handleEdit} 
          onViewIncome={handleViewIncome}
          userRole={userRole} 
        />
      )}
      {view === "CREATE" && <CreateTenant onCancel={handleBack} />}
      {view === "MODIFY" && <ModifyTenant tenant={selectedTenant} onBack={handleBack} />}
    </div>
  );
};

export default TenantManagementApp;