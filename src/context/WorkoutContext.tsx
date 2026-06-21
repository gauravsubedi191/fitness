/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  db, 
  auth, 
  googleProvider, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType 
} from "../firebase";
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { 
  WorkoutSession, 
  BodyWeightLog, 
  BodyMeasurementsLog, 
  WeeklyPlan, 
  ProfileSettings, 
  Exercise, 
  INITIAL_EXERCISES 
} from "../types";

interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "info" | "achievement";
}

interface WorkoutContextType {
  user: any | null;
  loading: boolean;
  isFirebaseMode: boolean;
  firebaseEnabled: boolean;
  sessions: WorkoutSession[];
  bodyWeights: BodyWeightLog[];
  measurementsList: BodyMeasurementsLog[];
  customExercises: Exercise[];
  allExercises: Exercise[];
  weeklyPlan: WeeklyPlan;
  settings: ProfileSettings;
  toasts: ToastMessage[];
  addToast: (text: string, type?: "success" | "info" | "achievement") => void;
  removeToast: (id: string) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  
  // Data actions
  saveSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  saveBodyWeight: (weightKg: number, date: string) => Promise<void>;
  saveMeasurements: (meas: Omit<BodyMeasurementsLog, "date">, date: string) => Promise<void>;
  addCustomExercise: (name: string, muscleGroup: string, equipment: string, difficulty: "beginner" | "intermediate") => Promise<void>;
  saveWeeklyPlan: (plan: WeeklyPlan) => Promise<void>;
  updateSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
  
