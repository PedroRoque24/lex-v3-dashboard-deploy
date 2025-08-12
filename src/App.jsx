import { BrowserRouter } from "react-router-dom";
import React from 'react'
import LexV3Dashboard from './components/LexV3Dashboard'
import { CaseContextProvider } from './components/CaseContext'

function App() {
<div className="bg-fuchsia-700 text-white p-12 rounded-3xl text-3xl m-10 shadow-2xl">
  If you see this purple, Tailwind is finally working!
</div>
  return (
    <CaseContextProvider>
      <BrowserRouter>
      <LexV3Dashboard />
          </BrowserRouter>
    </CaseContextProvider>
  )
}

export default App

