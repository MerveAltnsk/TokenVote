import { useState, useEffect } from 'react';
import { Poll, PollResults, getPoll, getPollResults, getUserVote, votePoll, isPollActive } from '../lib/contracts';
import { userSession } from '../lib/auth';
import { Clock, Users, CheckCircle } from 'lucide-react';

interface PollListProps {
  refreshTrigger: number;
}

export default function PollList({ refreshTrigger }: PollListProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollResults, setPollResults] = useState<{ [key: number]: PollResults }>({});
  const [userVotes, setUserVotes] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState<{ [key: number]: number }>({});

  const currentUserAddress = userSession.isUserSignedIn() 
    ? userSession.loadUserData().profile.stxAddress.testnet 
    : null;

  useEffect(() => {
    loadPolls();
  }, [refreshTrigger]);

  const loadPolls = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd want to fetch the poll count first
      // and then fetch all polls. For now, we'll try to fetch the first 10 polls
      const pollPromises = Array.from({ length: 10 }, (_, i) => getPoll(i));
      const pollsData = await Promise.all(pollPromises);
      const validPolls = pollsData.filter((poll): poll is Poll => poll !== null);
      
      setPolls(validPolls);

      // Load results for all polls
      const resultsPromises = validPolls.map(poll => getPollResults(poll.id));
      const resultsData = await Promise.all(resultsPromises);
      const resultsMap: { [key: number]: PollResults } = {};
      
      resultsData.forEach((result, index) => {
        if (result) {
          resultsMap[validPolls[index].id] = result;
        }
      });
      
      setPollResults(resultsMap);

      // Load user votes if signed in
      if (currentUserAddress) {
        const votePromises = validPolls.map(poll => 
          getUserVote(poll.id, currentUserAddress)
        );
        const votesData = await Promise.all(votePromises);
        const votesMap: { [key: number]: number } = {};
        
        votesData.forEach((vote, index) => {
          if (vote !== null) {
            votesMap[validPolls[index].id] = vote;
          }
        });
        
        setUserVotes(votesMap);
      }
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionIndex: number) => {
    if (!currentUserAddress) {
      alert('Please connect your wallet to vote');
      return;
    }

    setVotingLoading({ ...votingLoading, [pollId]: optionIndex });

    try {
      const txid = await votePoll(pollId, optionIndex);
      console.log('Vote cast:', txid);
      
      // Update local state optimistically
      setUserVotes({ ...userVotes, [pollId]: optionIndex });
      
      // Refresh poll results after a delay
      setTimeout(() => {
        loadPolls();
      }, 5000);
    } catch (error: any) {
      console.error('Voting error:', error);
      alert(error.message || 'Failed to cast vote');
    } finally {
      setVotingLoading({ ...votingLoading, [pollId]: -1 });
    }
  };

  const getPollStatus = (poll: Poll) => {
    const currentBlock = 100000; // This should be fetched from the network
    
    if (currentBlock < poll.startBlock) {
      return { status: 'upcoming', label: 'Upcoming' };
    } else if (currentBlock > poll.endBlock || !poll.isActive) {
      return { status: 'ended', label: 'Ended' };
    } else {
      return { status: 'active', label: 'Active' };
    }
  };

  const calculatePercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
        <p className="text-gray-500">Be the first to create a poll!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {polls.map((poll) => {
        const status = getPollStatus(poll);
        const results = pollResults[poll.id];
        const userVote = userVotes[poll.id];
        const hasVoted = userVote !== undefined;

        return (
          <div key={poll.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {poll.question}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {poll.votesCast} votes
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Block {poll.startBlock} - {poll.endBlock}
                  </span>
                </div>
              </div>
              <span className={`status-${status.status}`}>
                {status.label}
              </span>
            </div>

            <div className="space-y-3">
              {poll.options.map((option, index) => {
                const voteCount = results?.results[index] || 0;
                const percentage = results ? calculatePercentage(voteCount, results.totalVotes) : 0;
                const isUserChoice = hasVoted && userVote === index;
                const isVotingThisOption = votingLoading[poll.id] === index;

                return (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="font-medium text-gray-900">{option}</span>
                        {isUserChoice && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {voteCount} votes ({percentage}%)
                          </div>
                          {results && (
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        
                        {status.status === 'active' && !hasVoted && currentUserAddress && (
                          <button
                            onClick={() => handleVote(poll.id, index)}
                            disabled={isVotingThisOption}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {isVotingThisOption ? 'Voting...' : 'Vote'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasVoted && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ You voted for: <strong>{poll.options[userVote]}</strong>
                </p>
              </div>
            )}

            {status.status === 'active' && !currentUserAddress && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Connect your wallet to participate in this poll
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
