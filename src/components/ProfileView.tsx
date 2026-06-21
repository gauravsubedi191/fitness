/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Calendar, 
  Flame, 
  Settings, 
  Timer, 
  LogOut, 
  Dumbbell, 
  Activity, 
  Plus, 
  Weight,
  Sparkles,
  Lock,
  Trash2,
  Edit3
} from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { WeeklyPlan, BodyMeasurementsLog } from "../types";

export function ProfileView() {
  const { 
    user, 
    sessions, 
    weeklyPlan, 
    saveWeeklyPlan, 
    measurementsList, 
    saveMeasurements, 
    settings, 
    updateSettings, 
    logout, 
    streakCount,
    firebaseEnabled,
    updateUserProfile,
    updateUserPassword,
    deleteUserAccount
  } = useWorkout();

  // Weekly Planner Form States
  const [planner, setPlanner] = useState<WeeklyPlan>({ ...weeklyPlan });
  const [measurementDate, setMeasurementDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Body Measurements Input States
  const [chest, setChest] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [hips, setHips] = useState<string>("");
  const [leftArm, setLeftArm] = useState<string>("");
  const [rightArm, setRightArm] = useState<string>("");
  const [leftThigh, setLeftThigh] = useState<string>("");
  const [rightThigh, setRightThigh] = useState<string>("");

  // Settings parameter states
  const [restTimer, setRestTimer] = useState<number>(settings.restTimerDefault || 90);

  // User Management States
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || "");
  const [editPhoto, setEditPhoto] = useState(user?.photoURL || "");
  
  const [newPassword, setNewPassword] = useState("");
  const [showDangerZone, setShowDangerZone] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile(editName, editPhoto);
    setEditProfileMode(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return;
    await updateUserPassword(newPassword);
    setNewPassword("");
  };

  const handleDeleteAccount = async () => {
    if (confirm("WARNING: This will permanently delete your account login access. Your data will be safely orphaned and can be recovered by an admin later. Are you absolutely sure?")) {
      await deleteUserAccount();
    }
  };

  const daysLabel = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysKeys: (keyof WeeklyPlan)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const splitLabels = ["Rest", "Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Cardio"];

  const handleUpdateWeeklyPlan = async (key: keyof WeeklyPlan, value: string) => {
    const nextPlan = { ...planner, [key]: value };
    setPlanner(nextPlan);
    await saveWeeklyPlan(nextPlan);
  };

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      chestCm: parseFloat(chest) || undefined,
      waistCm: parseFloat(waist) || undefined,
      hipsCm: parseFloat(hips) || undefined,
      leftArmCm: parseFloat(leftArm) || undefined,
      rightArmCm: parseFloat(rightArm) || undefined,
      leftThighCm: parseFloat(leftThigh) || undefined,
      rightThighCm: parseFloat(rightThigh) || undefined
    };
    await saveMeasurements(payload, measurementDate);
    // clear input fields
    setChest(""); setWaist(""); setHips(""); setLeftArm(""); setRightArm(""); setLeftThigh(""); setRightThigh("");
  };

  const handleUpdateRestSetting = async (val: number) => {
    setRestTimer(val);
    await updateSettings({ restTimerDefault: val });
  };

  // GENERATE GITHUB-STYLE HEATMAP DATA
  // We will build a 52 weeks x 7 days grid. We'll map columns to weeks, rows to days.
  const renderHeatmap = () => {
    const today = new Date();
    const heatmapCells = [];

    // Map workout sessions count by date for quick lookup
    const sessionCountByDate: Record<string, number> = {};
    sessions.forEach((s) => {
      sessionCountByDate[s.date] = (sessionCountByDate[s.date] || 0) + 1;
    });

    // We'll gather the past 364 days.
    // 52 columns (weeks), each column has 7 squares (Monday to Sunday)
    // To format cleanly in SVG columns: X index (0 to 51) and Y index (0 to 6)
    // We compute the date starting 364 days ago.
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    // Get Mon of that week to align nicely
    const startDay = startDate.getDay(); // 0 is Sun, 1 is Mon
    const daysToAdjust = startDay === 0 ? 6 : startDay - 1;
    startDate.setDate(startDate.getDate() - daysToAdjust);

    const weeks = [];
    let currentDayIter = new Date(startDate);

    // Populate columns
    for (let w = 0; w < 52; w++) {
      const daysInWeek = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDayIter.toISOString().split("T")[0];
        const count = sessionCountByDate[dateStr] || 0;
        daysInWeek.push({
          date: dateStr,
          count: count
        });
        currentDayIter.setDate(currentDayIter.getDate() + 1);
      }
      weeks.push(daysInWeek);
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-900 bg-gray-950 p-4 scrollbar-thin">
        <div className="min-w-[620px]">
          <div className="flex justify-between text-[9px] text-gray-500 font-bold mb-2 uppercase tracking-wide px-1">
            <span>Last 52 Weeks Consistency Matrix</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="h-2.5 w-2.5 rounded bg-gray-800" />
              <span className="h-2.5 w-2.5 rounded bg-green-500/40" />
              <span className="h-2.5 w-2.5 rounded bg-green-600" />
              <span>More</span>
            </div>
          </div>
          <div className="flex gap-[4px]">
            {/* Days labels */}
            <div className="flex flex-col justify-between py-1 text-[9px] text-gray-600 font-black h-[105px] select-none pr-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Matrix squares */}
            <div className="flex gap-[4px] flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[4px]">
                  {week.map((day, dIdx) => {
                    let color = "bg-gray-900"; // zero sessions
                    if (day.count === 1) color = "bg-green-500/40 border border-green-500/20";
                    if (day.count >= 2) color = "bg-green-600 border border-green-500/40";

                    return (
                      <div
                        key={dIdx}
                        className={`h-[11px] w-[11px] rounded-[2px] transition-colors duration-200 cursor-pointer ${color}`}
                        title={`${day.date}: ${day.count} sessions`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate monthly stats count
  const getMonthlyCount = () => {
    const thisMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    return sessions.filter((s) => s.date.startsWith(thisMonthStr)).length;
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-28 text-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-900 bg-gray-950/80 px-6 py-4.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wide">Aesthetic Profile</h2>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 px-3 py-2 text-xs font-bold active:scale-95 transition-transform"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 pt-5 space-y-6">
        {/* Profile Card Summary details */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/30 p-5 flex items-center gap-4">
          <img
            src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
            referrerPolicy="no-referrer"
            alt="Profile Avatar"
            className="h-14 w-14 rounded-2xl border border-gray-800 object-cover"
          />
          <div>
            <h2 className="text-md font-black text-white">{user?.displayName || "Gaurav Subedi"}</h2>
            <p className="text-xs text-gray-500 mt-1">{user?.email || "Gauravsubedi191@gmail.com"}</p>
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-green-400 border border-green-500/20">
              <Activity className="h-3 w-3" />
              Active Gym Beginner
            </span>
          </div>
        </div>

        {/* CONSISTENCY HEATMAP CALENDAR */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Streaks & Consistency heatmap</h3>
          {renderHeatmap()}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="rounded-xl border border-gray-900 bg-gray-900/10 p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Completed Workouts This Month</span>
              <span className="text-2xl font-black text-white mt-1.5 block">{getMonthlyCount()}</span>
            </div>
            <div className="rounded-xl border border-gray-900 bg-gray-900/10 p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Longest Lifetime Streak</span>
              <span className="text-2xl font-black text-green-400 mt-1.5 block">{streakCount.longest} days</span>
            </div>
          </div>
        </div>

        {/* 7-DAY WEEKLY SCHEDULE PLANNER GRID */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/40 p-5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-400" />
            <span>7-Day Split Planner</span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Set your dynamic routine targets per week Mon-Sun</p>

          <div className="mt-4 space-y-2.5">
            {daysKeys.map((key, index) => (
              <div key={key} className="flex items-center justify-between py-1 bg-gray-950/40 px-3 rounded-xl border border-gray-900">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wide w-12">{daysLabel[index]}</span>
                <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none max-w-[240px]">
                  {splitLabels.map((lbl) => (
                    <button
                      key={lbl}
                      onClick={() => handleUpdateWeeklyPlan(key, lbl)}
                      className={`rounded px-2.5 py-1 text-[10px] font-extrabold select-none transition-all active:scale-95 ${
                        planner[key] === lbl
                          ? "bg-blue-600 text-white font-extrabold uppercase tracking-wide"
                          : "bg-gray-900 text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BODY MEASUREMENTS RECORD LOG WITH DATE PICKER */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/40 p-5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span>Body Measurements (cm)</span>
          </h3>

          <form onSubmit={handleSaveMeasurements} className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wide">Logging Date</span>
              <input
                type="date"
                required
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                className="rounded-xl border border-gray-850 bg-gray-950 px-3 py-2 text-xs font-bold text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Chest</label>
                <input
                  type="number"
                  placeholder="Chest"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-950 py-2 text-center text-xs font-bold text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Waist</label>
                <input
                  type="number"
                  placeholder="Waist"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-950 py-2 text-center text-xs font-bold text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Hips</label>
                <input
                  type="number"
                  placeholder="Hips"
                  value={hips}
                  onChange={(e) => setHips(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-950 py-2 text-center text-xs font-bold text-white focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block truncate">L-Arm</label>
                <input
                  type="number"
                  placeholder="L Arm"
                  value={leftArm}
                  onChange={(e) => setLeftArm(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-950 py-2 text-center text-xs font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block truncate">R-Arm</label>
                <input
                  type="number"
                  placeholder="R Arm"
                  value={rightArm}
                  onChange={(e) => setRightArm(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-950 py-2 text-center text-xs font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block truncate">L-Thigh</label>
                <input
                  type="number"
                  placeholder="L Thigh"
                  value={leftThigh}
                  onChange={(e) => setLeftThigh(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-950 py-2 text-center text-xs font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block truncate">R-Thigh</label>
                <input
                  type="number"
                  placeholder="R Thigh"
                  value={rightThigh}
                  onChange={(e) => setRightThigh(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-950 py-2 text-center text-xs font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl py-3 w-full transition-all active:scale-95"
            >
              Add Metrics Data
            </button>
          </form>

          {/* Measurements History Table list */}
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-900">
            <table className="w-full text-left text-[11px] font-semibold">
              <thead className="bg-gray-900 border-b border-gray-800 text-gray-400 text-[10px] uppercase font-bold text-center">
                <tr>
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-1">Chest</th>
                  <th className="py-2.5 px-1">Waist</th>
                  <th className="py-2.5 px-1">Arms (L/R)</th>
                  <th className="py-2.5 px-1">Thighs (L/R)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 text-center text-gray-300">
                {measurementsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-650 italic">No logs parsed.</td>
                  </tr>
                ) : (
                  measurementsList.slice(0, 5).map((m) => (
                    <tr key={m.date} className="hover:bg-gray-900/10">
                      <td className="py-2 px-3 text-left font-bold text-gray-400">{m.date}</td>
                      <td className="py-2 px-1">{m.chestCm ? `${m.chestCm}` : "-"}</td>
                      <td className="py-2 px-1">{m.waistCm ? `${m.waistCm}` : "-"}</td>
                      <td className="py-2 px-1">
                        {m.leftArmCm || m.rightArmCm ? `${m.leftArmCm || "-"}/${m.rightArmCm || "-"}` : "-"}
                      </td>
                      <td className="py-2 px-1">
                        {m.leftThighCm || m.rightThighCm ? `${m.leftThighCm || "-"}/${m.rightThighCm || "-"}` : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESTART CONFIG DEFAULT REST TIMER TIMER */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/30 p-5">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-green-400 animate-pulse" />
            <span>Workout Timer Config</span>
          </h3>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Default Rest Period</span>
              <span className="text-xs font-extrabold text-white bg-gray-900 px-3 py-1 border border-gray-850 rounded-lg">{restTimer} seconds</span>
            </div>
            <input
              type="range"
              min="30"
              max="240"
              step="15"
              value={restTimer}
              onChange={(e) => handleUpdateRestSetting(parseInt(e.target.value))}
              className="w-full accent-green-500 rounded-lg"
            />
          </div>
        </div>

        {/* ACCOUNT MANAGEMENT SECTION */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/30 p-5 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-blue-400" />
            <span>Account Management</span>
          </h3>

          {!editProfileMode ? (
            <button
              onClick={() => setEditProfileMode(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 py-3 text-xs font-bold text-white transition-all hover:bg-gray-700 active:scale-95"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile Details</span>
            </button>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-3 bg-gray-950/40 p-4 rounded-xl border border-gray-900">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-900 py-2.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Photo URL</label>
                <input
                  type="url"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-850 bg-gray-900 py-2.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditProfileMode(false)} className="flex-1 bg-gray-800 text-gray-300 rounded-lg py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-xs font-bold">Save</button>
              </div>
            </form>
          )}

          <div className="border-t border-gray-900/50 pt-4">
            <form onSubmit={handleUpdatePassword} className="flex gap-2">
              <input
                type="password"
                placeholder="New Password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 rounded-xl border border-gray-850 bg-gray-900 py-2.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
              />
              <button type="submit" disabled={!newPassword || newPassword.length < 6} className="bg-gray-800 text-white rounded-xl px-4 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">Update</button>
            </form>
          </div>

          <div className="border-t border-gray-900/50 pt-4">
            {!showDangerZone ? (
              <button
                onClick={() => setShowDangerZone(true)}
                className="text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest underline underline-offset-2"
              >
                Show Danger Zone
              </button>
            ) : (
              <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-4 space-y-3">
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide">Danger Zone: Delete Account</p>
                <p className="text-[10px] text-gray-400">This action permanently revokes login access. Your historic data is safely orphaned and can be recovered by an admin. You may need to sign out and sign back in to verify your identity before deleting.</p>
                <button
                  onClick={handleDeleteAccount}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-900/50 border border-red-800 py-2.5 text-[11px] font-bold text-red-100 transition-all hover:bg-red-800 active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Permanently Delete Account</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FIREBASE AUTH PREPARATION CHECK CARD */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/20 p-5 text-left text-xs text-gray-400 leading-relaxed grid gap-2.5">
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-blue-400" />
            <span>Secure Firebase Status</span>
          </h4>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${firebaseEnabled ? "bg-green-400" : "bg-blue-400 animation-pulse"}`} />
            <span className="font-bold text-white text-[11px]">{firebaseEnabled ? "Active Firebase SDK enabled" : "Active Local preview node (Offline)"}</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            To synchronize workout sessions globally across devices, host onto your free Spark Firebase plan. Check setup guidelines inside instructions README.md file.
          </p>
        </div>
      </main>
    </div>
  );
}
