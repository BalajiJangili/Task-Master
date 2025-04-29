import { useState, useEffect } from 'react';

/**
 * Custom hook for score management
 */
const useScore = () => {
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem('userScore');
    return savedScore ? parseInt(savedScore) : 0;
  });
  
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState(0);
  
  // Save score to localStorage
  useEffect(() => {
    localStorage.setItem('userScore', score.toString());
  }, [score]);
  
  return {
    score,
    setScore,
    showScoreAnimation,
    setShowScoreAnimation,
    lastScoreChange,
    setLastScoreChange
  };
};

export default useScore;
