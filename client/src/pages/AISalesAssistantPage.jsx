import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/ui/Button';
import { aiService } from '../services/aiService';
import { getErrorMessage } from '../utils/constants';

const QUICK_PROMPTS = [
  'Show high priority leads',
  "Summarize today's leads",
  'Which leads need follow-up?',
  'Give me AI recommendations',
];

const AISalesAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Sales Assistant. Ask me about your leads, priorities, follow-ups, or get recommendations.",
      highlights: [],
      suggestedActions: QUICK_PROMPTS,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const { data } = await aiService.chat(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.data.reply,
          highlights: data.data.highlights || [],
          suggestedActions: data.data.suggestedActions || [],
        },
      ]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please check that the AI service is configured and try again.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AdminLayout
      title="AI Sales Assistant"
      subtitle="Ask questions about your leads and get actionable recommendations"
    >
      <div className="mx-auto flex h-[calc(100vh-220px)] max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white'
                        : msg.isError
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.highlights?.length > 0 && (
                    <ul className="space-y-1 text-left text-sm text-slate-600">
                      {msg.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {msg.suggestedActions?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedActions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => sendMessage(action)}
                          disabled={loading}
                          className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <Bot className="h-4 w-4 text-slate-600" />
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your leads..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            />
            <Button type="submit" disabled={!input.trim() || loading} loading={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AISalesAssistantPage;
