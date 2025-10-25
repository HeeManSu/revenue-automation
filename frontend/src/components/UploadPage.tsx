import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ContractUpload } from "./ContractUpload";
import { SampleContracts } from "./SampleContracts";
import { ApiService } from "../services/api";
import {
  UploadIcon,
  LightningIcon,
  ChartIcon,
  CalendarIcon,
  LightningBoltIcon,
} from "../assets/icons";

interface UploadPageProps {
  onUploadSuccess: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  const [isUploadingSample, setIsUploadingSample] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSampleContractSelect = async (contract: any) => {
    try {
      setIsUploadingSample(true);
      setUploadStatus("idle");
      setErrorMessage("");
      await ApiService.uploadSampleContract(contract.id);
      setUploadStatus("success");
      onUploadSuccess();
    } catch (error) {
      console.error("Error uploading sample contract:", error);
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
      setUploadStatus("error");
    } finally {
      setIsUploadingSample(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Revenue Automation
                </h1>
                <p className="text-sm text-gray-500">Maximor AI</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link
                to="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Upload Contract
              </Link>
              <Link
                to="/dashboard"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Upload Contract
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Drop your contract. Watch your revenue schedule build itself.
          </p>
        </div>

        <ContractUpload
          onUploadSuccess={onUploadSuccess}
          uploadStatus={uploadStatus}
          errorMessage={errorMessage}
          isUploading={isUploadingSample}
        />

        {/* Sample Contracts */}
        <div className="mt-6">
          <SampleContracts
            onContractSelect={handleSampleContractSelect}
            isUploading={isUploadingSample}
          />
        </div>

        {/* Process Flow */}
        <div className="bg-white rounded-lg shadow p-4 mt-8">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
                <UploadIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">
                Upload
              </h4>
              <p className="text-xs text-gray-500">Drop your contract file</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
                <LightningIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">
                See Magic
              </h4>
              <p className="text-xs text-gray-500">AI processes everything</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
                <ChartIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">
                Revenue Schedule
              </h4>
              <p className="text-xs text-gray-500">ASC 606 compliant plan</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">
                Audit Memo
              </h4>
              <p className="text-xs text-gray-500">Compliance documentation</p>
            </div>
          </div>

          {/* Magic happens here section */}
          <div className="mt-6 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center space-x-2 text-purple-700">
              <LightningBoltIcon className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-medium">AI Magic Happens Here</span>
              <LightningBoltIcon className="w-4 h-4 animate-pulse" />
            </div>
            <p className="text-xs text-purple-600 text-center mt-1">
              Contract analysis • ASC 606 compliance • Revenue recognition •
              Audit trail
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
