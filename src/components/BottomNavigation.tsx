/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Dumbbell, BookOpen, BarChart3, User } from "lucide-react";

interface BottomNavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export function BottomNavigation({ currentTab, setTab }: BottomNavigationProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "log", label: "Log", icon: Dumbbell },
    { id: "exercises", label: "Exercises", icon: BookOpen },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-900/90 py-2 pb-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 text-xs font-semibold select-none transition-colors duration-200 active:scale-95 ${
                isActive ? "text-green-500" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isActive ? "bg-green-500/10 text-green-400" : "bg-transparent"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="mt-1 text-[10px] tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
