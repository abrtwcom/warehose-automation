import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, database } from "../firebase/config";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !database) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val() || {};
          const forcedRole =
            firebaseUser.email === "admin@gmail.com" ? "admin" : userData.role;

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData,
            role: forcedRole || "receiver", // Ensure a default role
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          const forcedRole =
            firebaseUser.email === "admin@gmail.com" ? "admin" : null;
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: forcedRole,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  const signup = async (email, password, { fullName, role }) => {
    if (!auth || !database)
      throw new Error("Firebase Auth or Database is not initialized.");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const userRef = ref(database, `users/${uid}`);
    const userRole = email === "admin@gmail.com" ? "admin" : role || "receiver";
    await set(userRef, {
      email,
      full_name: fullName || email,
      role: userRole,
      created_date: new Date().toISOString(),
    });
    return cred.user;
  };

  const loginWithGoogle = async (role = "receiver") => {
    if (!auth || !database)
      throw new Error("Firebase Auth or Database is not initialized.");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const { user: gUser } = result;

    const userRef = ref(database, `users/${gUser.uid}`);
    const snap = await get(userRef);
    if (!snap.exists()) {
      const userRole = gUser.email === "admin@gmail.com" ? "admin" : role;
      await set(userRef, {
        email: gUser.email,
        full_name: gUser.displayName || gUser.email,
        role: userRole,
        created_date: new Date().toISOString(),
      });
    }
    return gUser;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return { user, loading, login, signup, loginWithGoogle, logout };
};
