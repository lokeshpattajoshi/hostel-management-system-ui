import React, { useState, useEffect } from "react";
import ViewTenants from "./ViewTenants";
import CreateTenant from "./CreateTenant";
import ModifyTenant from "./ModifyTenant";

const TenantManagementApp = ({ initialView }) => {
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

  return (
    <div style={{ padding: "10px" }}>
      {view === "VIEW" && <ViewTenants onEdit={handleEdit} />}
      {view === "CREATE" && <CreateTenant onCancel={handleBack} />}
      {view === "MODIFY" && <ModifyTenant tenant={selectedTenant} onBack={handleBack} />}
    </div>
  );
};

export default TenantManagementApp;