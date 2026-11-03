import { Landmark, Calculator, FileCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MortgageCTASection = () => {
  const features = [
    {
      icon: Landmark,
      title: 'Partner Banks',
      description: 'Browse verified mortgage providers and leasing firms.',
    },
    {
      icon: Calculator,
      title: 'Affordability Calculator',
      description: 'Estimate monthly payments based on income and down payment.',
    },
    {
      icon: FileCheck,
      title: 'Pre-Approval',
      description: 'Request pre-approval directly from your chosen partner.',
    },
  ];

  return (
    <section id="mortgage-cta" className="py-14 sm:py-20 bg-muted/50 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-[#1a365d] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 text-white overflow-hidden relative border border-gold/30 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">
                Mortgage & Leasing Hub
              </h2>
              <p className="text-base sm:text-lg text-white font-medium">
                Explore financing options, calculate affordability, and connect with trusted partners—all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:border-gold/60 hover:bg-white/20 transition-all"
                >
                  <feature.icon className="w-10 h-10 text-gold mb-4" />
                  <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-white text-sm font-medium">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/mortgage"
                className="inline-flex items-center justify-center gap-2 bg-gold text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-gold/90 transition-all shadow-lg w-full sm:w-auto"
              >
                Explore Mortgage Hub
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-10 flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
              <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white">
                <strong className="text-white font-bold">Disclaimer:</strong> All calculations and estimates provided are for informational purposes only.
                Actual rates, terms, and eligibility depend on the financial provider. Please consult licensed professionals for financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MortgageCTASection;