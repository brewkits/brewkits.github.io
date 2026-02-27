import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import SponsorshipTiers from '@site/src/components/SponsorshipTiers';
import styles from './sponsors.module.css';

function SponsorsHeader() {
  return (
    <header className={styles.sponsorsHeader}>
      <div className="container">
        <Heading as="h1" className={styles.headerTitle}>
          Become a Sponsor
        </Heading>
        <p className={styles.headerSubtitle}>
          Help us maintain and improve world-class libraries for Flutter & Kotlin Multiplatform
        </p>
      </div>
    </header>
  );
}

function WhySponsor() {
  const reasons = [
    {
      icon: '⏱️',
      title: 'Save Development Time',
      description: 'Our libraries save you weeks of development. A $5 coffee is cheaper than 1 hour of developer time.',
    },
    {
      icon: '🛡️',
      title: 'Ensure Long-term Support',
      description: 'Your sponsorship ensures we can maintain these libraries for years, protecting your production apps.',
    },
    {
      icon: '🚀',
      title: 'Influence Roadmap',
      description: 'Sponsors get voting rights on new features and priority bug fixes for their production needs.',
    },
    {
      icon: '🌟',
      title: 'Support Open Source',
      description: 'Join other forward-thinking developers and companies in sustaining the open-source ecosystem.',
    },
  ];

  return (
    <section className={styles.whySponsor}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Why Sponsor BrewKits?
        </Heading>
        <div className="row">
          {reasons.map((reason, idx) => (
            <div key={idx} className="col col--6" style={{marginBottom: '2rem'}}>
              <div className={styles.reasonCard}>
                <div className={styles.reasonIcon}>{reason.icon}</div>
                <Heading as="h3" className={styles.reasonTitle}>{reason.title}</Heading>
                <p className={styles.reasonDescription}>{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurLibraries() {
  const libraries = [
    {
      name: 'Throttle & Debounce Universal',
      icon: '🎯',
      description: 'The most comprehensive throttle/debounce solution. Prevents thousands of redundant API calls.',
      impact: 'Used in production apps with 1M+ users',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      name: 'HTML Viewer Pro',
      icon: '🎨',
      description: 'Rendering HTML in Flutter is hell. We solved it with the highest-quality solution available.',
      impact: 'Handles complex HTML that others break on',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      name: 'KMP WorkManager',
      icon: '⚙️',
      description: 'Best-in-class background task manager for Kotlin Multiplatform. One code, works everywhere.',
      impact: 'Unified background jobs for Android & iOS',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <section className={styles.libraries}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          What You're Supporting
        </Heading>
        <p className={styles.sectionSubtitle}>
          These aren't hobby projects. They're production-grade solutions trusted by developers worldwide.
        </p>
        <div className="row">
          {libraries.map((lib, idx) => (
            <div key={idx} className="col col--4" style={{marginBottom: '2rem'}}>
              <div className={styles.libraryCard}>
                <div className={styles.libraryIcon} style={{background: lib.gradient}}>
                  {lib.icon}
                </div>
                <Heading as="h3" className={styles.libraryName}>{lib.name}</Heading>
                <p className={styles.libraryDescription}>{lib.description}</p>
                <div className={styles.libraryImpact}>
                  <span className={styles.impactBadge}>💪 {lib.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurrentSponsors() {
  return (
    <section className={styles.currentSponsors}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Our Amazing Sponsors
        </Heading>
        <p className={styles.sectionSubtitle}>
          Thank you to these individuals and companies who believe in our mission
        </p>
        <div className={styles.sponsorsGrid}>
          <div className={styles.sponsorPlaceholder}>
            <div className={styles.placeholderIcon}>🚀</div>
            <p className={styles.placeholderText}>Be the first sponsor!</p>
            <p className={styles.placeholderSubtext}>Your name or logo could be here</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Sponsors(): ReactNode {
  return (
    <Layout
      title="Sponsors"
      description="Support BrewKits development and help us maintain world-class libraries for Flutter and Kotlin Multiplatform">
      <SponsorsHeader />
      <main>
        <WhySponsor />
        <OurLibraries />
        <SponsorshipTiers />
        <CurrentSponsors />
      </main>
    </Layout>
  );
}
