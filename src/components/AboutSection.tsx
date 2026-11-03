const AboutSection = () => {
  return (
    <section id="about" className="py-14 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground mb-4">
            About PrimeX Estates
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn more about our mission, values, and what sets us apart in the real estate industry
          </p>
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-8 md:mb-16">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Our Mission</h3>
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
              className="w-full h-56 sm:h-80 object-cover"
              loading="lazy"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
