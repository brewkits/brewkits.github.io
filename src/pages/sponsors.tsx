import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
// import SponsorshipTiers from '@site/src/components/SponsorshipTiers';
import styles from './sponsors.module.css';

function SponsorsHeader() {
  return (
    <header className={styles.sponsorsHeader}>
      <div className="container">
        <Heading as="h1" className={styles.headerTitle}>
          Become a Sponsor
        </Heading>
        <p className={styles.headerSubtitle}>
          Brewing Production-Ready Infrastructure for Mobile Developers
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
      name: 'flutter_debounce_throttle',
      icon: '🎯',
      description: 'Traffic Control System for your app. Stop double-taps, spam API calls, and button hammering. Zero dependencies, 500+ tests.',
      impact: 'Prevents payment duplicates & saves API costs',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: 'https://github.com/brewkits/flutter_debounce_throttle',
      platform: 'Flutter',
    },
    {
      name: 'native_workmanager',
      icon: '⚡',
      description: 'Background tasks without Flutter Engine. Native Workers save 90% RAM. Perfect for sync, downloads, and file processing.',
      impact: 'Survives app kills, reboots & force-quits',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: 'https://github.com/brewkits/native_workmanager',
      platform: 'Flutter',
    },
    {
      name: 'Grant',
      icon: '🛡️',
      description: 'Headless Permission Manager for KMP. Fixes Android Dead Clicks, validates iOS Info.plist, no Fragment/Activity needed.',
      impact: 'Works in ViewModels & Composables',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: 'https://github.com/brewkits/Grant',
      platform: 'KMP',
    },
    {
      name: 'kmpworkmanager',
      icon: '⚙️',
      description: 'Unified API for background tasks on Android & iOS. One codebase for WorkManager + BGTaskScheduler. Task Chains included.',
      impact: '60-86% faster HTTP operations',
      gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      link: 'https://github.com/brewkits/kmpworkmanager',
      platform: 'KMP',
    },
    {
      name: 'KRelay',
      icon: '🔗',
      description: 'Type-safe bridge from shared KMP code to native platforms. Dispatch UI commands without memory leaks or lost events.',
      impact: 'Perfect for Toast, Navigation, Permissions',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      link: 'https://github.com/brewkits/KRelay',
      platform: 'KMP',
    },
    {
      name: 'dart_debounce_throttle',
      icon: '🎲',
      description: 'Pure Dart traffic control for servers, CLI tools, and backend services. Same power as Flutter version, zero UI dependencies.',
      impact: 'Rate limiting for Dart Frog & Shelf servers',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      link: 'https://github.com/brewkits/flutter_debounce_throttle',
      platform: 'Dart',
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
              <a href={lib.link} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit'}}>
                <div className={styles.libraryCard}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                    <div className={styles.libraryIcon} style={{background: lib.gradient}}>
                      {lib.icon}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: 'var(--ifm-color-primary-lightest)',
                      color: 'var(--ifm-color-primary-darkest)',
                      fontWeight: 600
                    }}>
                      {lib.platform}
                    </span>
                  </div>
                  <Heading as="h3" className={styles.libraryName}>{lib.name}</Heading>
                  <p className={styles.libraryDescription}>{lib.description}</p>
                  <div className={styles.libraryImpact}>
                    <span className={styles.impactBadge}>💪 {lib.impact}</span>
                  </div>
                </div>
              </a>
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
          Thank you to everyone who supports BrewKits
        </p>
        <div className={styles.sponsorsGrid}>
          <div className={styles.sponsorPlaceholder}>
            <div className={styles.placeholderIcon}>🚀</div>
            <p className={styles.placeholderText}>Be the first sponsor!</p>
            <p className={styles.placeholderSubtext}>Join us in building better mobile infrastructure</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportCTA() {
  return (
    <section className={styles.supportCTA}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            Support BrewKits Development
          </Heading>
          <p className={styles.ctaDescription}>
            If our libraries save you time and add value to your projects, consider buying me a coffee!
            Every contribution helps maintain and improve these tools.
          </p>
          <div className={styles.ctaButtons}>
            <a
              href="https://www.buymeacoffee.com/brewkits"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--primary button--lg"
              style={{fontSize: '1.2rem', padding: '1rem 2rem'}}
            >
              ☕ Buy Me a Coffee
            </a>
          </div>
          <p className={styles.ctaNote}>
            One-time or monthly support - whatever works for you!
          </p>
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
        <SupportCTA />
        {/* <SponsorshipTiers /> */}
        <CurrentSponsors />
      </main>
    </Layout>
  );
}
