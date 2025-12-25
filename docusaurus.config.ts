import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'BrewKits',
  tagline: 'Publishing Excellence for Flutter & Kotlin Multiplatform Libraries',
  favicon: 'img/icon.png',

  // Cấu hình URL quan trọng
  url: 'https://brewkits.dev',
  baseUrl: '/',

  // Cấu hình GitHub Deployment
  organizationName: 'brewkits',
  projectName: 'brewkits.github.io',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Cấu hình ngôn ngữ (mặc định tiếng Anh)
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Ảnh đại diện khi share link lên Facebook/Twitter
    image: 'img/banner.png',
    navbar: {
      title: 'BrewKits',
      logo: {
        alt: 'BrewKits Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/brewkits',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/brewkits',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BrewKits. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['dart', 'yaml'], // Hỗ trợ highlight code Dart/Flutter
    },
    colorMode: {
      defaultMode: 'dark', // Mặc định Dark mode cho ngầu
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;