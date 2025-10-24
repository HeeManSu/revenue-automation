import React, { useState, useEffect } from "react";
import {
  ApiService,
  type Contract,
  type RevenueSchedule,
  type AuditMemo,
} from "../services/api";

export const Dashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [revenueSchedules, setRevenueSchedules] = useState<RevenueSchedule[]>(
    []
  );
  const [auditMemos, setAuditMemos] = useState<AuditMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError("");
      const contractsData = await ApiService.getContracts();
      setContracts(contractsData);
    } catch (err) {
      setError("Failed to load contracts");
      console.error("Error loading contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshContracts = async () => {
    try {
      setRefreshing(true);
      const contractsData = await ApiService.getContracts();
      setContracts(contractsData);
    } catch (err) {
      setError("Failed to refresh contracts");
      console.error("Error refreshing contracts:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleContractSelect = async (contract: Contract) => {
    setSelectedContract(contract);
    setRevenueSchedules([]);
    setAuditMemos([]);
    setLoadingDetails(true);
    setError("");

    try {
      const [schedules, memos] = await Promise.all([
        ApiService.getRevenueSchedules(contract.id),
        ApiService.getAuditMemos(contract.id),
      ]);
      setRevenueSchedules(schedules);
      setAuditMemos(memos);
    } catch (err) {
      console.error("Error loading contract details:", err);
      setError("Failed to load contract details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      uploaded: { color: "bg-blue-100 text-blue-800", label: "Uploaded" },
      processing: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Processing",
      },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      error: { color: "bg-red-100 text-red-800", label: "Error" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.uploaded;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-3">
                <button
                  onClick={loadContracts}
                  className="text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Revenue Automation Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage contract revenue recognition and audit compliance
            </p>
          </div>
          <button
            onClick={refreshContracts}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
            ) : (
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Contracts
                  </h2>
                  <p className="text-sm text-gray-500">
                    {contracts.length} total contracts
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {contracts.filter((c) => c.status === "processed").length}{" "}
                    Processed
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {contracts.filter((c) => c.status === "uploaded").length}{" "}
                    Uploaded
                  </span>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {contracts.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  No contracts found. Upload a contract to get started.
                </div>
              ) : (
                contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedContract?.id === contract.id
                        ? "bg-primary-50 border-r-4 border-primary-500"
                        : ""
                    }`}
                    onClick={() => handleContractSelect(contract)}
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
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatCurrency(
                            contract.total_value,
                            contract.currency
                          )}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className="text-xs text-gray-400">
                            {formatDate(contract.created_at)}
                          </p>
                          {contract.start_date && contract.end_date && (
                            <p className="text-xs text-gray-400">
                              {formatDate(contract.start_date)} -{" "}
                              {formatDate(contract.end_date)}
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

        {/* Contract Details */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <div className="space-y-6">
              {/* Contract Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Contract Details
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedContract.status)}
                    {selectedContract.status === "processed" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Customer
                      </dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {selectedContract.customer_name || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Total Value
                      </dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {formatCurrency(
                          selectedContract.total_value,
                          selectedContract.currency
                        )}
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
                      <dt className="text-sm font-medium text-gray-500">
                        File Name
                      </dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {selectedContract.file_name || "N/A"}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Schedule */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Revenue Schedule
                  </h3>
                  {loadingDetails ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                      Loading...
                    </div>
                  ) : revenueSchedules.length > 0 ? (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Total:{" "}
                        {formatCurrency(
                          revenueSchedules.reduce(
                            (sum, s) => sum + (s.amount || 0),
                            0
                          )
                        )}
                      </span>
                      <span>
                        Recognized:{" "}
                        {formatCurrency(
                          revenueSchedules
                            .filter((s) => s.recognized)
                            .reduce((sum, s) => sum + (s.amount || 0), 0)
                        )}
                      </span>
                    </div>
                  ) : null}
                </div>
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">
                      Loading revenue schedule...
                    </p>
                  </div>
                ) : revenueSchedules.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm mt-2">
                      No revenue schedule available
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Revenue schedule will appear after contract processing
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {revenueSchedules.map((schedule) => (
                          <tr key={schedule.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(schedule.period_start)} -{" "}
                              {formatDate(schedule.period_end)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(schedule.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  schedule.recognized
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {schedule.recognized ? "Recognized" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Audit Memos */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Audit Memos
                  </h3>
                  {loadingDetails ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                      Loading...
                    </div>
                  ) : auditMemos.length > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {auditMemos.length} memo
                      {auditMemos.length !== 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">
                      Loading audit memos...
                    </p>
                  </div>
                ) : auditMemos.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm mt-2">
                      No audit memos available
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Audit memos will appear after contract processing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditMemos.map((memo) => (
                      <div
                        key={memo.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            Audit Memorandum
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(memo.created_at)}
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                            {memo.memo_text}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No contract selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a contract from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
