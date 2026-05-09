import React, { useState, useEffect } from "react";
import CreateExpense from "./CreateExpense";
import ViewExpenses from "./ViewExpenses";
import ModifyExpense from "./ModifyExpense";

const ExpenseManagementApp = ({ initialView }) => {
  // Logic to determine which sub-page to show
  const [view, setView] = useState(initialView || "VIEW");
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Sync internal state if the prop changes (e.g., clicking 'Create' from Dashboard)
  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  // Handler to switch to the Edit/Modify screen
  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setView("MODIFY");
  };

  // Generic back handler to return to the main list
  const handleBack = () => {
    setSelectedExpense(null);
    setView("VIEW");
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* 1. View/Search All Expenses */}
      {view === "VIEW" && (
        <ViewExpenses onEdit={handleEdit} />
      )}

      {/* 2. Create New Expense */}
      {view === "CREATE" && (
        <CreateExpense onCancel={handleBack} />
      )}

      {/* 3. Modify/Delete Existing Expense */}
      {view === "MODIFY" && (
        <ModifyExpense 
          expense={selectedExpense} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
};

export default ExpenseManagementApp;