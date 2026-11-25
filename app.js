'use strict';

const root = document.documentElement;
let language = 'zh';
try { language = localStorage.getItem('ww-portfolio-language') === 'en' ? 'en' : 'zh'; } catch { /* Storage can be disabled. */ }
const languageButton = document.querySelector('#language');
const menuButton = document.querySelector('.menu-btn');
const menu = document.querySelector('#menu');
const dialog = document.querySelector('#project-dialog');
const toast = document.querySelector('#toast');
const copyButton = document.querySelector('#copy-email');
let currentProject = null;
let toastTimer;
let previousFocus = null;

const projects = {
  shopping: {
    en: {
      kicker: 'Web application · Frontend Lead', title: 'Shopping Management System',
      intro: 'A React-based workspace that brings product catalogs, orders, inventory, and configurable forms into a connected management experience.',
      details: [
        ['The challenge', 'Keep data-heavy operations manageable', 'Product management involves large lists, changing inventory, and repetitive workflows. The interface needs clear information hierarchy and a data layer that can keep pace.'],
        ['Architecture', 'Separate server data from interface state', 'React 18 and TypeScript form the application foundation. Zustand handles interface state; React Query supports server-data fetching and cache management.'],
        ['Interaction', 'Design around real operational workflows', 'Virtual scrolling keeps large product lists focused on visible rows. WebSocket updates connect order and inventory changes to the interface; React DnD enables configurable form layouts.']
      ],
      note: 'Frontend Lead · June 2024 – April 2025 · React 18 / TypeScript / Zustand / React Query',
      demo: 'Open live demo', github: 'GitHub profile'
    },
    zh: {
      kicker: 'Web 应用 · 前端负责人', title: '购物管理系统',
      intro: '基于 React 的管理工作空间，将商品目录、订单、库存与可配置表单连接起来，让日常运营操作更清晰。',
      details: [
        ['业务挑战', '把数据密集的操作变得可管理', '大规模商品列表、持续变化的库存与重复性操作，对信息组织和数据流转提出了要求。项目围绕列表可用性、状态同步和操作效率展开。'],
        ['架构思路', '区分服务端数据与界面状态', '以 React 18 和 TypeScript 搭建应用基础，使用 Zustand 管理界面状态，React Query 处理服务端数据请求与缓存，让状态职责更明确。'],
        ['交互实现', '围绕实际工作流组织功能', '通过虚拟滚动聚焦当前可见的商品行，使用 WebSocket 推送连接订单与库存变化，并通过 React DnD 支持表单布局的拖拽配置。']
      ],
      note: '前端负责人 · 2024.06—2025.04 · React 18 / TypeScript / Zustand / React Query',
      demo: '访问在线演示', github: 'GitHub 个人主页'
    }
  },
  devtools: {
    en: {
      kicker: 'Desktop application · Core Developer', title: 'WeChat Mini Program DevTools',
      intro: 'A cross-platform desktop development workspace built with Electron, connecting editing, debugging, and publishing workflows for mini program development.',
      details: [
        ['The challenge', 'Reduce friction across the developer workflow', 'Development tools should help developers understand application behavior and move between development, debugging, and publishing without unnecessary context switching.'],
        ['Architecture', 'Bring the workflow into a desktop workspace', 'Electron provides the cross-platform application foundation. The work focuses on desktop architecture and integrating the tools needed across the development lifecycle.'],
        ['Developer experience', 'Make behavior visible and extensions possible', 'Real-time error logs and performance profiling tools support investigation. Third-party plugin and SDK integrations provide a path for custom feature extensions.']
      ],
      note: 'Core Developer · December 2023 – June 2024 · Electron / Desktop Architecture / SDK Integration',
      github: 'GitHub profile'
    },
    zh: {
      kicker: '桌面应用 · 核心开发者', title: '微信小程序开发工具',
      intro: '以 Electron 构建跨平台桌面开发工作空间，围绕小程序开发、调试和发布，让工具之间的流程衔接更顺畅。',
      details: [
        ['开发挑战', '减少开发流程中的切换成本', '开发工具需要帮助使用者理解程序行为，并在开发、调试与发布环节中保持清晰的上下文。项目关注统一工作空间中的流程整合。'],
        ['架构思路', '把工具流程整合到桌面工作空间', '通过 Electron 提供跨平台应用基础，围绕桌面应用架构和开发生命周期内的工具集成展开实现。'],
        ['开发体验', '让问题可观察，让能力可扩展', '通过实时错误日志与性能分析工具辅助问题定位，并通过第三方插件与 SDK 集成，为自定义功能扩展预留空间。']
      ],
      note: '核心开发者 · 2023.12—2024.06 · Electron / 桌面应用架构 / SDK 集成',
      github: 'GitHub 个人主页'
    }
  }
};

const zh = () => language === 'zh';

