import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV
} from '@stacks/transactions';
import { useNotification } from './NotificationProvider';

interface FutarchyProps {
  pollId: number;
  contractAddress: string;
  isActive: boolean;
  isCreator: boolean;
}

interface FutarchyData {
  valueQuestion: string;
  beliefQuestion: string;
  valueVotes: number[];
  beliefBets: number[];
  implementationThreshold: number;
  active: boolean;
  userParticipation?: {
    valueVote: number;
    beliefBet: number;
    beliefOutcome: number;
    settled: boolean;
  };
}

const Futarchy: React.FC<FutarchyProps> = ({ 
  pollId, 
  contractAddress, 
  isActive, 
  isCreator 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [futarchyData, setFutarchyData] = useState<FutarchyData | null>(null);
  const [valueQuestion, setValueQuestion] = useState('');
  const [beliefQuestion, setBeliefQuestion] = useState('');
  const [implementationThreshold, setImplementationThreshold] = useState(50);
  const [valueVote, setValueVote] = useState(5);
  const [beliefBet, setBeliefBet] = useState(10);
  const [beliefOutcome, setBeliefOutcome] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock futarchy data
  useEffect(() => {
    const mockFutarchyData: FutarchyData = {
      valueQuestion: "How much will this proposal increase platform value? (0-10 scale)",
      beliefQuestion: "Will this proposal be successfully implemented?",
      valueVotes: [2, 5, 8, 12, 15, 18, 10, 8, 5, 2],
      beliefBets: [25, 45, 30, 0, 0, 0, 0, 0, 0, 0],
      implementationThreshold: 60,
      active: true
    };
    setFutarchyData(mockFutarchyData);
  }, []);

  const handleCreateFutarchy = async () => {
    if (!valueQuestion.trim() || !beliefQuestion.trim()) {
      showNotification({
        type: 'error',
        title: 'Invalid Questions',
        message: 'Please provide both value and belief questions'
      });
      return;
    }

    setIsCreating(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock creation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setFutarchyData({
          valueQuestion,
          beliefQuestion,
          valueVotes: Array(10).fill(0),
          beliefBets: Array(10).fill(0),
          implementationThreshold,
          active: true
        });
        showNotification({
          type: 'success',
          title: 'Futarchy Created!',
          message: 'Futarchy mechanism has been set up successfully'
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'create-futarchy-proposal',
          functionArgs: [
            uintCV(pollId),
            stringAsciiCV(valueQuestion),
            stringAsciiCV(beliefQuestion),
            uintCV(implementationThreshold)
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            setFutarchyData({
              valueQuestion,
              beliefQuestion,
              valueVotes: Array(10).fill(0),
              beliefBets: Array(10).fill(0),
              implementationThreshold,
              active: true
            });
            showNotification({
              type: 'success',
              title: 'Futarchy Created!',
              message: 'Futarchy mechanism has been set up successfully'
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Creation Cancelled',
              message: 'Futarchy creation was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Futarchy creation failed:', error);
      showNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create futarchy mechanism. Please try again.'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleParticipate = async () => {
    if (!futarchyData?.active) return;

    setIsParticipating(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock participation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update futarchy data
        const newValueVotes = [...futarchyData.valueVotes];
        newValueVotes[valueVote] += 1;
        
        const newBeliefBets = [...futarchyData.beliefBets];
        newBeliefBets[beliefOutcome] += beliefBet;
        
        setFutarchyData({
          ...futarchyData,
          valueVotes: newValueVotes,
          beliefBets: newBeliefBets,
          userParticipation: {
            valueVote,
            beliefBet,
            beliefOutcome,
            settled: false
          }
        });
        
        showNotification({
          type: 'success',
          title: 'Participation Recorded!',
          message: `Value vote: ${valueVote}, Belief bet: ${beliefBet} STX`
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'futarchy-participate',
          functionArgs: [
            uintCV(pollId),
            uintCV(valueVote),
            uintCV(beliefBet * 1000000), // Convert to microSTX
            uintCV(beliefOutcome)
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            showNotification({
              type: 'success',
              title: 'Participation Recorded!',
              message: `Value vote: ${valueVote}, Belief bet: ${beliefBet} STX`
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Participation Cancelled',
              message: 'Futarchy participation was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Futarchy participation failed:', error);
      showNotification({
        type: 'error',
        title: 'Participation Failed',
        message: 'Failed to participate in futarchy. Please try again.'
      });
    } finally {
      setIsParticipating(false);
    }
  };

  const getAverageValueVote = () => {
    if (!futarchyData) return 0;
    const totalVotes = futarchyData.valueVotes.reduce((sum, votes) => sum + votes, 0);
    const weightedSum = futarchyData.valueVotes.reduce((sum, votes, index) => sum + (votes * index), 0);
    return totalVotes > 0 ? (weightedSum / totalVotes).toFixed(1) : '0';
  };

  const getBeliefProbability = () => {
    if (!futarchyData) return 0;
    const totalBets = futarchyData.beliefBets.reduce((sum, bet) => sum + bet, 0);
    const yesBets = futarchyData.beliefBets[1] || 0;
    return totalBets > 0 ? ((yesBets / totalBets) * 100).toFixed(1) : '0';
  };

  const shouldImplement = () => {
    const avgValueResult = getAverageValueVote();
    const beliefProbResult = getBeliefProbability();
    const avgValue = typeof avgValueResult === 'string' ? parseFloat(avgValueResult) : avgValueResult;
    const beliefProb = typeof beliefProbResult === 'string' ? parseFloat(beliefProbResult) : beliefProbResult;
    return avgValue >= 5 && beliefProb >= (futarchyData?.implementationThreshold || 0);
  };

  if (!futarchyData && !isCreator) {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Futarchy Set Up</h3>
          <p className="text-gray-600">
            A futarchy mechanism has not been created for this poll yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-semibold text-gray-800">Futarchy</h3>
          <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
            VOTE ON VALUES
          </span>
        </div>
        <button
          onClick={() => setShowResults(!showResults)}
          className="px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full hover:bg-teal-200 transition-colors"
        >
          {showResults ? 'Hide Results' : 'Show Results'}
        </button>
      </div>

      {!futarchyData && isCreator && (
        <div className="bg-white p-4 rounded-lg border border-teal-200 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Create Futarchy Mechanism</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value Question
              </label>
              <input
                type="text"
                value={valueQuestion}
                onChange={(e) => setValueQuestion(e.target.value)}
                placeholder="How much will this proposal increase platform value? (0-10 scale)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Belief Question
              </label>
              <input
                type="text"
                value={beliefQuestion}
                onChange={(e) => setBeliefQuestion(e.target.value)}
                placeholder="Will this proposal be successfully implemented?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementation Threshold: {implementationThreshold}%
              </label>
              <input
                type="range"
                min="10"
                max="90"
                value={implementationThreshold}
                onChange={(e) => setImplementationThreshold(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>90%</span>
              </div>
            </div>
            
            <button
              onClick={handleCreateFutarchy}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isCreating ? 'Creating Futarchy...' : 'Create Futarchy Mechanism'}
            </button>
          </div>
        </div>
      )}

      {futarchyData && (
        <div className="space-y-6">
          {futarchyData.userParticipation ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">Your Participation</h4>
                  <p className="text-sm text-green-700">
                    Value Vote: {futarchyData.userParticipation.valueVote}/10
                  </p>
                  <p className="text-sm text-green-700">
                    Belief Bet: {futarchyData.userParticipation.beliefBet} STX on {futarchyData.userParticipation.beliefOutcome === 1 ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-2xl">🔮</div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-teal-200">
              <h4 className="font-semibold text-gray-800 mb-4">Participate in Futarchy</h4>
              
              <div className="space-y-6">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h5 className="font-semibold text-teal-800 mb-2">Value Question</h5>
                  <p className="text-teal-700 mb-3">{futarchyData.valueQuestion}</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Value Vote: {valueVote}/10
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={valueVote}
                      onChange={(e) => setValueVote(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0 (No Value)</span>
                      <span>10 (High Value)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <h5 className="font-semibold text-cyan-800 mb-2">Belief Question</h5>
                  <p className="text-cyan-700 mb-3">{futarchyData.beliefQuestion}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Belief
                      </label>
                      <select
                        value={beliefOutcome}
                        onChange={(e) => setBeliefOutcome(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value={0}>No - Will NOT be implemented</option>
                        <option value={1}>Yes - WILL be implemented</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bet Amount: {beliefBet} STX
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={beliefBet}
                        onChange={(e) => setBeliefBet(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 STX</span>
                        <span>100 STX</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleParticipate}
                  disabled={isParticipating || !isActive}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isParticipating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recording Participation...
                    </div>
                  ) : (
                    'Submit Vote & Bet'
                  )}
                </button>
              </div>
            </div>
          )}

          {showResults && (
            <div className="bg-white p-4 rounded-lg border border-teal-200">
              <h4 className="font-semibold text-gray-800 mb-4">Futarchy Results</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">Value Assessment</h5>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-teal-600">
                      {getAverageValueVote()}/10
                    </div>
                    <div className="text-sm text-gray-600">Average Value Score</div>
                  </div>
                  
                  <div className="space-y-2">
                    {futarchyData.valueVotes.map((votes, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{index}/10:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${(votes / Math.max(...futarchyData.valueVotes, 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">{votes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">Belief Market</h5>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-cyan-600">
                      {getBeliefProbability()}%
                    </div>
                    <div className="text-sm text-gray-600">Implementation Probability</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Yes Bets:</span>
                        <span>{futarchyData.beliefBets[1] || 0} STX</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${getBeliefProbability()}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>No Bets:</span>
                        <span>{futarchyData.beliefBets[0] || 0} STX</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-red-500 h-3 rounded-full"
                          style={{ width: `${100 - Number(getBeliefProbability())}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 border-t">
                <div className="text-center">
                  <h5 className="font-semibold text-gray-800 mb-2">Implementation Decision</h5>
                  <div className={`text-2xl font-bold ${shouldImplement() ? 'text-green-600' : 'text-red-600'}`}>
                    {shouldImplement() ? '✅ IMPLEMENT' : '❌ DO NOT IMPLEMENT'}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on value score ≥ 5 and belief probability ≥ {futarchyData.implementationThreshold}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-3 bg-teal-50 rounded-lg border border-teal-200">
        <div className="flex items-start">
          <div className="text-teal-600 mr-2">💡</div>
          <div className="text-sm text-teal-800">
            <strong>Futarchy:</strong> "Vote on values, bet on beliefs." 
            Vote on how valuable this proposal would be, then bet on whether you think it will actually be implemented successfully.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Futarchy;
