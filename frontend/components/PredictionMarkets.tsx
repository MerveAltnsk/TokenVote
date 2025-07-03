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

interface PredictionMarketsProps {
  pollId: number;
  options: string[];
  contractAddress: string;
  isActive: boolean;
  isCreator: boolean;
}

interface MarketData {
  marketActive: boolean;
  outcomeOdds: number[];
  totalBets: number;
  outcomePools: number[];
  userBet?: {
    outcome: number;
    betAmount: number;
    oddsAtBet: number;
    settled: boolean;
  };
}

const PredictionMarkets: React.FC<PredictionMarketsProps> = ({ 
  pollId, 
  options, 
  contractAddress, 
  isActive, 
  isCreator 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [initialOdds, setInitialOdds] = useState<number[]>([]);
  const [isBetting, setIsBetting] = useState(false);
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize odds
  useEffect(() => {
    const evenOdds = Array(options.length).fill(Math.floor(100 / options.length));
    // Adjust for rounding
    const remainder = 100 - evenOdds.reduce((sum, odd) => sum + odd, 0);
    if (remainder > 0) evenOdds[0] += remainder;
    setInitialOdds(evenOdds);
  }, [options]);

  // Mock market data
  useEffect(() => {
    const mockMarketData: MarketData = {
      marketActive: true,
      outcomeOdds: [40, 30, 20, 10],
      totalBets: 150,
      outcomePools: [60, 45, 30, 15]
    };
    setMarketData(mockMarketData);
  }, []);

  const handleCreateMarket = async () => {
    if (initialOdds.reduce((sum, odd) => sum + odd, 0) !== 100) {
      showNotification({
        type: 'error',
        title: 'Invalid Odds',
        message: 'Odds must sum to 100%'
      });
      return;
    }

    setIsCreatingMarket(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock market creation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setMarketData({
          marketActive: true,
          outcomeOdds: initialOdds,
          totalBets: 0,
          outcomePools: Array(options.length).fill(0)
        });
        showNotification({
          type: 'success',
          title: 'Market Created!',
          message: 'Prediction market has been created successfully'
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'create-prediction-market',
          functionArgs: [
            uintCV(pollId),
            listCV(initialOdds.map(odd => uintCV(odd)))
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            setMarketData({
              marketActive: true,
              outcomeOdds: initialOdds,
              totalBets: 0,
              outcomePools: Array(options.length).fill(0)
            });
            showNotification({
              type: 'success',
              title: 'Market Created!',
              message: 'Prediction market has been created successfully'
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Creation Cancelled',
              message: 'Market creation was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Market creation failed:', error);
      showNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create prediction market. Please try again.'
      });
    } finally {
      setIsCreatingMarket(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!marketData?.marketActive) return;

    setIsBetting(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock betting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update market data
        const newOutcomePools = [...marketData.outcomePools];
        newOutcomePools[selectedOutcome] += betAmount;
        
        setMarketData({
          ...marketData,
          totalBets: marketData.totalBets + betAmount,
          outcomePools: newOutcomePools,
          userBet: {
            outcome: selectedOutcome,
            betAmount: betAmount,
            oddsAtBet: marketData.outcomeOdds[selectedOutcome],
            settled: false
          }
        });
        
        showNotification({
          type: 'success',
          title: 'Bet Placed!',
          message: `Bet ${betAmount} STX on "${options[selectedOutcome]}"`
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'place-prediction-bet',
          functionArgs: [
            uintCV(pollId),
            uintCV(selectedOutcome),
            uintCV(betAmount * 1000000) // Convert to microSTX
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            showNotification({
              type: 'success',
              title: 'Bet Placed!',
              message: `Bet ${betAmount} STX on "${options[selectedOutcome]}"`
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Bet Cancelled',
              message: 'Betting was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Betting failed:', error);
      showNotification({
        type: 'error',
        title: 'Bet Failed',
        message: 'Failed to place bet. Please try again.'
      });
    } finally {
      setIsBetting(false);
    }
  };

  const calculatePayout = (outcome: number, amount: number) => {
    if (!marketData) return 0;
    const odds = marketData.outcomeOdds[outcome];
    return Math.floor((amount * 100) / odds);
  };

  const getImpliedProbability = (odds: number) => {
    return `${odds}%`;
  };

  const updateOdds = (index: number, value: number) => {
    const newOdds = [...initialOdds];
    newOdds[index] = value;
    setInitialOdds(newOdds);
  };

  if (!marketData && !isCreator) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Prediction Market</h3>
          <p className="text-gray-600">
            A prediction market has not been created for this poll yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-semibold text-gray-800">Prediction Market</h3>
          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
            BETTING
          </span>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full hover:bg-purple-200 transition-colors"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      {!marketData && isCreator && (
        <div className="bg-white p-4 rounded-lg border border-purple-200 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Create Prediction Market</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Initial Odds (must sum to 100%)
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="w-24 text-sm text-gray-700">{option}:</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={initialOdds[index] || 0}
                      onChange={(e) => updateOdds(index, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Total: {initialOdds.reduce((sum, odd) => sum + odd, 0)}% 
                {initialOdds.reduce((sum, odd) => sum + odd, 0) !== 100 && (
                  <span className="text-red-500 ml-2">⚠️ Must equal 100%</span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleCreateMarket}
              disabled={isCreatingMarket || initialOdds.reduce((sum, odd) => sum + odd, 0) !== 100}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isCreatingMarket ? 'Creating Market...' : 'Create Prediction Market'}
            </button>
          </div>
        </div>
      )}

      {marketData && (
        <div className="space-y-6">
          {marketData.userBet ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">Your Bet</h4>
                  <p className="text-sm text-green-700">
                    {marketData.userBet.betAmount} STX on "{options[marketData.userBet.outcome]}"
                  </p>
                  <p className="text-xs text-green-600">
                    Potential payout: {calculatePayout(marketData.userBet.outcome, marketData.userBet.betAmount)} STX
                  </p>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-4">Place Your Bet</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Outcome
                  </label>
                  <select
                    value={selectedOutcome}
                    onChange={(e) => setSelectedOutcome(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {options.map((option, index) => (
                      <option key={index} value={index}>
                        {option} ({getImpliedProbability(marketData.outcomeOdds[index])})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bet Amount: {betAmount} STX
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 STX</span>
                    <span>100 STX</span>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {calculatePayout(selectedOutcome, betAmount)}
                      </div>
                      <div className="text-sm text-gray-600">Potential Payout</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-pink-600">
                        {getImpliedProbability(marketData.outcomeOdds[selectedOutcome])}
                      </div>
                      <div className="text-sm text-gray-600">Implied Probability</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceBet}
                  disabled={isBetting || !isActive}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isBetting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing Bet...
                    </div>
                  ) : (
                    `Bet ${betAmount} STX on "${options[selectedOutcome]}"`
                  )}
                </button>
              </div>
            </div>
          )}

          {showAdvanced && (
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-4">Market Overview</h4>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {marketData.totalBets}
                  </div>
                  <div className="text-sm text-gray-600">Total Bets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">
                    {options.length}
                  </div>
                  <div className="text-sm text-gray-600">Outcomes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {marketData.marketActive ? 'Active' : 'Closed'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-gray-800">Market Depth</h5>
                {options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{option}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {marketData.outcomePools[index]} STX
                        </span>
                        <span className="text-sm text-purple-600">
                          {getImpliedProbability(marketData.outcomeOdds[index])}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(marketData.outcomePools[index] / marketData.totalBets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-start">
          <div className="text-purple-600 mr-2">💡</div>
          <div className="text-sm text-purple-800">
            <strong>Prediction Markets:</strong> Bet on the outcome you think will win. 
            If you're correct, you'll earn rewards based on the odds when you placed your bet.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionMarkets;
