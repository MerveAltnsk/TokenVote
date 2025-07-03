import React, { useState } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  listCV,
  principalCV
} from '@stacks/transactions';

interface AdvancedCreatePollProps {
  contractAddress: string;
  onPollCreated?: (pollId: number) => void;
}

const CATEGORIES = [
  'governance',
  'development', 
  'community',
  'funding',
  'technical',
  'general'
];

const PRESET_TAGS = [
  'dao', 'defi', 'nft', 'protocol', 'upgrade', 
  'budget', 'proposal', 'research', 'security', 'tokenomics'
];

const AdvancedCreatePoll: React.FC<AdvancedCreatePollProps> = ({ 
  contractAddress, 
  onPollCreated 
}) => {
  const { doContractCall } = useConnect();
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    category: 'general',
    tags: [] as string[],
    startDelay: 1,
    duration: 7,
    fundingGoal: 0,
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : prev.tags.length < 5 
          ? [...prev.tags, tag]
          : prev.tags
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress) return;

    setIsCreating(true);
    try {
      const [contractAddr, contractName] = contractAddress.split('.');
      const currentBlock = 1000; // This should come from actual chain state
      
      // Create basic poll first
      await doContractCall({
        network: new StacksTestnet(),
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'create-poll',
        functionArgs: [
          stringAsciiCV(formData.question),
          listCV(formData.options.filter(opt => opt.trim()).map(opt => stringAsciiCV(opt))),
          uintCV(currentBlock + formData.startDelay),
          uintCV(currentBlock + formData.startDelay + formData.duration)
        ],
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: async (data) => {
          console.log('Poll created:', data);
          
          // If advanced features are enabled, set metadata
          if (showAdvanced && (formData.category !== 'general' || formData.tags.length > 0 || formData.fundingGoal > 0)) {
            try {
              await doContractCall({
                network: new StacksTestnet(),
                contractAddress: contractAddr,
                contractName: contractName,
                functionName: 'set-poll-metadata',
                functionArgs: [
                  uintCV(0), // Poll ID (should be determined from the previous call)
                  stringAsciiCV(formData.category),
                  listCV(formData.tags.map(tag => stringAsciiCV(tag))),
                  uintCV(formData.fundingGoal)
                ],
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
                onFinish: () => {
                  console.log('Poll metadata set');
                  setIsCreating(false);
                  if (onPollCreated) onPollCreated(0);
                }
              });
            } catch (error) {
              console.error('Error setting metadata:', error);
              setIsCreating(false);
            }
          } else {
            setIsCreating(false);
            if (onPollCreated) onPollCreated(0);
          }
        },
        onCancel: () => {
          setIsCreating(false);
        }
      });
    } catch (error) {
      console.error('Poll creation failed:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Create Advanced Poll</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            showAdvanced 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {showAdvanced ? 'Simple Mode' : 'Advanced Mode'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poll Question *
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What should we decide?"
            required
          />
        </div>

        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Provide more context about this poll..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options *
          </label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            {formData.options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Option
              </button>
            )}
          </div>
        </div>

        {showAdvanced && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal (STX)
                </label>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (max 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {formData.tags.join(', ')}
                </div>
              )}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Delay (blocks)
            </label>
            <input
              type="number"
              value={formData.startDelay}
              onChange={(e) => setFormData(prev => ({ ...prev, startDelay: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (blocks)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 7 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating || !formData.question.trim() || formData.options.some(opt => !opt.trim())}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isCreating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Poll...
            </div>
          ) : (
            'Create Advanced Poll'
          )}
        </button>
      </form>
    </div>
  );
};

export default AdvancedCreatePoll;
