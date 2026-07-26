import { Shield, Clock, Award, HeadphonesIcon } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance with GDPR, SOC 2, and industry standards.',
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Agile development with MVPs delivered in weeks, not months.',
  },
  {
    icon: Award,
    title: 'Proven Expertise',
    description: 'Team of certified AI engineers with experience across 20+ industries.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Dedicated Support',
    description: '24/7 monitoring, maintenance, and optimization for all deployed solutions.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-6">
              Built for Results, Not Just Demos
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              We don&apos;t just build AI — we build AI that works in production, scales with your business, and delivers measurable ROI from day one.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-square gradient-bg p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  {[
                    { label: 'Accuracy Rate', value: '99.2%' },
                    { label: 'Cost Reduction', value: '45%' },
                    { label: 'Time Saved', value: '60hrs/wk' },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                      <p className="text-white/70 text-sm">{metric.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
