"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue } from "firebase/database";

export default function DisplayPage() {
    const [score, setScore] = useState({ runs: '0', wickets: '0', overs: '0.0' });

    useEffect(() => {
        const scoresRef = ref(db, 'scores/match1');
        const unsubscribe = onValue(scoresRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setScore({
                    runs: data.runs || '0',
                    wickets: data.wickets || '0',
                    overs: data.overs || '0.0'
                });
            }
        });

        return () => unsubscribe();
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
            <div className="absolute bottom-6 right-8 font-mono text-gray-300 font-bold" style={{ fontSize: '2vw' }}>
                OVERS: {score.overs}
            </div>
        </div>
    );
}
