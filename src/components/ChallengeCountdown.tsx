import React, { useState, useEffect } from 'react';

interface ChallengeCountdownProps {
  startDate: string;
  endDate: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: 'upcoming' | 'active' | 'ended';
}

const ChallengeCountdown: React.FC<ChallengeCountdownProps> = ({ startDate, endDate }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: 'upcoming'
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (now >= end) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: 'ended'
        });
        return;
      }

      if (now >= start) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: 'active'
        });
        return;
      }

      // Calculate time remaining until start
      const diff = start.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        status: 'upcoming'
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const formatTimeValue = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const getStatusColor = () => {
    switch (timeRemaining.status) {
      case 'upcoming':
        return 'text-blue-400';
      case 'active':
        return 'text-green-400';
      case 'ended':
        return 'text-gray-400';
      default:
        return 'text-blue-400';
    }
  };

  const getStatusText = () => {
    switch (timeRemaining.status) {
      case 'upcoming':
        return 'Starts in:';
      case 'active':
        return 'Status:';
      case 'ended':
        return 'Status:';
      default:
        return 'Starts in:';
    }
  };

  const getDisplayText = () => {
    switch (timeRemaining.status) {
      case 'upcoming':
        return `${timeRemaining.days}d ${formatTimeValue(timeRemaining.hours)}h ${formatTimeValue(timeRemaining.minutes)}m ${formatTimeValue(timeRemaining.seconds)}s`;
      case 'active':
        return 'Active';
      case 'ended':
        return 'Ended';
      default:
        return '';
    }
  };

  if (timeRemaining.status === 'upcoming') {
    return (
      <div className="space-y-3 flex flex-col items-center justify-center">
        <div className="text-gray-400 text-sm text-center">Starts in:</div>
        <div className="flex gap-2 justify-center items-center">
          {/* Days Box */}
          <div className="bg-gray-800/90 backdrop-blur-md border border-blue-500/30 rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-white font-bold text-lg leading-none">
              {timeRemaining.days}
            </div>
            <div className="text-gray-300 text-xs mt-1">
              Days
            </div>
          </div>
          
          {/* Hours Box */}
          <div className="bg-gray-800/90 backdrop-blur-md border border-blue-500/30 rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-white font-bold text-lg leading-none">
              {formatTimeValue(timeRemaining.hours)}
            </div>
            <div className="text-gray-300 text-xs mt-1">
              Hours
            </div>
          </div>
          
          {/* Minutes Box */}
          <div className="bg-gray-800/90 backdrop-blur-md border border-blue-500/30 rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-white font-bold text-lg leading-none">
              {formatTimeValue(timeRemaining.minutes)}
            </div>
            <div className="text-gray-300 text-xs mt-1">
              Minutes
            </div>
          </div>
          
          {/* Seconds Box */}
          <div className="bg-gray-800/90 backdrop-blur-md border border-blue-500/30 rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-white font-bold text-lg leading-none">
              {formatTimeValue(timeRemaining.seconds)}
            </div>
            <div className="text-gray-300 text-xs mt-1">
              Seconds
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{getStatusText()}</span>
      <span className={`font-semibold ${getStatusColor()}`}>
        {getDisplayText()}
      </span>
    </div>
  );
};

export default ChallengeCountdown;
