import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    imageUrl?: string;
    imageAlt?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    imageUrl = "/viral.jpg",
    imageAlt = "Modern office workspace"
}) => {
    return (
        <div className="min-h-screen bg-gray-100 flex p-2">
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {title}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {subtitle}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-8">
                        {children}
                    </div>
                </div>
            </div>
            <div className="hidden lg:block relative rounded-2xl flex-1">
                <div className="absolute inset-0 rounded-2xl bg-gray-900">
                    <img
                        className="w-full h-full rounded-2xl grayscale opacity-70"
                        src={imageUrl}
                        alt={imageAlt}
                    />
                    <div className="absolute opacity-70 inset-0 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/80 mix-blend-multiply" />

                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="text-center text-white">
                            <h3 className="text-4xl font-bold mb-4 leading-tight">
                                Welcome to the Future of Marketing with virallens
                            </h3>
                            <p className="text-xl opacity-90 leading-relaxed">

                                Performance marketing and AI video solutions built exclusively for school and college marketers.                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
