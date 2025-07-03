import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  uintCV,
  listCV
} from '@stacks/transactions';
import { useNotification } from './NotificationProvider';

interface RankedChoiceVotingProps {
  pollId: number;
  options: string[];
  contractAddress: string;
  isActive: boolean;
}

interface RankedOption {
  option: string;
  index: number;
  rank: number;
}

interface RoundResult {
  round: number;
  eliminated: string;
  counts: { [key: string]: number };
}

const RankedChoiceVoting: React.FC<RankedChoiceVotingProps> = ({ 
  pollId, 
  options, 
  contractAddress, 
  isActive 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [rankings, setRankings] = useState<number[]>(options.map(() => 0));
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  // Mock results data
  useEffect(() => {
    const mockRounds: RoundResult[] = [
      {
        round: 1,
        eliminated: 'Polygon',
        counts: { 'Ethereum': 15, 'Stacks': 12, 'Solana': 10, 'Polygon': 5 }
      },
      {
        round: 2,
        eliminated: 'Solana',
        counts: { 'Ethereum': 18, 'Stacks': 16, 'Solana': 8 }
      },
      {
        round: 3,
        eliminated: '',
        counts: { 'Ethereum': 22, 'Stacks': 20 }
      }
    ];
    setRoundResults(mockRounds);
  }, []);

  const handleRankChange = (optionIndex: number, rank: number) => {
    const newRankings = [...rankings];
    
    // Remove this rank from other options
    newRankings.forEach((_, idx) => {
      if (newRankings[idx] === rank && idx !== optionIndex) {
        newRankings[idx] = 0;
      }
    });
    
    // Set the new rank
    newRankings[optionIndex] = rank;
    setRankings(newRankings);
  };

  const handleRankedVote = async () => {
    // Validate rankings
    const usedRanks = rankings.filter(rank => rank > 0);
    if (usedRanks.length < 2) {
      showNotification({
        type: 'error',
        title: 'Invalid Rankings',
        message: 'Please rank at least 2 options'
      });
      return;
    }

    setIsVoting(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock voting for demonstration
        await new Promise(resolve => setTimeout(resolve, 2000));
        showNotification({
          type: 'success',
          title: 'Ranked Vote Cast!',
          message: 'Your rankings have been recorded successfully'
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'ranked-vote',
          functionArgs: [
            uintCV(pollId),
            listCV(rankings.map(rank => uintCV(rank)))
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            showNotification({
              type: 'success',
              title: 'Ranked Vote Cast!',
              message: 'Your rankings have been recorded successfully'
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Vote Cancelled',
              message: 'Ranked choice voting was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Ranked voting failed:', error);
      showNotification({
        type: 'error',
        title: 'Vote Failed',
        message: 'Failed to cast ranked vote. Please try again.'
      });
    } finally {
      setIsVoting(false);
    }
  };

  const resetRankings = () => {
    setRankings(options.map(() => 0));
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    if (rank > 0) return 'bg-blue-500 text-white';
    return 'bg-gray-200 text-gray-400';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank > 0) return '🏅';
    return '';
  };

  const rankedOptions = options.map((option, index) => ({
    option,
    index,
    rank: rankings[index]
  })).sort((a, b) => {
    if (a.rank === 0 && b.rank === 0) return 0;
    if (a.rank === 0) return 1;
    if (b.rank === 0) return -1;
    return a.rank - b.rank;
  });

  const getWinner = () => {
    const finalRound = roundResults[roundResults.length - 1];
    if (!finalRound) return null;
    
    const entries = Object.entries(finalRound.counts);
    const winner = entries.reduce((prev, current) => 
      prev[1] > current[1] ? prev : current
    );
    return winner[0];
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-semibold text-gray-800">Ranked Choice Voting</h3>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            RANKED
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowResults(!showResults)}
            className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full hover:bg-green-200 transition-colors"
          >
            {showResults ? 'Hide Results' : 'Show Results'}
          </button>
          <button
            onClick={resetRankings}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-3">Rank Your Preferences</h4>
            <p className="text-sm text-gray-600 mb-4">
              Rank the options in order of preference. 1 = most preferred, 2 = second choice, etc.
            </p>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(rankings[index])}`}>
                      {rankings[index] || '?'}
                    </div>
                    <span className="font-medium text-gray-700">{option}</span>
                    <span className="text-lg">{getRankEmoji(rankings[index])}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].slice(0, options.length).map((rank) => (
                      <button
                        key={rank}
                        onClick={() => handleRankChange(index, rank)}
                        className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                          rankings[index] === rank
                            ? getRankColor(rank)
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {rank}
                      </button>
                    ))}
                    <button
                      onClick={() => handleRankChange(index, 0)}
                      className="w-8 h-8 rounded-full text-sm font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-3">Your Rankings</h4>
            <div className="space-y-2">
              {rankedOptions.filter(item => item.rank > 0).map((item, index) => (
                <div key={item.index} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(item.rank)}`}>
                    {item.rank}
                  </div>
                  <span className="text-gray-700">{item.option}</span>
                  <span className="text-lg">{getRankEmoji(item.rank)}</span>
                </div>
              ))}
              {rankedOptions.filter(item => item.rank > 0).length === 0 && (
                <div className="text-gray-500 text-sm">No options ranked yet</div>
              )}
            </div>
          </div>

          <button
            onClick={handleRankedVote}
            disabled={isVoting || !isActive || rankings.filter(rank => rank > 0).length < 2}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isVoting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Rankings...
              </div>
            ) : (
              'Submit Ranked Vote'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-4">Instant Runoff Results</h4>
            
            {getWinner() && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-2">🏆</span>
                  <span className="text-lg font-bold text-green-800">
                    Winner: {getWinner()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {roundResults.map((round, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-semibold text-gray-800">Round {round.round}</h5>
                    {round.eliminated && (
                      <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                        Eliminated: {round.eliminated}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(round.counts).map(([option, count]) => (
                      <div key={option} className="flex items-center justify-between">
                        <span className="text-gray-700">{option}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(count / Math.max(...Object.values(round.counts))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start">
          <div className="text-green-600 mr-2">💡</div>
          <div className="text-sm text-green-800">
            <strong>Ranked Choice Voting:</strong> Rank options in order of preference. 
            If no option gets a majority, the least popular is eliminated and votes are redistributed until someone wins.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankedChoiceVoting;
