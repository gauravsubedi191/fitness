/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Search, BookOpen, AlertTriangle, Sparkles, Dumbbell, X } from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { Exercise } from "../types";

export function ExercisesView() {
  const { allExercises, personalBests, addCustomExercise } = useWorkout();

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [muscleFilter, setMuscleFilter] = useState<string>("All");

  // Create Custom Exercise States
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("");
  const [customMuscle, setCustomMuscle] = useState<string>("Chest");
  const [customEquipment, setCustomEquipment] = useState<string>("Dumbbells");
  const [customDifficulty, setCustomDifficulty] = useState<"beginner" | "intermediate">("beginner");

  const muscleGroups = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Cardio"];
  const muscleFormOptions = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Cardio"];

  const filtered = allExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === "All" || ex.muscleGroup === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    await addCustomExercise(
      customName,
      customMuscle,
      customEquipment,
      customDifficulty
    );

    // reset forms
    setCustomName("");
    setCreateOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-28 text-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-900 bg-gray-950/80 px-6 py-4.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wide">Exercise Library</h2>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-wider text-white px-3.5 py-2 active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 pt-5">
        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute top-3.5 left-4 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises database..."
            className="w-full rounded-xl border border-gray-800 bg-gray-900/40 pl-11 pr-4 py-3 text-xs font-extrabold text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Categories filters scroll list */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {muscleGroups.map((group) => (
            <button
              key={group}
              onClick={() => setMuscleFilter(group)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold select-none whitespace-nowrap active:scale-95 transition-all ${
                muscleFilter === group
                  ? "bg-green-500 text-black font-extrabold shadow-md shadow-green-500/10"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Exercises Grid Items */}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/10 py-12 px-4 text-center">
              <p className="text-xs text-gray-500">No exercises match search guidelines.</p>
            </div>
          ) : (
            filtered.map((ex) => {
              const pb = personalBests[ex.id];
              return (
                <div
                  key={ex.id}
                  className="group flex flex-col rounded-xl border border-gray-900 bg-gray-900/30 p-4 hover:bg-gray-900 hover:border-gray-800 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{ex.name}</h4>
                      <p className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>{ex.equipment}</span>
                        <span className="text-gray-600">•</span>
                        <span className={ex.difficulty === "beginner" ? "text-green-400" : "text-amber-400"}>
                          {ex.difficulty}
                        </span>
                      </p>
                    </div>

                    <span className="rounded bg-gray-800 px-2 py-0.5 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      {ex.muscleGroup}
                    </span>
                  </div>

                  {/* Personal Best indicator */}
                  {pb && pb > 0 && (
                    <div className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-2.5 py-1 text-yellow-400 border border-yellow-500/20 w-fit">
                      <Sparkles className="h-3 w-3 fill-yellow-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider leading-none">Personal Best: {pb} kg</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* CREATE CUSTOM EXERCISE OVERLAY MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 p-6 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/90 p-5 shadow-2xl relative">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-md font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-green-400" />
              <span>New Custom Exercise</span>
            </h3>

            <form onSubmit={handleCreateCustom} className="mt-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Incline Cable Press"
                  className="mt-1.5 w-full rounded-xl border border-gray-850 bg-gray-950 px-4 py-3 text-xs font-bold text-white focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Muscle Group</label>
                <select
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-850 bg-gray-950 px-4 py-3 text-xs font-semibold text-white focus:border-green-500 focus:outline-none"
                >
                  {muscleFormOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Equipment Needed</label>
                <input
                  type="text"
                  required
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value)}
                  placeholder="e.g. Cables, Barbell, Band"
                  className="mt-1.5 w-full rounded-xl border border-gray-850 bg-gray-950 px-4 py-3 text-xs font-semibold text-white focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Difficulty</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomDifficulty("beginner")}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                      customDifficulty === "beginner"
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : "bg-gray-950 text-gray-500 border border-gray-850 hover:text-white"
                    }`}
                  >
                    Beginner
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomDifficulty("intermediate")}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                      customDifficulty === "intermediate"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                        : "bg-gray-950 text-gray-500 border border-gray-850 hover:text-white"
                    }`}
                  >
                    Intermediate
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/10 active:scale-95"
              >
                Insert Exercise
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
