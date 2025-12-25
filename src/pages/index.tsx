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
        <section style={{background: 'var(--ifm-background-surface-color)', paddingBottom: '2rem'}}>
          <div className="container">
            <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Support Our Work</h2>
            <p style={{textAlign: 'center', marginBottom: '1.5rem', color: 'var(--ifm-color-emphasis-600)'}}>
              If you find our libraries useful, consider buying us a coffee to support continued development!
            </p>
            <BuyMeACoffee />
          </div>
        </section>
      </main>
    </Layout>
  );
}
