import React from "react";
import { DocumentIcon } from "../assets/icons";

interface AuditMemoProps {
  memo: {
    metadata: {
      standard: string;
      contract_id: string;
      analysis_date: string;
      prepared_by: string;
    };
    contract_summary: {
      provider: string;
      customer: string;
      effective_date: string;
      end_date: string;
      total_consideration: string;
    };
  };
  onClick?: () => void;
}

const AuditMemoViewer: React.FC<AuditMemoProps> = ({ memo, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-blue-300" : ""
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <DocumentIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Audit Memorandum
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Generated on {memo.metadata.analysis_date}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full flex-shrink-0">
            ASC 606 Compliant
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex">
            <span className="font-medium text-gray-500 w-24 flex-shrink-0">
              Contract ID:
            </span>
            <span className="text-gray-900">{memo.metadata.contract_id}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-500 w-24 flex-shrink-0">
              Provider:
            </span>
            <span className="text-gray-900">
              {memo.contract_summary.provider}
            </span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-500 w-24 flex-shrink-0">
              Customer:
            </span>
            <span className="text-gray-900">
              {memo.contract_summary.customer}
            </span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-500 w-24 flex-shrink-0">
              Total Value:
            </span>
            <span className="text-gray-900 font-semibold">
              {memo.contract_summary.total_consideration}
            </span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-500 w-24 flex-shrink-0">
              Period:
            </span>
            <span className="text-gray-900">
              {memo.contract_summary.effective_date} to{" "}
              {memo.contract_summary.end_date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditMemoViewer;
