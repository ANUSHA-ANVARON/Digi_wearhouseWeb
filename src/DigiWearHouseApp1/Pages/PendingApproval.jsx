
import React from 'react';
import { useApp } from '../context/Context';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApproval() {
    const { signOut, currentUser, userData } = useApp();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isApproved = userData?.status === 'active' || userData?.isActive === true;

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isApproved ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {isApproved ? (
                            <Clock className="w-8 h-8 text-green-600" />

                        ) : (
                            <Clock className="w-8 h-8 text-yellow-600" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        {isApproved ? "Application Approved!" : "Application Pending"}
                    </h2>

                    <p className="text-slate-600 mb-6">
                        {isApproved
                            ? "Your vendor application has been approved. You can now access your dashboard."
                            : "Your vendor application has been submitted and is currently pending approval from our team."
                        }
                    </p>

                    <div className={`text-sm p-4 rounded-xl mb-8 border ${isApproved ? 'bg-green-50 text-green-800 border-green-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                        <p>
                            {isApproved
                                ? "Welcome to Digiwear House! Click below to get started."
                                : "Please check back later or contact support if you don't receive an update within 24-48 hours."
                            }
                        </p>
                    </div>

                    <div className="space-y-3">
                        {isApproved ? (
                            <button
                                onClick={handleDashboard}
                                className="w-full bg-[#006400] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#004d00] transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-[#800000] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#a00000] transition-colors"
                            >
                                Check Status
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full bg-white text-slate-600 font-medium py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {userData && (
                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                        <span>Account Status:</span>
                        <span className="font-semibold text-yellow-600 uppercase tracking-wider">
                            {userData.status || 'Pending'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
