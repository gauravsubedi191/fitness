/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart3, 
  Calendar, 
  Sparkles, 
  ChevronDown, 
  Award,
  Plus, 
  Weight 
} from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

export function ProgressView() {
  const { 
    sessions, 
    bodyWeights, 
    saveBodyWeight, 
    allExercises, 
    personalBests, 
    addToast 
  } = useWorkout();

  // Active analysis states
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("bench_press");
  const [weightInput, setWeightInput] = useState<string>("");
  const [weightDate, setWeightDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Extract list of all logged exercises to show in dropdown
  const loggedExerciseIds = Array.from(new Set(
    sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId))
  ));

  // Determine actual display elements
  const dropdownIds = loggedExerciseIds.length > 0 ? loggedExerciseIds : ["bench_press"];

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(weightInput);
    if (!wt || wt <= 0) return;

    await saveBodyWeight(wt, weightDate);
    setWeightInput("");
    addToast(`Recorded ${wt} kg weight.`, "success");
  };

  // Compute points for selected exercise: { date: string, maxWeight: number }
  const getExerciseChartData = () => {
    // Collect all dates this exercise was logged
    const dataPoints: { date: string; timestamp: number; maxWeight: number }[] = [];

    sessions.forEach((sess) => {
      const matchedEx = sess.exercises.find((e) => e.exerciseId === selectedExerciseId);
      if (matchedEx) {
        // Find max weight in completed sets
        let maxWt = 0;
        matchedEx.sets.forEach((s) => {
          if (s.completed && s.weightKg > maxWt) {
            maxWt = s.weightKg;
          }
        });
        if (maxWt > 0) {
          dataPoints.push({
            date: sess.date,
            timestamp: sess.timestamp,
            maxWeight: maxWt
          });
        }
      }
    });

    // Sort ascending by timestamp
    return dataPoints
      .sort((a,b) => a.timestamp - b.timestamp)
      .map((d) => ({ date: d.date, "Max Weight (kg)": d.maxWeight }));
  };

  const exerciseChartData = getExerciseChartData();

  // Format body weight data for Recharts
  const formattedWeightData = bodyWeights
    .map((w) => ({
      date: w.date,
      "Weight (kg)": w.weightKg
    }));

  // AUTO-DETECT PRs per muscle group
  // Output format: { MuscleGroup: { exerciseName, weightKg } }
  const getPRsPerMuscleGroup = () => {
    const prs: Record<string, { exerciseName: string; weightKg: number }> = {};

    sessions.forEach((sess) => {
      sess.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed && set.weightKg > 0) {
            const currentPr = prs[ex.muscleGroup];
            if (!currentPr || set.weightKg > currentPr.weightKg) {
              prs[ex.muscleGroup] = {
                exerciseName: ex.name,
                weightKg: set.weightKg
              };
            }
          }
        });
      });
    });

    return prs;
  };

  const musclePRs = getPRsPerMuscleGroup();
  const activeMuscleGroups = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Cardio"];

  return (
    <div className="min-h-screen bg-gray-950 pb-28 text-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-900 bg-gray-950/80 px-6 py-4.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wide">Progress Analytics</h2>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 pt-5 space-y-6">
        {/* ONE-REP MAX PROGRESS CHART */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/30 p-5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Analyze Exercise Lift Track</label>
            <div className="relative mt-2">
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-xs font-bold text-white focus:border-green-500 focus:outline-none appearance-none"
              >
                {dropdownIds.map((id) => {
                  const name = allExercises.find((ex) => ex.id === id)?.name || id;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="mt-5 h-48 w-full">
            {exerciseChartData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-xs text-gray-500">
                <BarChart3 className="h-8 w-8 text-gray-700 stroke-[1.2] mb-2" />
                <p>Log completed sets for this exercise to generate progress charts.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: "600" }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: "600" }} 
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-gray-800 bg-gray-950 p-2 text-xs shadow-2xl">
                            <p className="font-bold text-gray-400">{payload[0].payload.date}</p>
                            <p className="font-black text-green-400 mt-0.5">{payload[0].value} kg (Max Lift)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Max Weight (kg)" 
                    stroke="#22c55e" 
                    strokeWidth={3} 
                    dot={{ fill: "#22c55e", strokeWidth: 1 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* BODY WEIGHT TRACKER PANEL */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/30 p-5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Weight className="h-5 w-5 text-green-400" />
            <span>Body Weight Tracker</span>
          </h3>

          <form onSubmit={handleLogWeight} className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 72.5"
                  className="mt-1.5 w-full rounded-xl border border-gray-850 bg-gray-950 px-4 py-2.5 text-xs font-bold text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Log Date</label>
                <input
                  type="date"
                  required
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-850 bg-gray-950 px-4 py-2.5 text-xs font-bold text-white focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl py-3 w-full transition-all active:scale-95"
            >
              Add Weight Node
            </button>
          </form>

          {/* Body weight trends line chart */}
          <div className="mt-5 h-44 w-full">
            {formattedWeightData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-xs text-gray-500">
                <Weight className="h-7 w-7 text-gray-700 stroke-[1.2] mb-2" />
                <p>Log a body weight node to generate tracker charts.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedWeightData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: "600" }} 
                  />
                  <YAxis 
                    domain={["dataMin - 2", "dataMax + 2"]} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: "600" }} 
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-gray-800 bg-gray-950 p-2 text-xs shadow-2xl">
                            <p className="font-bold text-gray-400">{payload[0].payload.date}</p>
                            <p className="font-black text-blue-400 mt-0.5">{payload[0].value} kg</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Weight (kg)" 
                    stroke="#3b82f6" 
                    strokeWidth={2.5} 
                    dot={{ fill: "#3b82f6" }} 
                    activeDot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PERSONAL RECORDS (PRs) WIDGET CONTAINER */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/30 p-5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            <span>Personal Records (PRs)</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {activeMuscleGroups.map((group) => {
              const pr = musclePRs[group];
              return (
                <div 
                  key={group} 
                  className={`rounded-xl p-3 border ${
                    pr 
                      ? "bg-yellow-500/5 border-yellow-500/25" 
                      : "bg-gray-900/30 border-gray-900"
                  }`}
                >
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{group}</span>
                  {pr ? (
                    <div className="mt-1">
                      <p className="text-xs font-black text-white truncate">{pr.exerciseName}</p>
                      <p className="text-xs font-black text-yellow-400 mt-0.5">{pr.weightKg} kg</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-600 font-semibold italic">Not logged</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
