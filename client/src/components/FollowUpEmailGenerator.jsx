import { useState } from 'react';
import { Mail, Copy, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import { formatDate } from '../utils/constants';

const FollowUpEmailGenerator = ({ email, onGenerate, generating, hasAnalysis }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!email?.body) return;

    const text = `Subject: ${email.subject}\n\n${email.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy email');
    }
  };

  if (!hasAnalysis) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        Run AI analysis first to generate a personalized follow-up email.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-indigo-500" />
          <h4 className="font-bold text-slate-900 dark:text-white">Follow-up Email</h4>
        </div>
        <Button variant="secondary" size="sm" onClick={onGenerate} loading={generating}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          {email?.body ? 'Regenerate' : 'Generate Email'}
        </Button>
      </div>

      {generating && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Generating personalized email...
        </div>
      )}

      {!generating && email?.body && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Subject</p>
            <p className="mt-1 font-bold text-slate-900 dark:text-white">{email.subject}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Body</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{email.body}</p>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Email
                </>
              )}
            </Button>
            {email.generatedAt && (
              <p className="text-xs text-slate-400 dark:text-slate-500">Generated: {formatDate(email.generatedAt)}</p>
            )}
          </div>
        </div>
      )}

      {!generating && !email?.body && (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Click &quot;Generate Email&quot; to create a personalized follow-up message.
        </div>
      )}
    </div>
  );
};

export default FollowUpEmailGenerator;
