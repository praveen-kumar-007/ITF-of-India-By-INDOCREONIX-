import React, { useRef, useEffect, useState } from 'react';

const DialerFilterBar = ({ categories, activeFilter, onFilterClick, chipClass = 'gallery-filter-chip' }) => {
  const scrollRef = useRef(null);
  
  // Physics states
  const [isDown, setIsDown] = useState(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const velocity = useRef(2.5); // "OG speed" - moving by default
  const baseSpeed = 1.0; // Slow, steady continuous speed
  const maxVelocity = 40; // Max speed cap on fast drag
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const isUserInteracting = useRef(false);
  const currentDirection = useRef(1); // 1 = right, -1 = left
  
  // Hover pause states
  const isHoverPaused = useRef(false);
  const hoverTimeout = useRef(null);

  // Duplicate categories to create a seamless infinite loop
  const duplicatedCategories = [...categories, ...categories, ...categories, ...categories];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationFrameId;

    // Center the scroll initially so we have room to go left or right
    const halfWidth = container.scrollWidth / 4;
    container.scrollLeft = halfWidth;

    const updatePhysics = () => {
      if (!container) return;

      // Handle wrapping for seamless circular scrolling
      const singleSectionWidth = container.scrollWidth / 4;
      
      if (container.scrollLeft >= singleSectionWidth * 2) {
        container.scrollLeft -= singleSectionWidth;
      } else if (container.scrollLeft <= singleSectionWidth) {
        container.scrollLeft += singleSectionWidth;
      }

      // If user is not actively dragging and not hover-paused, apply the auto-scroll
      if (!isUserInteracting.current && !isHoverPaused.current) {
        // Slow down back to base speed using exponential decay (friction)
        if (Math.abs(velocity.current) > baseSpeed) {
          velocity.current *= 0.96; // Slow down
        } else {
          // Maintain OG speed in current direction
          velocity.current = baseSpeed * currentDirection.current;
        }

        // Apply motion
        container.scrollLeft += velocity.current;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  const handleMouseEnter = () => {
    isHoverPaused.current = true;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      isHoverPaused.current = false;
    }, 4000); // 4 second pause
  };

  const handleMouseLeave = () => {
    isHoverPaused.current = false;
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  // Drag threshold
  const hasDragged = useRef(false);

  // Drag handlers for mouse/touch
  const handleStart = (clientX) => {
    setIsDown(true);
    isUserInteracting.current = true;
    hasDragged.current = false; // Reset on start
    
    // Reset hover pause when user interacts
    isHoverPaused.current = false;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    startX.current = clientX;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    lastX.current = clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handleMove = (clientX) => {
    if (!isDown || !scrollRef.current) return;

    const x = clientX;
    const walk = (x - startX.current) * 1.5; // Drag sensitivity multiplier
    
    // If we moved more than 5px, mark as dragged to prevent clicking
    if (Math.abs(x - startX.current) > 5) {
      hasDragged.current = true;
    }

    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;

    // Calculate real-time velocity of the drag
    const now = performance.now();
    const timeDelta = now - lastTime.current;
    const distDelta = x - lastX.current;

    if (timeDelta > 0) {
      // Calculate instantaneous speed
      const speed = -(distDelta / timeDelta) * 15; // Adjusted scale factor
      
      // Cap speed
      const cappedSpeed = Math.max(-maxVelocity, Math.min(maxVelocity, speed));
      
      // Smoothen velocity changes
      velocity.current = velocity.current * 0.7 + cappedSpeed * 0.3;
      
      if (Math.abs(velocity.current) > 0.1) {
        currentDirection.current = Math.sign(velocity.current);
      }
    }

    lastX.current = x;
    lastTime.current = now;
  };

  const handleEnd = () => {
    setIsDown(false);
    // Release interaction lock, letting physics take over with the current velocity
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 50); // Slight buffer for smoothness
  };

  const handleLeaveCombined = () => {
    handleEnd();
    handleMouseLeave();
  };

  const handleChipClick = (cat, e) => {
    // If the user was dragging, ignore the click
    if (hasDragged.current) return;

    if (onFilterClick) onFilterClick(cat);
    
    // Smooth scroll the clicked chip to the center of the container
    const chip = e.currentTarget;
    const container = scrollRef.current;
    if (chip && container) {
      // Temporarily lock auto-scroll physics to allow smooth scroll to finish
      isUserInteracting.current = true;
      
      const containerRect = container.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();
      
      // Calculate the position relative to the scroll container's content
      const targetScrollLeft = chip.offsetLeft - (containerRect.width / 2) + (chipRect.width / 2);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });

      // Resume auto-scroll after a delay
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 1000);
    }
  };

  return (
    <div 
      className="dialer-filter-container"
      style={{
        width: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isDown ? 'grabbing' : 'grab',
        position: 'relative'
      }}
    >
      <div
        ref={scrollRef}
        className="dialer-filter-scroll"
        style={{
          display: 'flex',
          gap: '1.2rem',
          overflowX: 'auto',
          padding: '1rem 0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollBehavior: 'auto'
        }}
        onMouseDown={(e) => handleStart(e.pageX)}
        onMouseMove={(e) => handleMove(e.pageX)}
        onMouseUp={handleLeaveCombined}
        onMouseLeave={handleLeaveCombined}
        onMouseEnter={handleMouseEnter}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleLeaveCombined}
      >
        {duplicatedCategories.map((cat, idx) => (
          <button
            key={`${cat}-${idx}`}
            className={`${chipClass} ${activeFilter === cat ? 'active' : ''}`}
            onClick={(e) => handleChipClick(cat, e)}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {activeFilter === cat && (
              <span 
                className="chosen-symbol" 
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#000', // Solid Black
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              />
            )}
            {cat}
          </button>
        ))}
      </div>
      
      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .gallery-filter-chip.active, .news-filter-chip.active {
          background: #ffffff !important;
          color: #000000 !important;
          border-color: #000000 !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12) !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default DialerFilterBar;
