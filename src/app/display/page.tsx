"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue } from "firebase/database";

export default function DisplayPage() {
    const [score, setScore] = useState({ runs: '0', wickets: '0', overs: '0.0', target: '0', totalOvers: '0' });

    const [celebration, setCelebration] = useState<{ type: string, timestamp: number } | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        // Score Listener
        const scoresRef = ref(db, 'scores/match1');
        const unsubscribe = onValue(scoresRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setScore({
                    runs: data.runs || '0',
                    wickets: data.wickets || '0',
                    overs: data.overs || '0.0',
                    target: data.target || '0',
                    totalOvers: data.totalOvers || '0'
                });
            }
        });

        // Celebration Listener
        const celRef = ref(db, 'celebrations/match1');
        const unsubCel = onValue(celRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.timestamp) {
                // Relaxed check to 60 seconds for debugging
                const now = Date.now();
                const diff = now - data.timestamp;
                console.log("Celebration Data:", data, "Diff:", diff);

                // Show if within 60 seconds (allocating for major clock drift)
                if (diff < 60000) {
                    setCelebration(data);
                    setShowOverlay(true);
                    
                    const remaining = 10000; // Force 10s duration for now
                    setTimeout(() => setShowOverlay(false), remaining);
                }
            }
        });

        return () => {
            unsubscribe();
            unsubCel();
        };
    }, []);

    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden relative">
            {/* Runs / Wickets in massive text */}
            <div className="flex items-center justify-center font-bold" style={{ fontSize: '32vw', lineHeight: 1 }}>
                <span>{score.runs}</span>

                {/* Vertical Line Separator */}
                <div className="mx-8 bg-gray-500 rounded" style={{ width: '1vw', height: '20vw' }}></div>

                <span>{score.wickets}</span>
            </div>

            {/* Overs at bottom right */}
            {/* Overs at bottom right */}
            <div className="absolute bottom-6 right-8 font-mono text-gray-300 font-bold" style={{ fontSize: '2vw' }}>
                OVERS: {score.overs}
            </div>

            {/* Celebration Overlay */}
            {showOverlay && celebration && (
                <div 
                    className="absolute inset-0 flex items-center justify-center z-50 bg-black font-bold"
                >
                    <style>{`
                        @keyframes celebration-pop {
                            0% { transform: scale(0.5); opacity: 0; }
                            50% { transform: scale(1.2); }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        @keyframes celebration-pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                            100% { transform: scale(1); }
                        }
                        /* OUT Animation */
                        @keyframes ball-throw {
                            0% { transform: translate(400%, -50%); opacity: 1; }
                            50% { transform: translate(0, -50%); opacity: 1; }
                            100% { transform: translate(-200%, -50%); opacity: 0; }
                        }
                        @keyframes stump-flight-left {
                            0%, 45% { transform: rotate(0); }
                            100% { transform: rotate(-60deg) translate(-50px, -50px); opacity: 0; }
                        }
                        @keyframes stump-flight-mid {
                            0%, 45% { transform: rotate(0); }
                            100% { transform: rotate(10deg) translate(20px, -80px); opacity: 0; }
                        }
                        @keyframes stump-flight-right {
                            0%, 45% { transform: rotate(0); }
                            100% { transform: rotate(60deg) translate(50px, -50px); opacity: 0; }
                        }
                        }
                        /* OUT Animation */
                        @keyframes ball-throw {
                            0% { transform: translate(400%, -50%); opacity: 1; }
                            50% { transform: translate(0, -50%); opacity: 1; }
                            100% { transform: translate(-200%, -50%); opacity: 0; }
                        }
                        @keyframes stump-flight-left {
                            0%, 45% { transform: rotate(0); }
                            100% { transform: rotate(-60deg) translate(-50px, -50px); opacity: 0; }
                        }
                        @keyframes stump-flight-mid {
                            0%, 45% { transform: rotate(0); }
                            100% { transform: rotate(10deg) translate(20px, -80px); opacity: 0; }
                        }
                        @keyframes stump-flight-right {
                            0%, 45% { transform: rotate(0); }
                            100% { transform: rotate(60deg) translate(50px, -50px); opacity: 0; }
                        }
                    `}</style>
                    
                    {(() => {
                        const getRunRate = () => {
                            const r = parseInt(score.runs) || 0;
                            const [overs, balls] = (score.overs || '0.0').split('.');
                            const totalOvers = parseInt(overs) + (parseInt(balls || '0') / 6);
                            if (totalOvers === 0) return '0.00';
                            return (r / totalOvers).toFixed(2);
                        };

                        const getReqRunRate = () => {
                            const target = parseInt(score.target) || 0;
                            const current = parseInt(score.runs) || 0;
                            const remainingRuns = target - current;
                            
                            const [overs, balls] = (score.overs || '0.0').split('.');
                            const totalBallsBowled = (parseInt(overs) * 6) + parseInt(balls || '0');
                             
                            const TOTAL_OVERS = parseInt(score.totalOvers) > 0 ? parseInt(score.totalOvers) : 20; 
                            const totalBalls = TOTAL_OVERS * 6;
                            const remainingBalls = totalBalls - totalBallsBowled;
                            
                            if (remainingBalls <= 0) return '0.00';
                            
                            const reqRate = (remainingRuns / (remainingBalls / 6));
                            return reqRate.toFixed(2);
                        };

                        if (celebration.type === 'REQ_RR') {
                            return (
                                <div style={{ color: 'white', fontSize: '15vw', textAlign: 'center' }}>
                                    <div>REQ. RR</div>
                                    <div style={{ fontSize: '25vw' }}>{getReqRunRate()}</div>
                                    <div style={{ fontSize: '5vw' }}>Target: {score.target}</div>
                                </div>
                            );
                        }

                        if (celebration.type === 'RUN_RATE') {
                            return (
                                <div style={{ color: 'white', fontSize: '15vw', textAlign: 'center' }}>
                                    <div>RUN RATE</div>
                                    <div style={{ fontSize: '25vw' }}>{getRunRate()}</div>
                                </div>
                            );
                        }
                        
                        if (celebration.type === 'END_OVER') {
                            return (
                                <div style={{ color: 'white', fontSize: '15vw', textAlign: 'center' }}>
                                    <div>END OF OVER</div>
                                    <div style={{ fontSize: '25vw' }}>{score.overs}</div>
                                </div>
                            );
                        }

                        if (celebration.type === 'OUT') {
                            return (
                                <div className="relative flex items-center justify-center w-full h-full">
                                    {/* Stumps */}
                                    <div className="relative flex items-end justify-center space-x-2" style={{ height: '30vh' }}>
                                        <div style={{ width: '2vw', height: '100%', background: '#d4d4d4', animation: 'stump-flight-left 1s ease-out forwards 0.1s' }}></div>
                                        <div style={{ width: '2vw', height: '100%', background: '#d4d4d4', animation: 'stump-flight-mid 1s ease-out forwards 0.1s' }}></div>
                                        <div style={{ width: '2vw', height: '100%', background: '#d4d4d4', animation: 'stump-flight-right 1s ease-out forwards 0.1s' }}></div>
                                    </div>
                                    
                                    {/* Ball */}
                                    <div style={{
                                        position: 'absolute',
                                        width: '5vw',
                                        height: '5vw',
                                        background: 'red',
                                        borderRadius: '50%',
                                        top: '50%',
                                        left: '50%',
                                        animation: 'ball-throw 0.6s linear forwards'
                                    }}></div>

                                    {/* Text (appears after hit) */}
                                    <div style={{
                                        position: 'absolute',
                                        color: 'white',
                                        fontSize: '30vw',
                                        animation: 'celebration-pop 0.5s ease-out forwards 0.5s',
                                        opacity: 0
                                    }}>
                                        OUT
                                    </div>
                                </div>
                            );
                        }

                        // Default: 4 or 6
                        return (
                             <div 
                                style={{ 
                                    color: 'white', 
                                    fontSize: '35vw',
                                    animation: 'celebration-pop 0.5s ease-out forwards, celebration-pulse 2s infinite ease-in-out'
                                }}
                            >
                                {celebration.type === 'FOUR' ? '4' : '6'}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
