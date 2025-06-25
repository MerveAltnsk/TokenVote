import { Connect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { ReactNode } from 'react';

interface StacksProviderProps {
  children: ReactNode;
}

const appName = 'TokenVote';
const appIcon = '/favicon.ico';

export default function StacksProvider({ children }: StacksProviderProps) {
  return (
    <Connect
      authOptions={{
        appDetails: {
          name: appName,
          icon: appIcon,
        },
        redirectTo: '/',
        onFinish: () => {
          window.location.reload();
        },
        userSession: undefined,
      }}
    >
      {children}
    </Connect>
  );
}
