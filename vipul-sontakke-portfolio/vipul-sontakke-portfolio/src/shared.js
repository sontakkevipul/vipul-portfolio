import { createContext } from 'react';

// Shared by app.jsx and extras.jsx so the new sections follow the same Motion switch.
export const MotionContext = createContext(true);
export const EASE = [0.22, 1, 0.36, 1];
