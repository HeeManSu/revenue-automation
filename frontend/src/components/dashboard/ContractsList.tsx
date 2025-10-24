import React from "react";
import { type Contract } from "../../services/api";
import { CheckCircleIcon, XCircleIcon, DocumentIcon } from "../../assets/icons";

interface ContractsListProps {
  contracts: Contract[];
  selectedContract: Contract | null;
  onContractSelect: (contract: Contract) => void;
  formatCurrency: (amount?: number, currency?: string) => string;
  formatDate: (dateString?: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getContractStatusText: (contract: Contract) => string;
}

export const ContractsList: React.FC<ContractsListProps> = ({
  contracts,
  selectedContract,
  onContractSelect,
  formatCurrency,
  formatDate,
  getStatusBadge,
  getContractStatusText,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Contracts</h2>
              <p className="text-sm text-gray-500 mt-1">
                {contracts.length} total contracts
              </p>
            </div>
            <div className="flex space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {
                  contracts.filter(
                    (c) => c.status === "processed" || c.status === "completed"
                  ).length
                }{" "}
                Processed
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {
                  contracts.filter(
                    (c) => c.status === "uploaded" || c.status === "processing"
                  ).length
                }{" "}
                Uploaded
              </span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {contracts.length === 0 ? (
            <div className="px-8 py-8 text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <DocumentIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm">No contracts found.</p>
              <p className="text-xs text-gray-400 mt-1">
                Upload a contract to get started.
              </p>
            </div>
          ) : (
            contracts.map((contract) => (
              <div
                key={contract.id}
                className={`px-8 py-6 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                  selectedContract?.id === contract.id
                    ? "bg-blue-50 border-r-4 border-blue-500"
                    : ""
                }`}
                onClick={() => onContractSelect(contract)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contract.customer_name ||
                          contract.file_name ||
                          `Contract #${contract.id}`}
                      </p>
                      {contract.status === "processed" && (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      )}
                      {contract.status === "processing" && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                      )}
                      {contract.status === "error" && (
                        <XCircleIcon className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {contract.total_value
                        ? formatCurrency(
                            contract.total_value,
                            contract.currency
                          )
                        : "Pending..."}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <p className="text-xs text-gray-400">
                        Uploaded: {formatDate(contract.created_at)}
                      </p>
                      {contract.start_date && contract.end_date ? (
                        <p className="text-xs text-gray-400">
                          {formatDate(contract.start_date)} -{" "}
                          {formatDate(contract.end_date)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          {getContractStatusText(contract)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {getStatusBadge(contract.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
