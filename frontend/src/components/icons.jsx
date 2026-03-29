import React from 'react';

export const IconUsers = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1" />
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 20H4v-2a4 4 0 014-4h1" />
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

export const IconClipboard = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 2h6v2h3v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4h3V2z" />
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" />
  </svg>
);

export const IconChart = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-4 4 5 3-8" />
  </svg>
);

export const IconCheck = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
  </svg>
);

export default {};
