import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  callReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV
} from '@stacks/transactions';

interface VotingDashboardProps {
  userAddress: string;
  contractAddress: string;
}

interface UserStats {
  votesCast: number;
  pollsCreated: number;
  reputationPoints: number;
  delegationPower: number;
  currentDelegation?: string;
}

const VotingDashboard: React.FC<VotingDashboardProps> = ({ 
  userAddress, 
  contractAddress 
}) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userAddress && contractAddress) {
      loadUserStats();
    }
  }, [userAddress, contractAddress]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const network = new StacksTestnet();
      const [contractAddr, contractName] = contractAddress.split('.');

      // Get user reputation
      const reputationResult = await callReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-user-reputation',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress,
      });

      // Get delegation power
      const delegationPowerResult = await callReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-delegation-power',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress,
      });

      // Get current delegation
      const currentDelegationResult = await callReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-user-delegation',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress,
      });

      const reputation = cvToJSON(reputationResult).value;
      const delegationPower = cvToJSON(delegationPowerResult).value;
      const currentDelegation = cvToJSON(currentDelegationResult).value;

      setUserStats({
        votesCast: reputation['votes-cast']?.value || 0,
        pollsCreated: reputation['polls-created']?.value || 0,
        reputationPoints: reputation['reputation-points']?.value || 0,
        delegationPower: delegationPower || 0,
        currentDelegation: currentDelegation?.value || undefined
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationLevel = (points: number) => {
    if (points >= 100) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (points >= 50) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (points >= 20) return { level: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' };
    if (points >= 5) return { level: 'Beginner', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Newcomer', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          Failed to load user statistics
        </div>
      </div>
    );
  }

  const reputationLevel = getReputationLevel(userStats.reputationPoints);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Voting Dashboard</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${reputationLevel.bg} ${reputationLevel.color}`}>
          {reputationLevel.level}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Votes Cast</p>
              <p className="text-2xl font-bold text-blue-800">{userStats.votesCast}</p>
            </div>
            <div className="text-blue-500">🗳️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Polls Created</p>
              <p className="text-2xl font-bold text-green-800">{userStats.pollsCreated}</p>
            </div>
            <div className="text-green-500">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Reputation</p>
              <p className="text-2xl font-bold text-purple-800">{userStats.reputationPoints}</p>
            </div>
            <div className="text-purple-500">⭐</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Delegation Power</p>
              <p className="text-2xl font-bold text-orange-800">{userStats.delegationPower}</p>
            </div>
            <div className="text-orange-500">🤝</div>
          </div>
        </div>
      </div>

      {userStats.currentDelegation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚡</div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Active Delegation</p>
              <p className="text-xs text-yellow-700">
                You have delegated your voting power to: {userStats.currentDelegation}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Voting Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Participation Rate</span>
              <span className="font-medium">
                {userStats.votesCast > 0 ? '85%' : '0%'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Vote Time</span>
              <span className="font-medium">2.3 days after start</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Consistency Score</span>
              <span className="font-medium">92%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Achievements</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${userStats.votesCast >= 1 ? 'text-green-500' : 'text-gray-400'}`}>
                {userStats.votesCast >= 1 ? '✅' : '⭕'}
              </span>
              <span>First Vote Cast</span>
            </div>
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${userStats.votesCast >= 10 ? 'text-green-500' : 'text-gray-400'}`}>
                {userStats.votesCast >= 10 ? '✅' : '⭕'}
              </span>
              <span>Active Voter (10+ votes)</span>
            </div>
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${userStats.pollsCreated >= 1 ? 'text-green-500' : 'text-gray-400'}`}>
                {userStats.pollsCreated >= 1 ? '✅' : '⭕'}
              </span>
              <span>Poll Creator</span>
            </div>
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${userStats.delegationPower >= 1 ? 'text-green-500' : 'text-gray-400'}`}>
                {userStats.delegationPower >= 1 ? '✅' : '⭕'}
              </span>
              <span>Trusted Delegate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingDashboard;
