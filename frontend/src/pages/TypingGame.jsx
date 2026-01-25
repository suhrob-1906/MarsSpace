import { useState, useEffect } from 'react';
import api from '../services/api';
import { Timer, RefreshCw } from 'lucide-react';

const TEXT_SAMPLES = [
    "def hello_world(): print('Hello form space')",
    "import django\nfrom django.db import models",
    "const [user, setUser] = useState(null);",
    "class SpaceShip:\n    def __init__(self, name):\n        self.name = name"
];

const TypingGame = () => {
    const [text, setText] = useState("");
    const [input, setInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        const randomText = TEXT_SAMPLES[Math.floor(Math.random() * TEXT_SAMPLES.length)];
        setText(randomText);
        setInput("");
        setStartTime(null);
        setWpm(0);
        setCompleted(false);
    };

    const handleChange = (e) => {
        const val = e.target.value;
        if (!startTime) setStartTime(Date.now());

        setInput(val);

        if (val === text) {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        const endTime = Date.now();
        const minutes = (endTime - startTime) / 60000;
        const words = text.split(" ").length;
        const calculatedWpm = Math.round(words / minutes);

        setWpm(calculatedWpm);
        setCompleted(true);

        // Submit score
        try {
            await api.post('/typing/', {
                wpm: calculatedWpm,
                accuracy: 100, // naive simplified
                score: calculatedWpm * 1.5 // gamified score
            });
            // alert("Score saved! " + calculatedWpm + " WPM");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 text-center pt-10">
            <h1 className="text-4xl font-bold text-white mb-2">Code Typing Trainer</h1>
            <p className="text-slate-400">Type the code exactly as shown to earn energy.</p>

            <div className="card p-8 relative">
                <div className="font-mono text-xl bg-slate-950 p-6 rounded-xl text-left text-slate-400 mb-6 select-none border border-slate-700">
                    {text}
                </div>

                {!completed ? (
                    <textarea
                        value={input}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-4 font-mono text-xl text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary h-32 resize-none"
                        placeholder="Start typing here..."
                        spellCheck="false"
                    />
                ) : (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-8 animate-in zoom-in duration-300">
                        <div className="text-4xl font-bold text-white mb-2">{wpm} WPM</div>
                        <div className="text-green-300 font-bold mb-6">Great job! Analysis complete.</div>
                        <button onClick={resetGame} className="btn btn-primary mx-auto">
                            <RefreshCw size={20} /> Play Again
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-8 text-slate-500">
                <div className="flex items-center gap-2">
                    <Timer size={20} />
                    <span>Timer starts on first keypress</span>
                </div>
            </div>
        </div>
    );
};

export default TypingGame;
