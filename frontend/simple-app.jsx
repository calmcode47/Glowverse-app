// Simple React web server for testing
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Glowverse Frontend</h1>
      <p>Frontend is running successfully!</p>
      <p>Backend Status: <span id="backend-status">Checking...</span></p>
      <button onClick={checkBackend}>Test Backend Connection</button>
    </div>
  );
}

function checkBackend() {
  fetch('http://localhost:3000/health')
    .then(response => response.json())
    .then(data => {
      document.getElementById('backend-status').textContent = '✅ Connected';
      alert('Backend connection successful!');
    })
    .catch(error => {
      document.getElementById('backend-status').textContent = '❌ Disconnected';
      alert('Backend connection failed: ' + error.message);
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);