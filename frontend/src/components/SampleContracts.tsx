import React from "react";
import { DocumentIcon } from "../assets/icons";

interface SampleContract {
  id: string;
  name: string;
  description: string;
  value: string;
  duration: string;
  type: string;
}

interface SampleContractsProps {
  onContractSelect: (contract: SampleContract) => void;
  isUploading?: boolean;
}

const sampleContracts: SampleContract[] = [
  {
    id: "acme",
    name: "ACME Global Inc.",
    description: "Finance Automation Platform - 2 Year Contract",
    value: "$330,000",
    duration: "2 years",
    type: "SaaS + Implementation",
  },
  {
    id: "neuraxis",
    name: "Neuraxis Therapeutics",
    description: "Revenue Recognition Suite - 2 Year Contract",
    value: "$430,000",
    duration: "2 years",
    type: "SaaS + AI Analytics",
  },
  {
    id: "omega",
    name: "Omega Biopharma Ltd.",
    description: "Enterprise AI Compliance Suite - 2 Year Contract",
    value: "$412,000",
    duration: "2 years",
    type: "SaaS + Compliance",
  },
];

export const SampleContracts: React.FC<SampleContractsProps> = ({
  onContractSelect,
  isUploading = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="text-center mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Try Sample Contracts
        </h3>
        <p className="text-xs text-gray-600">
          {isUploading
            ? "Uploading sample contract..."
            : "Click on any sample contract to see how our AI processes it"}
        </p>
        {isUploading && (
          <div className="flex justify-center mt-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sampleContracts.map((contract) => (
          <button
            key={contract.id}
            onClick={() => onContractSelect(contract)}
            disabled={isUploading}
            className="group p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <DocumentIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {contract.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {contract.description}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs font-medium text-green-600">
                    {contract.value}
                  </span>
                  <span className="text-xs text-gray-400">
                    {contract.duration}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {contract.type}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          These are real contract examples to demonstrate our AI capabilities
        </p>
      </div>
    </div>
  );
};
