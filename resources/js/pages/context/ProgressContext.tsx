import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type ProgressContextType = {
  progress: number;
  setProgress: (value: number) => void;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  endTime: number | null;
  setEndTime: (time: number | null) => void;
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Automatically hide bar after finishing
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setIsVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        setProgress,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        isVisible,
        setIsVisible,
      }}
    >
      {children}

      {/* 🌈 Global top progress bar */}
      {isVisible && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-[9999]">
          <div
            className="h-1 bg-blue-600 transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within a ProgressProvider");
  return context;
};
