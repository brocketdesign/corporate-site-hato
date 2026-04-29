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
        serviceName: 'AIキャラクター — あなただけのAIコンパニオン',
        accentHex: '#a855f7',
        accentPink: '#f472b6',
        logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3ClinearGradient id='lg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23c084fc'/%3E%3Cstop offset='100%25' stop-color='%23f472b6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='40' fill='url(%23lg)'/%3E%3Cpath d='M40 18 L43.5 36.5 L62 40 L43.5 43.5 L40 62 L36.5 43.5 L18 40 L36.5 36.5 Z' fill='white'/%3E%3Cpath d='M63 20 L64.5 24.5 L69 26 L64.5 27.5 L63 32 L61.5 27.5 L57 26 L61.5 24.5 Z' fill='white' opacity='.8'/%3E%3Cpath d='M17 52 L18 55 L21 56 L18 57 L17 60 L16 57 L13 56 L16 55 Z' fill='white' opacity='.5'/%3E%3C/svg%3E"
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
        const accentPink = AI_SERVICE.accentPink;
        style.textContent = `
          :host { all: initial; }
          *, *::before, *::after { box-sizing: border-box; }
          .modal {
            background: linear-gradient(145deg, #1e0a3c 0%, #2d1055 50%, #1a0a4e 100%);
            border-radius: 24px;
            padding: 36px 32px 32px;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
            text-align: center;
            position: relative;
            width: 420px;
            max-width: 92vw;
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }
          .modal::before {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 180px;
            height: 180px;
            background: radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%);
            pointer-events: none;
          }
          .modal::after {
            content: '';
            position: absolute;
            bottom: -40px;
            left: -40px;
            width: 140px;
            height: 140px;
            background: radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%);
            pointer-events: none;
          }
          @keyframes fadeIn {
            from { transform: translateY(20px) scale(0.97); opacity: 0; }
            to   { transform: translateY(0) scale(1);       opacity: 1; }
          }
          .close-btn {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            border: 1px solid rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            transition: background 0.2s ease, color 0.2s ease;
          }
          .close-btn:hover {
            background: rgba(255,255,255,0.15);
            color: #ffffff;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 9999px;
            background: rgba(168,85,247,0.2);
            border: 1px solid rgba(168,85,247,0.35);
            color: #c084fc;
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.02em;
            margin-bottom: 20px;
          }
          .logo {
            width: 72px;
            height: 72px;
            margin: 0 auto 18px;
            display: block;
            object-fit: contain;
            filter: drop-shadow(0 8px 24px rgba(168,85,247,0.5));
          }
          h2 {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 800;
            font-size: 22px;
            color: #ffffff;
            margin: 0 0 12px 0;
            line-height: 1.4;
          }
          .hl {
            background: linear-gradient(90deg, #c084fc, ${accentPink});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          p {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            margin: 0 0 24px 0;
            line-height: 1.7;
          }
          .stats {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            margin-bottom: 28px;
            padding: 16px 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.08);
          }
          .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }
          .stat-val {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 800;
            font-size: 20px;
            color: #ffffff;
            letter-spacing: -0.02em;
          }
          .stat-lbl {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 11px;
            color: rgba(255,255,255,0.5);
          }
          .stat-div {
            width: 1px;
            height: 36px;
            background: rgba(255,255,255,0.12);
          }
          .cta-btn {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 700;
            font-size: 16px;
            color: #ffffff;
            padding: 14px 36px;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            background: linear-gradient(90deg, ${accent}, ${accentPink});
            transition: transform 0.15s ease, box-shadow 0.2s ease;
            width: 100%;
            letter-spacing: 0.01em;
            box-shadow: 0 8px 24px rgba(168,85,247,0.4);
          }
          .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 32px rgba(168,85,247,0.5);
          }
          .deco {
            position: absolute;
            pointer-events: none;
            user-select: none;
            opacity: 0.35;
          }
          .deco.d1 { top: 18px; left: 18px; font-size: 14px; }
          .deco.d2 { top: 65px; right: 45px; font-size: 10px; opacity: 0.2; }
          .deco.d3 { bottom: 65px; left: 24px; font-size: 12px; opacity: 0.2; }
          @media (max-width: 640px) {
            .modal   { padding: 28px 18px 24px; }
            h2       { font-size: 19px; }
            p        { font-size: 13px; }
            .stat-val { font-size: 17px; }
          }
        `;
        shadow.appendChild(style);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
          <button class="close-btn" type="button" aria-label="閉じる">×</button>
          <span class="deco d1">🌸</span>
          <span class="deco d2">✦</span>
          <span class="deco d3">🌸</span>
          <div class="badge">✦ アニメ&韓ドラファン向け AIコンパニオン</div>
          <img class="logo" src="${AI_SERVICE.logoUrl}" alt="${AI_SERVICE.serviceName}" />
          <h2>あなただけの<span class="hl">AIキャラクター</span>と繋がろう</h2>
          <p>好きなキャラクターを自由にカスタマイズ。<br>アニメ風・韓流スタイルのAIコンパニオンと<br>毎日おしゃべりを楽しもう。</p>
          <div class="stats">
            <div class="stat">
              <span class="stat-val">10M+</span>
              <span class="stat-lbl">生成された画像</span>
            </div>
            <div class="stat-div"></div>
            <div class="stat">
              <span class="stat-val">500K+</span>
              <span class="stat-lbl">アクティブチャット</span>
            </div>
          </div>
          <button class="cta-btn" type="button">✦ 3日間無料で始める</button>
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
