import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UploadPage } from "./components/UploadPage";
import { Dashboard } from "./components/Dashboard";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Routes>
          <Route
            path="/"
            element={<UploadPage onUploadSuccess={handleUploadSuccess} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard key={refreshTrigger} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
