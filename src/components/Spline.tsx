import React from 'react';
import Spline from '@splinetool/react-spline';

const SplineScene: React.FC = () => {
  return (
    <div className="h-full w-full scale-125 origin-center">
      <Spline scene="https://prod.spline.design/3PmI1vxHLDjmimKi/scene.splinecode" />
    </div>
  );
};

export default SplineScene;
