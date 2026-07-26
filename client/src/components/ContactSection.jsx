import { useState } from 'react';
import { Send } from 'lucide-react';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import { BUDGET_OPTIONS } from '../utils/constants';
import { leadService } from '../services/leadService';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', budget: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await leadService.create(form);
      setSuccess('Thanks! Your lead has been submitted successfully.');
      setForm({ name: '', email: '', budget: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit your lead right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-slate-900 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Get Started</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Ready to turn your next opportunity into a qualified lead?</h2>
            <p className="mt-4 text-lg text-slate-300">
              Share your requirements and we’ll follow up with a tailored plan for your AI initiative.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-800/70 p-6 shadow-2xl shadow-black/20">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="mt-4">
              <Select label="Budget" name="budget" options={BUDGET_OPTIONS} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} required />
            </div>
            <div className="mt-4">
              <Textarea label="Project Brief" name="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            {success && <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p>}
            <div className="mt-6">
              <Button type="submit" className="w-full" loading={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Lead'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
