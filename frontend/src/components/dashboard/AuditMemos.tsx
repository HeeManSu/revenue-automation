import React from "react";
import { type AuditMemo } from "../../services/api";
import AuditMemoViewer from "../AuditMemoViewer";
import { DocumentIcon } from "../../assets/icons";

interface AuditMemosProps {
  auditMemos: AuditMemo[];
  structuredMemos: any[];
  loadingDetails: boolean;
  onMemoClick: (memo: AuditMemo) => void;
  onStructuredMemoClick: (memo: any) => void;
  selectedContract: any;
  formatCurrency: (amount?: number, currency?: string) => string;
  formatDate: (dateString?: string) => string;
}

export const AuditMemos: React.FC<AuditMemosProps> = ({
  auditMemos,
  structuredMemos,
  loadingDetails,
  onMemoClick,
  onStructuredMemoClick,
  selectedContract,
  formatCurrency,
  formatDate,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">Audit Memos</h3>
        {loadingDetails ? (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Loading...
          </div>
        ) : auditMemos.length > 0 ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {auditMemos.length} memo{auditMemos.length !== 1 ? "s" : ""}
          </span>
        ) : null}
      </div>
      {loadingDetails ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-3">Loading audit memos...</p>
        </div>
      ) : auditMemos.length === 0 ? (
        <div className="text-center py-8">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 text-sm mt-2">No audit memos available</p>
          <p className="text-gray-400 text-xs mt-1">
            Audit memos will appear after contract processing
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {structuredMemos.length > 0
            ? structuredMemos.map((structuredMemo, index) => (
                <AuditMemoViewer
                  key={index}
                  memo={{
                    metadata: structuredMemo.metadata,
                    contract_summary: structuredMemo.contract_summary,
                  }}
                  onClick={() => onStructuredMemoClick(structuredMemo)}
                />
              ))
            : auditMemos.map((memo) => (
                <AuditMemoViewer
                  key={memo.id}
                  memo={{
                    metadata: {
                      standard:
                        "ASC 606 - Revenue from Contracts with Customers",
                      contract_id: String(
                        memo.contract_id || selectedContract?.external_id || ""
                      ),
                      analysis_date: formatDate(memo.created_at) || "",
                      prepared_by: "Automated Revenue Recognition System",
                    },
                    contract_summary: {
                      provider:
                        selectedContract?.file_name?.split("_")[0] || "",
                      customer: selectedContract?.customer_name || "",
                      effective_date:
                        formatDate(selectedContract?.start_date) || "",
                      end_date: formatDate(selectedContract?.end_date) || "",
                      total_consideration:
                        formatCurrency(
                          selectedContract?.total_value,
                          selectedContract?.currency
                        ) || "",
                    },
                  }}
                  onClick={() => onMemoClick(memo)}
                />
              ))}
        </div>
      )}
    </div>
  );
};
