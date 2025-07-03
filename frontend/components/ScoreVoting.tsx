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

interface ScoreVotingProps {
  pollId: number;
  options: string[];
  contractAddress: string;
  isActive: boolean;
}

interface ScoreResults {
  option: string;
  totalScore: number;
  voteCount: number;
  averageScore: number;
}

const ScoreVoting: React.FC<ScoreVotingProps> = ({ 
  pollId, 
  options, 
  contractAddress, 
  isActive 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [scores, setScores] = useState<number[]>(options.map(() => 50));
  const [isVoting, setIsVoting] = useState(false);
  const [results, setResults] = useState<ScoreResults[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Mock results data
  useEffect(() => {
    const mockResults: ScoreResults[] = options.map((option, index) => ({
      option,
      totalScore: Math.floor(Math.random() * 500) + 200,
      voteCount: Math.floor(Math.random() * 20) + 5,
      averageScore: Math.floor(Math.random() * 40) + 50
    }));
    setResults(mockResults);
  }, [options]);

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const handleScoreVote = async () => {
    setIsVoting(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock voting for demonstration
        await new Promise(resolve => setTimeout(resolve, 2000));
        showNotification({
          type: 'success',
          title: 'Score Vote Cast!',
          message: 'Your scores have been recorded successfully'
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'score-vote',
          functionArgs: [
            uintCV(pollId),
            listCV(scores.map(score => uintCV(score)))
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            showNotification({
              type: 'success',
              title: 'Score Vote Cast!',
              message: 'Your scores have been recorded successfully'
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Vote Cancelled',
              message: 'Score voting was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Score voting failed:', error);
      showNotification({
        type: 'error',
        title: 'Vote Failed',
        message: 'Failed to cast score vote. Please try again.'
      });
    } finally {
      setIsVoting(false);
    }
  };

  const resetScores = () => {
    setScores(options.map(() => 50));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Very Poor';
  };

  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / scores.length;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-semibold text-gray-800">Score Voting</h3>
          <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
            RANGE
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowResults(!showResults)}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full hover:bg-indigo-200 transition-colors"
          >
            {showResults ? 'Hide Results' : 'Show Results'}
          </button>
          <button
            onClick={resetScores}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-gray-800 mb-3">Rate Each Option (0-100)</h4>
            <p className="text-sm text-gray-600 mb-4">
              Give each option a score from 0 (worst) to 100 (best). You can give multiple options the same score.
            </p>
            
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{option}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-indigo-600">{scores[index]}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getScoreColor(scores[index])}`}>
                        {getScoreDescription(scores[index])}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scores[index]}
                      onChange={(e) => handleScoreChange(index, parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #eab308 50%, #22c55e 75%, #16a34a 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-gray-800 mb-3">Voting Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{totalScore}</div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{averageScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{options.length}</div>
                <div className="text-sm text-gray-600">Options Rated</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleScoreVote}
            disabled={isVoting || !isActive}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isVoting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Scores...
              </div>
            ) : (
              'Submit Score Vote'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-gray-800 mb-4">Score Results</h4>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{result.option}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{result.voteCount} votes</span>
                      <span className="text-lg font-bold text-indigo-600">{result.averageScore.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${result.averageScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Total Score: {result.totalScore}</span>
                    <span>Average: {result.averageScore.toFixed(1)}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-start">
          <div className="text-indigo-600 mr-2">💡</div>
          <div className="text-sm text-indigo-800">
            <strong>Score Voting:</strong> Rate each option independently from 0-100. 
            This allows you to express the intensity of your preferences and support multiple good options.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreVoting;
