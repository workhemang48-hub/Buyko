import { Repeat, BadgeCheck, Headphones } from 'lucide-react';

function TrustBadges() {
  const badges = [
    {
      icon: Repeat,
      title: 'Easy Exchange Policy',
      subtitle: 'We offer hassle free exchange policy',
    },
    {
      icon: BadgeCheck,
      title: '7 Days Return Policy',
      subtitle: 'We provide 7 days free return policy',
    },
    {
      icon: Headphones,
      title: 'Best Customer Support',
      subtitle: 'We provide 24/7 customer support',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
      {badges.map(({ icon: Icon, title, subtitle }) => (
        <div key={title} className="flex flex-col items-center gap-3">
          <Icon className="w-8 h-8 text-buyko-text" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-buyko-text">{title}</h3>
          <p className="text-sm text-buyko-text-dim">{subtitle}</p>
        </div>
      ))}
    </section>
  );
}

export default TrustBadges;