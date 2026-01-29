import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Timer, RefreshCw, Trophy, Coins, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Leaderboard from '../components/game/Leaderboard';

// Word dictionaries
const RUSSIAN_WORDS = [
    'программа', 'компьютер', 'разработка', 'алгоритм', 'функция', 'переменная', 'массив', 'объект',
    'класс', 'метод', 'интерфейс', 'наследование', 'инкапсуляция', 'полиморфизм', 'абстракция',
    'данные', 'структура', 'база', 'запрос', 'сервер', 'клиент', 'протокол', 'сеть', 'интернет',
    'браузер', 'приложение', 'система', 'операция', 'процесс', 'память', 'процессор', 'устройство',
    'файл', 'папка', 'документ', 'текст', 'код', 'скрипт', 'библиотека', 'фреймворк', 'модуль',
    'пакет', 'версия', 'обновление', 'установка', 'настройка', 'конфигурация', 'параметр', 'опция',
    'команда', 'терминал', 'консоль', 'вывод', 'ввод', 'ошибка', 'исключение', 'отладка', 'тест',
    'проверка', 'валидация', 'безопасность', 'шифрование', 'аутентификация', 'авторизация', 'токен',
    'сессия', 'куки', 'кеш', 'хранилище', 'репозиторий', 'ветка', 'коммит', 'слияние', 'конфликт',
    'развертывание', 'продакшн', 'разработка', 'тестирование', 'интеграция', 'доставка', 'релиз'
];

const ENGLISH_WORDS = [
    'program', 'computer', 'development', 'algorithm', 'function', 'variable', 'array', 'object',
    'class', 'method', 'interface', 'inheritance', 'encapsulation', 'polymorphism', 'abstraction',
    'data', 'structure', 'database', 'query', 'server', 'client', 'protocol', 'network', 'internet',
    'browser', 'application', 'system', 'operation', 'process', 'memory', 'processor', 'device',
    'file', 'folder', 'document', 'text', 'code', 'script', 'library', 'framework', 'module',
    'package', 'version', 'update', 'install', 'configuration', 'parameter', 'option', 'setting',
    'command', 'terminal', 'console', 'output', 'input', 'error', 'exception', 'debug', 'test',
    'validation', 'security', 'encryption', 'authentication', 'authorization', 'token', 'session',
    'cookie', 'cache', 'storage', 'repository', 'branch', 'commit', 'merge', 'conflict', 'deploy',
    'production', 'development', 'testing', 'integration', 'delivery', 'release', 'performance'
];

