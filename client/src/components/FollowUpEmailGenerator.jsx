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
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
        Run AI analysis first to generate a personalized follow-up email.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand-500" />
          <h4 className="font-semibold text-slate-900">Follow-up Email</h4>
        </div>
        <Button variant="secondary" size="sm" onClick={onGenerate} loading={generating}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {email?.body ? 'Regenerate' : 'Generate Email'}
        </Button>
      </div>

      {generating && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Generating personalized email...
        </div>
      )}

      {!generating && email?.body && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Subject</p>
            <p className="mt-1 font-medium text-slate-900">{email.subject}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Body</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{email.body}</p>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Email
                </>
              )}
            </Button>
            {email.generatedAt && (
              <p className="text-xs text-slate-400">Generated: {formatDate(email.generatedAt)}</p>
            )}
          </div>
        </div>
      )}

      {!generating && !email?.body && (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Click &quot;Generate Email&quot; to create a personalized follow-up message.
        </div>
      )}
    </div>
  );
};

export default FollowUpEmailGenerator;
