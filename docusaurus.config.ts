const config = {
  title: 'BrewKits', // Tên thương hiệu
  tagline: 'The Traffic Control System for your App Architecture', // Slogan ngầu của bạn
  favicon: 'img/favicon.ico', // Nhớ thay logo ly cafe vào đây

  // QUAN TRỌNG: Cấu hình Domain
  url: 'https://brewkits.dev', 
  baseUrl: '/',

  // Cấu hình GitHub Deployment
  organizationName: 'brewkits',
  projectName: 'brewkits.github.io',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  themeConfig: {
    // Sửa Navbar
    navbar: {
      title: 'BrewKits',
      logo: {
        alt: 'BrewKits Logo',
        src: 'img/logo.svg', // Thay logo của bạn vào folder static/img
      },
      items: [
        {to: '/docs/intro', label: 'Docs', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/brewkits',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    // Chân trang
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} BrewKits. Built with Docusaurus.`,
    },
    // Mặc định Dark Mode cho ngầu
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  },
};