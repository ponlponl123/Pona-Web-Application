import { ReactNode } from 'react';

export interface mind {
  startContent: ReactNode;
  key: string;
}

export const minds: mind[] = [
  {
    key: 'stressed',
    startContent: '😣',
  },
  {
    key: 'tried',
    startContent: '😒',
  },
  {
    key: 'sad',
    startContent: '😢',
  },
  {
    key: 'fear',
    startContent: '😖',
  },
  {
    key: 'alone',
    startContent: '😶',
  },
  {
    key: 'hungry',
    startContent: '🤤',
  },
  {
    key: 'hot',
    startContent: '🤬',
  },
  {
    key: 'cold',
    startContent: '🥶',
  },
  {
    key: 'happy',
    startContent: '😊',
  },
  {
    key: 'sweet',
    startContent: '🥰',
  },
  {
    key: 'cool',
    startContent: '😎',
  },
];
