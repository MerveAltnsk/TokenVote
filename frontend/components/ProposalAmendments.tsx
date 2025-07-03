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

interface ProposalAmendmentsProps {
  pollId: number;
  pollCreator: string;
  userAddress: string;
  contractAddress: string;
  isVotingStarted: boolean;
}

interface Amendment {
  id: number;
  text: string;
  timestamp: number;
  author: string;
}

const ProposalAmendments: React.FC<ProposalAmendmentsProps> = ({ 
  pollId, 
  pollCreator, 
  userAddress, 
  contractAddress, 
  isVotingStarted 
}) => {
  const { doContractCall } = useConnect();
  const { showNotification } = useNotification();
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [newAmendment, setNewAmendment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock amendments data
  useEffect(() => {
    const mockAmendments: Amendment[] = [
      {
        id: 1,
        text: "Clarification: This proposal specifically refers to implementing quadratic voting for governance proposals only, not for all voting mechanisms.",
        timestamp: Date.now() - 86400000, // 1 day ago
        author: pollCreator
      },
      {
        id: 2,
        text: "Amendment: Added provision for minimum token holding requirement of 10 STX to participate in quadratic voting.",
        timestamp: Date.now() - 43200000, // 12 hours ago
        author: pollCreator
      }
    ];
    setAmendments(mockAmendments);
  }, [pollCreator]);

  const isCreator = userAddress === pollCreator;
  const canAmend = isCreator && !isVotingStarted;

  const handleSubmitAmendment = async () => {
    if (!newAmendment.trim()) return;

    setIsSubmitting(true);
    try {
      if (contractAddress === 'contract-not-deployed') {
        // Mock amendment submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newAmendmentObj: Amendment = {
          id: amendments.length + 1,
          text: newAmendment,
          timestamp: Date.now(),
          author: userAddress
        };
        setAmendments([...amendments, newAmendmentObj]);
        showNotification({
          type: 'success',
          title: 'Amendment Added',
          message: 'Successfully added amendment to proposal'
        });
      } else {
        await doContractCall({
          network: new StacksTestnet(),
          contractAddress: contractAddress.split('.')[0],
          contractName: contractAddress.split('.')[1],
          functionName: 'amend-proposal',
          functionArgs: [
            uintCV(pollId),
            stringAsciiCV(newAmendment)
          ],
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            const newAmendmentObj: Amendment = {
              id: amendments.length + 1,
              text: newAmendment,
              timestamp: Date.now(),
              author: userAddress
            };
            setAmendments([...amendments, newAmendmentObj]);
            showNotification({
              type: 'success',
              title: 'Amendment Added',
              message: 'Successfully added amendment to proposal'
            });
          },
          onCancel: () => {
            showNotification({
              type: 'info',
              title: 'Amendment Cancelled',
              message: 'Amendment submission was cancelled'
            });
          }
        });
      }
    } catch (error) {
      console.error('Amendment submission failed:', error);
      showNotification({
        type: 'error',
        title: 'Amendment Failed',
        message: 'Failed to submit amendment. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
      setNewAmendment('');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeDifference = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
        <h3 className="text-xl font-bold text-gray-800">Proposal Amendments</h3>
        <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
          REVISION
        </span>
      </div>

      {/* Amendment History */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-800">Amendment History</h4>
        
        {amendments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No amendments have been made to this proposal yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {amendments.map((amendment) => (
              <div key={amendment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-blue-600">
                      Amendment #{amendment.id}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {getTimeDifference(amendment.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(amendment.timestamp)}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{amendment.text}</p>
                
                <div className="flex items-center text-xs text-gray-500">
                  <span>By: {amendment.author.slice(0, 10)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Amendment Section */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-800 mb-4">Add Amendment</h4>
        
        {canAmend ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amendment Text
              </label>
              <textarea
                value={newAmendment}
                onChange={(e) => setNewAmendment(e.target.value)}
                placeholder="Describe the amendment to this proposal..."
                rows={4}
                maxLength={512}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {newAmendment.length}/512 characters
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <strong>Important:</strong> Amendments can only be made before voting starts. 
                  Once voting begins, the proposal cannot be modified.
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSubmitAmendment}
              disabled={isSubmitting || !newAmendment.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Amendment...
                </div>
              ) : (
                'Submit Amendment'
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            {!isCreator ? (
              <div className="text-gray-500">
                <p className="mb-2">🔒 Creator Only</p>
                <p className="text-sm">
                  Only the proposal creator can submit amendments.
                </p>
              </div>
            ) : (
              <div className="text-gray-500">
                <p className="mb-2">⏰ Voting Has Started</p>
                <p className="text-sm">
                  Amendments cannot be made once voting has begun.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amendment Guidelines */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-2">Amendment Guidelines</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Amendments should clarify or refine the original proposal</li>
          <li>• Major changes should be submitted as a new proposal</li>
          <li>• All amendments are permanent and cannot be deleted</li>
          <li>• Amendments are visible to all voters before they cast their vote</li>
        </ul>
      </div>
    </div>
  );
};

export default ProposalAmendments;
