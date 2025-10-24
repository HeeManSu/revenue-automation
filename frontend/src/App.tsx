import { useState } from "react";
import { ContractUpload } from "./components/ContractUpload";
import { Dashboard } from "./components/Dashboard";

function App() {
  const [activeTab, setActiveTab] = useState<"upload" | "dashboard">("upload");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Revenue Automation
                </h1>
                <p className="text-sm text-gray-500">Maximor AI</p>
              </div>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "upload"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Upload Contract
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "upload" ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Upload Contract
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Drop your contract. Watch your revenue schedule build itself.
              </p>
            </div>
            <ContractUpload onUploadSuccess={handleUploadSuccess} />

            {/* Process Flow */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                How it works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-600 font-semibold">1</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Upload</h4>
                  <p className="text-xs text-gray-500">Contract file</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-600 font-semibold">2</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Extract</h4>
                  <p className="text-xs text-gray-500">Key terms</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-600 font-semibold">3</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Schedule
                  </h4>
                  <p className="text-xs text-gray-500">Revenue plan</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-600 font-semibold">4</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Audit</h4>
                  <p className="text-xs text-gray-500">Memo generated</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-600 font-semibold">5</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Reconcile
                  </h4>
                  <p className="text-xs text-gray-500">Validate data</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Dashboard key={refreshTrigger} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Revenue Automation Platform - Maximor AI</p>
            <p className="mt-1">
              Automating ASC 606 compliance and revenue recognition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
