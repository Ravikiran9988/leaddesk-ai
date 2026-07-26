import {
  Bot,
  Cog,
  Brain,
  Globe,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const services = [
  {
    icon: Bot,
    title: 'AI Chatbots',
    description: 'Intelligent conversational agents that handle customer support, lead qualification, and sales 24/7.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Cog,
    title: 'Automation',
    description: 'Streamline repetitive tasks with RPA and intelligent workflow automation that saves hours every week.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Brain,
    title: 'Machine Learning',
    description: 'Custom ML models for prediction, classification, and anomaly detection tailored to your data.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Globe,
    title: 'Web Development',
    description: 'Modern, responsive web applications built with React, Node.js, and cloud-native architecture.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Cross-platform mobile solutions with AI-powered features for iOS and Android.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Sparkles,
    title: 'GenAI Solutions',
    description: 'Leverage GPT, Claude, and custom LLMs for content generation, analysis, and creative workflows.',
    color: 'from-brand-500 to-blue-600',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
            End-to-End AI Solutions
          </h2>
          <p className="text-lg text-slate-600">
            From strategy to deployment, we cover every aspect of your AI transformation journey.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <service.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
