import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Button from './ui/Button';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-6">
              <CheckCircle2 className="h-4 w-4" />
              Trusted by 500+ businesses worldwide
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Transform Your Business with{' '}
              <span className="gradient-text">Intelligent AI</span> Solutions
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl">
              From smart chatbots to generative AI — we design, build, and deploy custom AI systems that drive growth, automate workflows, and delight your customers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Your AI Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="#services">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Explore Services
                </Button>
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { value: '500+', label: 'Projects Delivered' },
                { value: '98%', label: 'Client Satisfaction' },
                { value: '24/7', label: 'Support Available' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-bold text-brand-600">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-500/20 border border-slate-100">
              <div className="aspect-[4/3] gradient-bg p-8 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-white/80 text-sm">AI Assistant Online</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/20 rounded-xl p-3 text-white text-sm">
                      How can AI help my e-commerce store?
                    </div>
                    <div className="bg-white rounded-xl p-3 text-slate-700 text-sm ml-4">
                      I can build personalized product recommendations, automate customer support, and optimize inventory with ML models.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
              <p className="text-2xl font-bold text-brand-600">3x</p>
              <p className="text-xs text-slate-500">Average ROI Increase</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
