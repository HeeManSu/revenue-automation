import React, { useState, useEffect } from "react";
import {
  ApiService,
  type Contract,
  type RevenueSchedule,
  type AuditMemo,
} from "../services/api";
import AuditMemoDetailViewer from "./AuditMemoDetailViewer";
import { ContractsList } from "./dashboard/ContractsList";
import { ContractDetails } from "./dashboard/ContractDetails";
import { RevenueScheduleTable } from "./dashboard/RevenueSchedule";
import { AuditMemos } from "./dashboard/AuditMemos";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { NoContractSelected } from "./dashboard/NoContractSelected";
import { ErrorState } from "./dashboard/ErrorState";
import { LoadingState } from "./dashboard/LoadingState";
import { TimeSavedMeter } from "./TimeSavedMeter";
import {
  ArrowLeftIcon,
  DocumentIcon,
  CheckCircleOutlineIcon,
  ClockIcon,
  DollarIcon,
} from "../assets/icons";

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
  const [selectedMemo, setSelectedMemo] = useState<any>(null);
  const [showDetailedMemo, setShowDetailedMemo] = useState(false);
  const [structuredMemos, setStructuredMemos] = useState<any[]>([]);
  const [totalTimeSaved, setTotalTimeSaved] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadContracts();
  }, []);

  // Polling effect for contract status updates
  useEffect(() => {
    const pollContracts = async () => {
      try {
        const updatedContracts = await ApiService.getContracts();
        setContracts(updatedContracts);
        setTotalTimeSaved(calculateTotalTimeSaved(updatedContracts));
      } catch (err) {
        console.error("Error polling contracts:", err);
      }
    };

    const pollInterval = setInterval(() => {
      if (contracts.length > 0) {
        pollContracts();
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [contracts.length]);

  const calculateTotalTimeSaved = (contracts: Contract[]) => {
    return contracts
      .filter(
        (contract) =>
          contract.status === "processed" && contract.time_saved_hours
      )
      .reduce((total, contract) => total + (contract.time_saved_hours || 0), 0);
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError("");
      const contractsData = await ApiService.getContracts();
      setContracts(contractsData);
      setTotalTimeSaved(calculateTotalTimeSaved(contractsData));
      console.log("Total time saved:", totalTimeSaved);
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
      setTotalTimeSaved(calculateTotalTimeSaved(contractsData));
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
    setStructuredMemos([]);
    setLoadingDetails(true);
    setError("");
    setCurrentPage(1); // Reset to first page when selecting new contract

    try {
      const [schedules, memos] = await Promise.all([
        ApiService.getRevenueSchedules(
          contract.external_id || contract.id.toString()
        ),
        ApiService.getAuditMemos(
          contract.external_id || contract.id.toString()
        ),
      ]);
      setRevenueSchedules(schedules);
      setAuditMemos(memos);

      // Fetch structured memo data for each audit memo
      if (memos.length > 0) {
        try {
          const contractId = contract.external_id || contract.id.toString();
          console.log(`Fetching structured memo for contract: ${contractId}`);
          const structuredMemo = await ApiService.getStructuredAuditMemo(
            contractId
          );
          console.log("Structured memo received:", structuredMemo);
          setStructuredMemos([structuredMemo]);
        } catch (err) {
          console.error("Error fetching structured memo:", err);
          // Continue without structured data - this is optional
          setStructuredMemos([]);
        }
      }
    } catch (err) {
      console.error("Error loading contract details:", err);
      setError("Failed to load contract details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(revenueSchedules.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMemoClick = async () => {
    try {
      setLoadingDetails(true);
      // Fetch structured memo data from backend
      const structuredMemo = await ApiService.getStructuredAuditMemo(
        selectedContract?.external_id || selectedContract?.id.toString() || ""
      );
      setSelectedMemo(structuredMemo);
      setShowDetailedMemo(true);
    } catch (error) {
      console.error("Error fetching structured memo:", error);
      // Show error message instead of fallback to mock data
      alert("Failed to load audit memo. Please try again.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStructuredMemoClick = (memo: any) => {
    setSelectedMemo(memo);
    setShowDetailedMemo(true);
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return "TBD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      uploaded: { color: "bg-blue-100 text-blue-800", label: "Uploaded" },
      processing: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Processing",
      },
      processed: { color: "bg-green-100 text-green-800", label: "Processed" },
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

  const getContractStatusText = (contract: Contract) => {
    switch (contract.status) {
      case "processing":
        return "Processing contract...";
      case "processed":
        return "Analysis complete";
      case "completed":
        return "Revenue recognition complete";
      case "error":
        return "Processing failed";
      case "uploaded":
      default:
        return "Pending analysis";
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error && !loading) {
    return <ErrorState error={error} onRetry={loadContracts} />;
  }

  // Show detailed memo view if selected
  if (showDetailedMemo && selectedMemo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <button
            onClick={() => setShowDetailedMemo(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
        <AuditMemoDetailViewer memo={selectedMemo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <DashboardHeader
            refreshing={refreshing}
            onRefresh={refreshContracts}
          />

          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Contracts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-center mb-2">
                <DocumentIcon className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm text-gray-500 mb-1">Total Contracts</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {contracts.length}
              </p>
            </div>

            {/* Processed Contracts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-center mb-2">
                <CheckCircleOutlineIcon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-sm text-gray-500 mb-1">Processed</h3>
              <p className="text-2xl font-semibold text-green-600">
                {contracts.filter((c) => c.status === "processed").length}
              </p>
            </div>

            {/* Hours Saved */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-center mb-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm text-gray-500 mb-1">Hours Saved</h3>
              <p className="text-2xl font-semibold text-blue-600">
                {totalTimeSaved > 0 ? `${totalTimeSaved} hrs` : "0 hrs"}
              </p>
            </div>

            {/* AI ROI */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-center mb-2">
                <DollarIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm text-gray-500 mb-1">Cost Savings</h3>
              <p className="text-2xl font-semibold text-purple-600">
                {totalTimeSaved > 0
                  ? `$${Math.round(totalTimeSaved * 40).toLocaleString()}`
                  : "$0"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contracts List */}
            <ContractsList
              contracts={contracts}
              selectedContract={selectedContract}
              onContractSelect={handleContractSelect}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              getContractStatusText={getContractStatusText}
            />

            {/* Contract Details */}
            <div className="lg:col-span-2">
              {selectedContract ? (
                <div className="space-y-8">
                  {/* Contract Info */}
                  <ContractDetails
                    selectedContract={selectedContract}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                  />

                  {/* Time Saved Meter */}
                  {selectedContract.time_saved_hours &&
                    selectedContract.status === "processed" && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
                        <div className="flex items-center justify-center">
                          <TimeSavedMeter
                            timeSavedHours={selectedContract.time_saved_hours}
                          />
                        </div>
                        <div className="text-center mt-3">
                          <p className="text-sm text-gray-600">
                            Contract processing complete! Your automation ROI is
                            showing.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Revenue Schedule */}
                  <RevenueScheduleTable
                    revenueSchedules={revenueSchedules}
                    loadingDetails={loadingDetails}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />

                  {/* Audit Memos */}
                  <AuditMemos
                    auditMemos={auditMemos}
                    structuredMemos={structuredMemos}
                    loadingDetails={loadingDetails}
                    onMemoClick={handleMemoClick}
                    onStructuredMemoClick={handleStructuredMemoClick}
                    selectedContract={selectedContract}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                </div>
              ) : (
                <NoContractSelected />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
