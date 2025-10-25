import React from "react";

interface TimeSavedMeterProps {
  timeSavedHours: number;
  className?: string;
}

export const TimeSavedMeter: React.FC<TimeSavedMeterProps> = ({
  timeSavedHours,
  className = "",
}) => {
  if (!timeSavedHours || timeSavedHours <= 0) {
    return null;
  }

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours === 1) {
      return "1 hour";
    } else if (hours % 1 === 0) {
      return `${Math.round(hours)} hours`;
    } else {
      return `${hours} hours`;
    }
  };

  const getTimeIcon = (hours: number): string => {
    if (hours >= 8) return "🚀";
    if (hours >= 4) return "⚡";
    return "⏰";
  };

  const getTimeColor = (hours: number): string => {
    if (hours >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (hours >= 4) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-purple-600 bg-purple-50 border-purple-200";
  };

  return (
    <div
      className={`inline-flex items-center px-4 py-3 rounded-lg border-2 ${getTimeColor(
        timeSavedHours
      )} ${className}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl" role="img" aria-label="Time saved">
          {getTimeIcon(timeSavedHours)}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            Estimated {formatTime(timeSavedHours)} of manual review saved
          </span>
          <span className="text-xs ml-20 opacity-75">AI automation ROI</span>
        </div>
      </div>
    </div>
  );
};
