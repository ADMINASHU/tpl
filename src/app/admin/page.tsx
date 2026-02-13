"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, update, onValue } from "firebase/database";
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');

    const [runs, setRuns] = useState('');
    const [target, setTarget] = useState('');
    const [wickets, setWickets] = useState('');
    const [overs, setOvers] = useState('');
    const [totalOvers, setTotalOvers] = useState('');
    const [theme, setTheme] = useState('dark');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Fetch current values on load to populate form
    useEffect(() => {
        if (!isAuthenticated) return;

        const scoresRef = ref(db, 'scores/match1');
        const unsubscribe = onValue(scoresRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setRuns(data.runs || '0');
                setTarget(data.target || '');
                setWickets(data.wickets || '0');
                setOvers(data.overs || '0.0');
                setTotalOvers(data.totalOvers || '');
                setTheme(data.theme || 'dark');
            }
        });

        return () => unsubscribe();
    }, [isAuthenticated]);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === '0014') {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect PIN');
            setPinInput('');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await update(ref(db, 'scores/match1'), {
                runs: runs,
                target: target,
                wickets: wickets,
                overs: overs,
                totalOvers: totalOvers,
                theme: theme,
                timestamp: Date.now()
            });
            setMessage('Score updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error updating score:", error);
            setMessage('Error updating score. Check console/permissions.');
        }
        setLoading(false);
    };

    const triggerCelebration = async (type: 'FOUR' | 'SIX' | 'OUT' | 'RUN_RATE' | 'END_OVER' | 'REQ_RR') => {
        setMessage('');
        try {
            await update(ref(db, 'celebrations/match1'), {
                type: type,
                timestamp: Date.now()
            });
            setMessage(`Celebration ${type} triggered!`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error triggering celebration:", error);
            setMessage('Error triggering celebration.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Access</h2>
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enter PIN</label>
                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                                maxLength={4}
                                placeholder="****"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Enter
                        </button>
                    </form>
                    
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-black">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Score Control</h1>
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                            className={`px-3 py-1 rounded text-sm font-bold ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-200 text-black border border-gray-400'}`}
                        >
                            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                        </button>
                        <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-500 hover:underline">Logout</button>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Runs</label>
                            <input
                                type="number"
                                value={runs}
                                onChange={(e) => setRuns(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                                placeholder="e.g. 145"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Wickets</label>
                            <input
                                type="number"
                                value={wickets}
                                onChange={(e) => setWickets(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                                placeholder="e.g. 3"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Overs</label>
                            <input
                                type="text"
                                value={overs}
                                onChange={(e) => setOvers(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                                placeholder="e.g. 14.2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target (Optional)</label>
                            <input
                                type="number"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                                placeholder="e.g. 200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Overs (Optional)</label>
                        <input
                            type="number"
                            value={totalOvers}
                            onChange={(e) => setTotalOvers(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                            placeholder="e.g. 20"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                    >
                        {loading ? 'Updating...' : 'UPDATE SCORE'}
                    </button>
                </form>

                <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Celebrations</h2>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => triggerCelebration('FOUR')}
                            className="py-3 px-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow transition-colors"
                        >
                            4
                        </button>
                        <button
                            onClick={() => triggerCelebration('SIX')}
                            className="py-3 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow transition-colors"
                        >
                            6
                        </button>
                        <button
                            onClick={() => triggerCelebration('OUT')}
                            className="py-3 px-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-colors"
                        >
                            OUT
                        </button>
                        <button
                            onClick={() => triggerCelebration('RUN_RATE')}
                            className="py-3 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition-colors"
                        >
                            RR
                        </button>
                        <button
                            onClick={() => triggerCelebration('END_OVER')}
                            className="py-3 px-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded shadow transition-colors"
                        >
                            END OVER
                        </button>
                        
                        {parseInt(target) > 0 && (
                            <button
                                onClick={() => triggerCelebration('REQ_RR')}
                                className="py-3 px-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded shadow transition-colors"
                            >
                                REQ RR
                            </button>
                        )}
                    </div>
                </div>

                {message && (
                    <div className={`mt-4 text-center p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
