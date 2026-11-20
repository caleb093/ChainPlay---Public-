import React from 'react';
// import './shooting-stars.css'; // make sure this path matches your structure

const ShootingStars = () => {
  const stars = Array.from({ length: 10 });

  return (
    <div className="shooting-stars-container ">
      {stars.map((_, i) => (
        <div key={i} className="shooting-star" />
      ))}
    </div>
  );
};

export default ShootingStars;
