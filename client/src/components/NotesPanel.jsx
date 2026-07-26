import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import { formatDate } from '../utils/constants';

const NotesPanel = ({ notes = [], onAddNote, loading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onAddNote(content.trim());
    setContent('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Add an internal note..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" size="sm" loading={loading} disabled={!content.trim()}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Add Note
        </Button>
      </form>

      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">{note.content}</p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {note.createdBy?.name || 'Unknown'} &bull; {formatDate(note.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
