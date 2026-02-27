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
    name: 'Coffee Mate',
    price: '$5',
    icon: '☕',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    benefits: [
      'Access to exclusive posts & updates',
      'Supporter Badge on profile',
    ],
    ctaText: 'Become Coffee Mate',
    ctaLink: 'https://www.buymeacoffee.com/brewkits',
  },
  {
    name: 'Pro Brewer',
    price: '$10',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    popular: true,
    benefits: [
      'All Coffee Mate benefits',
      'Priority Issue Review for faster responses on issues/PRs',
      'Early access to beta/pre-release versions',
    ],
    ctaText: 'Become Pro Brewer',
    ctaLink: 'https://www.buymeacoffee.com/brewkits',
  },
  {
    name: 'Enterprise Sponsor',
    price: '$50',
    icon: '🏢',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    benefits: [
      'All Pro Brewer benefits',
      'Logo placement on popular repository READMEs',
      'Direct support channel',
      'Influence on roadmap priorities',
    ],
    ctaText: 'Become Enterprise Sponsor',
    ctaLink: 'https://www.buymeacoffee.com/brewkits',
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
            ☕ All memberships are managed through <strong>Buy Me a Coffee</strong>.
            Choose a tier that fits your needs and join our community of supporters.
          </p>
        </div>
      </div>
    </section>
  );
}
