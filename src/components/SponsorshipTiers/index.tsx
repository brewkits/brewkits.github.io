import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type TierItem = {
  name: string;
  price: string;
  icon: string;
  gradient: string;
  popular?: boolean;
  benefits: string[];
  ctaText: string;
  ctaLink: string;
};

const TiersList: TierItem[] = [
  {
    name: 'Casual Brewer',
    price: '$5',
    icon: '☕',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    benefits: [
      'Supporter badge on Discord',
      'Name in CONTRIBUTORS.md',
      'Early access to updates',
      'Support indie development',
    ],
    ctaText: 'Buy Me a Coffee',
    ctaLink: 'https://www.buymeacoffee.com/brewkits',
  },
  {
    name: 'Silver Partner',
    price: '$50',
    icon: '🥈',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    popular: true,
    benefits: [
      'All Casual Brewer benefits',
      'Company logo in README',
      'Priority issue response',
      'Monthly project updates',
      'Feature voting rights',
    ],
    ctaText: 'Become Silver Partner',
    ctaLink: 'https://github.com/sponsors/brewkits',
  },
  {
    name: 'Gold Partner',
    price: '$100+',
    icon: '🥇',
    gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    benefits: [
      'All Silver Partner benefits',
      'Large logo on brewkits.dev',
      'Dedicated support channel',
      'Custom feature requests',
      'SLA guarantee',
      'Annual consultation call',
    ],
    ctaText: 'Contact for Gold',
    ctaLink: 'mailto:contact@brewkits.dev',
  },
];

function Tier({name, price, icon, gradient, popular, benefits, ctaText, ctaLink}: TierItem) {
  return (
    <div className={clsx('col col--4', styles.tierCol)}>
      <div className={clsx(styles.tierCard, popular && styles.tierCardPopular)}>
        {popular && <div className={styles.popularBadge}>Most Popular</div>}
        <div className={styles.tierIcon} style={{ background: gradient }}>
          {icon}
        </div>
        <Heading as="h3" className={styles.tierName}>{name}</Heading>
        <div className={styles.tierPrice}>
          {price}
          <span className={styles.tierPeriod}>/month</span>
        </div>
        <ul className={styles.benefitsList}>
          {benefits.map((benefit, idx) => (
            <li key={idx} className={styles.benefitItem}>
              <span className={styles.checkIcon}>✓</span>
              {benefit}
            </li>
          ))}
        </ul>
        <a
          href={ctaLink}
          className={clsx('button', 'button--primary', 'button--lg', styles.tierCta)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}

export default function SponsorshipTiers(): ReactNode {
  return (
    <section className={styles.tiers}>
      <div className="container">
        <div className={styles.tiersHeader}>
          <Heading as="h2" className={styles.tiersTitle}>
            Support BrewKits Development
          </Heading>
          <p className={styles.tiersSubtitle}>
            Choose a tier that fits your needs. All contributions help us maintain and improve our libraries.
          </p>
        </div>
        <div className="row">
          {TiersList.map((props, idx) => (
            <Tier key={idx} {...props} />
          ))}
        </div>
        <div className={styles.tiersFooter}>
          <p className={styles.footerNote}>
            💼 <strong>Enterprise solutions?</strong> We offer custom licensing and dedicated support for companies.
            <a href="mailto:contact@brewkits.dev"> Contact us</a> for a tailored plan.
          </p>
        </div>
      </div>
    </section>
  );
}
