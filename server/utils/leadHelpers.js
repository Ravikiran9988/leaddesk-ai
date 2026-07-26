export const normalizeStatus = (status) => (status === 'Closed' ? 'Won' : status);

export const addActivity = (lead, { type, description, user, metadata = {} }) => {
  lead.activities.unshift({
    type,
    description,
    user: user?._id || user,
    metadata,
  });
};

export const buildLeadQuery = (req) => {
  const {
    search = '',
    status = '',
    priority = '',
    category = '',
    source = '',
    assignedTo = '',
    budget = '',
    dateFrom = '',
    dateTo = '',
  } = req.query;

  const query = {};
  const andConditions = [];

  if (req.user.role === 'sales_executive') {
    query.assignedTo = req.user._id;
  } else if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  if (search) {
    andConditions.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { 'aiAnalysis.category': { $regex: search, $options: 'i' } },
        { 'aiAnalysis.tags': { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (status) {
    if (status === 'Won') {
      query.status = { $in: ['Won', 'Closed'] };
    } else {
      query.status = status;
    }
  }

  if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
    query['aiAnalysis.priority'] = priority;
  }

  if (category) {
    andConditions.push({
      $or: [
        { category: { $regex: category, $options: 'i' } },
        { 'aiAnalysis.category': { $regex: category, $options: 'i' } },
      ],
    });
  }

  if (source && ['Website', 'LinkedIn', 'Instagram', 'Referral', 'Walk-in'].includes(source)) {
    query.source = source;
  }

  if (budget && ['Below $500', '$500-$1000', '$1000-$5000', 'Above $5000'].includes(budget)) {
    query.budget = budget;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  return query;
};

export const canAccessLead = (user, lead) => {
  if (['admin', 'manager'].includes(user.role)) return true;
  if (user.role === 'sales_executive') {
    return lead.assignedTo?.toString() === user._id.toString();
  }
  return false;
};

export const canModifyLead = (user) => ['admin', 'manager', 'sales_executive'].includes(user.role);

export const canDeleteLead = (user) => ['admin', 'manager'].includes(user.role);

export const KANBAN_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
];

export const buildStatusStats = (stats) => {
  const counts = {};
  KANBAN_STATUSES.forEach((s) => {
    counts[s] = 0;
  });

  stats.forEach((s) => {
    const key = normalizeStatus(s._id);
    if (counts[key] !== undefined) {
      counts[key] += s.count;
    }
  });

  return counts;
};
