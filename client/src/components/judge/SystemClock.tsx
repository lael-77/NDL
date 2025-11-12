import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";

export const SystemClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
      <Clock className="h-4 w-4 text-[#0077CC]" />
      <span className="font-mono">
        {format(currentTime, "HH:mm:ss")}
      </span>
      <span className="text-xs">
        {format(currentTime, "MMM dd, yyyy")}
      </span>
    </div>
  );
};

