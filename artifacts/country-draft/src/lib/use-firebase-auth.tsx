import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile, type UserProfile } from "./firestore";

export type FirebaseAuthState = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsUsername: boolean;
  isGuest: boolean;
  startGuestMode: () => void;
  exitGuestMode: () => void;
  signInGuestAnonymously: () => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, create?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<FirebaseAuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("geoDraftsIsGuest") === "true";
    }
    return false;
  });

  const fetchProfile = useCallback(async (user: User) => {
    if (user.isAnonymous) {
      setProfile(null);
      return null;
    }
    try {
      const p = await getUserProfile(user.uid);
      setProfile(p);
      return p;
    } catch (error) {
      console.error("[AuthProvider] Error fetching profile:", error);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && !user.isAnonymous) {
        await fetchProfile(user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, [fetchProfile]);

  const startGuestMode = useCallback(() => {
    setIsGuest(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("geoDraftsIsGuest", "true");
    }
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("geoDraftsIsGuest");
    }
  }, []);

  const signInGuestAnonymously = useCallback(async () => {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const cred = await signInAnonymously(auth);
    return cred.user;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    exitGuestMode();
  }, [exitGuestMode]);

  const signInWithEmail = useCallback(
    async (email: string, password: string, create = false) => {
      const sanitizedEmail = email.trim();
      if (create) {
        await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      }
      exitGuestMode();
    },
    [exitGuestMode]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
    exitGuestMode();
  }, [exitGuestMode]);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser && !firebaseUser.isAnonymous) await fetchProfile(firebaseUser);
  }, [firebaseUser, fetchProfile]);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      isLoading,
      isAuthenticated: !!firebaseUser && !firebaseUser.isAnonymous && !!profile,
      needsUsername: !!firebaseUser && !firebaseUser.isAnonymous && !profile && !isLoading,
      isGuest,
      startGuestMode,
      exitGuestMode,
      signInGuestAnonymously,
      signInWithGoogle,
      signInWithEmail,
      logout,
      refreshProfile,
    }),
    [
      firebaseUser,
      profile,
      isLoading,
      isGuest,
      startGuestMode,
      exitGuestMode,
      signInGuestAnonymously,
      signInWithGoogle,
      signInWithEmail,
      logout,
      refreshProfile,
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth(): FirebaseAuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within an AuthProvider");
  }
  return context;
}

