import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, RefreshIcon } from "../../assets/icons";

interface DashboardHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  refreshing,
  onRefresh,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Upload
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Revenue Automation Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Manage contract revenue recognition and audit compliance
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          ) : (
            <RefreshIcon className="w-4 h-4 mr-2" />
          )}
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
};
