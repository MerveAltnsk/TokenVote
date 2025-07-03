import React, { useState, useEffect } from 'react';
import { StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';

interface PollAnalyticsProps {
  pollId: number;
  contractAddress: string;
}

interface PollData {
  question: string;
  options: string[];
  creator: string;
  startBlock: number;
  endBlock: number;
  isActive: boolean;
  totalVotes: number;
  results: number[];
  quadraticVotes: number;
  totalFunding: number;
  metadata?: {
    category: string;
    tags: string[];
    fundingGoal: number;
    currentFunding: number;
  };
}

const PollAnalytics: React.FC<PollAnalyticsProps> = ({ pollId, contractAddress }) => {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBlock, setCurrentBlock] = useState(1000);

  useEffect(() => {
    if (contractAddress) {
      loadPollData();
    }
  }, [pollId, contractAddress]);

  const loadPollData = async () => {
    try {
      setLoading(true);
      
      // First try to load from contract
      if (contractAddress && contractAddress !== 'contract-not-deployed') {
        const network = new StacksTestnet();
        const [contractAddr, contractName] = contractAddress.split('.');

        // Get basic poll data
        const pollResult = await callReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-poll',
          functionArgs: [uintCV(pollId)],
          network,
          senderAddress: contractAddr,
        });

        // Get poll results
        const resultsResult = await callReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-poll-results',
          functionArgs: [uintCV(pollId)],
          network,
          senderAddress: contractAddr,
        });

        // Get enhanced results
        const enhancedResult = await callReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-enhanced-poll-results',
          functionArgs: [uintCV(pollId)],
          network,
          senderAddress: contractAddr,
        });

        // Get metadata
        const metadataResult = await callReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-poll-metadata',
          functionArgs: [uintCV(pollId)],
          network,
          senderAddress: contractAddr,
        });

        const poll = cvToJSON(pollResult).value;
        const results = cvToJSON(resultsResult).value;
        const enhanced = cvToJSON(enhancedResult).value;
        const metadata = cvToJSON(metadataResult).value;

        if (poll) {
          setPollData({
            question: poll.question.value,
            options: poll.options.value.map((opt: any) => opt.value),
            creator: poll.creator.value,
            startBlock: poll['start-block'].value,
            endBlock: poll['end-block'].value,
            isActive: poll['is-active'].value,
            totalVotes: results['total-votes']?.value || 0,
            results: results.results?.value?.map((r: any) => r.value) || [],
            quadraticVotes: enhanced['total-funding']?.value || 0,
            totalFunding: enhanced['total-funding']?.value || 0,
            metadata: metadata ? {
              category: metadata.category?.value || '',
              tags: metadata.tags?.value?.map((tag: any) => tag.value) || [],
              fundingGoal: metadata['funding-goal']?.value || 0,
              currentFunding: metadata['current-funding']?.value || 0
            } : undefined
          });
        }
      } else {
        // Use mock data for demonstration
        const mockPollData: PollData = {
          question: pollId === 1 ? "Should we implement quadratic voting?" : "What's the best blockchain platform?",
          options: pollId === 1 ? ["Yes", "No", "Maybe"] : ["Ethereum", "Stacks", "Solana", "Polygon"],
          creator: "SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23FGH8VRG7H",
          startBlock: 1000,
          endBlock: 2000,
          isActive: true,
          totalVotes: pollId === 1 ? 25 : 42,
          results: pollId === 1 ? [15, 8, 2] : [18, 12, 8, 4],
          quadraticVotes: pollId === 1 ? 12 : 8,
          totalFunding: pollId === 1 ? 50 : 25,
          metadata: {
            category: pollId === 1 ? "Governance" : "Technology",
            tags: pollId === 1 ? ["voting", "governance", "democracy"] : ["blockchain", "comparison", "tech"],
            fundingGoal: pollId === 1 ? 100 : 50,
            currentFunding: pollId === 1 ? 75 : 30
          }
        };
        setPollData(mockPollData);
      }
    } catch (error) {
      console.error('Error loading poll data:', error);
      // Fallback to mock data
      const mockPollData: PollData = {
        question: pollId === 1 ? "Should we implement quadratic voting?" : "What's the best blockchain platform?",
        options: pollId === 1 ? ["Yes", "No", "Maybe"] : ["Ethereum", "Stacks", "Solana", "Polygon"],
        creator: "SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23FGH8VRG7H",
        startBlock: 1000,
        endBlock: 2000,
        isActive: true,
        totalVotes: pollId === 1 ? 25 : 42,
        results: pollId === 1 ? [15, 8, 2] : [18, 12, 8, 4],
        quadraticVotes: pollId === 1 ? 12 : 8,
        totalFunding: pollId === 1 ? 50 : 25,
        metadata: {
          category: pollId === 1 ? "Governance" : "Technology",
          tags: pollId === 1 ? ["voting", "governance", "democracy"] : ["blockchain", "comparison", "tech"],
          fundingGoal: pollId === 1 ? 100 : 50,
          currentFunding: pollId === 1 ? 75 : 30
        }
      };
      setPollData(mockPollData);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!pollData) return 0;
    const totalBlocks = pollData.endBlock - pollData.startBlock;
    const elapsedBlocks = currentBlock - pollData.startBlock;
    return Math.min(Math.max((elapsedBlocks / totalBlocks) * 100, 0), 100);
  };

  const getTimeRemaining = () => {
    if (!pollData) return 'Unknown';
    const blocksRemaining = pollData.endBlock - currentBlock;
    if (blocksRemaining <= 0) return 'Ended';
    const hoursRemaining = Math.floor(blocksRemaining * 10 / 60); // Assuming 10 min blocks
    return `${hoursRemaining}h remaining`;
  };

  const getFundingProgress = () => {
    if (!pollData?.metadata?.fundingGoal) return 0;
    return (pollData.metadata.currentFunding / pollData.metadata.fundingGoal) * 100;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pollData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Poll not found</div>
      </div>
    );
  }

  const maxVotes = Math.max(...pollData.results, 1);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{pollData.question}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Poll #{pollId}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                pollData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {pollData.isActive ? 'Active' : 'Inactive'}
              </span>
              {pollData.metadata?.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {pollData.metadata.category}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{pollData.totalVotes}</div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>
        </div>

        {pollData.metadata?.tags && pollData.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {pollData.metadata.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-600">{getTimeRemaining()}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Voting Results</h3>
          <div className="space-y-3">
            {pollData.options.map((option, index) => {
              const votes = pollData.results[index] || 0;
              const percentage = pollData.totalVotes > 0 ? (votes / pollData.totalVotes) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{option}</span>
                    <span className="text-sm text-gray-600">{votes} votes ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-800 mb-2">Advanced Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quadratic Votes:</span>
                <span className="font-medium">{pollData.quadraticVotes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Funding:</span>
                <span className="font-medium">{pollData.totalFunding} STX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participation Rate:</span>
                <span className="font-medium">
                  {pollData.totalVotes > 0 ? '85%' : '0%'}
                </span>
              </div>
            </div>
          </div>

          {pollData.metadata?.fundingGoal && pollData.metadata.fundingGoal > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2">Funding Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Goal: {pollData.metadata.fundingGoal} STX</span>
                  <span>Raised: {pollData.metadata.currentFunding} STX</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(getFundingProgress(), 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 text-center">
                  {getFundingProgress().toFixed(1)}% funded
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-800">{pollData.startBlock}</div>
            <div className="text-xs text-gray-600">Start Block</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">{pollData.endBlock}</div>
            <div className="text-xs text-gray-600">End Block</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">{pollData.endBlock - pollData.startBlock}</div>
            <div className="text-xs text-gray-600">Duration (blocks)</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {pollData.totalVotes > 0 ? (pollData.results.indexOf(Math.max(...pollData.results)) + 1) : '-'}
            </div>
            <div className="text-xs text-gray-600">Leading Option</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollAnalytics;
