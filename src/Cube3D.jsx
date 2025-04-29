import React, { useEffect, useRef } from 'react';
import './Cube3D.css';

const Cube3D = ({ size = 100, color = '#7f5af0', position = 'top-right' }) => {
  const cubeRef = useRef(null);
  
  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;
    
    let rotX = 0;
    let rotY = 0;
    let animationId;
    
    const animate = () => {
      rotX += 0.5;
      rotY += 0.7;
      
      cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div className={`cube-container ${position}`} style={{ width: size, height: size }}>
      <div className="cube" ref={cubeRef}>
        <div className="face front" style={{ backgroundColor: color, width: size, height: size }}></div>
        <div className="face back" style={{ backgroundColor: color, width: size, height: size }}></div>
        <div className="face right" style={{ backgroundColor: color, width: size, height: size }}></div>
        <div className="face left" style={{ backgroundColor: color, width: size, height: size }}></div>
        <div className="face top" style={{ backgroundColor: color, width: size, height: size }}></div>
        <div className="face bottom" style={{ backgroundColor: color, width: size, height: size }}></div>
      </div>
    </div>
  );
};

export default Cube3D;
