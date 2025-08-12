import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";


import SidebarBrand from "../SidebarBrand";
const nav = [
  { label: "Symbolic Mode", to: "/symbolic" },
  { label: "Clinical Mode", to: "/clinical" },
  {
    label: "Continuum",
    collapsible: true,
    children: [
      { label: "Doctor", to: "/continuum/doctor" },
      { label: "Patient", to: "/continuum/patient" },
    ],
  },
  { label: "Library", to: "/library" },
  {
    label: "Public Health",
    collapsible: true,
    children: [
      { label: "Outbreak Reports", to: "/public-health/outbreak" },
      { label: "Prevalence Calculator", to: "/public-health/prevalence" },
      { label: "Geo Mapping", to: "/public-health/geo" },
    ],
  },
  {
    label: "Teaching",
    collapsible: true,
    children: [
      { label: "Teaching", to: "/teaching" },
    ],
  },
  { label: "LiveLex", to: "/livelex" },
];

export default function Sidebar() {
  const [open, setOpen] = useState({
    Continuum: false,
    "Public Health": false,
    Teaching: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // For mobile: toggle sidebar
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // Style for active nav link
  const activeClass =
    "bg-lex-accent text-white font-bold shadow-lex rounded-xl";
  const inactiveClass =
    "bg-lex-blue/60 text-white hover:bg-lex-blue/90 hover:text-lex-accent rounded-xl transition";

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-lex-accent text-white p-2 rounded-full shadow-lex"
        onClick={toggleSidebar}
      >
        <span className="text-xl">☰</span>
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 bg-lex-card/90 shadow-lex p-6 flex flex-col gap-6 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo / Brand */}
        <div className="mb-4 select-none"><SidebarBrand /></div>
        {/* Nav Links */}
        <nav className="flex flex-col gap-2">
          {nav.map((item) =>
            item.collapsible ? (
              <div key={item.label}>
                <button
                  className="flex items-center justify-between w-full px-4 py-2 font-bold text-lg bg-lex-blue/70 text-white rounded-xl shadow-lex hover:bg-lex-blue/90 transition"
                  onClick={() =>
                    setOpen((prev) => ({
                      ...prev,
                      [item.label]: !prev[item.label],
                    }))
                  }
                >
                  {item.label}
                  {open[item.label] ? (
                    <FaChevronUp className="ml-2" />
                  ) : (
                    <FaChevronDown className="ml-2" />
                  )}
                </button>
                {/* Collapsible children */}
                <div
                  className={`flex flex-col ml-4 mt-1 gap-1 transition-all overflow-hidden ${
                    open[item.label] ? "max-h-40" : "max-h-0"
                  }`}
                  style={{
                    transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  {item.children.map((child) => (
                    <Link
                      to={child.to}
                      key={child.label}
                      className={`px-4 py-2 text-md ${
                        location.pathname === child.to
                          ? activeClass
                          : inactiveClass
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                to={item.to}
                key={item.label}
                className={`px-4 py-2 text-lg font-bold ${
                  location.pathname === item.to ? activeClass : inactiveClass
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </aside>
      {/* Main content overlay (for mobile, click to close) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={toggleSidebar}
        />
      )}
      {/* Spacer for sidebar width on desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
