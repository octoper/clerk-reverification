'use client';

import { SessionVerificationLevel } from '@clerk/types';
import React, { createContext, Dispatch, SetStateAction } from 'react';

export type ReverificationState = {
  inProgress: boolean;
  level: SessionVerificationLevel | undefined;
  cancel: () => void;
  complete: () => void;
};

const ReverificationContext = createContext<{
  verificationState: [ReverificationState | undefined, Dispatch<SetStateAction<ReverificationState | undefined>>];
}|undefined>(undefined);

export const ReverificationProvider = ({ children }: { children: React.ReactNode }) => {
  const state = React.useState<ReverificationState|undefined>();

  return (
    <ReverificationContext.Provider value={{
      verificationState: state,
    }}>
      {children}
    </ReverificationContext.Provider>
  );
}

export const useReverificationStatus = () => {
  const context = React.useContext(ReverificationContext);

  if (!context) {
    throw new Error('useReverification must be used within a ReverificationProvider');
  }

  const [verificationState, setVerificationState] = context.verificationState;

  return {
    state: verificationState,
    setState: setVerificationState,
  };
}

export { ReverificationContext };
