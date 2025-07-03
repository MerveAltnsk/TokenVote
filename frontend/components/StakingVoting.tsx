import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  uintCV
} from '@stacks/transactions';
import { useNotification } from './NotificationProvider';

interface StakingVotingProps {
  pollId: number;
  options: string[];
  contractAddress: string;
  isActive: boolean;
}

interface StakeInfo {
  totalStaked: number;
  outcomeStakes: number[];
  rewardPool: number;
  userStake?: {
    amount: number;
    predictedOutcome: number;
    withdrawn: boolean;
  };
}

const StakingVoting: React.FC<StakingVotingProps> = ({ 
  pollId, 
  options, 
  contractAddress, 
  isActive 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [stakeAmount, setStakeAmount] = useState(10);
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Mock stake data
  useEffect(() => {
    const mockStakeInfo: StakeInfo = {
      totalStaked: 250,
      outcomeStakes: [120, 80, 35, 15],
      rewardPool: 25,
      userStake: undefined
    };
    setStakeInfo(mockStakeInfo);
  }, []);

  const handleStakeAndVote = async () => {
    if (stakeAmount <= 0) {
      showNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid stake amount'
      });
      return;
    }

    setIsStaking(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock staking for demonstration
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update stake info
        if (stakeInfo) {
          const newStakeInfo = {
            ...stakeInfo,
            totalStaked: stakeInfo.totalStaked + stakeAmount,
            outcomeStakes: stakeInfo.outcomeStakes.map((stake, index) => 
              index === selectedOutcome ? stake + stakeAmount : stake
            ),
            rewardPool: stakeInfo.rewardPool + Math.floor(stakeAmount * 0.1),
            userStake: {
              amount: stakeAmount,
              predictedOutcome: selectedOutcome,
              withdrawn: false
            }
          };
          setStakeInfo(newStakeInfo);
        }
        
        showNotification({
          type: 'success',
          title: 'Stake Successful!',
          message: `Staked ${stakeAmount} STX on "${options[selectedOutcome]}"`
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'stake-and-vote',
          functionArgs: [
            uintCV(pollId),
            uintCV(stakeAmount * 1000000), // Convert to microSTX
            uintCV(selectedOutcome)
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            showNotification({
              type: 'success',
              title: 'Stake Successful!',
              message: `Staked ${stakeAmount} STX on "${options[selectedOutcome]}"`
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Stake Cancelled',
              message: 'Staking was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Staking failed:', error);
      showNotification({
        type: 'error',
        title: 'Stake Failed',
        message: 'Failed to stake. Please try again.'
      });
    } finally {
      setIsStaking(false);
    }
  };

  const calculatePotentialReward = (outcome: number) => {
    if (!stakeInfo) return 0;
    
    const totalStaked = stakeInfo.totalStaked;
    const outcomeStake = stakeInfo.outcomeStakes[outcome];
    
    if (outcomeStake === 0) return 0;
    
    // Simple reward calculation: proportional share of total pool
    const shareOfOutcome = stakeAmount / (outcomeStake + stakeAmount);
    const rewardMultiplier = totalStaked / (outcomeStake + stakeAmount);
    
    return Math.floor(stakeAmount * rewardMultiplier);
  };

  const getOutcomePercentage = (outcome: number) => {
    if (!stakeInfo) return 0;
    return (stakeInfo.outcomeStakes[outcome] / stakeInfo.totalStaked) * 100;
  };

  const getOdds = (outcome: number) => {
    const percentage = getOutcomePercentage(outcome);
    if (percentage === 0) return 'N/A';
    return `${(100 / percentage).toFixed(1)}:1`;
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-semibold text-gray-800">Staking Voting</h3>
          <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
            STAKE
          </span>
        </div>
        <button
          onClick={() => setShowResults(!showResults)}
          className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full hover:bg-amber-200 transition-colors"
        >
          {showResults ? 'Hide Pool' : 'Show Pool'}
        </button>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          {stakeInfo?.userStake ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">Your Stake</h4>
                  <p className="text-sm text-green-700">
                    {stakeInfo.userStake.amount} STX on "{options[stakeInfo.userStake.predictedOutcome]}"
                  </p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-gray-800 mb-4">Stake and Predict</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Predicted Outcome
                  </label>
                  <select
                    value={selectedOutcome}
                    onChange={(e) => setSelectedOutcome(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {options.map((option, index) => (
                      <option key={index} value={index}>
                        {option} (Odds: {getOdds(index)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stake Amount: {stakeAmount} STX
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 STX</span>
                    <span>100 STX</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-amber-600">
                        {calculatePotentialReward(selectedOutcome)}
                      </div>
                      <div className="text-sm text-gray-600">Potential Reward</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        {getOdds(selectedOutcome)}
                      </div>
                      <div className="text-sm text-gray-600">Current Odds</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStakeAndVote}
                  disabled={isStaking || !isActive}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isStaking ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Staking...
                    </div>
                  ) : (
                    `Stake ${stakeAmount} STX on "${options[selectedOutcome]}"`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-gray-800 mb-4">Stake Pool Overview</h4>
            
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {stakeInfo?.totalStaked || 0}
                </div>
                <div className="text-sm text-gray-600">Total Staked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {stakeInfo?.rewardPool || 0}
                </div>
                <div className="text-sm text-gray-600">Reward Pool</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stakeInfo?.outcomeStakes.filter(stake => stake > 0).length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Outcomes</div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-gray-800">Stakes by Outcome</h5>
              {options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{option}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {stakeInfo?.outcomeStakes[index] || 0} STX
                      </span>
                      <span className="text-sm text-amber-600">
                        ({getOutcomePercentage(index).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getOutcomePercentage(index)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Odds: {getOdds(index)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start">
          <div className="text-amber-600 mr-2">💡</div>
          <div className="text-sm text-amber-800">
            <strong>Staking Voting:</strong> Stake STX tokens on your predicted outcome. 
            If you're correct, you'll earn rewards from the total pool proportional to your stake.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingVoting;
