import { useContext } from "react";
import { AuthContext } from "../features/auth/AuthContext";

export default function useAuth() {
  return useContext(AuthContext);
}
