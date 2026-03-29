// Mobile sidebar toggle
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
  sidebar.classList.add('open');
  if (sidebarOverlay) sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

// Close sidebar when clicking a link (mobile)
document.querySelectorAll('.sidebar-nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  });
});

// Active section highlighting
const sections = document.querySelectorAll('.section[id]');
const navLinks = document.querySelectorAll('.sidebar-nav a');

function updateActiveLink() {
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + id) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

// Copy to clipboard + language labels for code blocks
document.querySelectorAll('pre').forEach(block => {
  // Copy button
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'Copy';
  block.appendChild(btn);

  btn.addEventListener('click', async () => {
    const code = block.querySelector('code');
    const text = code ? code.textContent : block.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    } catch {
      btn.textContent = 'Failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    }
  });

  // Language label
  const code = block.querySelector('code');
  const langMatch = code?.className.match(/language-(\w+)/);
  if (langMatch) {
    const label = document.createElement('span');
    label.className = 'code-lang-label';
    label.textContent = langMatch[1].toUpperCase();
    block.appendChild(label);
  }
});

// Fade-in animations with IntersectionObserver
const fadeElements = document.querySelectorAll('.section, .feature-card, .arch-diagram');
fadeElements.forEach(el => el.classList.add('fade-in-section'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

fadeElements.forEach(el => fadeObserver.observe(el));

// Back to top button
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Hero terminal typing animation
(function initTerminal() {
  const typedEl = document.getElementById('typed-command');
  const cursorEl = document.getElementById('terminal-cursor');
  const outputEl = document.getElementById('terminal-output');
  if (!typedEl || !outputEl) return;

  const command = 'npx ui-context generate -s ./src/components -p react';
  const outputLines = [
    { text: '  Parsing 12 component files...', cls: 'line-muted', delay: 300 },
    { text: '  Found 12 components with 47 props', cls: 'line-accent', delay: 600 },
    { text: '  Generated components.json', cls: 'line-success', delay: 400 },
    { text: '  Generated mcp-config.json', cls: 'line-success', delay: 300 },
    { text: '  Done in 1.2s', cls: 'line-success', delay: 400 },
  ];

  let charIndex = 0;

  function typeChar() {
    if (charIndex < command.length) {
      typedEl.textContent += command[charIndex];
      charIndex++;
      setTimeout(typeChar, 30 + Math.random() * 40);
    } else {
      if (cursorEl) cursorEl.style.display = 'none';
      showOutput(0);
    }
  }

  function showOutput(lineIndex) {
    if (lineIndex >= outputLines.length) return;
    const { text, cls, delay } = outputLines[lineIndex];
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = cls;
      div.textContent = text;
      div.style.opacity = '0';
      div.style.transform = 'translateY(4px)';
      div.style.transition = 'opacity 0.3s, transform 0.3s';
      outputEl.appendChild(div);
      requestAnimationFrame(() => {
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
      });
      showOutput(lineIndex + 1);
    }, delay);
  }

  // Start typing when hero is visible
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(typeChar, 500);
        heroObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const hero = document.querySelector('.hero');
  if (hero) heroObserver.observe(hero);
})();
