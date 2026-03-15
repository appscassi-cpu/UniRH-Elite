
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfile {
  nome: string;
  email: string;
  perfil: 'admin' | 'usuario';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  isAdmin: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const profileRef = doc(db, 'usuarios', firebaseUser.uid);
          const profileDoc = await getDoc(profileRef);
          
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            // Lógica de Inicialização Automática para o Administrador Mestre
            if (firebaseUser.email === 'litencarv@uems.br') {
              const newProfile: UserProfile = {
                nome: "Lilian Tenório",
                email: firebaseUser.email,
                perfil: 'admin'
              };
              await setDoc(profileRef, {
                ...newProfile,
                dataCriacao: serverTimestamp()
              });
              setProfile(newProfile);
            } else {
              setProfile(null);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      
      if (!firebaseUser && pathname !== '/login') {
        router.push('/login');
      }
      if (firebaseUser && pathname === '/login') {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const isAdmin = profile?.perfil === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
