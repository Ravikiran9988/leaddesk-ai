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
          <Send className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </form>

      <div className="max-h-64 space-y-3 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-500">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm leading-relaxed text-slate-700">{note.content}</p>
              <p className="mt-2 text-xs text-slate-400">
                {note.createdBy?.name || 'Unknown'} · {formatDate(note.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
