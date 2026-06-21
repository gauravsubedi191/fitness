/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dumbbell, Calendar, Flame, Timer, ChevronRight, Play, Award, CheckCircle2 } from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";

interface HomeViewProps {
  setTab: (tab: string) => void;
}

export function HomeView({ setTab }: HomeViewProps) {
  const { 
    user, 
    sessions, 
    weeklyPlan, 
    streakCount 
  } = useWorkout();

  // Get current day of the week (mon, tue, wed...)
  const daysOfWeekFull = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const daysOfWeekShort: Record<string, string> = {
    monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu", friday: "fri", saturday: "sat", sunday: "sun"
  };
  const todayName = daysOfWeekFull[new Date().getDay()];
  const todayShortKey = daysOfWeekShort[todayName] || "mon";
  const todayPlannedWorkout = (weeklyPlan as any)[todayShortKey] || "Rest";

  // Check if a session was completed today (YYYY-MM-DD local time)
  const todayDateStr = new Date().toISOString().split("T")[0];
  const loggedToday = sessions.find((s) => s.date === todayDateStr);

  // Compute total weight lifted per day for the last 7 calendar days to show in our Recharts BarChart
  const getWeeklyVolumeData = () => {
    const days = [];
    const dateObjs = [];
    
    // Generate past 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
      dateObjs.push({
        dateStr: d.toISOString().split("T")[0],
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
        totalKg: 0
      });
    }

    // Accumulate total volume (reps * weight) per day
    sessions.forEach((sess) => {
      const match = dateObjs.find((o) => o.dateStr === sess.date);
      if (match) {
        let sessionVolume = 0;
        sess.exercises.forEach((ex) => {
          ex.sets.forEach((set) => {
            if (set.completed) {
              sessionVolume += set.reps * set.weightKg;
            }
          });
        });
        match.totalKg += sessionVolume;
      }
    });

    return dateObjs;
  };

  const volumeData = getWeeklyVolumeData();
  const maxVolume = Math.max(...volumeData.map(v => v.totalKg), 1);

  // Get muscle groups targeted from a session
  const getSessionMuscles = (session: typeof sessions[0]) => {
    const muscles = session.exercises.map((e) => e.muscleGroup);
    return Array.from(new Set(muscles)).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-28 text-gray-100">
      {/* Top Banner with user profile details */}
      <header className="sticky top-0 z-40 border-b border-gray-900 bg-gray-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
              alt="Profile"
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-xl border border-gray-800 object-cover"
            />
            <div>
              <p className="text-xs text-gray-500 font-medium">Welcome back</p>
              <h2 className="text-sm font-bold text-white">{user?.displayName || "Gaurav Subedi"}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-orange-400 border border-orange-500/20">
            <Flame className="h-4 w-4 fill-orange-500" />
            <span className="text-xs font-bold leading-none">{streakCount.current} Day Streak</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 pt-6">
        {/* Planned Today Card & Quick Start */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/80 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">Planned for Today</span>
              <h3 className="mt-1 text-xl font-black text-white">{todayPlannedWorkout} Day</h3>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          {loggedToday ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-green-500/10 p-3 text-green-400 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
              <div className="text-xs">
                <p className="font-bold">Completed session: {loggedToday.name}</p>
                <p className="text-gray-400 text-[11px] mt-0.5">Duration: {loggedToday.durationMinutes} mins • {loggedToday.exercises.length} exercises</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setTab("log")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-[1.01] active:translate-y-0.5"
            >
              <Play className="h-4 w-4 fill-white shrink-0" />
              <span>Start Planned Session</span>
            </button>
          )}
        </div>

        {/* Streak Metrics Section */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Current Streak</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{streakCount.current}</span>
              <span className="text-xs text-gray-400">days</span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Longest Streak</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-green-400">{streakCount.longest}</span>
              <span className="text-xs text-gray-400">days</span>
            </div>
          </div>
        </div>

        {/* Weekly Tonnage/Volume Chart */}
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white tracking-tight">Weekly Tonnage Volume (kg)</h4>
            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-semibold border border-green-500/10">Active weight</span>
          </div>

          <div className="mt-5 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="dayLabel" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: "600" }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: "600" }}
                  width={30}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  content={({ list, active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-gray-800 bg-gray-950 p-2 text-xs shadow-xl">
                          <p className="font-semibold text-gray-300">{payload[0].payload.dayLabel}</p>
                          <p className="font-black text-green-400 mt-0.5">{payload[0].value} kg lifted</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalKg" radius={[4, 4, 0, 0]}>
                  {volumeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.totalKg > 0 ? "#10b981" : "#1f2937"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last 3 Logged Sessions */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-white tracking-tight">Recent Sessions</h4>
            <span className="text-xs text-gray-400 font-bold select-none cursor-pointer" onClick={() => setTab("log")}>View Logs</span>
          </div>

          <div className="mt-3 space-y-3">
            {sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/10 py-8 px-4 text-center">
                <Dumbbell className="mx-auto h-8 w-8 text-gray-600 stroke-[1.5]" />
                <p className="mt-2 text-xs text-gray-400">No sessions logged yet. Let's make an active start!</p>
                <button
                  onClick={() => setTab("log")}
                  className="mt-4 rounded-lg bg-green-500/10 text-green-400 text-xs px-3 py-1.5 font-bold border border-green-500/20 active:scale-95 transition-transform"
                >
                  Log Workout
                </button>
              </div>
            ) : (
              sessions.slice(0, 3).map((session) => (
                <div 
                  key={session.id} 
                  className="group flex items-center justify-between rounded-xl border border-gray-800/80 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-green-400">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">{session.name}</h5>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {getSessionMuscles(session).map((m, i) => (
                          <span 
                            key={i} 
                            className="rounded bg-gray-800 px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wide"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                      <Timer className="h-3 w-3" />
                      {session.durationMinutes}m
                    </span>
                    <p className="mt-1 text-[10px] text-gray-500 font-semibold">{session.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
