import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'f31'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '182'),
    exact: true
  },
  {
    path: '/blog/authors',
    component: ComponentCreator('/blog/authors', '0b7'),
    exact: true
  },
  {
    path: '/blog/authors/brewkits',
    component: ComponentCreator('/blog/authors/brewkits', '296'),
    exact: true
  },
  {
    path: '/blog/flutter-publishing-guide',
    component: ComponentCreator('/blog/flutter-publishing-guide', '093'),
    exact: true
  },
  {
    path: '/blog/kmp-getting-started',
    component: ComponentCreator('/blog/kmp-getting-started', '303'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', '287'),
    exact: true
  },
  {
    path: '/blog/tags/announcement',
    component: ComponentCreator('/blog/tags/announcement', 'e2c'),
    exact: true
  },
  {
    path: '/blog/tags/brewkits',
    component: ComponentCreator('/blog/tags/brewkits', '816'),
    exact: true
  },
  {
    path: '/blog/tags/flutter',
    component: ComponentCreator('/blog/tags/flutter', '8b8'),
    exact: true
  },
  {
    path: '/blog/tags/kmp',
    component: ComponentCreator('/blog/tags/kmp', 'e7c'),
    exact: true
  },
  {
    path: '/blog/tags/kotlin',
    component: ComponentCreator('/blog/tags/kotlin', '50b'),
    exact: true
  },
  {
    path: '/blog/tags/multiplatform',
    component: ComponentCreator('/blog/tags/multiplatform', 'b2c'),
    exact: true
  },
  {
    path: '/blog/tags/pub-dev',
    component: ComponentCreator('/blog/tags/pub-dev', 'a72'),
    exact: true
  },
  {
    path: '/blog/tags/publishing',
    component: ComponentCreator('/blog/tags/publishing', '472'),
    exact: true
  },
  {
    path: '/blog/tags/tutorial',
    component: ComponentCreator('/blog/tags/tutorial', '5fd'),
    exact: true
  },
  {
    path: '/blog/welcome-to-brewkits',
    component: ComponentCreator('/blog/welcome-to-brewkits', '139'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '3d7'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '862'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '38f'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'd99'),
            routes: [
              {
                path: '/docs/flutter/best-practices',
                component: ComponentCreator('/docs/flutter/best-practices', 'b48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/flutter/getting-started',
                component: ComponentCreator('/docs/flutter/getting-started', '771'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/flutter/publishing',
                component: ComponentCreator('/docs/flutter/publishing', 'a10'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/kmp/best-practices',
                component: ComponentCreator('/docs/kmp/best-practices', '3c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/kmp/getting-started',
                component: ComponentCreator('/docs/kmp/getting-started', 'e2d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/kmp/publishing',
                component: ComponentCreator('/docs/kmp/publishing', 'a36'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
