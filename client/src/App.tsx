import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import ChatLayout from '@/pages/ChatLayout';
import Chat from '@/pages/Chat';
import ChatWelcome from '@/pages/ChatWelcome';

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route
                                path="/chat"
                                element={
                                    <ProtectedRoute>
                                        <ChatLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<ChatWelcome />} />
                                <Route path=":conversationId" element={<Chat />} />
                            </Route>

                            <Route path="/" element={<Navigate to="/chat" replace />} />

                            <Route path="*" element={<Navigate to="/chat" replace />} />
                        </Routes>

                        <Toaster
                            position="top-right"
                        />
                    </div>
                </Router>
            </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
