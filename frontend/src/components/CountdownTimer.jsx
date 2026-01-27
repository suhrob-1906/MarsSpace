import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CountdownTimer = ({ endDate, timeRemaining }) => {
    const { t } = useTranslation();
    const [time, setTime] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTime = () => {
            if (!timeRemaining || timeRemaining <= 0) {
                setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(timeRemaining / (24 * 60 * 60));
            const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
            const seconds = Math.floor(timeRemaining % 60);

            setTime({ days, hours, minutes, seconds });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    return (
        <div className="flex gap-3">
            <TimeUnit value={time.days} label={t('season.days')} />
            <TimeUnit value={time.hours} label={t('season.hours')} />
            <TimeUnit value={time.minutes} label={t('season.minutes')} />
            <TimeUnit value={time.seconds} label={t('season.seconds')} />
        </div>
    );
};

const TimeUnit = ({ value, label }) => {
    return (
        <div className="flex flex-col items-center bg-slate-800/50 rounded-lg px-3 py-2 min-w-[60px]">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
        </div>
    );
};

export default CountdownTimer;