const TypingGame = () => {
    const { user, refreshUser } = useAuth();
    const [language, setLanguage] = useState('english');
    const [duration, setDuration] = useState(30);
    const [words, setWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(duration);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [correctWords, setCorrectWords] = useState(0);
    const [incorrectWords, setIncorrectWords] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [bestWpm, setBestWpm] = useState(user?.last_wpm || 0);

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // Generate random words
    const generateWords = () => {
        const wordList = language === 'russian' ? RUSSIAN_WORDS : ENGLISH_WORDS;
        const randomWords = [];
        for (let i = 0; i < 100; i++) {
            randomWords.push(wordList[Math.floor(Math.random() * wordList.length)]);
        }
        return randomWords;
    };

    const resetGame = () => {
        setWords(generateWords());
        setCurrentWordIndex(0);
        setInput('');
        setTimeLeft(duration);
        setGameStarted(false);
        setGameFinished(false);
        setCorrectWords(0);
        setIncorrectWords(0);
        setWpm(0);
        setAccuracy(100);
        setCoinsEarned(0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    useEffect(() => {
        resetGame();
    }, [language, duration]);

    const startGame = () => {
        setGameStarted(true);
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endGame = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setGameFinished(true);

        const totalWords = correctWords + incorrectWords;
        const calculatedWpm = Math.round((correctWords / duration) * 60);
        const calculatedAccuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

        setWpm(calculatedWpm);
        setAccuracy(calculatedAccuracy);

        // Update best WPM
        if (calculatedWpm > bestWpm) {
            setBestWpm(calculatedWpm);
        }

        // Submit score to backend
        try {
            const response = await api.post('/typing/', {
                wpm: calculatedWpm,
                accuracy: calculatedAccuracy,
                score: Math.round(calculatedWpm * (calculatedAccuracy / 100))
            });

            if (response.data.coins_reward) {
                setCoinsEarned(response.data.coins_reward);
            }

            if (refreshUser) {
                await refreshUser();
            }
        } catch (err) {
            console.error('Failed to submit score:', err);
        }
    };

    const handleInputChange = (e) => {
        if (!gameStarted) {
            startGame();
        }

        const value = e.target.value;
        setInput(value);

        // Check if word is complete (space pressed)
        if (value.endsWith(' ')) {
            const typedWord = value.trim();
            const currentWord = words[currentWordIndex];

            if (typedWord === currentWord) {
                setCorrectWords(prev => prev + 1);
            } else {
                setIncorrectWords(prev => prev + 1);
            }

            setCurrentWordIndex(prev => prev + 1);
            setInput('');
        }
    };

    const getCurrentWordStatus = () => {
        const currentWord = words[currentWordIndex];
        if (!currentWord) return [];

        return currentWord.split('').map((char, idx) => {
            if (idx < input.length) {
                return {
                    char,
                    status: input[idx] === char ? 'correct' : 'incorrect'
                };
            }
            return { char, status: 'pending' };
        });
    };

    return (
        <div className="container mx-auto pt-8 px-4">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Game Area */}
                <div className="flex-1 space-y-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-800 mb-2">Typing Speed Test</h1>
                        <p className="text-slate-500">Test your typing speed and accuracy</p>
                    </div>

                    {/* Settings */}
                    {!gameStarted && !gameFinished && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Language Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Globe className="inline mr-2" size={16} />
                                        Language
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLanguage('english')}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${language === 'english'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => setLanguage('russian')}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${language === 'russian'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            Русский
                                        </button>
                                    </div>
                                </div>

                                {/* Duration Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Timer className="inline mr-2" size={16} />
                                        Duration
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setDuration(15)}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${duration === 15
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            15s
                                        </button>
                                        <button
                                            onClick={() => setDuration(30)}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${duration === 30
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            30s
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Bar */}
                    {gameStarted && !gameFinished && (
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
                                <div className="text-3xl font-bold text-orange-600">{timeLeft}s</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Time Left</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
                                <div className="text-3xl font-bold text-blue-600">{correctWords}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Words</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
                                <div className="text-3xl font-bold text-green-600">
                                    {Math.round((correctWords / (duration - timeLeft || 1)) * 60)}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">WPM</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
                                <div className="text-3xl font-bold text-purple-600">
                                    {correctWords + incorrectWords > 0
                                        ? Math.round((correctWords / (correctWords + incorrectWords)) * 100)
                                        : 100}%
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Accuracy</div>
                            </div>
                        </div>
                    )}

                    {/* Game Area */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        {!gameFinished ? (
                            <>
                                {/* Words Display */}
                                <div className="mb-6 min-h-[120px] flex flex-wrap gap-2 text-2xl font-mono">
                                    {words.slice(currentWordIndex, currentWordIndex + 15).map((word, idx) => (
                                        <span
                                            key={idx}
                                            className={`${idx === 0
                                                    ? 'text-slate-800 font-bold'
                                                    : 'text-slate-400'
                                                }`}
                                        >
                                            {idx === 0 ? (
                                                getCurrentWordStatus().map((item, charIdx) => (
                                                    <span
                                                        key={charIdx}
                                                        className={
                                                            item.status === 'correct'
                                                                ? 'text-green-600'
                                                                : item.status === 'incorrect'
                                                                    ? 'text-red-600 bg-red-100'
                                                                    : 'text-slate-800'
                                                        }
                                                    >
                                                        {item.char}
                                                    </span>
                                                ))
                                            ) : (
                                                word
                                            )}
                                        </span>
                                    ))}
                                </div>

                                {/* Input */}
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-xl font-mono outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    placeholder={gameStarted ? "Type here..." : "Click here to start typing..."}
                                    autoFocus
                                    disabled={gameFinished}
                                />

                                <button
                                    onClick={resetGame}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <RefreshCw size={20} />
                                    Restart
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                                    <Trophy size={48} />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800">Great Job!</h2>

                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">{wpm}</div>
                                        <div className="text-sm text-slate-600">Words Per Minute</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <div className="text-4xl font-bold text-green-600 mb-2">{accuracy}%</div>
                                        <div className="text-sm text-slate-600">Accuracy</div>
                                    </div>
                                </div>

                                {coinsEarned > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto">
                                        <div className="flex items-center justify-center gap-2 text-amber-600">
                                            <Coins size={24} />
                                            <span className="text-xl font-bold">+{coinsEarned} Coins Earned!</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={resetGame}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all inline-flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Play Again
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Best Score */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Your Best Score</h3>
                                <p className="text-white/80 text-sm">Keep practicing to improve!</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black">{bestWpm}</div>
                                <div className="text-sm text-white/80">WPM</div>
                            </div>
                        </div>
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
