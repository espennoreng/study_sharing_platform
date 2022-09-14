import { createContext, useContext } from "react";
import useFirebaseAuth from "./useFirebaseAuth";

const authUserContext = createContext({
  authUser: null,
  loading: true,
  signIn: () => {},
  createUser: () => {},
  signOut: () => {},
});

export function AuthUserProvider({ children }: any) {
  const auth: any = useFirebaseAuth();
  return (
    <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>
  );
}
// custom hook to use the authUserContext and access authUser and loading
export const useAuth = () => useContext(authUserContext);
