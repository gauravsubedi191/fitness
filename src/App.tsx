/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WorkoutProvider, useWorkout } from "./context/WorkoutContext";
import { AuthScreen } from "./components/AuthScreen";
import { BottomNavigation } from "./components/BottomNavigation";
import { HomeView } from "./components/HomeView";
import { LogView } from "./components/LogView";
import { ExercisesView } from "./components/ExercisesView";
import { ProgressView } from "./components/ProgressView";
import { ProfileView } from "./components/ProfileView";
import { Sparkles, Trophy, CheckCircle, Info, X } from "lucide-react";

function MainAppContent() {
  const { user, loading, toasts, removeToast } = useWorkout();
  const [currentTab, setTab] = useState<string>("home");

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-gray-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-500">Loading Athlete Profile...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Render match layout sub-view
  const renderTabContent = () => {
    switch (currentTab) {
      case "home":
        return <HomeView setTab={setTab} />;
      case "log":
        return <LogView setTab={setTab} />;
      case "exercises":
        return <ExercisesView />;
      case "progress":
        return <ProgressView />;
      case "profile":
        return <ProfileView />;
      default:
        return <HomeView setTab={setTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Dynamic Tab Panel */}
      <div className="pb-16">{renderTabContent()}</div>

      {/* Persistent Docked Bottom Navigation Bar */}
      <BottomNavigation currentTab={currentTab} setTab={setTab} />

      {/* FLOATING TOASTS NOTIFICATIONS PANEL */}
      <div className="fixed top-6 right-6 left-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm mx-auto">
        {toasts.map((toast) => {
          let icon = <CheckCircle className="h-4.5 w-4.5 text-green-400" />;
          let styleClass = "border-green-500/20 bg-gray-900/95 shadow-md shadow-green-500/5 text-gray-200";
          
          if (toast.type === "achievement") {
            icon = <Trophy className="h-5 w-5 text-yellow-400" />;
            styleClass = "border-yellow-500/30 bg-gray-900/95 shadow-lg shadow-yellow-500/10 text-yellow-100 font-bold";
          } else if (toast.type === "info") {
            icon = <Info className="h-4.5 w-4.5 text-blue-400" />;
            styleClass = "border-blue-500/20 bg-gray-900/95 text-gray-300";
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between gap-3.5 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 scale-95 animate-fade-in pointer-events-auto ${styleClass}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span className="text-xs font-semibold leading-relaxed tracking-wide">{toast.text}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded p-1 text-gray-500 hover:text-white active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <MainAppContent />
    </WorkoutProvider>
  );
}
