import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  principalCV
} from '@stacks/transactions';
import { useNotification } from './NotificationProvider';

interface VetoSystemProps {
  userAddress: string;
  contractAddress: string;
  userReputation: number;
}

interface VetoProposal {
  pollId: number;
  title: string;
  creator: string;
  vetoReason?: string;
  vetoPower?: boolean;
}

const VetoSystem: React.FC<VetoSystemProps> = ({ 
  userAddress, 
  contractAddress, 
  userReputation 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [selectedProposal, setSelectedProposal] = useState<VetoProposal | null>(null);
  const [vetoReason, setVetoReason] = useState('');
  const [granteeAddress, setGranteeAddress] = useState('');
  const [vetoDuration, setVetoDuration] = useState(1000);
  const [isVetoing, setIsVetoing] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  // Mock data for active proposals
  const activeProposals: VetoProposal[] = [
    {
      pollId: 1,
      title: "Should we implement quadratic voting?",
      creator: "SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23FGH8VRG7H",
      vetoPower: userReputation >= 100
    },
    {
      pollId: 2,
      title: "What's the best blockchain platform?",
      creator: "SP2K1A1PMGW2ZJCNF46NWZWHG8TS1D23FGH8VRG7H",
      vetoPower: userReputation >= 100
    }
  ];

  const handleVetoProposal = async () => {
    if (!selectedProposal || !vetoReason.trim()) return;

    setIsVetoing(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock veto for demonstration
        await new Promise(resolve => setTimeout(resolve, 2000));
        showNotification({
          type: 'success',
          title: 'Proposal Vetoed',
          message: `Successfully vetoed proposal "${selectedProposal.title}"`
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'veto-proposal',
          functionArgs: [
            uintCV(selectedProposal.pollId),
            stringAsciiCV(vetoReason)
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            showNotification({
              type: 'success',
              title: 'Proposal Vetoed',
              message: `Successfully vetoed proposal "${selectedProposal.title}"`
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Veto Cancelled',
              message: 'Veto action was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Veto failed:', error);
      showNotification({
        type: 'error',
        title: 'Veto Failed',
        message: 'Failed to veto proposal. Please try again.'
      });
    } finally {
      setIsVetoing(false);
      setSelectedProposal(null);
      setVetoReason('');
    }
  };

  const handleGrantVetoPower = async () => {
    if (!granteeAddress.trim()) return;

    setIsGranting(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock grant for demonstration
        await new Promise(resolve => setTimeout(resolve, 2000));
        showNotification({
          type: 'success',
          title: 'Veto Power Granted',
          message: `Successfully granted veto power to ${granteeAddress}`
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'grant-veto-power',
          functionArgs: [
            principalCV(granteeAddress),
            uintCV(vetoDuration)
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            showNotification({
              type: 'success',
              title: 'Veto Power Granted',
              message: `Successfully granted veto power to ${granteeAddress}`
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Grant Cancelled',
              message: 'Grant veto power action was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Grant veto power failed:', error);
      showNotification({
        type: 'error',
        title: 'Grant Failed',
        message: 'Failed to grant veto power. Please try again.'
      });
    } finally {
      setIsGranting(false);
      setGranteeAddress('');
      setVetoDuration(1000);
    }
  };

  const canGrantVetoPower = userReputation >= 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
        <h3 className="text-xl font-bold text-gray-800">Veto System</h3>
        <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
          GOVERNANCE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Veto Proposals */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Active Proposals</h4>
          
          {activeProposals.map((proposal) => (
            <div key={proposal.pollId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-800">{proposal.title}</h5>
                <span className="text-xs text-gray-500">#{proposal.pollId}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Created by: {proposal.creator.slice(0, 10)}...
              </p>
              
              {proposal.vetoPower && (
                <button
                  onClick={() => setSelectedProposal(proposal)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Veto This Proposal
                </button>
              )}
              
              {!proposal.vetoPower && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  ⚠️ Insufficient reputation to veto (need 100+ points)
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Grant Veto Power */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Grant Veto Power</h4>
          
          {canGrantVetoPower ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={granteeAddress}
                    onChange={(e) => setGranteeAddress(e.target.value)}
                    placeholder="SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23FGH8VRG7H"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (blocks): {vetoDuration}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    value={vetoDuration}
                    onChange={(e) => setVetoDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100</span>
                    <span>10000</span>
                  </div>
                </div>
                
                <button
                  onClick={handleGrantVetoPower}
                  disabled={isGranting || !granteeAddress.trim()}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGranting ? 'Granting...' : 'Grant Veto Power'}
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center text-gray-500">
                <p className="mb-2">🔒 Insufficient Reputation</p>
                <p className="text-sm">
                  You need at least 100 reputation points to grant veto power.
                </p>
                <p className="text-xs mt-1">
                  Current: {userReputation} points
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Veto Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Veto Proposal #{selectedProposal.pollId}
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">
                {selectedProposal.title}
              </h4>
              <p className="text-sm text-gray-600">
                This action will immediately deactivate the proposal and prevent further voting.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Veto
              </label>
              <textarea
                value={vetoReason}
                onChange={(e) => setVetoReason(e.target.value)}
                placeholder="Explain why this proposal should be vetoed..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedProposal(null);
                  setVetoReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVetoProposal}
                disabled={isVetoing || !vetoReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVetoing ? 'Vetoing...' : 'Confirm Veto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetoSystem;
