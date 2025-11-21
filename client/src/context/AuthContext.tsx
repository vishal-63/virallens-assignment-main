import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import {
  AuthState,
  User,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
} from "@/types/auth";
import api from "@/utils/api";
import toast from "react-hot-toast";

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User } }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  signin: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const user = localStorage.getItem("user");

      if (!user) {
        dispatch({ type: "AUTH_FAILURE" });
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });
      const response: AuthResponse = await api.get("/auth/me");

      if (response && response.success) {
        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: response.user as User,
          },
        });
      } else {
        localStorage.removeItem("user");
        dispatch({ type: "AUTH_FAILURE" });
      }
    } catch (error) {
      localStorage.removeItem("user");
      dispatch({ type: "AUTH_FAILURE" });
    }
  };

  const signin = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: "AUTH_START" });

      const data: AuthResponse = await api.post<AuthResponse>(
        "/auth/signin",
        credentials
      );

      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: data.user,
          },
        });

        toast.success(data.message || "Login successful!");
        return true;
      } else {
        dispatch({ type: "AUTH_FAILURE" });
        toast.error(data.message || "Login failed");
        return false;
      }
    } catch (error: any) {
      dispatch({ type: "AUTH_FAILURE" });
      const message = error.message || "Login failed";
      toast.error(message);
      return false;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<boolean> => {
    try {
      dispatch({ type: "AUTH_START" });

      const data: AuthResponse = await api.post<AuthResponse>(
        "/auth/signup",
        credentials
      );

      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: data.user,
          },
        });

        toast.success(data.message || "Account created successfully!");
        return true;
      } else {
        dispatch({ type: "AUTH_FAILURE" });
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((error: any) => {
            toast.error(error.msg);
          });
        } else {
          toast.error(data.message || "Signup failed");
        }
        return false;
      }
    } catch (error: any) {
      dispatch({ type: "AUTH_FAILURE" });
      const message = error.message || "Signup failed";
      toast.error(message);
      return false;
    }
  };

  const logout = (): void => {
    try {
      api.post("/auth/logout", {}).catch(() => {});
    } catch (error) {
    } finally {
      localStorage.removeItem("user");

      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully");
    }
  };

  const value: AuthContextType = {
    ...state,
    signin,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
