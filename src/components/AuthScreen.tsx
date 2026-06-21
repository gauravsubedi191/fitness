/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dumbbell, LogIn, ChevronRight, UserCheck } from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";

export function AuthScreen() {
  const { loginWithGoogle, loginAsDemo, firebaseEnabled } = useWorkout();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-gray-100">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[120px]" />

      <div className="z-10 w-full max-w-md text-center">
        {/* Brand Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 shadow-lg shadow-green-500/20">
          <Dumbbell className="h-8 w-8 text-black" />
        </div>

        {/* Title */}
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          AESTHETIC<span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">FIT</span>
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Zero subscriptions. Complete tracking. Built for beginners.
        </p>

        {/* Visual Illustration Quote */}
        <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-900/40 p-5 text-left backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Beginner friendly</span>
          </div>
          <p className="mt-2 text-sm text-gray-200">
            "The hardest part of going to the gym is walking through the front door. Track your progress, dominate your sets, and build consistent habits."
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Includes 60+ exercises, routines planner & streaks heatmap</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 space-y-4">
          <button
            onClick={loginWithGoogle}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 py-4 text-sm font-bold text-black shadow-lg shadow-green-500/10 transition-all duration-300 hover:scale-[1.01] active:translate-y-0.5 cursor-pointer"
          >
            <LogIn className="h-5 w-5" />
            <span>Connect with Google Auth</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-900"></div>
            <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-black uppercase tracking-wider">or continue offline</span>
            <div className="flex-grow border-t border-gray-900"></div>
          </div>

          <button
            onClick={loginAsDemo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-900 bg-gray-900/30 py-3.5 text-xs font-bold text-gray-300 transition-all hover:bg-gray-900/50 active:translate-y-0.5 cursor-pointer"
          >
            <UserCheck className="h-4 w-4 text-green-400" />
            <span>Use Demo / Offline mode</span>
          </button>

          <div className="rounded-xl bg-blue-500/5 p-3.5 border border-blue-500/10 text-[11px] text-gray-400 text-left leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-blue-400 uppercase tracking-wide text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Sign-In Configuration Notice
            </div>
            <p className="mt-1.5 text-gray-500">
              Note: Firebase Google Auth requires a configured Google Identity Provider in your Firebase Console project. If configuration issues occur, choose the offline mode to save training sessions safely in local storage offline.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-xs text-gray-500">
          Syncs securely via Firebase once configured in your development credentials.
        </p>
      </div>
    </div>
  );
}