  // Computations
  streakCount: { current: number; longest: number };
  personalBests: Record<string, number>; // exerciseId -> max weight (kg)
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  // Authentication & Mode states
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseMode, setIsFirebaseMode] = useState<boolean>(isFirebaseConfigured);

  // App Data states
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [bodyWeights, setBodyWeights] = useState<BodyWeightLog[]>([]);
  const [measurementsList, setMeasurementsList] = useState<BodyMeasurementsLog[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    mon: "Rest", tue: "Rest", wed: "Rest", thu: "Rest", fri: "Rest", sat: "Rest", sun: "Rest"
  });
  const [settings, setSettings] = useState<ProfileSettings>({
    restTimerDefault: 90,
    weightUnit: "kg",
    theme: "dark"
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Derived calculations
  const [streakCount, setStreakCount] = useState({ current: 0, longest: 0 });
  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});

  const [allExercises, setAllExercises] = useState<Exercise[]>(INITIAL_EXERCISES);

  // Helper: Trigger custom beautiful toast notifications
  const addToast = (text: string, type: "success" | "info" | "achievement" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Google Sign-In with popup. Handles both Real Firebase and Mock-fallback cases cleanly.
  const loginWithGoogle = async () => {
    if (isFirebaseMode && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        setUser(result.user);
        addToast(`Welcome back, ${result.user.displayName || "Gaurav"}! 👋`, "success");
      } catch (error: any) {
        console.error("Sign-in error", error);
        if (error && (error.code === "auth/configuration-not-found" || String(error.message || "").includes("configuration-not-found"))) {
          addToast("Google sign-in is not enabled in your Firebase console. Switched to offline Demo Mode.", "info");
        } else {
          addToast("Firebase Authentication declined. Active demo account enabled.", "info");
        }
        // Fallback to mock/local storage mode so user does not get stuck
        setIsFirebaseMode(false);
        mockLogin();
      }
    } else {
      mockLogin();
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebaseMode && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        setUser(result.user);
        addToast(`Welcome back! 👋`, "success");
      } catch (error: any) {
        console.error("Email sign-in error", error);
        addToast("Invalid email or password.", "info");
      }
    } else {
      mockLogin();
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    if (isFirebaseMode && auth) {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        setUser(result.user);
        addToast(`Account created successfully! 🎉`, "success");
      } catch (error: any) {
        console.error("Email registration error", error);
        addToast("Failed to create account. Email may be in use.", "info");
      }
    } else {
      mockLogin();
    }
  };

  const loginAsDemo = () => {
    setIsFirebaseMode(false);
    mockLogin();
  };

  const mockLogin = () => {
    const mockUser = {
      uid: "mock_gaurav_123",
      displayName: "Gaurav Subedi",
      email: "Gauravsubedi191@gmail.com",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    };
    setUser(mockUser);
    localStorage.setItem("fit_mock_user", JSON.stringify(mockUser));
    addToast("Signed in as Gaurav Subedi (Demo Mode) 🏋️‍♂️", "success");
  };

  const logout = async () => {
    const origFirebaseMode = isFirebaseMode;
    if (origFirebaseMode && auth) {
      try {
        await firebaseSignOut(auth);
        setUser(null);
        addToast("Logged out successfully.", "info");
      } catch (error) {
        console.error("Logout failed", error);
      }
    } else {
      setUser(null);
      localStorage.removeItem("fit_mock_user");
      addToast("Signed out of local session.", "info");
    }
    // Restore default Firebase mode state if configured
    setIsFirebaseMode(isFirebaseConfigured);
    
    // Clear data states to prevent leakage
    setSessions([]);
    setBodyWeights([]);
    setMeasurementsList([]);
    setCustomExercises([]);
  };

  // Listen to Authentication State
  useEffect(() => {
    if (isFirebaseMode && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else {
          // If no Firebase session, check for mock user in localStorage
          const localMock = localStorage.getItem("fit_mock_user");
          if (localMock) {
            setUser(JSON.parse(localMock));
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const localMock = localStorage.getItem("fit_mock_user");
      if (localMock) {
        setUser(JSON.parse(localMock));
      }
      setLoading(false);
    }
  }, [isFirebaseMode]);

  // Synchronize App State when User changes
  useEffect(() => {
    if (!user) {
      // Load standard defaults for offline/unauthenticated users
      setSessions([]);
      setBodyWeights([]);
      setMeasurementsList([]);
      setCustomExercises([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      if (isFirebaseMode && auth && auth.currentUser) {
        const uid = auth.currentUser.uid;
        try {
          // 1. Fetch sessions
          const sessionsSnap = await getDocs(collection(db, `users/${uid}/sessions`));
          const sessionsData: WorkoutSession[] = [];
          sessionsSnap.forEach((doc) => {
            sessionsData.push({ id: doc.id, ...doc.data() } as WorkoutSession);
          });
          setSessions(sessionsData.sort((a,b) => b.timestamp - a.timestamp));

          // 2. Fetch weights
          const weightSnap = await getDocs(collection(db, `users/${uid}/bodyweight`));
          const weightData: BodyWeightLog[] = [];
          weightSnap.forEach((doc) => {
            weightData.push(doc.data() as BodyWeightLog);
          });
          setBodyWeights(weightData.sort((a,b) => a.date.localeCompare(b.date)));

          // 3. Fetch measurements
          const measSnap = await getDocs(collection(db, `users/${uid}/measurements`));
          const measData: BodyMeasurementsLog[] = [];
          measSnap.forEach((doc) => {
            measData.push(doc.data() as BodyMeasurementsLog);
          });
          setMeasurementsList(measData.sort((a,b) => b.date.localeCompare(a.date)));

          // 4. Fetch custom exercises
          const customSnap = await getDocs(collection(db, `users/${uid}/customExercises`));
          const customData: Exercise[] = [];
          customSnap.forEach((doc) => {
            customData.push({ id: doc.id, ...doc.data() } as Exercise);
          });
          setCustomExercises(customData);

          // 5. Fetch settings
          const settingsSnap = await getDoc(doc(db, `users/${uid}/profile/settings`));
          if (settingsSnap.exists()) {
            setSettings(settingsSnap.data() as ProfileSettings);
          }

          // 6. Fetch weeklyPlan
          const planSnap = await getDoc(doc(db, `users/${uid}/weeklyPlan/plan`));
          if (planSnap.exists()) {
            setWeeklyPlan(planSnap.data() as WeeklyPlan);
          }

        } catch (error) {
          console.error("Firestore loading error, returning to dual mode state", error);
          loadOfflineData();
        }
      } else {
        loadOfflineData();
      }
      setLoading(false);
    };

    loadData();
  }, [user, isFirebaseMode]);

  // Read full states from localStorage in local mode
  const loadOfflineData = () => {
    const keyPrefix = user ? user.uid : "global_offline";
    
    const localSess = localStorage.getItem(`fit_sess_${keyPrefix}`);
    setSessions(localSess ? JSON.parse(localSess) : []);

    const localWeights = localStorage.getItem(`fit_weight_${keyPrefix}`);
    setBodyWeights(localWeights ? JSON.parse(localWeights) : []);

    const localMeas = localStorage.getItem(`fit_meas_${keyPrefix}`);
    setMeasurementsList(localMeas ? JSON.parse(localMeas) : []);

    const localCustom = localStorage.getItem(`fit_custom_${keyPrefix}`);
    setCustomExercises(localCustom ? JSON.parse(localCustom) : []);

    const localSettings = localStorage.getItem(`fit_settings_${keyPrefix}`);
    if (localSettings) setSettings(JSON.parse(localSettings));

    const localPlan = localStorage.getItem(`fit_plan_${keyPrefix}`);
    if (localPlan) setWeeklyPlan(JSON.parse(localPlan));
  };

  // Maintain local state writes in local mode
  const saveOfflineData = (type: "sessions" | "bodyweights" | "measurements" | "custom" | "settings" | "plan", updatedData: any) => {
    const keyPrefix = user ? user.uid : "global_offline";
    switch (type) {
      case "sessions":
        localStorage.setItem(`fit_sess_${keyPrefix}`, JSON.stringify(updatedData));
        break;
      case "bodyweights":
        localStorage.setItem(`fit_weight_${keyPrefix}`, JSON.stringify(updatedData));
        break;
      case "measurements":
        localStorage.setItem(`fit_meas_${keyPrefix}`, JSON.stringify(updatedData));
        break;
      case "custom":
        localStorage.setItem(`fit_custom_${keyPrefix}`, JSON.stringify(updatedData));
        break;
      case "settings":
        localStorage.setItem(`fit_settings_${keyPrefix}`, JSON.stringify(updatedData));
        break;
      case "plan":
        localStorage.setItem(`fit_plan_${keyPrefix}`, JSON.stringify(updatedData));
        break;
    }
  };

  // Combine custom-exercises and preset exercises list
  useEffect(() => {
    setAllExercises([...INITIAL_EXERCISES, ...customExercises]);
  }, [customExercises]);

  // RECALCULATE PRs and STREAKS dynamically whenever sessions are updated
  useEffect(() => {
    // 1. Personal Bests calculation
    const pbMap: Record<string, number> = {};
    sessions.forEach((sess) => {
      sess.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed && set.weightKg > 0) {
            const curPb = pbMap[ex.exerciseId] || 0;
            if (set.weightKg > curPb) {
              pbMap[ex.exerciseId] = set.weightKg;
            }
          }
        });
      });
    });
    setPersonalBests(pbMap);

    // 2. Streak Calculations
    if (sessions.length === 0) {
      setStreakCount({ current: 0, longest: 0 });
      return;
    }

    // Extract unique active YYYY-MM-DD dates sorted descending
    const activeDates = Array.from(new Set(sessions.map((s) => s.date))).sort((a, b) => (b as string).localeCompare(a as string));
    
    // Convert to target offset check
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let currentStreak = 0;
    let longestStreak = 0;
    
    // Verify sequence
    if (activeDates.includes(todayStr) || activeDates.includes(yesterdayStr)) {
      let checkDate = activeDates.includes(todayStr) ? new Date() : yesterday;
      let checkStr = checkDate.toISOString().split("T")[0];
      
      while (activeDates.includes(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split("T")[0];
      }
    }

    // Compute longest consecutive days list
    let tempStreak = 0;
    const sortedDatesStrSet = Array.from(new Set(sessions.map((s) => s.date))).sort((a, b) => (a as string).localeCompare(b as string));
    
    if (sortedDatesStrSet.length > 0) {
      let prevDateObj: Date | null = null;
      sortedDatesStrSet.forEach((dateStr) => {
        const currentDateObj = new Date(dateStr as string);
        if (prevDateObj === null) {
          tempStreak = 1;
        } else {
          const diffTime = Math.abs(currentDateObj.getTime() - prevDateObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            tempStreak = 1;
          }
        }
        prevDateObj = currentDateObj;
      });
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    setStreakCount({ 
      current: currentStreak, 
      longest: Math.max(longestStreak, currentStreak) 
    });

  }, [sessions]);

  // ACTIONS TO SAVE DETAILS TOGETHER

  // 1. Save Workout Session
  const saveSession = async (session: WorkoutSession) => {
    const updated = [session, ...sessions];
    setSessions(updated);
    saveOfflineData("sessions", updated);

    // Check for Personal Best / Personal Records broken!
    let pbBroken = false;
    session.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          const currentMax = personalBests[ex.exerciseId] || 0;
          if (set.weightKg > currentMax && currentMax > 0) {
            pbBroken = true;
          }
        }
      });
    });

    if (pbBroken) {
      addToast("New Personal Record (PR) achieved! 🏆", "achievement");
    } else {
      addToast("Workout saved perfectly!", "success");
    }

    if (isFirebaseMode && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/sessions/${session.id}`;
      try {
        await setDoc(doc(db, path), session);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  // 2. Delete Workout Session
  const deleteSession = async (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveOfflineData("sessions", updated);
    addToast("Workout session deleted.", "info");

    if (isFirebaseMode && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/sessions/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // 3. Save Body Weight Log
  const saveBodyWeight = async (weightKg: number, date: string) => {
    // Deduplicate weights by date
    const filtered = bodyWeights.filter((b) => b.date !== date);
    const updated = [...filtered, { date, weightKg }].sort((a,b) => a.date.localeCompare(b.date));
    setBodyWeights(updated);
    saveOfflineData("bodyweights", updated);
    addToast("Body weight updated securely!", "success");

    if (isFirebaseMode && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/bodyweight/${date}`;
      try {
        await setDoc(doc(db, path), { weightKg, date });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  // 4. Save Body Measurements Log
  const saveMeasurements = async (meas: Omit<BodyMeasurementsLog, "date">, date: string) => {
    const logItem: BodyMeasurementsLog = { date, ...meas };
    const filtered = measurementsList.filter((m) => m.date !== date);
    const updated = [logItem, ...filtered].sort((a,b) => b.date.localeCompare(a.date));
    setMeasurementsList(updated);
    saveOfflineData("measurements", updated);
    addToast("Measurements logged for selected date!", "success");

    if (isFirebaseMode && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/measurements/${date}`;
      try {
        await setDoc(doc(db, path), logItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  // 5. Add Custom Exercise
  const addCustomExercise = async (
    name: string, 
    muscleGroup: string, 
    equipment: string, 
    difficulty: "beginner" | "intermediate"
  ) => {
    const exerciseId = "custom_" + name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now().toString().slice(-4);
    const newEx: Exercise = {
      id: exerciseId,
      name,
      muscleGroup: muscleGroup as any,
      equipment,
      difficulty
    };
    const updated = [...customExercises, newEx];
    setCustomExercises(updated);
    saveOfflineData("custom", updated);
    addToast(`Added custom exercise: ${name}!`, "success");

    if (isFirebaseMode && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/customExercises/${exerciseId}`;
      try {
        await setDoc(doc(db, path), newEx);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  // 6. Save Weekly Planned Routine
  const saveWeeklyPlan = async (plan: WeeklyPlan) => {
    setWeeklyPlan(plan);
    saveOfflineData("plan", plan);
    addToast("Weekly plan updated!", "success");

    if (isFirebaseMode && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/weeklyPlan/plan`;
      try {
        await setDoc(doc(db, path), plan);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  // 7. Update Profile Configuration settings
  const updateSettings = async (newSettings: Partial<ProfileSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveOfflineData("settings", updated);
    addToast("Settings updated successfully!", "success");

    if (isFirebaseMode && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/profile/settings`;
      try {
        await setDoc(doc(db, path), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        user,
        loading,
        isFirebaseMode,
        firebaseEnabled: isFirebaseConfigured && isFirebaseMode,
        sessions,
        bodyWeights,
        measurementsList,
        customExercises,
        allExercises,
        weeklyPlan,
        settings,
        toasts,
        addToast,
        removeToast,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemo,
        logout,
        saveSession,
        deleteSession,
        saveBodyWeight,
        saveMeasurements,
        addCustomExercise,
        saveWeeklyPlan,
        updateSettings,
        streakCount,
        personalBests,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}
