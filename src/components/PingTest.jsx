
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from 'react';

const PingTest = () => {
  const [pingResult, setPingResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/ping')
      .then(res => {
        if (!res.ok) throw new Error("Ping failed");
        return res.json();
      })
      .then(data => setPingResult(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '1em', backgroundColor: '#f2f2f2', marginTop: '1em', borderRadius: '8px' }}>
      <h3>🚀 API Proxy Ping Test</h3>
      {pingResult ? (
        <pre style={{ color: 'green' }}>✅ Ping successful: {JSON.stringify(pingResult)}</pre>
      ) : error ? (
        <pre style={{ color: 'crimson' }}>❌ Ping failed: {error}</pre>
      ) : (
        <p>⏳ Pinging backend...</p>
      )}
    </div>
  );
};

export default PingTest;
