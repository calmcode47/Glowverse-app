export const animations = {
  durations: {
    instant: 0,
    fastest: 100,
    faster: 150,
    fast: 200,
    normal: 300,
    slow: 400,
    slower: 500,
    slowest: 700
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bouncy: [0.68, -0.55, 0.265, 1.55],
    smooth: [0.4, 0, 0.2, 1],
    snappy: [0.16, 1, 0.3, 1],
    dramatic: [0.87, 0, 0.13, 1]
  },
  springs: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1
    },
    stiff: {
      damping: 30,
      stiffness: 200,
      mass: 1
    },
    slow: {
      damping: 20,
      stiffness: 50,
      mass: 1
    }
  },
  gestures: {
    swipe: {
      velocityThreshold: 500,
      directionalOffsetThreshold: 80
    },
    pan: {
      minDist: 10
    },
    longPress: {
      minDurationMs: 500,
      maxDist: 10
    }
  }
};

export type AnimationToken = typeof animations;
