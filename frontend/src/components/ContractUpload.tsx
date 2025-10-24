import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../services/api";
import { UploadIcon, CheckIcon, XIcon } from "../assets/icons";

interface ContractUploadProps {
  onUploadSuccess: () => void;
}

export const ContractUpload: React.FC<ContractUploadProps> = ({
  onUploadSuccess,
}) => {
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/x-markdown",
        "application/markdown",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".md"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      const isValidMimeType = allowedTypes.includes(file.type);
      const isValidExtension = allowedExtensions.includes(fileExtension);

      if (!isValidMimeType && !isValidExtension) {
        setErrorMessage(
          `Please upload a PDF, Word document, Markdown, or text file. Detected: ${
            file.type || "unknown type"
          }`
        );
        setUploadStatus("error");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB.");
        setUploadStatus("error");
        return;
      }

      setIsUploading(true);
      setUploadStatus("idle");
      setErrorMessage("");

      try {
        await ApiService.uploadContract(file);
        setUploadStatus("success");
        onUploadSuccess();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Upload failed"
        );
        setUploadStatus("error");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-primary-500 bg-primary-50"
            : uploadStatus === "success"
            ? "border-success-500 bg-success-50"
            : uploadStatus === "error"
            ? "border-danger-500 bg-danger-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12">
            {isUploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            ) : uploadStatus === "success" ? (
              <CheckIcon className="w-12 h-12 text-success-500 mx-auto" />
            ) : uploadStatus === "error" ? (
              <XIcon className="w-12 h-12 text-danger-500 mx-auto" />
            ) : (
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isUploading
                ? "Uploading contract..."
                : uploadStatus === "success"
                ? "Contract uploaded successfully!"
                : uploadStatus === "error"
                ? "Upload failed"
                : "Upload Contract"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isUploading
                ? "Please wait while we process your contract"
                : uploadStatus === "success"
                ? "Your contract is being processed for revenue recognition"
                : uploadStatus === "error"
                ? errorMessage
                : "Drag and drop your contract here, or click to browse"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Supported formats: PDF, Word documents (.doc, .docx), Text files (.txt),
        Markdown (.md)
        <br />
        Maximum file size: 10MB
      </div>

      {uploadStatus === "success" && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/dashboard");
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUploadStatus("idle");
            }}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Upload another contract
          </button>
        </div>
      )}
    </div>
  );
};
