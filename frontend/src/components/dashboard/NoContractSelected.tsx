import React from "react";
import { DocumentIcon } from "../../assets/icons";

export const NoContractSelected: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-12 text-center">
      <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No contract selected
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Select a contract from the list to view details
      </p>
    </div>
  );
};
