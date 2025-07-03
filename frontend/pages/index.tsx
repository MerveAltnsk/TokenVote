import { useState } from 'react';
import Head from 'next/head';
import { useConnect } from '@stacks/connect-react';
import WalletConnect from '../components/WalletConnect';
import CreatePoll from '../components/CreatePoll';
import PollList from '../components/PollList';
import AdvancedCreatePoll from '../components/AdvancedCreatePoll';
import VotingDashboard from '../components/VotingDashboard';
import QuadraticVoting from '../components/QuadraticVoting';
import PollAnalytics from '../components/PollAnalytics';

export default function Home() {
  const { authData, userSession } = useConnect();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'polls' | 'create' | 'analytics'>('polls');
  const [selectedPollId, setSelectedPollId] = useState<number>(0);
  
  // This should be set to your deployed contract address
  const contractAddress = 'ST32GSWZ2A1QB5XX0J0KBM21QGBB72ZEYQMBXR8QW.tokenvote';

  const handlePollCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('polls'); // Switch to polls view after creating
  };

  const tabs = [
    { id: 'dashboard' as const, name: 'Dashboard', icon: '📊' },
    { id: 'polls' as const, name: 'Polls', icon: '🗳️' },
    { id: 'create' as const, name: 'Create', icon: '➕' },
    { id: 'analytics' as const, name: 'Analytics', icon: '📈' },
  ];

  const userAddress = authData?.userSession?.loadUserData()?.profile?.stxAddress?.testnet;
  const isSignedIn = !!userSession?.isUserSignedIn();

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>TokenVote - Decentralized Voting on Stacks</title>
        <meta name="description" content="A decentralized voting system for token holders on Stacks blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  🗳️ TokenVote
                </h1>
                <span className="ml-3 px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                  Beta
                </span>
              </div>
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isSignedIn ? (
            <>
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Decentralized Voting for Token Holders
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                  Create polls, vote on proposals, and participate in governance using your Stacks tokens.
                  Experience advanced features like quadratic voting, delegation, and reputation systems.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Connect Your Wallet</h3>
                  <p className="text-blue-700 mb-4">Connect your Stacks wallet to start voting and creating polls</p>
                  <WalletConnect />
                </div>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Voting</h3>
                  <p className="text-gray-600">Votes are recorded on-chain and cannot be altered or censored</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">�</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quadratic Voting</h3>
                  <p className="text-gray-600">Advanced voting mechanism where vote power = √(tokens spent)</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delegation</h3>
                  <p className="text-gray-600">Delegate your voting power to trusted community members</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600">Detailed analytics and reputation tracking for voters</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                    <VotingDashboard userAddress={userAddress} contractAddress={contractAddress} />
                  </div>
                )}

                {activeTab === 'polls' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">All Polls</h2>
                      <button
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Refresh
                      </button>
                    </div>
                    <PollList refreshTrigger={refreshTrigger} />
                    
                    {/* Quadratic Voting Demo Section */}
                    <div className="mt-12 border-t pt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Quadratic Voting Demo</h3>
                      <QuadraticVoting 
                        pollId={selectedPollId} 
                        options={['Option A', 'Option B', 'Option C']} 
                        contractAddress={contractAddress} 
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'create' && (
                  <div className="space-y-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Poll</h2>
                      <AdvancedCreatePoll onPollCreated={handlePollCreated} contractAddress={contractAddress} />
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-8">
                    <PollAnalytics pollId={selectedPollId} contractAddress={contractAddress} />
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600">
                Built on Stacks blockchain with Clarity smart contracts
              </p>
              <div className="mt-4 flex justify-center space-x-6">
                <a
                  href="https://docs.stacks.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Stacks Docs
                </a>
                <a
                  href="https://explorer.stacks.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Explorer
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  GitHub
                </a>
              </div>
            </div>        </div>
      </footer>
    </div>
  );
}
