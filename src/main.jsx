import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'   // <-- This MUST match your main Tailwind source file!
import App from './App'

// Always force dark mode
document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

