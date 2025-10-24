import React from "react";
import { type Contract } from "../../services/api";

interface ContractDetailsProps {
  selectedContract: Contract;
  formatCurrency: (amount?: number, currency?: string) => string;
  formatDate: (dateString?: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ContractDetails: React.FC<ContractDetailsProps> = ({
  selectedContract,
  formatCurrency,
  formatDate,
  getStatusBadge,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Contract Details
        </h3>
        <div className="flex items-center space-x-3">
          {getStatusBadge(selectedContract.status)}
          {selectedContract.status === "processed" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Ready
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {selectedContract.customer_name || "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Value</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formatCurrency(
                selectedContract.total_value,
                selectedContract.currency
              )}{" "}
              <span className="text-gray-500 text-xs ml-1">
                (Excluding discounts)
              </span>
            </dd>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contract Period
            </dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formatDate(selectedContract.start_date)} -{" "}
              {formatDate(selectedContract.end_date)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Name</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {selectedContract.file_name || "N/A"}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};
