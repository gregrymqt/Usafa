import { useState } from 'react';

export const useSectionManager = (totalSections: number) => {
  const [currentSection, setCurrentSection] = useState(0);

  const next = () => {
    setCurrentSection(prev => (prev + 1) % totalSections);
  };

  const previous = () => {
    setCurrentSection(prev => (prev - 1 + totalSections) % totalSections);
  };

  const goTo = (sectionIndex: number) => {
    setCurrentSection(sectionIndex % totalSections);
  }

  return { currentSection, next, previous, goTo };
};