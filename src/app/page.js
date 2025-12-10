"use client";
import { useState } from "react";

export default function Home() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [rooms, setRooms] = useState([
    { id: 101, type: "Suite", status: "available", price: 200 },
    { id: 102, type: "Standard", status: "occupied", price: 100 },
    { id: 103, type: "Standard", status: "dirty", price: 100 },
  ]);

  const occupiedCount = rooms.filter((r) => r.status === "occupied").length;
  const occupancyPercentage = Math.round((occupiedCount / rooms.length) * 100);

  return (
    <div className="bg-slate-50 text-slate-800 h-screen overflow-hidden flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 text-white">
          <span className="material-symbols-outlined text-3xl text-indigo-400">
            domain
          </span>
          <h1 className="font-bold text-lg">VISTA PMS</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-left ${
              currentView === "dashboard" ? "bg-slate-800 text-white" : ""
            }`}
            onClick={() => setCurrentView("dashboard")}
          >
            <span className="material-symbols-outlined">dashboard</span>{" "}
            Dashboard
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-left ${
              currentView === "frontdesk" ? "bg-slate-800 text-white" : ""
            }`}
            onClick={() => setCurrentView("frontdesk")}
          >
            <span className="material-symbols-outlined">concierge</span> Front
            Desk
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div id="view-container" className="p-8 overflow-y-auto h-full">
          {/* Dashboard View */}
          {currentView === "dashboard" && (
            <div id="view-dashboard" className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-500">Occupancy</p>
                  <h3 className="text-3xl font-bold text-indigo-600">
                    {occupancyPercentage}%
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Front Desk View */}
          {currentView === "frontdesk" && (
            <div id="view-frontdesk" className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold">Room Management</h2>
              <div className="grid grid-cols-4 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white p-4 rounded-xl shadow border"
                  >
                    <h3 className="font-bold">Room {room.id}</h3>
                    <p className="text-sm uppercase">{room.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
