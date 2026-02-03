"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; 
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  role: 'admin' | 'staff' | 'kitchen' | 'waiter' | 'manager' | 'cashier' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthContextType['role']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          }
        } catch (err) {
          console.error("Auth State Error:", err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    console.log("Attempting login for:", email); // DEBUG LOG

    try {
      // 1. Authenticate
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log("Auth Successful. UID:", firebaseUser.uid); // DEBUG LOG
      
      // 2. Get Role
      const docRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(docRef);
      
      let userRole: AuthContextType['role'] = 'staff'; // Default fallback

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Firestore Data Found:", userData); // DEBUG LOG
        userRole = userData.role;
        setRole(userData.role);
      } else {
        console.error("No User Document found in Firestore for this UID!"); // CRITICAL DEBUG LOG
        console.log("Please create a document in 'users' collection with ID:", firebaseUser.uid);
      }

      console.log("Redirecting based on role:", userRole); // DEBUG LOG

      // 3. Redirect
      if (userRole === 'admin' || userRole === 'manager') {
        router.push("/dashboard");
      } else if (userRole === 'staff' || userRole === 'waiter' || userRole === 'cashier') {
        router.push("/orders"); 
      } else if (userRole === 'kitchen') {
        router.push("/kitchen");
      } else {
        router.push("/dashboard");
      }

    } catch (err: unknown) {
      console.error("Login Process Error:", err); // DEBUG LOG
      if ((err as { code?: string }).code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError("Failed to sign in. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Create Firestore Doc
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      setRole(role as AuthContextType['role']);
      
      // 3. Redirect
      if (role === 'admin' || role === 'manager') {
        router.push("/dashboard");
      } else if (role === 'staff' || role === 'waiter' || role === 'cashier') {
        router.push("/orders");
      } else if (role === 'kitchen') {
        router.push("/kitchen");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      console.error("Signup Error:", err);
      if ((err as { code?: string }).code === 'auth/email-already-in-use') {
        setError("Email is already registered.");
      } else {
        setError("Failed to sign up.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      router.push("/");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function getRoleBadgeColor(role: string | null | undefined) {
  switch (role) {
    case 'admin': return 'bg-primary/10 text-primary hover:bg-primary/20';
    case 'staff': 
    case 'waiter': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
    case 'kitchen': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    default: return 'bg-slate-100 text-slate-700';
  }
}