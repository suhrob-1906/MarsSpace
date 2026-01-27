import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Timer, RefreshCw, Trophy, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Leaderboard from '../components/game/Leaderboard';

const TEXT_SAMPLES = [
    "def hello_world(): print('Hello from space')",
    "import django\nfrom django.db import models\nfrom django.contrib.auth.models import User",
    "const [user, setUser] = useState(null);\nuseEffect(() => { fetchUser(); }, []);",
    "class SpaceShip:\n    def __init__(self, name):\n        self.name = name\n    def launch(self):\n        print(f'{self.name} launched!')",
    "function calculateScore(wpm, accuracy) {\n    return Math.round(wpm * (accuracy / 100));\n}",
    "SELECT * FROM users WHERE role = 'STUDENT' ORDER BY created_at DESC;",
    "async def get_user_data(user_id):\n    user = await User.objects.get(id=user_id)\n    return user.serialize()"
];

const TypingGame = () => {
    const { refreshUser } = useAuth();
    const [text, setText] = useState("");
    const [input, setInput] = useState("");
    const startTimeRef = useRef(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [errors, setErrors] = useState(0);

    const [gameStarted, setGameStarted] = useState(false);

    const resetGame = () => {
        const randomText = TEXT_SAMPLES[Math.floor(Math.random() * TEXT_SAMPLES.length)];
        setText(randomText);
        setInput("");
        startTimeRef.current = null;
        setWpm(0);
        setAccuracy(0);
        setCompleted(false);
        setCoinsEarned(0);
        setErrors(0);
        setGameStarted(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        resetGame();
    }, []);

    const calculateAccuracy = (original, typed) => {
        let correct = 0;
        let total = Math.max(original.length, typed.length);
        for (let i = 0; i < Math.min(original.length, typed.length); i++) {
            if (original[i] === typed[i]) {
                correct++;
            }
        }
        return total > 0 ? Math.round((correct / total) * 100) : 0;
    };

    useEffect(() => {
        if (input.length === 1 && !startTimeRef.current) {
            startTimeRef.current = performance.now();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGameStarted(true);
        }
    }, [input]);

    const handleChange = (e) => {
        const val = e.target.value;
        setInput(val);

        // Calculate errors
        let errorCount = 0;
        for (let i = 0; i < Math.min(text.length, val.length); i++) {
            if (text[i] !== val[i]) {
                errorCount++;
            }
        }
        setErrors(errorCount);

        // Calculate accuracy
        const acc = calculateAccuracy(text, val);
        setAccuracy(acc);

        if (val === text) {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        const endTime = performance.now();
        const minutes = (endTime - startTimeRef.current) / 60000;
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0;
        const finalAccuracy = calculateAccuracy(text, input);

        setWpm(calculatedWpm);
        setAccuracy(finalAccuracy);
        setCompleted(true);

        // Submit score
        try {
            const response = await api.post('/typing/', {
                wpm: calculatedWpm,
                accuracy: finalAccuracy,
                score: Math.round(calculatedWpm * (finalAccuracy / 100))
            });

            // Update coins and energy from response
            if (response.data.coins_reward) {
                setCoinsEarned(response.data.coins_reward);
            }

            // Refresh user data to update wallet
            if (refreshUser) {
                await refreshUser();
            }
        } catch (err) {
            console.error('Failed to submit score:', err);
        }
    };

    // Highlight text based on input
    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = 'text-slate-400';
            if (index < input.length) {
                if (char === input[index]) {
                    className = 'text-green-400';
                } else {
                    className = 'text-red-400 bg-red-500/20';
                }
            }
            return <span key={index} className={className}>{char}</span>;
        });
    };

    return (
        <div className="container mx-auto pt-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Game Area */}
                <div className="flex-1 space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-2">Code Typing Trainer</h1>
                        <p className="text-slate-400">Type the code exactly as shown to earn coins and energy.</p>
                    </div>

                    {/* Stats Bar */}
                    {!completed && gameStarted && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="card text-center p-4">
                                <div className="text-2xl font-bold text-primary">{wpm || 0}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">WPM</div>
                            </div>
                            <div className="card text-center p-4">
                                <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Accuracy</div>
                            </div>
                            <div className="card text-center p-4">
                                <div className="text-2xl font-bold text-red-400">{errors}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Errors</div>
                            </div>
                        </div>
                    )}

                    <div className="card p-8 relative">
                        {/* Code Display */}
                        <div className="font-mono text-lg bg-slate-950 p-6 rounded-xl text-left mb-6 select-none border border-slate-700 overflow-x-auto">
                            <div className="whitespace-pre-wrap">
                                {renderText()}
                            </div>
                        </div>

                        {!completed ? (
                            <>
                                <textarea
                                    value={input}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-4 font-mono text-lg text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 h-32 resize-none"
                                    placeholder="Start typing here..."
                                    spellCheck="false"
                                    autoFocus
                                />
                                <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
                                    <Timer size={16} />
                                    <span>Timer starts on first keypress</span>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-8 animate-in zoom-in duration-300">
                                <div className="text-center space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-green-300 mb-4">
                                        <Trophy size={32} />
                                        <span className="text-2xl font-bold">Great job!</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-900/50 rounded-xl p-4">
                                            <div className="text-3xl font-bold text-white mb-1">{wpm}</div>
                                            <div className="text-sm text-slate-400">Words Per Minute</div>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-xl p-4">
                                            <div className="text-3xl font-bold text-green-400 mb-1">{accuracy}%</div>
                                            <div className="text-sm text-slate-400">Accuracy</div>
                                        </div>
                                    </div>

                                    {coinsEarned > 0 && (
                                        <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                                            <div className="text-lg font-bold text-white mb-2">Rewards Earned</div>
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="flex items-center gap-2 text-amber-400">
                                                    <Coins size={20} />
                                                    <span className="font-bold">+{coinsEarned} Coins</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={resetGame} className="btn btn-primary mx-auto">
                                        <RefreshCw size={20} /> Play Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Leaderboard Sidebar */}
                <div className="lg:w-80 space-y-6">
                    <Leaderboard />
                </div>
            </div>
        </div>
    );
};

export default TypingGame;
