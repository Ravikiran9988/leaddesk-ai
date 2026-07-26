import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';

const TagsInput = ({ tags = [], onChange, disabled }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput('');
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
          >
            {tag}
            {!disabled && (
              <button type="button" onClick={() => removeTag(tag)} className="text-brand-400 hover:text-brand-700">
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!input.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TagsInput;
