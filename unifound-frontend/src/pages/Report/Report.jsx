import React from "react";
import ReportItemForm from "../../components/ReportItemForm/ReportItemForm";

const Report = () => {
  return (
    <ReportItemForm
      onSubmit={(data) => console.log(data)}
      onCancel={() => navigate(-1)}
    />
  );
};

export default Report;
