import React, { useState } from "react";
import axios from "axios";
import API_CONFIG from "../config/api";

const ApiTest = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log("Testing connection to:", API_CONFIG.BASE_URL);

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/test`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      setResult(`✅ Success: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error("API Test Error:", error);
      setResult(
        `❌ Error: ${error.message} - ${
          error.response?.data?.message || "Network error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded m-3">
      <h5>API Connection Test</h5>
      <p>Backend URL: {API_CONFIG.BASE_URL}</p>
      <button
        className="btn btn-primary"
        onClick={testConnection}
        disabled={loading}
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>
      {result && (
        <div className="mt-3 p-2 border rounded">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
