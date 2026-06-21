/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  X, 
  Play, 
  Timer, 
  Square,
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { WorkoutSession, WorkoutExercise, SetLog, Exercise } from "../types";

export function LogView({ setTab }: { setTab: (tab: string) => void }) {
  const { 
    allExercises, 
    saveSession, 
    addToast,
    settings 
  } = useWorkout();

  // Logging states
  const [sessionName, setSessionName] = useState<string>("Push Day");
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [isLogging, setIsLogging] = useState<boolean>(true);
  
  // Exercise search/selector modal
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [muscleFilter, setMuscleFilter] = useState<string>("All");

  // Rest Timer State
  const [timerMax, setTimerMax] = useState<number>(settings.restTimerDefault || 90);
  const [timerLeft, setTimerLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Time-tracker refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Running work duration counter
  useEffect(() => {
    const elapsedTimer = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 60000));
    }, 10000); // update every 10s is perfect

    return () => clearInterval(elapsedTimer);
  }, []);

  // Rest Timer countdown ticker
  useEffect(() => {
    if (timerActive && timerLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timerLeft === 0) {
      setTimerActive(false);
      // Trigger simple haptic vibration if supported
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
      }
      addToast("Rest Time Complete! Back to work! 🏋️‍♂️", "achievement");
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerLeft, timerActive]);

  // Start Countdown Rest Timer on set completion
  const triggerRestTimer = () => {
    setTimerLeft(timerMax);
    setTimerActive(true);
  };

  const handleAdjustTimer = (amt: number) => {
    setTimerLeft((prev) => Math.max(0, prev + amt));
  };

  // Preset plans names options
  const routinePicks = ["Push Day", "Pull Day", "Leg Day", "Full Body", "Cardio Blast", "Core Workout"];

  // Search filter exercises list
  const filteredExercises = allExercises.filter((ex) => {
    const queryMatch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const muscleMatch = muscleFilter === "All" || ex.muscleGroup === muscleFilter;
    return queryMatch && muscleMatch;
  });

  const muscleGroups = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Cardio"];

  // Insert workout exercise to list
  const addExerciseToSession = (ex: Exercise) => {
    // Prevent duplicate exercises in the active logger if we want, or allow multiple
    const exists = activeExercises.find((ae) => ae.exerciseId === ex.id);
    if (exists) {
      addToast(`${ex.name} is already in the logger!`, "info");
      return;
    }

    const newSessEx: WorkoutExercise = {
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 20, completed: false }
      ],
      notes: ""
    };

    setActiveExercises([...activeExercises, newSessEx]);
    setSearchOpen(false);
    addToast(`Added ${ex.name} to workout list.`, "success");
  };

  // Remove exercise from active logger list
  const removeExercise = (exerciseId: string) => {
    setActiveExercises(activeExercises.filter((ae) => ae.exerciseId !== exerciseId));
  };

  // Manage individual set parameters
  const updateSetField = (exerciseIndex: number, setIndex: number, field: keyof SetLog, value: any) => {
    const updated = [...activeExercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setActiveExercises(updated);
  };

  const addSetToExercise = (exerciseIndex: number) => {
    const updated = [...activeExercises];
    const prevSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({
      setNumber: updated[exerciseIndex].sets.length + 1,
      reps: prevSet ? prevSet.reps : 10,
      weightKg: prevSet ? prevSet.weightKg : 20,
      completed: false
    });
    setActiveExercises(updated);
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    const updated = [...activeExercises];
    if (updated[exerciseIndex].sets.length === 1) {
      // If only one set left, remove the whole exercise
      setActiveExercises(activeExercises.filter((_, i) => i !== exerciseIndex));
      return;
    }
    updated[exerciseIndex].sets.splice(setIndex, 1);
    // Renumber sets remaining
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.map((set, idx) => ({
      ...set,
      setNumber: idx + 1
    }));
    setActiveExercises(updated);
  };

  const updateExerciseNotes = (exerciseIndex: number, notes: string) => {
    const updated = [...activeExercises];
    updated[exerciseIndex].notes = notes;
    setActiveExercises(updated);
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const updated = [...activeExercises];
    const targetSet = updated[exerciseIndex].sets[setIndex];
    const beforeState = targetSet.completed;
    
    updated[exerciseIndex].sets[setIndex] = {
      ...targetSet,
      completed: !beforeState
    };
    setActiveExercises(updated);

    // If marked as complete, trigger countdown rest timer pill!
    if (!beforeState) {
      triggerRestTimer();
    }
  };

  // Save full session to DB
  const finishSession = async () => {
    if (activeExercises.length === 0) {
      addToast("Add at least one exercise to save!", "info");
      return;
    }

    const sessionItem: WorkoutSession = {
      id: "session_" + Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      name: sessionName || "Gym Routine",
      durationMinutes: Math.max(1, duration),
      exercises: activeExercises,
      timestamp: Date.now()
    };

    await saveSession(sessionItem);
    
    // reset logger states
    setActiveExercises([]);
    setDuration(0);
    setTimerActive(false);
    startTimeRef.current = Date.now();
    
    // Redirect back to Home context tab
    setTab("home");
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-36 text-gray-100">
      {/* Top sticky details bar */}
      <div className="sticky top-0 z-40 border-b border-gray-900 bg-gray-950/90 px-6 py-4.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-black text-white tracking-wide uppercase">Active Workout logger</h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-1.5 border border-gray-800 text-xs font-semibold text-gray-300">
            <Timer className="h-4 w-4 text-green-400" />
            <span>{duration} minutes elapsed</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-md px-6 pt-6">
        {/* Routine selector preset buttons */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Routine Type / Name</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm font-bold text-white focus:border-green-500 focus:outline-none"
              placeholder="e.g. Leg Day, Push Day..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {routinePicks.map((pick) => (
              <button
                key={pick}
                onClick={() => setSessionName(pick)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold select-none transition-all active:scale-95 ${
                  sessionName === pick
                    ? "bg-green-500/10 text-green-400 border border-green-500/35"
                    : "bg-gray-900 text-gray-400 border border-gray-800/80 hover:text-white"
                }`}
              >
                {pick}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises list section */}
        <div className="mt-8 space-y-6">
          {activeExercises.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/10 py-16 px-6 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-700 stroke-[1.2]" />
              <h4 className="mt-4 text-sm font-bold text-gray-300">No exercises added to log</h4>
              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                Search the exercise database below to log sets, reps, and work weight.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(true);
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 transition-transform"
              >
                <Plus className="h-4 w-4" />
                <span>Search & Add Exercises</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeExercises.map((ae, exIdx) => (
                <div key={ae.exerciseId} className="rounded-2xl border border-gray-800/80 bg-gray-900/30 p-5">
                  <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-white">{ae.name}</h4>
                      <span className="mt-0.5 inline-block rounded bg-gray-800 px-1.5 py-0.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {ae.muscleGroup}
                      </span>
                    </div>
                    <button
                      onClick={() => removeExercise(ae.exerciseId)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-800 hover:text-red-400/90 active:scale-95 transition-all"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Log input table */}
                  <div className="mt-4 space-y-2.5">
                    <div className="grid grid-cols-12 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2">
                      <span className="col-span-2 text-left">Set</span>
                      <span className="col-span-4">kg (Weight)</span>
                      <span className="col-span-4">Reps</span>
                      <span className="col-span-2">Done</span>
                    </div>

                    {ae.sets.map((set, setIdx) => {
                      const isCmplt = set.completed;
                      return (
                        <div
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 rounded-xl py-1.5 px-2 items-center transition-all duration-300 ${
                            isCmplt 
                              ? "bg-green-500/10 border border-green-500/20 text-green-400" 
                              : "bg-gray-900 border border-gray-800/60 text-gray-300"
                          }`}
                        >
                          <span className="col-span-2 text-xs font-bold text-center pl-1">
                            {set.setNumber}
                          </span>
                          
                          {/* Weight input */}
                          <div className="col-span-4 flex items-center justify-center">
                            <input
                              type="number"
                              disabled={isCmplt}
                              value={set.weightKg === 0 ? "" : set.weightKg}
                              onChange={(e) => updateSetField(exIdx, setIdx, "weightKg", parseFloat(e.target.value) || 0)}
                              className="w-16 rounded-lg bg-gray-950/70 border border-gray-800 py-1.5 text-center text-xs font-black text-white focus:border-green-500 focus:outline-none disabled:bg-transparent disabled:border-transparent"
                            />
                          </div>

                          {/* Reps input */}
                          <div className="col-span-4 flex items-center justify-center">
                            <input
                              type="number"
                              disabled={isCmplt}
                              value={set.reps === 0 ? "" : set.reps}
                              onChange={(e) => updateSetField(exIdx, setIdx, "reps", parseInt(e.target.value) || 0)}
                              className="w-16 rounded-lg bg-gray-950/70 border border-gray-800 py-1.5 text-center text-xs font-black text-white focus:border-green-500 focus:outline-none disabled:bg-transparent disabled:border-transparent"
                            />
                          </div>

                          {/* Completed action button state */}
                          <div className="col-span-2 flex items-center justify-center">
                            <button
                              onClick={() => toggleSetComplete(exIdx, setIdx)}
                              className={`flex h-6 w-11 items-center justify-center rounded-lg border transition-all duration-200 active:scale-95 ${
                                isCmplt
                                  ? "bg-green-500 text-black border-transparent"
                                  : "border-gray-700 bg-gray-950 text-gray-500 hover:border-gray-500 hover:text-white"
                              }`}
                            >
                              <Check className="h-4 w-4 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions per exercise container */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => addSetToExercise(exIdx)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-gray-900/40 px-3 py-1.5 border border-gray-800 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Set
                    </button>

                    <button
                      onClick={() => removeSetFromExercise(exIdx, ae.sets.length - 1)}
                      className="text-xs font-bold text-gray-500 hover:text-red-400/90 transition-colors"
                    >
                      Remove Set
                    </button>
                  </div>

                  {/* Form reminder field notes */}
                  <input
                    type="text"
                    value={ae.notes || ""}
                    onChange={(e) => updateExerciseNotes(exIdx, e.target.value)}
                    placeholder="Form reminders/notes (optional)..."
                    className="mt-4 w-full rounded-lg border border-gray-800/60 bg-gray-950/40 px-3 py-2 text-xs font-semibold text-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
              ))}

              {/* Add exercise trigger button */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(true);
                  }}
                  className="flex-1 rounded-xl border border-dashed border-gray-800 bg-gray-900/10 py-3.5 text-center text-xs font-bold text-gray-400 hover:text-white hover:border-gray-700 active:scale-95"
                >
                  + Add Exercise
                </button>
                <button
                  onClick={finishSession}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 py-3.5 text-center text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-green-500/10 hover:scale-[1.01] active:translate-y-0.5"
                >
                  Finish Workout
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FLOATING REST TIMER PILL AT THE BOTTOM */}
      {timerActive && (
        <div className="fixed bottom-24 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 transform rounded-full border border-green-500/30 bg-gray-900/90 py-3 px-5 shadow-2xl backdrop-blur-lg animate-bounce">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 animate-spin items-center justify-center rounded-full bg-green-500/10 text-green-400 font-bold border border-green-500/20">
                <Timer className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-black">Rest Countdown</p>
                <p className="text-sm font-black text-white leading-none mt-0.5">
                  {Math.floor(timerLeft / 60)}:{(timerLeft % 60).toString().padStart(2, "0")} <span className="text-[10px] text-gray-500">remaining</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAdjustTimer(30)}
                className="rounded-full bg-gray-800 px-2.5 py-1 text-[10px] font-black hover:bg-gray-700 active:scale-95"
              >
                +30s
              </button>
              <button
                onClick={() => setTimerActive(false)}
                className="rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 p-1 pl-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH EXERCISE DATABASE MODAL PANEL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 p-6 overflow-hidden">
          {/* Header search controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-md font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-400" />
              <span>Exercise Database (60+)</span>
            </h3>
            <button
              onClick={() => setSearchOpen(false)}
              className="rounded-xl bg-gray-900 p-2 border border-gray-800 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search box with icons */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-3.5 left-4 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercise..."
                className="w-full rounded-xl border border-gray-900 bg-gray-900 pl-11 pr-4 py-3 placeholder-gray-500 text-xs font-bold text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Horizontal muscle groups filters list */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setMuscleFilter(group)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap active:scale-95 transition-all ${
                  muscleFilter === group
                    ? "bg-green-500 text-black font-extrabold"
                    : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Matches results list */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-2 pb-6">
            {filteredExercises.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No matching exercises found in library.
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => addExerciseToSession(ex)}
                  className="flex items-center justify-between rounded-xl border border-gray-900 bg-gray-900/40 p-3.5 hover:bg-gray-900 hover:border-gray-800 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div>
                    <h5 className="text-xs font-black text-white">{ex.name}</h5>
                    <div className="mt-1 flex gap-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                        {ex.equipment}
                      </span>
                      <span className="text-[9px] font-semibold text-gray-400">•</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${
                        ex.difficulty === "beginner" ? "text-green-400" : "text-amber-400"
                      }`}>
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>

                  <span className="rounded bg-gray-800 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-green-400">
                    {ex.muscleGroup}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
