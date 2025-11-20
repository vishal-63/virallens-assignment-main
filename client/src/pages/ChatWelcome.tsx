
import SEOHead from '@/components/SEOHead';

const ChatWelcome = () => {
    return (
        <>
            <SEOHead
                title="AI Marketing Bot Dashboard - Get Expert Marketing Advice"
                description="Welcome to Virallens Marketing Bot! Get instant expert marketing advice, strategies, campaign planning, and analytics insights. Your AI marketing assistant is ready to help."
                keywords="AI marketing bot, marketing dashboard, marketing assistant, marketing strategies, campaign planning, digital marketing advice"
                url="https://virallens.com/chat"
            />
            <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-6xl mb-6" role="img" aria-label="Robot emoji representing AI assistant">🤖</div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                        Welcome to Virallens <br /> Marketing Bot
                    </h1>
                    <p className="text-gray-600 mb-6">
                        I'm your dedicated AI marketing expert, ready to help solve any marketing challenges you face. Ask me anything about marketing strategies, campaigns, analytics, or best practices to grow your business!
                    </p>
                    <div className="hidden">
                        <h2>AI-Powered Marketing Assistant Features:</h2>
                        <ul>
                            <li>Marketing Strategy Development</li>
                            <li>Campaign Planning and Optimization</li>
                            <li>Digital Marketing Analytics</li>
                            <li>Social Media Marketing Guidance</li>
                            <li>Content Marketing Best Practices</li>
                            <li>SEO and SEM Recommendations</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWelcome;
