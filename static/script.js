// ============================================
// 主题切换功能
// ============================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const bodyEl = document.body;
    const savedTheme = localStorage.getItem('theme') || 'light';
    bodyEl.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const currentTheme = bodyEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        bodyEl.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
    });
}

// ============================================
// 移动端菜单功能
// ============================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
}

// ============================================
// 滚动时 header 样式变化
// ============================================
function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ============================================
// 返回顶部功能
// ============================================
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// 复制 RSS 地址
// ============================================
window.copyRssUrl = function(event) {
    const urlInput = document.getElementById('rssUrl');
    if (!urlInput) return;
    
    urlInput.select();
    urlInput.setSelectionRange(0, 99999);

    const btn = event?.target || document.querySelector('.subscribe-button');
    const originalText = btn.textContent;
    
    navigator.clipboard.writeText(urlInput.value).then(() => {
        btn.textContent = '已复制!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        document.execCommand('copy');
        btn.textContent = '已复制!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
};

// ============================================
// 初始化所有功能
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initMobileMenu();
    initHeaderScroll();
    initBackToTop();
});