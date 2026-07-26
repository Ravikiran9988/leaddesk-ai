import {
  UserPlus,
  MessageSquare,
  Tag,
  FileUp,
  RefreshCw,
  CircleDot,
  FolderOpen,
} from 'lucide-react';
import { formatDate } from '../utils/constants';

const ACTIVITY_ICONS = {
  created: CircleDot,
  status_changed: RefreshCw,
  assigned: UserPlus,
  note_added: MessageSquare,
  tag_added: Tag,
  tag_removed: Tag,
  category_changed: FolderOpen,
  file_uploaded: FileUp,
  updated: RefreshCw,
};

const ActivityTimeline = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = ACTIVITY_ICONS[activity.type] || CircleDot;
        return (
          <div key={activity._id || index} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 border-b border-slate-100 pb-4">
              <p className="text-sm text-slate-800">{activity.description}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>{formatDate(activity.createdAt)}</span>
                {activity.user?.name && <span>by {activity.user.name}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
