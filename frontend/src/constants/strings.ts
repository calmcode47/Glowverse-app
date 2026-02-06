export type Strings = {
  appName: string;
  tagline: string;
  screens: {
    onboarding: string;
    home: string;
    camera: string;
    results: string;
    profile: string;
  };
  buttons: {
    getStarted: string;
    capture: string;
    retake: string;
    save: string;
    share: string;
    continue: string;
    apply: string;
  };
  errors: {
    network: string;
    cameraPermission: string;
    mediaLibraryPermission: string;
    unknown: string;
  };
  success: {
    savedToLibrary: string;
    analysisComplete: string;
  };
  onboarding: {
    slide1Title: string;
    slide1Subtitle: string;
    slide2Title: string;
    slide2Subtitle: string;
    slide3Title: string;
    slide3Subtitle: string;
  };
};

export const strings: Strings = {
  appName: "PerfectCorpAI",
  tagline: "AI-powered beauty & AR try-on",
  screens: {
    onboarding: "Welcome",
    home: "Home",
    camera: "Camera",
    results: "Results",
    profile: "Profile"
  },
  buttons: {
    getStarted: "Get Started",
    capture: "Capture",
    retake: "Retake",
    save: "Save",
    share: "Share",
    continue: "Continue",
    apply: "Apply"
  },
  errors: {
    network: "Network error. Please try again.",
    cameraPermission: "Camera permission is required.",
    mediaLibraryPermission: "Media library permission is required.",
    unknown: "Something went wrong. Please try again."
  },
  success: {
    savedToLibrary: "Saved to your library.",
    analysisComplete: "Analysis complete."
  },
  onboarding: {
    slide1Title: "Discover your best look",
    slide1Subtitle: "Personalized AI recommendations in seconds.",
    slide2Title: "Try on in AR",
    slide2Subtitle: "Real-time virtual makeup and filters.",
    slide3Title: "Save & share",
    slide3Subtitle: "Keep your favorites and share with friends."
  }
};
