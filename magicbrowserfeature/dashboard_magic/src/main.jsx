import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SessionReplay from './SessionReplay';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionReplay />
  </StrictMode>
);
