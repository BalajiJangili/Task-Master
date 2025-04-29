import React, { useEffect, useState } from 'react';
import './ScoreDisplay.css';

const ScoreDisplay = ({ score, showAnimation, pointsChange, streak = 0 }) => {
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);

  // Calculate level and progress based on score
  useEffect(() => {
    // Each level requires more points than the previous
    const calculateLevel = (score) => {
      // Base points needed for level 1 is 100
      const basePoints = 100;
      let currentLevel = 1;
      let pointsForNextLevel = basePoints;
      let remainingPoints = score;

      // Keep increasing level until we don't have enough points
      while (remainingPoints >= pointsForNextLevel) {
        remainingPoints -= pointsForNextLevel;
        currentLevel++;
        // Each level requires 20% more points than the previous
        pointsForNextLevel = Math.floor(basePoints * Math.pow(1.2, currentLevel - 1));
      }

      // Calculate progress percentage towards next level
      const progressPercentage = (remainingPoints / pointsForNextLevel) * 100;

      return { level: currentLevel, progress: progressPercentage };
    };

    const result = calculateLevel(score);

    // Check if level has increased
    if (result.level > level && level > 1) {
      // Dispatch a custom event that App.jsx can listen for
      const levelUpEvent = new CustomEvent('levelUp', {
        detail: { level: result.level }
      });
      window.dispatchEvent(levelUpEvent);
    }

    setLevel(result.level);
    setProgress(result.progress);
  }, [score, level]);

  return (
    <div className="score-display">
      <div className="score-container">
        <div className="score-icon">🏆</div>
        <div className="score-info">
          <div className="score-value">{score} pts</div>
          <div className="level-info">Level {level}</div>
        </div>
      </div>

      {streak > 0 && (
        <div className="streak-container">
          <div className="streak-icon">🔥</div>
          <div className="streak-value">{streak} day streak</div>
        </div>
      )}

      <div className="level-progress-container">
        <div
          className="level-progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {showAnimation && (
        <div className={`score-animation ${pointsChange > 0 ? 'positive' : 'negative'}`}>
          {pointsChange > 0 ? '+' : ''}{pointsChange}
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
