/**
 * @fileoverview Description of file. This file is the entry point of the react
 * app.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/main.css';
import App from '@/App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
