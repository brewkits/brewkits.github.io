import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import BuyMeACoffee from '@site/src/components/BuyMeACoffee';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Explore Our Libraries
          </Link>
          <Link
            className="button button--primary button--lg"
            to="/blog"
            style={{marginLeft: '1rem'}}>
            Read Our Blog
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Publishing excellence for Flutter and Kotlin Multiplatform libraries. Trusted by developers worldwide.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className={styles.valueSection}>
          <div className="container">
            <div className={styles.valueContent}>
              <div className={styles.valueIcon}>💡</div>
              <Heading as="h2" className={styles.valueTitle}>
                Your App Uses Our Libraries in Production?
              </Heading>
              <p className={styles.valueDescription}>
                Our libraries save you <strong>weeks of development time</strong>. A $5 coffee is cheaper than 1 hour of developer salary.
                Help us maintain and improve these tools that power your business.
              </p>
              <div className={styles.valueStats}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>10,000+</div>
                  <div className={styles.statLabel}>Hours Saved</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>1M+</div>
                  <div className={styles.statLabel}>End Users</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>100%</div>
                  <div className={styles.statLabel}>Production Ready</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.supportSection}>
          <div className="container">
            <div className={styles.supportContent}>
              <h2 className={styles.supportTitle}>Support Independent Development</h2>
              <p className={styles.supportDescription}>
                BrewKits is <strong>independently maintained</strong>. Your sponsorship ensures these libraries stay updated,
                secure, and free for everyone. Companies using our libraries in commercial apps should consider sponsoring.
              </p>
              <div className={styles.ctaButtons}>
                <Link
                  className="button button--primary button--lg"
                  to="/sponsors"
                  style={{marginRight: '1rem'}}>
                  ⭐ View Sponsorship Tiers
                </Link>
                <BuyMeACoffee />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
