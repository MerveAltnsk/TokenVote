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
import VetoSystem from '../components/VetoSystem';
import ProposalAmendments from '../components/ProposalAmendments';
import ScoreVoting from '../components/ScoreVoting';
import RankedChoiceVoting from '../components/RankedChoiceVoting';
import StakingVoting from '../components/StakingVoting';
import PredictionMarkets from '../components/PredictionMarkets';
import Futarchy from '../components/Futarchy';

export default function Home() {
  const { authData, userSession } = useConnect();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'polls' | 'create' | 'analytics' | 'governance' | 'voting' | 'markets'>('polls');
  const [selectedPollId, setSelectedPollId] = useState<number>(1);
  
  // This should be set to your deployed contract address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'contract-not-deployed';

  const handlePollCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('polls'); // Switch to polls view after creating
  };

  const tabs = [
    { id: 'dashboard' as const, name: 'Dashboard', icon: '📊' },
    { id: 'polls' as const, name: 'Polls', icon: '🗳️' },
    { id: 'create' as const, name: 'Create', icon: '➕' },
    { id: 'voting' as const, name: 'Advanced Voting', icon: '⚡' },
    { id: 'governance' as const, name: 'Governance', icon: '🏛️' },
    { id: 'markets' as const, name: 'Markets', icon: '💰' },
    { id: 'analytics' as const, name: 'Analytics', icon: '📈' },
  ];

  const userAddress = authData?.userSession?.loadUserData()?.profile?.stxAddress?.testnet || 'SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23FGH8VRG7H';
  const isSignedIn = !!userSession?.isUserSignedIn();

  // Mock user reputation for demonstration
  const userReputation = 23;

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
          {/* Always show features, with optional wallet connection */}
          
          {/* Demo Notice */}
          {!isSignedIn && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">🎮</div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Demo Mode Active</h3>
                  <p className="text-blue-700">
                    You're viewing the platform in demo mode with mock data. 
                    <button 
                      onClick={() => setActiveTab('voting')}
                      className="underline hover:text-blue-800 ml-1"
                    >
                      Try the advanced features
                    </button>
                    or connect your wallet for real blockchain interaction.
                  </p>
                </div>
              </div>
            </div>
          )}

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

                {activeTab === 'voting' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Voting Systems</h2>
                    
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Score Voting</h3>
                        <ScoreVoting 
                          pollId={selectedPollId} 
                          options={['Option A', 'Option B', 'Option C']}
                          contractAddress={contractAddress} 
                          isActive={true}
                        />
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Ranked Choice Voting</h3>
                        <RankedChoiceVoting 
                          pollId={selectedPollId} 
                          options={['Option A', 'Option B', 'Option C']}
                          contractAddress={contractAddress} 
                          isActive={true}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Staking for Voting</h3>
                      <StakingVoting 
                        pollId={selectedPollId}
                        options={['Option A', 'Option B', 'Option C']}
                        contractAddress={contractAddress} 
                        isActive={true}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'governance' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Governance Systems</h2>
                    
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Veto System</h3>
                        <VetoSystem 
                          contractAddress={contractAddress} 
                          userAddress={userAddress} 
                          userReputation={userReputation} 
                        />
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Proposal Amendments</h3>
                        <ProposalAmendments 
                          pollId={selectedPollId}
                          pollCreator={userAddress}
                          userAddress={userAddress}
                          contractAddress={contractAddress} 
                          isVotingStarted={false}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Futarchy</h3>
                      <Futarchy 
                        pollId={selectedPollId}
                        contractAddress={contractAddress} 
                        isActive={true}
                        isCreator={false}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'markets' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Prediction Markets</h2>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <PredictionMarkets 
                        pollId={selectedPollId}
                        options={['Option A', 'Option B', 'Option C']}
                        contractAddress={contractAddress} 
                        isActive={true}
                        isCreator={false}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-8">
                    <PollAnalytics pollId={selectedPollId} contractAddress={contractAddress} />
                  </div>
                )}
              </div>
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
            </div>
          </div>
        </footer>
      </div>
    );
  }
