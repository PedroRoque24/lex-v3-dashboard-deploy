import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCaseContext } from './CaseContext';

const ContinuumAlertsViewer = () => {
  const { casePath } = useCaseContext();
  const [alerts, setAlerts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!casePath) return;
    fetch(`/memory/${casePath}/continuum_alerts.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Invalid alert format');
        setAlerts(data);
      })
      .catch(err => {
        console.error('Continuum Alert Viewer error:', err);
        setAlerts([]);
      });
  }, [casePath]);

  const visibleAlerts = expanded ? alerts : alerts.slice(0, 5);

  return (
    <div className="rounded-2xl shadow-lex mb-4 border-2 border-yellow-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-yellow-700 bg-yellow-900/80 text-yellow-200 shadow"
        onClick={() => setIsOpen(x => !x)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">🧡</span>
          Continuum Alerts
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-yellow-700 animate-fadeIn transition-all">
          {visibleAlerts.length === 0 ? (
            <p className="text-yellow-300 text-base">No alerts at this time.</p>
          ) : (
            <ul className="space-y-2">
              {visibleAlerts.map((alert, idx) => (
                <li key={idx} className="bg-yellow-900/60 border border-yellow-700 text-yellow-100 p-3 rounded-xl shadow font-semibold">
                  <span className="mr-2">
                    <strong>[{(alert.level || 'UNKNOWN').toUpperCase()}]</strong>
                  </span>
                  <span className="mr-1">{alert.title || 'Untitled'}</span>
                  <span className="ml-1 text-yellow-300">→ {alert.message || 'No message'}</span>
                </li>
              ))}
            </ul>
          )}
          {alerts.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 bg-yellow-700 hover:bg-yellow-800 px-4 py-2 rounded-xl text-white text-sm font-bold transition"
            >
              {expanded ? 'Show Less' : 'Show All Alerts'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContinuumAlertsViewer;
