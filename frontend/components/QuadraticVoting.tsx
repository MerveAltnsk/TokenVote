import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  stringAsciiCV,
  listCV
} from '@stacks/transactions';
import { useNotification } from './NotificationProvider';

interface QuadraticVotingProps {
  pollId: number;
  options: string[];
  contractAddress: string;
}

const QuadraticVoting: React.FC<QuadraticVotingProps> = ({ 
  pollId, 
  options, 
  contractAddress 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [tokensToSpend, setTokensToSpend] = useState<number>(1);
  const [isVoting, setIsVoting] = useState(false);

  const votePower = Math.floor(Math.sqrt(tokensToSpend));
  const efficiency = tokensToSpend > 0 ? (votePower / tokensToSpend * 100).toFixed(1) : '0';

  const handleQuadraticVote = async () => {
    if (!contractAddress) return;

    setIsVoting(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock voting for demonstration
        await new Promise(resolve => setTimeout(resolve, 2000));
        showNotification({
          type: 'success',
          title: 'Vote Successful!',
          message: `Quadratic vote cast for "${options[selectedOption]}" with ${tokensToSpend} tokens (${votePower} power)`
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'quadratic-vote',
          functionArgs: [
            uintCV(pollId),
            uintCV(selectedOption),
            uintCV(tokensToSpend)
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            console.log('Quadratic vote successful:', data);
            showNotification({
              type: 'success',
              title: 'Vote Successful!',
              message: `Quadratic vote cast for "${options[selectedOption]}" with ${tokensToSpend} tokens (${votePower} power)`
            });
            setIsVoting(false);
          },
          onCancel: () => {
            setIsVoting(false);
          }
        });
      }
    } catch (error) {
      console.error('Quadratic voting failed:', error);
      showNotification({
        type: 'error',
        title: 'Vote Failed',
        message: 'Failed to cast quadratic vote. Please try again.'
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
        <h3 className="text-lg font-semibold text-gray-800">Quadratic Voting</h3>
        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
          ADVANCED
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Option
          </label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {options.map((option, index) => (
              <option key={index} value={index}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tokens to Spend: {tokensToSpend}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={tokensToSpend}
            onChange={(e) => setTokensToSpend(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{votePower}</div>
              <div className="text-sm text-gray-600">Vote Power</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{efficiency}%</div>
              <div className="text-sm text-gray-600">Efficiency</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 text-center">
            Formula: Vote Power = √(Tokens Spent)
          </div>
        </div>

        <button
          onClick={handleQuadraticVote}
          disabled={isVoting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isVoting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Voting...
            </div>
          ) : (
            `Cast Quadratic Vote (${tokensToSpend} tokens → ${votePower} power)`
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="text-blue-600 mr-2">💡</div>
          <div className="text-sm text-blue-800">
            <strong>Quadratic Voting:</strong> Spend more tokens for more voting power, but with diminishing returns. 
            This prevents wealthy voters from dominating while still allowing them to express stronger preferences.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuadraticVoting;
