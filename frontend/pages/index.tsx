import { useState } from 'react';
import Head from 'next/head';
import WalletConnect from '../components/WalletConnect';
import CreatePoll from '../components/CreatePoll';
import PollList from '../components/PollList';
import StacksProvider from '../lib/StacksProvider';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePollCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <StacksProvider>
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Decentralized Voting for Token Holders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create polls, vote on proposals, and participate in governance using your Stacks tokens.
              Your voice matters in the decentralized future.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Voting</h3>
              <p className="text-gray-600">Votes are recorded on-chain and cannot be altered or censored</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🪙</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Token Gated</h3>
              <p className="text-gray-600">Only token holders can create polls and cast votes</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast & Fair</h3>
              <p className="text-gray-600">Real-time results with transparent vote counting</p>
            </div>
          </div>

          {/* Create Poll Section */}
          <CreatePoll onPollCreated={handlePollCreated} />

          {/* Polls List */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Polls</h2>
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Refresh
              </button>
            </div>
            <PollList refreshTrigger={refreshTrigger} />
          </section>
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
    </StacksProvider>
  );
}
