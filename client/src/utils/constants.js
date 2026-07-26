export const BUDGET_OPTIONS = [
  'Below $500',
  '$500-$1000',
  '$1000-$5000',
  'Above $5000',
];

export const STATUS_OPTIONS = ['New', 'Contacted', 'Closed'];

export const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-700 border-blue-200',
  Contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  Closed: 'bg-green-100 text-green-700 border-green-200',
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join(', ');
  }
  return error.response?.data?.message || error.message || 'Something went wrong';
};