function translate(nextLanguage) {
  language = nextLanguage;
  root.lang = zh() ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-en][data-zh]').forEach(element => { element.textContent = element.dataset[language]; });
  document.querySelectorAll('[data-label-en][data-label-zh]').forEach(element => { element.setAttribute('aria-label', zh() ? element.dataset.labelZh : element.dataset.labelEn); });
  languageButton.textContent = zh() ? 'EN' : '中';
  languageButton.setAttribute('aria-label', zh() ? '切换到英文' : 'Switch to Chinese');
  updateMenuLabel();
  document.querySelector('.dialog-close')?.setAttribute('aria-label', zh() ? '关闭项目详情' : 'Close project details');
  if (copyButton) {
    copyButton.setAttribute('aria-label', zh() ? '复制邮箱地址' : 'Copy email address');
    copyButton.title = zh() ? '复制邮箱地址' : 'Copy email address';
  }
  document.title = (zh() ? document.body.dataset.titleZh : document.body.dataset.titleEn) || 'Wan Wenxuan';
  try { localStorage.setItem('ww-portfolio-language', language); } catch { /* The page works without storage. */ }
  if (dialog?.open && currentProject) renderProject(currentProject);
  document.dispatchEvent(new CustomEvent('portfolio:language', {detail: language}));
}
languageButton.addEventListener('click', () => translate(zh() ? 'en' : 'zh'));

/* ---------- full-screen menu ---------- */
const outside = [document.querySelector('main'), document.querySelector('footer'), document.querySelector('.skip-link')].filter(Boolean);
function updateMenuLabel() {
  const open = menu.classList.contains('open');
  menuButton.setAttribute('aria-label', open ? (zh() ? '关闭菜单' : 'Close menu') : (zh() ? '打开菜单' : 'Open menu'));
}
function setMenu(open, {restoreFocus = true} = {}) {
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  outside.forEach(element => { element.inert = open; });
  updateMenuLabel();
  document.dispatchEvent(new CustomEvent('portfolio:menu', {detail: open}));
  if (open) setTimeout(() => menu.querySelector('a')?.focus({preventScroll: true}), 350);
  else if (restoreFocus) menuButton.focus({preventScroll: true});
}
menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, {restoreFocus: false})));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

/* ---------- project overview dialog ---------- */
function renderProject(key) {
  const project = projects[key][language];
  document.querySelector('#dialog-kicker').textContent = project.kicker;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-intro').textContent = project.intro;
  const content = document.querySelector('#dialog-content');
  content.replaceChildren();
  project.details.forEach(([label, title, description]) => {
    const section = document.createElement('section'); section.className = 'dialog-detail';
    const eyebrow = document.createElement('span'); eyebrow.textContent = label;
    const heading = document.createElement('h3'); heading.textContent = title;
    const paragraph = document.createElement('p'); paragraph.textContent = description;
    section.append(eyebrow, heading, paragraph); content.append(section);
  });
  const note = document.createElement('p'); note.className = 'dialog-note'; note.textContent = project.note; content.append(note);
  const links = document.querySelector('#dialog-links'); links.replaceChildren(); links.className = 'dialog-actions';
  const caseLink = document.createElement('a'); caseLink.href = './case-' + key + '.html'; caseLink.className = 'button';
  caseLink.textContent = (zh() ? '阅读完整案例' : 'Read full case study') + ' ↗'; links.append(caseLink);
  if (key === 'shopping') {
    const demo = document.createElement('a'); demo.href = 'https://mist-ben.github.io/shopping/'; demo.className = 'button';
    demo.target = '_blank'; demo.rel = 'noopener noreferrer'; demo.textContent = project.demo + ' ↗'; links.append(demo);
  }
  const github = document.createElement('a'); github.href = 'https://github.com/mist-ben'; github.className = 'text-link';
  github.target = '_blank'; github.rel = 'noopener noreferrer'; github.textContent = project.github + ' ↗'; links.append(github);
}

if (dialog) {
  document.querySelectorAll('.project-open').forEach(button => button.addEventListener('click', () => {
    previousFocus = button; currentProject = button.dataset.project;
    renderProject(currentProject); dialog.showModal(); dialog.scrollTop = 0;
    document.body.classList.add('dialog-open'); document.dispatchEvent(new CustomEvent('portfolio:menu', {detail: true}));
    document.querySelector('.dialog-close').focus({preventScroll: true});
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open'); currentProject = null;
    document.dispatchEvent(new CustomEvent('portfolio:menu', {detail: false}));
    previousFocus?.focus({preventScroll: true});
  });
}

/* ---------- copy email ---------- */
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('show'); toastTimer = setTimeout(() => toast.classList.remove('show'), 3000); }
copyButton?.addEventListener('click', async () => {
  const email = '2975008537@qq.com';
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(email);
    showToast(zh() ? '邮箱已复制，期待你的来信。' : 'Email copied. Looking forward to hearing from you.');
  } catch {
    const range = document.createRange(); range.selectNodeContents(document.querySelector('.email'));
    window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range);
    showToast(zh() ? '邮箱已选中，请按 Ctrl+C 或长按复制。' : 'Email selected. Press Ctrl+C or long-press to copy.');
  }
});

translate(language);
