import { Sparkles, TrendingUp, Tag, DollarSign, Heart, Target, Zap, RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import {
  PRIORITY_COLORS,
  SENTIMENT_COLORS,
  getLeadScoreColor,
  formatCurrency,
  formatDate,
} from '../utils/constants';

const LeadAnalysisPanel = ({ analysis, onAnalyze, analyzing, hasAnalysis }) => {
  if (!analysis?.analyzedAt && !analyzing) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center dark:border-indigo-900/60 dark:bg-indigo-950/40">
        <Sparkles className="mx-auto h-8 w-8 text-indigo-500" />
        <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">No AI analysis yet</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Analyze this lead to get insights, scoring, and recommendations.</p>
        <Button className="mt-4" onClick={onAnalyze} loading={analyzing}>
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze with AI
        </Button>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-8 text-center dark:border-indigo-900/60 dark:bg-indigo-950/40">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-indigo-200 dark:bg-indigo-800" />
        <p className="mt-3 text-sm font-bold text-indigo-700 dark:text-indigo-300">AI is analyzing this lead...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h4 className="font-bold text-slate-900 dark:text-white">AI Analysis</h4>
        </div>
        <Button variant="outline" size="sm" onClick={onAnalyze} loading={analyzing}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh Analysis
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <TrendingUp className="h-3.5 w-3.5" />
            Lead Score
          </div>
          <p className={`mt-1 text-3xl font-black ${getLeadScoreColor(analysis.leadScore)}`}>
            {analysis.leadScore}
            <span className="text-base font-normal text-slate-400 dark:text-slate-500">/100</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Target className="h-3.5 w-3.5" />
            Confidence
          </div>
          <p className="mt-1 text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {analysis.confidenceScore}
            <span className="text-base font-normal text-slate-400 dark:text-slate-500">%</span>
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Summary</p>
        <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">{analysis.summary}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${PRIORITY_COLORS[analysis.priority]}`}>
          {analysis.priority} Priority
        </span>
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {analysis.category}
        </span>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${SENTIMENT_COLORS[analysis.sentiment]}`}>
          <Heart className="mr-1 h-3 w-3" />
          {analysis.sentiment}
        </span>
      </div>

      {analysis.tags?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Tag className="h-3.5 w-3.5" />
            Tags
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.tags.map((tag) => (
              <span key={tag} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <DollarSign className="h-3.5 w-3.5" />
          Estimated Deal Value
        </div>
        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(analysis.estimatedDealValue)}</p>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/40">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Zap className="h-3.5 w-3.5" />
          Recommended Next Action
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{analysis.recommendedNextAction}</p>
      </div>

      {analysis.analyzedAt && (
        <p className="text-xs text-slate-400 dark:text-slate-500">Last analyzed: {formatDate(analysis.analyzedAt)}</p>
      )}
    </div>
  );
};

export default LeadAnalysisPanel;
