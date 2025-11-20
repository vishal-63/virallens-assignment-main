import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { LoginCredentials } from '@/types/auth';
import AuthLayout from '@/components/AuthLayout';
import SEOHead from '@/components/SEOHead';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const SignIn = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signin, isAuthenticated, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>();

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            const from = location.state?.from?.pathname || '/chat';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate, location]);

    const onSubmit = async (data: LoginCredentials) => {
        setIsSubmitting(true);
        try {
            const success = await signin(data);
            if (success) {
                const from = location.state?.from?.pathname || '/chat';
                navigate(from, { replace: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SEOHead
                title="Sign In - Access Your Marketing Bot Assistant"
                description="Sign in to Virallens Marketing Bot and get instant access to AI-powered marketing advice, strategies, and expert guidance for your business."
                keywords="sign in, login, marketing bot access, AI marketing assistant, business marketing tools"
                url="https://virallens.com/signin"
            />
            <AuthLayout
                title="Sign in to your account"
                subtitle="Welcome back! Please sign in to continue."
            >
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                type="email"
                                autoComplete="email"
                                className="input pl-10"
                                placeholder="Enter your email address"
                            />
                        </div>
                        {errors.email && (
                            <p className="form-error">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                type="password"
                                autoComplete="current-password"
                                className="input pl-10"
                                placeholder="Enter your password"
                            />
                        </div>
                        {errors.password && (
                            <p className="form-error">{errors.password.message}</p>
                        )}
                    </div>



                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary w-full"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="spinner h-5 w-5 mr-3"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <FaSignInAlt className="w-5 h-5 mr-2" />
                                    Sign in
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-semibold text-gray-800 hover:text-gray-900 transition-colors underline underline-offset-2"
                            >
                                Sign up
                            </Link>
                        </span>
                    </div>
                </form>
            </AuthLayout>
        </>
    );
};

export default SignIn;
