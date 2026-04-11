/*
 * Referral popup widget v2.0.0
 * - Fetches all enabled popups from backend
 * - Shows a centered overlay popup after a short delay
 * - Any click (CTA, close button, or overlay backdrop) triggers backgroundOpen
 * - Persists per-slug cookies so refreshed pages skip already-shown popups
 */
(function() {
  console.log('Referral popup widget version: v2.0.0');

  const DEBUG_PREFIX = '[ReferalPopup]';

  const log = (...args) => console.log(DEBUG_PREFIX, ...args);
  const warn = (...args) => console.warn(DEBUG_PREFIX, ...args);
  const error = (...args) => console.error(DEBUG_PREFIX, ...args);

  let jQueryLoaded = typeof jQuery !== 'undefined';
  let cookiesLoaded = typeof Cookies !== 'undefined';

  log('Bootstrap starting', { jQueryLoaded, cookiesLoaded });

  function getCookie(name) {
    if (typeof Cookies !== 'undefined') {
      return Cookies.get(name);
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return undefined;
  }

  function setCookie(name, value, options = {}) {
    if (typeof Cookies !== 'undefined') {
      return Cookies.set(name, value, options);
    }
    let cookieString = `${name}=${value}`;
    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    cookieString += `; path=${options.path || '/'}`;
    document.cookie = cookieString;
  }

  function ensureScript(src, onLoaded) {
    const tag = document.createElement('script');
    tag.src = src;
    tag.onload = onLoaded;
    tag.onerror = () => warn('Failed loading external script', src);
    document.head.appendChild(tag);
  }

  function checkAndInit() {
    if (jQueryLoaded && cookiesLoaded) {
      log('All dependencies ready, initializing');
      init();
    }
  }

  if (!jQueryLoaded) {
    log('Loading jQuery on demand');
    ensureScript('https://code.jquery.com/jquery-3.6.0.min.js', () => {
      jQueryLoaded = true;
      checkAndInit();
    });
  }

  if (!cookiesLoaded) {
    log('Loading js-cookie on demand');
    ensureScript('https://cdnjs.cloudflare.com/ajax/libs/js-cookie/3.0.5/js.cookie.min.js', () => {
      cookiesLoaded = true;
      checkAndInit();
    });
  }

  // If both libraries were already on the page
  checkAndInit();

  function init() {
    (function($) {
      log('init() called');

      const CONFIG = {
        REFERAL_API_URL: 'https://rakuado-43706e27163e.herokuapp.com/api/referal',
        COOKIE_EXPIRY_HOURS: 24,
        COOKIE_PREFIX: 'referal-opened-',
        POPUP_DELAY_MS: 3000      // Popup appears after 3s page load
      };

      // Defaults — can be extended via API serviceConfig in the future
      const AI_SERVICE = {
        serviceName: 'RakuAdo — AIクーポンファインダー',
        headline: 'AIが人気サイトのお得情報を自動発見！',
        subtext: 'Yahoo・TikTok・Temu など主要サイトを毎日チェック',
        accentHex: '#6366f1',
        logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%236366f1'/%3E%3Cpath d='M24 12l3 6.5L34 22l-7 3.5L24 32l-3-6.5L14 22l7-3.5z' fill='%23fff'/%3E%3Cpath d='M35 9l1.5 3L40 13.5l-3.5 1.5L35 18l-1.5-3L30 13.5l3.5-1.5z' fill='%23fff' opacity='.7'/%3E%3C/svg%3E"
      };

      const state = {
        currentPopup: null,
        popupRoot: null,
        popupTimeoutId: null,
        processingInteraction: false
      };

      $(document).ready(() => {
        log('Document ready, fetching enabled popups');
        fetchEnabledPopups();
      });

      const normalizeSlug = (slugRaw = '') => {
        if (typeof slugRaw !== 'string') return '';
        const sanitized = slugRaw
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/-{2,}/g, '-')
          .replace(/^-|-$/g, '');
        return sanitized || slugRaw.trim();
      };

      const resolveSlug = (popup) => {
        const direct = normalizeSlug(popup.slug);
        if (direct) {
          log('Resolved slug from popup.slug', { popupId: popup._id, raw: popup.slug, normalized: direct });
          return direct;
        }
        const fallback = `popup-${popup._id}`;
        log('Resolved slug via fallback', { popupId: popup._id, fallback });
        return fallback;
      };

      function fetchEnabledPopups() {
        fetch(`${CONFIG.REFERAL_API_URL}/enabled`)
          .then(res => res.json())
          .then(popups => {
            log('Enabled popups payload', popups);
            if (!Array.isArray(popups) || popups.length === 0) {
              log('No enabled popups available');
              return;
            }

            const enriched = popups
              .filter(Boolean)
              .map(p => {
                const resolvedSlug = resolveSlug(p);
                const snapshot = { ...p, slug: resolvedSlug };
                log('Enriched popup entry', snapshot);
                return snapshot;
              });

            const notOpened = enriched.filter(p => {
              const alreadyOpened = hasOpened(p.slug);
              log('Filter check', { popupId: p._id, slug: p.slug, alreadyOpened });
              return !alreadyOpened;
            });

            log('Filtered popups summary', { total: enriched.length, notOpened: notOpened.length });

            if (notOpened.length > 0) {
              const popup = notOpened[0];
              log('Selected popup for display', { popupId: popup._id, slug: popup.slug });
              schedulePopup(popup);
            } else {
              log('All popups already shown');
            }
          })
          .catch(err => error('Failed to fetch enabled popups', err));
      }

      function hasOpened(slug) {
        const cookieKey = CONFIG.COOKIE_PREFIX + slug;
        const rawValue = getCookie(cookieKey);
        const opened = Boolean(rawValue);
        log('Checking cookie status', { slug, cookieKey, rawValue, opened });
        return opened;
      }

      function markOpened(slug) {
        const cookieKey = CONFIG.COOKIE_PREFIX + slug;
        log('Persisting opened slug', { slug, cookieKey });
        setCookie(cookieKey, 'true', { expires: CONFIG.COOKIE_EXPIRY_HOURS / 24, path: '/' });
      }

      function schedulePopup(popup) {
        state.currentPopup = popup;
        registerView(popup._id);

        log('Scheduling popup display', { delay: CONFIG.POPUP_DELAY_MS, popupId: popup._id });

        state.popupTimeoutId = window.setTimeout(() => {
          log('Displaying popup', { popupId: popup._id });
          renderPopup(popup);
        }, CONFIG.POPUP_DELAY_MS);
      }

      function renderPopup(popup) {
        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'referal-popup-overlay';
        overlay.style.cssText = [
          'position:fixed',
          'top:0',
          'left:0',
          'width:100%',
          'height:100%',
          'background:rgba(0,0,0,0.7)',
          'z-index:2147483646',
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'pointer-events:auto'
        ].join(';');
        document.body.appendChild(overlay);

        // Shadow host
        const host = document.createElement('div');
        host.id = 'referal-popup-host';
        host.style.cssText = 'position:relative;z-index:2147483647;pointer-events:auto;';
        overlay.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        const accent = AI_SERVICE.accentHex;
        style.textContent = `
          :host { all: initial; }
          *, *::before, *::after { box-sizing: border-box; }
          .modal {
            background: #ffffff;
            border-radius: 20px;
            padding: 40px 36px;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3);
            text-align: center;
            position: relative;
            width: 400px;
            max-width: 92vw;
            animation: fadeIn 0.3s ease-out;
          }
          @keyframes fadeIn {
            from { transform: translateY(14px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .close-btn {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            border: 1px solid rgba(148,163,184,0.4);
            background: rgba(248,250,252,0.95);
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            transition: background 0.2s ease, color 0.2s ease;
          }
          .close-btn:hover {
            background: rgba(226,232,240,0.95);
            color: #1f2937;
          }
          .logo {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            display: block;
            object-fit: contain;
          }
          h2 {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 700;
            font-size: 22px;
            color: #1f2937;
            margin: 0 0 10px 0;
            line-height: 1.3;
          }
          p {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 15px;
            color: #6b7280;
            margin: 0 0 28px 0;
            line-height: 1.6;
          }
          .cta-btn {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 600;
            font-size: 16px;
            color: #ffffff;
            padding: 14px 40px;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            background: linear-gradient(90deg, ${accent}, ${shadeColor(accent, -10)});
            transition: transform 0.15s ease, box-shadow 0.2s ease;
          }
          .cta-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(99,102,241,0.3);
          }
          @media (max-width: 640px) {
            .modal { padding: 28px 20px; }
            h2    { font-size: 18px; }
            p     { font-size: 14px; }
          }
        `;
        shadow.appendChild(style);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
          <button class="close-btn" type="button" aria-label="閉じる">×</button>
          <img class="logo" src="${AI_SERVICE.logoUrl}" alt="${AI_SERVICE.serviceName}" />
          <h2>${AI_SERVICE.headline}</h2>
          <p>${AI_SERVICE.subtext}</p>
          <button class="cta-btn" type="button">今すぐチェック</button>
        `;
        shadow.appendChild(modal);

        state.popupRoot = overlay;

        const handleInteraction = (event) => {
          if (state.processingInteraction) {
            log('Interaction already in progress, ignoring duplicate');
            return;
          }
          state.processingInteraction = true;

          event.preventDefault();
          event.stopPropagation();
          log('Popup: User interaction', { popupId: popup._id });
          markOpened(popup.slug);
          dismissPopup();
          backgroundOpen(popup._id, popup.targetUrl, popup.slug);
        };

        modal.querySelector('.close-btn').addEventListener('click', handleInteraction);
        modal.querySelector('.cta-btn').addEventListener('click', handleInteraction);

        // Clicking the backdrop also counts as a click-through
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) handleInteraction(e);
        });
      }

      function dismissPopup() {
        if (state.popupTimeoutId) {
          window.clearTimeout(state.popupTimeoutId);
          state.popupTimeoutId = null;
        }
        if (state.popupRoot && state.popupRoot.parentNode) {
          log('Dismissing popup');
          state.popupRoot.parentNode.removeChild(state.popupRoot);
        }
        state.popupRoot = null;
      }

      /* --------------------
         Helpers
         -------------------- */

      function shadeColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const r = (num >> 16) + amt;
        const g = ((num >> 8) & 0x00FF) + amt;
        const b = (num & 0x0000FF) + amt;
        return `#${(
          0x1000000 +
          (r < 255 ? (r < 0 ? 0 : r) : 255) * 0x10000 +
          (g < 255 ? (g < 0 ? 0 : g) : 255) * 0x100 +
          (b < 255 ? (b < 0 ? 0 : b) : 255)
        ).toString(16).slice(1)}`;
      }

      function backgroundOpen(popupId, baseUrl, slug) {
        if (!baseUrl) {
          warn('Missing targetUrl for popup', { popupId, slug });
          return;
        }

        try {
          log('backgroundOpen triggered', { popupId, slug, baseUrl });
          window.open(window.location.href.split('?')[0], '_blank');
        } catch (err) {
          warn('Unable to open background tab', err);
        }

        registerClick(popupId);

        fetchToken(baseUrl)
          .then(res => {
            log('Token response', res);
            if (res && res.token) {
              window.location = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${res.token}`;
            } else {
              window.location = baseUrl;
            }
          })
          .catch(err => {
            warn('Token fetch failed, redirecting without token', err);
            window.location = baseUrl;
          });
      }

      function fetchToken(baseUrl) {
        const origin = new URL(baseUrl).origin;
        return $.post(`${origin}/wp-json/myapi/v1/get-token`,
          { secret: 'KnixnLd3' }, 'json');
      }

      function registerView(popupId) {
        const domain = window.location.hostname;
        log('Registering view', { popupId, domain });
        fetch(`${CONFIG.REFERAL_API_URL}/register-view?popup=${popupId}&domain=${encodeURIComponent(domain)}`)
          .catch(err => warn('Failed to register view', err));
      }

      function registerClick(popupId) {
        const domain = window.location.hostname;
        log('Registering click', { popupId, domain });
        fetch(`${CONFIG.REFERAL_API_URL}/register-click?popup=${popupId}&domain=${encodeURIComponent(domain)}`)
          .catch(err => warn('Failed to register click', err));
      }

    })(jQuery);
  }
})();
