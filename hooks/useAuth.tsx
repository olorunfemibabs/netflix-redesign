import { 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    signOut,
    User
 } from 'firebase/auth';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect,  useMemo, useState } from 'react';
import { auth } from '@/firebase.config';

interface IAuth {
  user: User | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  loading: boolean
}

const AuthContext = createContext<IAuth>({
  user: null,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
  error: null,
  loading: false,
})

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const router = useRouter();

  //The onAuthStateChanged function in Firebase is used to listen for 
  //changes in the authentication state of the user. i.e. when the user signs in or signs out

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if(user) {
        //if user is logged in
        setUser(user);
        setLoading(false);
      } else {
        //not logged in
        setUser(null);
        setLoading(true);
        router.push("/login");
      }

      setInitialLoading(false)
    })
  }, [auth])

  const signUp = async (email: string, password: string) => {
    setLoading(true);

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
        router.push("/");
        setLoading(false);
      })
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false))
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
        router.push("/");
        setLoading(false);
      })
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false))
  }

  const logout = async () => {
    setLoading(true)

    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false))
  }

  const memoedValue = useMemo(
    () => ({ user, signUp, signIn, logout, error, loading}),
    [user, loading, error]
  )

  return (
   <AuthContext.Provider value={memoedValue}>
      {!initialLoading && children}
   </AuthContext.Provider>
  )
}

//export only the "useAuth" hook instead of context.
//will only want to use the hook directly and never the context component.

export default function useAuth  () {
  return useContext(AuthContext)
}
