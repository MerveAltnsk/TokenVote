import { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { userSession } from '../lib/auth';

export default function WalletConnect() {
  const { doOpenAuth } = useConnect();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    doOpenAuth();
  };

  const disconnectWallet = () => {
    userSession.signUserOut('/');
    setUserData(null);
  };

  return (
    <div className="flex items-center space-x-4">
      {userData ? (
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {userData.profile?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {userData.profile?.stxAddress?.testnet?.slice(0, 8)}...
              {userData.profile?.stxAddress?.testnet?.slice(-4)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="btn-primary"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
