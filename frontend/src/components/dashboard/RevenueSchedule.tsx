import React from "react";
import { type RevenueSchedule } from "../../services/api";
import { ChartBarIcon } from "../../assets/icons";

interface RevenueScheduleProps {
  revenueSchedules: RevenueSchedule[];
  loadingDetails: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  formatCurrency: (amount?: number, currency?: string) => string;
  formatDate: (dateString?: string) => string;
}

export const RevenueScheduleTable: React.FC<RevenueScheduleProps> = ({
  revenueSchedules,
  loadingDetails,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  formatCurrency,
  formatDate,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRevenueSchedules = revenueSchedules.slice(startIndex, endIndex);

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Revenue Schedule
        </h3>
        {loadingDetails ? (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Loading...
          </div>
        ) : revenueSchedules.length > 0 ? (
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>
              Total:{" "}
              {formatCurrency(
                revenueSchedules.reduce((sum, s) => sum + (s.amount || 0), 0)
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-3">
            Loading revenue schedule...
          </p>
        </div>
      ) : revenueSchedules.length === 0 ? (
        <div className="text-center py-8">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 text-sm mt-2">
            No revenue schedule available
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Revenue schedule will appear after contract processing
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRevenueSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(schedule.period_start)} -{" "}
                      {formatDate(schedule.period_end)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                      {schedule.obligation?.name || "Unknown Obligation"}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {schedule.obligation?.type || "N/A"}
                        {schedule.obligation?.recognition_method && (
                          <div className="text-xs text-gray-500 mt-1">
                            {schedule.obligation.recognition_method.replace(
                              "_",
                              " "
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(schedule.amount)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
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

          {/* Pagination */}
          {revenueSchedules.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, revenueSchedules.length)} of{" "}
                {revenueSchedules.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
