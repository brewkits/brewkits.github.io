import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
  gradient: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Flutter Libraries',
    icon: '🦋',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: (
      <>
        Publishing high-quality Flutter packages to pub.dev with best practices,
        comprehensive documentation, and reliable maintenance.
      </>
    ),
  },
  {
    title: 'Kotlin Multiplatform',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: (
      <>
        Crafting KMP libraries for klibs.io with cross-platform excellence,
        supporting Android, iOS, and beyond.
      </>
    ),
  },
  {
    title: 'Open Source Excellence',
    icon: '⭐',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: (
      <>
        Committed to building trusted, well-documented libraries that developers
        can rely on. Join us in creating better mobile experiences.
      </>
    ),
  },
];

function Feature({title, icon, description, gradient}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon} style={{ background: gradient }}>
          {icon}
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <Heading as="h2" className={styles.featuresTitle}>
            Why Choose BrewKits?
          </Heading>
          <p className={styles.featuresSubtitle}>
            We brew the finest libraries for your mobile applications
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
