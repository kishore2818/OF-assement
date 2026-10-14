import React from 'react';

export function OpenfabricLogo({ className = "w-7 h-7", withText = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/favicon.png"
        alt="Open Fabric"
        className={`${className} object-contain`}
      />
      {withText && (
        <span className="font-bold tracking-tight text-white text-base">
          Open Fabric
        </span>
      )}
    </div>
  );
}
