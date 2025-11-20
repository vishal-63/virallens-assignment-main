import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, SignupCredentials, AuthResponse } from '@/types/auth';
import api from '@/utils/api';
import toast from 'react-hot-toast';

type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'AUTH_FAILURE' }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                isLoading: true,
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'SET_LOADING':
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
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (!token || !user) {
                dispatch({ type: 'AUTH_FAILURE' });
                return;
            }

            const response = await api.get('/auth/me');

            if (response && response.success) {
                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: {
                        user: response.user,
                        token,
                    },
                });
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch({ type: 'AUTH_FAILURE' });
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'AUTH_FAILURE' });
        }
    };

    const signin = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            dispatch({ type: 'AUTH_START' });

            const data: AuthResponse = await api.post('/auth/signin', credentials);

            if (data.success && data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: {
                        user: data.user,
                        token: data.token,
                    },
                });

                toast.success(data.message || 'Login successful!');
                return true;
            } else {
                dispatch({ type: 'AUTH_FAILURE' });
                toast.error(data.message || 'Login failed');
                return false;
            }
        } catch (error: any) {
            dispatch({ type: 'AUTH_FAILURE' });
            const message = error.message || 'Login failed';
            toast.error(message);
            return false;
        }
    };

    const signup = async (credentials: SignupCredentials): Promise<boolean> => {
        try {
            dispatch({ type: 'AUTH_START' });

            const data: AuthResponse = await api.post('/auth/signup', credentials);

            if (data.success && data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: {
                        user: data.user,
                        token: data.token,
                    },
                });

                toast.success(data.message || 'Account created successfully!');
                return true;
            } else {
                dispatch({ type: 'AUTH_FAILURE' });
                if (data.errors && data.errors.length > 0) {
                    data.errors.forEach((error: any) => {
                        toast.error(error.msg);
                    });
                } else {
                    toast.error(data.message || 'Signup failed');
                }
                return false;
            }
        } catch (error: any) {
            dispatch({ type: 'AUTH_FAILURE' });
            const message = error.message || 'Signup failed';
            toast.error(message);
            return false;
        }
    };

    const logout = (): void => {
        try {
            api.post('/auth/logout', {}).catch(() => {
            });
        } catch (error) {
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            dispatch({ type: 'LOGOUT' });
            toast.success('Logged out successfully');
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
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
