import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CountdownTimer = ({ endDate }) => {
    const { t } = useTranslation();
    const [time, setTime] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTime = () => {
            if (!endDate) {
                setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const now = new Date().getTime();
            const end = new Date(endDate).getTime();
            const difference = end - now;

            if (difference <= 0) {
                setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTime({ days, hours, minutes, seconds });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [endDate]);

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
