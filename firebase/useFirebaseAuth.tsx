import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "./firebase";

const formatAuthUser = (user: any) => ({
  uid: user.uid,
  email: user.email,
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const authStateChanged = async (authState: any) => {
    if (!authState) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    let formattedUser = formatAuthUser(authState);
    setAuthUser(formattedUser);
    setLoading(false);
    console.log(authUser);
  };

  // listen for Firebase state change
  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  const signIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const createUser = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signOut = () => auth.signOut();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(formatAuthUser(user));
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
      } else {
        // User is signed out
        // ...
      }
    });
  }, []);

  return {
    authUser,
    loading,
    signIn,
    createUser,
    signOut,
  };
}
