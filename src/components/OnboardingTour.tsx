import { useState, useEffect } from 'react';
import * as JoyrideModule from 'react-joyride';

// Vite SSR bypass for missing default export
const Joyride = (JoyrideModule as any).Joyride || JoyrideModule;
const STATUS = (JoyrideModule as any).STATUS || {};

const OnboardingTour = () => {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const steps: any[] = [
    {
      target: '.tour-feed',
      content: 'This is the Feed. Here you can view updates and track the latest activity.',
    },
    {
      target: '.tour-report',
      content: 'Use this section to report a new issue and trigger the AI submission flow.',
    },
    {
      target: '.tour-workspace',
      content: 'Manage your tasks here using the functional project management Kanban board.',
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED, 'finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem('hasSeenTour', 'true');
      setRun(false);
    }
  };

  if (!mounted || !run || !Joyride) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#4F46E5', 
          zIndex: 1000,
        },
      }}
    />
  );
};

export default OnboardingTour;