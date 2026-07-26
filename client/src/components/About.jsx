import { Target, Users, Lightbulb } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">About Us</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Your Partner in AI Innovation
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            AI LeadDesk Mini is a boutique AI consultancy dedicated to helping businesses of all sizes harness the power of artificial intelligence. We bridge the gap between cutting-edge technology and practical business outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: 'Mission-Driven',
              description: 'We democratize AI by making enterprise-grade solutions accessible to startups and SMBs alike.',
            },
            {
              icon: Users,
              title: 'Client-Centric',
              description: 'Every project starts with understanding your unique challenges, goals, and customer needs.',
            },
            {
              icon: Lightbulb,
              title: 'Innovation First',
              description: 'We stay ahead of the curve with the latest in LLMs, computer vision, and automation tech.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg hover:border-brand-100 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
