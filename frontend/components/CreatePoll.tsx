import { useState } from 'react';
import { createPoll } from '../lib/contracts';
import { userSession } from '../lib/auth';

interface CreatePollProps {
  onPollCreated: () => void;
}

export default function CreatePoll({ onPollCreated }: CreatePollProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationDays, setDurationDays] = useState(7);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userSession.isUserSignedIn()) {
      setError('Please connect your wallet first');
      return;
    }

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Calculate start and end blocks (approximate 10 minutes per block)
      const currentBlock = 100000; // This should be fetched from the network
      const startBlock = currentBlock + 10; // Start in ~1.5 hours
      const endBlock = startBlock + (durationDays * 24 * 6); // Duration in blocks

      const txid = await createPoll(question, validOptions, startBlock, endBlock);
      console.log('Poll created:', txid);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setDurationDays(7);
      setIsOpen(false);
      onPollCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary mb-6"
        disabled={!userSession.isUserSignedIn()}
      >
        Create New Poll
      </button>
    );
  }

  return (
    <div className="card mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Create New Poll</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-field"
            placeholder="What would you like to ask?"
            maxLength={256}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="input-field"
                placeholder={`Option ${index + 1}`}
                maxLength={64}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Option
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Days)
          </label>
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="input-field"
          >
            <option value={1}>1 Day</option>
            <option value={3}>3 Days</option>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Creating...' : 'Create Poll'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
