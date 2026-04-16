import { Shield, Users, Star, Handshake } from 'lucide-react';

const AboutSection = () => {
  const values = [
    {
      icon: Shield,
      title: 'Rigorous Vetting',
      description: 'Every partner undergoes comprehensive due diligence'
    },
    {
      icon: Users,
      title: 'Direct Access',
      description: 'Connect directly with project developers and builders'
    },
    {
      icon: Star,
      title: 'Premium Selection',
      description: 'Carefully curated properties that meet our high standards'
    },
    {
      icon: Handshake,
      title: 'No Commissions',
      description: "We don't charge commissions or hidden fees"
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            About PrimeX Estates
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn more about our mission, values, and what sets us apart in the real estate industry
          </p>
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">Our Mission</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              PrimeX Estates was founded with a singular vision: to simplify the property acquisition
              process by connecting discerning clients directly with carefully vetted property
              developers and builders.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We bridge the gap between premium property seekers and reputable developers through a
              transparent, direct connection model that eliminates unnecessary intermediaries.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1170&q=80"
              alt="About PrimeX Estates"
              className="w-full h-80 object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Values Grid */}
        <div className="bg-card rounded-2xl p-10 shadow-card border border-border">
          <h3 className="text-2xl font-bold text-foreground text-center mb-10">What Sets Us Apart</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-muted transition-colors">
                <div className="w-16 h-16 bg-gold/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-gold" />
                </div>
                <h4 className="font-bold text-foreground mb-2">{value.title}</h4>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
