import { useEffect, useState } from 'react';
import { Upload, ExternalLink, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Select from './ui/Select';
import Button from './ui/Button';
import TagsInput from './TagsInput';
import NotesPanel from './NotesPanel';
import ActivityTimeline from './ActivityTimeline';
import LeadAnalysisPanel from './LeadAnalysisPanel';
import FollowUpEmailGenerator from './FollowUpEmailGenerator';
import {
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  CATEGORY_OPTIONS,
  STATUS_COLORS,
  SOURCE_COLORS,
  formatDate,
  canDeleteLeads,
  getErrorMessage,
} from '../utils/constants';
import { aiService } from '../services/aiService';

const LeadDetailModal = ({
  lead,
  assignees,
  user,
  onClose,
  onUpdate,
  onDelete,
  onAddNote,
  onUpload,
  onRefetch,
}) => {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [localLead, setLocalLead] = useState(lead);

  useEffect(() => {
    setLocalLead(lead);
    if (lead) {
      setForm({
        status: lead.status === 'Closed' ? 'Won' : lead.status,
        source: lead.source || 'Website',
        category: lead.category || '',
        tags: lead.tags || [],
        assignedTo: lead.assignedTo?._id || '',
      });
    }
  }, [lead]);

  if (!localLead) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
      };
      const updated = await onUpdate(localLead._id, payload);
      setLocalLead(updated);
      toast.success('Lead updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (content) => {
    setNoteLoading(true);
    try {
      const updated = await onAddNote(localLead._id, content);
      setLocalLead(updated);
      toast.success('Note added');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setNoteLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await onUpload(localLead._id, file);
      setLocalLead(updated);
      toast.success('File uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data } = await aiService.analyzeLead(localLead._id);
      setLocalLead(data.data);
      await onRefetch();
      toast.success('Lead analyzed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateEmail = async () => {
    setGeneratingEmail(true);
    try {
      const { data } = await aiService.generateFollowUpEmail(localLead._id);
      setLocalLead(data.data.lead);
      toast.success('Follow-up email generated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this lead permanently?')) return;
    try {
      await onDelete(localLead._id);
      onClose();
      toast.success('Lead deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Modal isOpen={!!lead} onClose={onClose} title="Lead Details" size="lg">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 scrollbar-none">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Name</p>
            <p className="mt-1 font-bold text-slate-900 dark:text-white">{localLead.name}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">{localLead.email}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Budget</p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">{localLead.budget}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Created</p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">{formatDate(localLead.createdAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Message</p>
          <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">{localLead.message}</p>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-2">
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <Select
            label="Source"
            options={SOURCE_OPTIONS}
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <Select
            label="Category"
            options={['', ...CATEGORY_OPTIONS]}
            placeholder="Select category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Assigned To
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="" className="dark:bg-slate-900 dark:text-white">Unassigned</option>
              {assignees.map((u) => (
                <option key={u._id} value={u._id} className="dark:bg-slate-900 dark:text-white">
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tags</p>
          <TagsInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[form.status]}`}>
            {form.status}
          </span>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${SOURCE_COLORS[form.source]}`}>
            {form.source}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
          {canDeleteLeads(user?.role) && (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Notes</h3>
          <NotesPanel notes={localLead.notes} onAddNote={handleAddNote} loading={noteLoading} />
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Attachments</h3>
          <div className="space-y-2">
            {(localLead.attachments || []).map((file) => (
              <a
                key={file._id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-slate-800 dark:text-indigo-400 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-4 w-4" />
                {file.filename}
              </a>
            ))}
          </div>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-300">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload file'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Activity Timeline</h3>
          <ActivityTimeline activities={localLead.activities} />
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <LeadAnalysisPanel
            analysis={localLead.aiAnalysis}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            hasAnalysis={!!localLead.aiAnalysis?.analyzedAt}
          />
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <FollowUpEmailGenerator
            email={localLead.followUpEmail}
            onGenerate={handleGenerateEmail}
            generating={generatingEmail}
            hasAnalysis={!!localLead.aiAnalysis?.analyzedAt}
          />
        </div>
      </div>
    </Modal>
  );
};

export default LeadDetailModal;
