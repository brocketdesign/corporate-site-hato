/*
 * Referral popup widget v1.4.0
 * - Fetches all enabled popups from backend
 * - Stage 1: Non-intrusive bottom popup (3s delay, 20s display time) - SEO friendly
 * - Stage 2: Full-screen overlay (5s skip timer) if Stage 1 not clicked - Intrusive fallback
 * - Email Stage: Email capture form on return visits (after first interaction)
 * - Stage 2 also includes inline email form
 * - Persists per-slug cookies so refreshed pages skip shown popups
 * - Triggers backgroundOpen on user click/interaction (first interaction ALWAYS triggers affiliate redirect)
 */
(function() {
  console.log('Referral popup widget version: v1.4.0');

  const DEBUG_PREFIX = '[ReferalPopup]';

  const log = (...args) => console.log(DEBUG_PREFIX, ...args);
  const warn = (...args) => console.warn(DEBUG_PREFIX, ...args);
  const error = (...args) => console.error(DEBUG_PREFIX, ...args);

  let jQueryLoaded = typeof jQuery !== 'undefined';
  let cookiesLoaded = typeof Cookies !== 'undefined';

  log('Bootstrap starting', { jQueryLoaded, cookiesLoaded });

  // Fallback cookie helpers (will delegate to js-cookie if available)
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

  // If both libraries were already on page
  checkAndInit();

  function init() {
    (function($) {
      log('init() called');

      const CONFIG = {
        REFERAL_API_URL: 'https://rakuado-43706e27163e.herokuapp.com/api/referal',
        COOKIE_EXPIRY_HOURS: 24,
        COOKIE_PREFIX: 'referal-opened-',
        COOKIE_EMAIL_PREFIX: 'referal-email-',
        EMAIL_FORM_ACTION: 'https://app.rakuado.net/api/mailing-lists/subscribe/69b7450039dc17c081ec347f',
        STAGE1_DELAY_MS: 3000,      // Stage 1 appears after 3s page load
        STAGE1_DISPLAY_MS: 20000,   // Stage 1 visible for 20s
        STAGE2_SKIP_MS: 5000,       // Stage 2 skip button becomes clickable after 5s
        EMAIL_STAGE_DELAY_MS: 2000  // Email Stage appears after 2s on return visits
      };

      const AI_SERVICE = {
        serviceName: 'RakuAdo — AIクーポンファインダー',
        extraDays: 3,
        headline: 'AIが人気サイトのお得情報を自動発見！',
        subtext: 'Yahoo・TikTok・Temu など主要サイトを毎日チェック',
        accentHex: '#6366f1',
        logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%236366f1'/%3E%3Cpath d='M24 12l3 6.5L34 22l-7 3.5L24 32l-3-6.5L14 22l7-3.5z' fill='%23fff'/%3E%3Cpath d='M35 9l1.5 3L40 13.5l-3.5 1.5L35 18l-1.5-3L30 13.5l3.5-1.5z' fill='%23fff' opacity='.7'/%3E%3C/svg%3E"
      };

      const state = {
        currentPopup: null,
        stage1Root: null,
        stage1Shadow: null,
        stage1TimeoutId: null,
        stage1DismissTimeoutId: null,
        stage1CountdownInterval: null,
        stage2Root: null,
        stage2Shadow: null,
        stage2SkipTimeoutId: null,
        stage2SkipCounter: null,
        emailStageRoot: null,
        emailStageShadow: null,
        emailStageTimeoutId: null,
        interacted: false,
        processingInteraction: false  // Lock to prevent concurrent interactions
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

            // Separate popups into: not yet opened (Stage 1/2 flow) vs opened but no email (Email Stage)
            const notOpened = [];
            const needsEmail = [];

            enriched.forEach(p => {
              const alreadyOpened = hasOpened(p.slug);
              const emailSubmitted = hasSubmittedEmail(p.slug);
              log('Filter check', { popupId: p._id, slug: p.slug, alreadyOpened, emailSubmitted });
              if (!alreadyOpened) {
                notOpened.push(p);
              } else if (!emailSubmitted) {
                needsEmail.push(p);
              }
            });

            log('Filtered popups summary', {
              total: enriched.length,
              notOpened: notOpened.length,
              needsEmail: needsEmail.length
            });

            if (notOpened.length > 0) {
              // First-time visit: show Stage 1 → Stage 2 flow
              const popup = notOpened[0];
              log('Selected popup for Stage 1 display', { popupId: popup._id, slug: popup.slug });
              scheduleStage1(popup);
            } else if (needsEmail.length > 0) {
              // Return visit: already interacted but no email submitted → show Email Stage
              const popup = needsEmail[0];
              log('Selected popup for Email Stage', { popupId: popup._id, slug: popup.slug });
              scheduleEmailStage(popup);
            } else {
              log('All popups fully completed (opened + email)');
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

      function hasSubmittedEmail(slug) {
        const cookieKey = CONFIG.COOKIE_EMAIL_PREFIX + slug;
        const rawValue = getCookie(cookieKey);
        const submitted = Boolean(rawValue);
        log('Checking email cookie status', { slug, cookieKey, rawValue, submitted });
        return submitted;
      }

      function markEmailSubmitted(slug) {
        const cookieKey = CONFIG.COOKIE_EMAIL_PREFIX + slug;
        log('Persisting email submitted slug', { slug, cookieKey });
        setCookie(cookieKey, 'true', { expires: CONFIG.COOKIE_EXPIRY_HOURS / 24, path: '/' });
      }

      function scheduleStage1(popup) {
        state.currentPopup = popup;
        registerView(popup._id);

        log('Scheduling Stage 1 display', {
          delay: CONFIG.STAGE1_DELAY_MS,
          popupId: popup._id
        });

        state.stage1TimeoutId = window.setTimeout(() => {
          log('Displaying Stage 1 popup', { popupId: popup._id });
          renderStage1(popup);

          // Schedule Stage 1 auto-dismiss
          state.stage1DismissTimeoutId = window.setTimeout(() => {
            log('Stage 1 timeout - dismissing and showing Stage 2', { popupId: popup._id });
            dismissStage1();
            scheduleStage2(popup);
          }, CONFIG.STAGE1_DISPLAY_MS);
        }, CONFIG.STAGE1_DELAY_MS);
      }

      function renderStage1(popup) {
        const host = document.createElement('div');
        host.id = 'referal-popup-stage1-host';
        host.style.position = 'fixed';
        host.style.left = '20px';
        host.style.bottom = '20px';
        host.style.zIndex = '2147483647';
        host.style.width = 'auto';
        host.style.pointerEvents = 'none';
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = `
          :host {
            all: initial;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          .popup-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0;
            pointer-events: auto;
          }
          .progress-bar {
            width: 100%;
            height: 3px;
            background: #e5e7eb;
            border-radius: 9999px 9999px 0 0;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #6366f1, #4f46e5);
            width: 100%;
            animation: depleteBar 20s linear forwards;
          }
          @keyframes depleteBar {
            from { width: 100%; }
            to { width: 0%; }
          }
          .cta-button {
            display: flex;
            align-items: center;
            background: #ffffff;
            border-radius: 0 0 9999px 9999px;
            padding: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            cursor: pointer;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.35);
          }
          .cta-button .logo {
            width: 36px;
            height: 36px;
            border-radius: 9999px;
            object-fit: contain;
            margin-right: 16px;
            flex-shrink: 0;
            background: #fff;
          }
          .cta-info {
            display: flex;
            flex-direction: column;
            margin-right: 16px;
            min-width: 0;
            flex: 1;
          }
          .cta-info h4 {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 700;
            font-size: 15px;
            color: #1f2937;
            margin: 0;
            line-height: 1.3;
          }
          .cta-info .countdown {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 600;
            font-size: 12px;
            color: #6366f1;
            margin-top: 4px;
            white-space: nowrap;
          }
          .cta-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: auto;
            flex-shrink: 0;
          }
          .cta-primary {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 600;
            font-size: 14px;
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 9999px;
            cursor: pointer;
            border: none;
            transition: transform 0.15s ease, box-shadow 0.2s ease;
          }
          .cta-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
          }
          .cta-close {
            width: 28px;
            height: 28px;
            border-radius: 9999px;
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(248, 250, 252, 0.95);
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease, color 0.2s ease;
          }
          .cta-close:hover {
            background: rgba(226, 232, 240, 0.95);
            color: #1f2937;
          }
          .bounce {
            animation: bounce 1.5s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @media (max-width: 640px) {
            :host {
              left: 12px !important;
              right: 12px !important;
            }
            .popup-wrapper {
              width: calc(100vw - 24px);
            }
            .cta-button {
              flex-direction: column;
              align-items: flex-start;
              border-radius: 0 0 24px 24px;
              padding: 16px;
            }
            .cta-info {
              margin-right: 0;
              margin-bottom: 12px;
            }
            .cta-actions {
              width: 100%;
              justify-content: space-between;
              margin-left: 0;
            }
          }
        `;

        shadow.appendChild(style);
        const wrapper = document.createElement('div');
        wrapper.className = 'popup-wrapper';
        shadow.appendChild(wrapper);

        // Progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressContainer.appendChild(progressFill);
        wrapper.appendChild(progressContainer);

        const accent = AI_SERVICE.accentHex;

        const container = document.createElement('div');
        container.className = 'cta-button bounce';
        container.dataset.slug = popup.slug;

        container.innerHTML = `
          <img class="logo" src="${AI_SERVICE.logoUrl}" alt="${AI_SERVICE.serviceName}" />
          <div class="cta-info">
            <h4>${AI_SERVICE.headline}</h4>
            <div class="countdown">${AI_SERVICE.subtext}（残り <span id="timer">20</span>秒）</div>
          </div>
          <div class="cta-actions">
            <button class="cta-primary" type="button" style="background: linear-gradient(90deg, ${accent}, ${shadeColor(accent, -10)});">
              今すぐチェック
            </button>
            <button class="cta-close" type="button" aria-label="閉じる">×</button>
          </div>
        `;

        const primaryBtn = container.querySelector('.cta-primary');
        const closeBtn = container.querySelector('.cta-close');
        const timerDisplay = container.querySelector('#timer');

        // Countdown timer
        let remainingTime = 20;
        state.stage1CountdownInterval = window.setInterval(() => {
          remainingTime--;
          if (timerDisplay) {
            timerDisplay.textContent = remainingTime;
          }
          if (remainingTime <= 0) {
            if (state.stage1CountdownInterval) {
              window.clearInterval(state.stage1CountdownInterval);
            }
          }
        }, 1000);

        const handleAction = (event) => {
          // Prevent concurrent interactions
          if (state.processingInteraction) {
            log('Interaction already in progress, ignoring duplicate');
            return;
          }
          state.processingInteraction = true;

          event.preventDefault();
          event.stopPropagation();
          log('Stage 1: User interaction', { popupId: popup._id });
          state.interacted = true;
          markOpened(popup.slug);
          dismissStage1();
          dismissStage2();
          backgroundOpen(popup._id, popup.targetUrl, popup.slug);
        };

        primaryBtn.addEventListener('click', handleAction);
        closeBtn.addEventListener('click', handleAction);
        container.addEventListener('click', handleAction);

        wrapper.appendChild(container);
        state.stage1Root = host;
        state.stage1Shadow = shadow;
      }

      function dismissStage1() {
        if (state.stage1CountdownInterval) {
          window.clearInterval(state.stage1CountdownInterval);
          state.stage1CountdownInterval = null;
        }
        if (state.stage1DismissTimeoutId) {
          window.clearTimeout(state.stage1DismissTimeoutId);
          state.stage1DismissTimeoutId = null;
        }
        if (state.stage1Root && state.stage1Root.parentNode) {
          log('Dismissing Stage 1 popup');
          state.stage1Root.parentNode.removeChild(state.stage1Root);
        }
        state.stage1Root = null;
        state.stage1Shadow = null;
      }

      /* --------------------
         Email Stage (return visits)
         -------------------- */

      function scheduleEmailStage(popup) {
        state.currentPopup = popup;
        log('Scheduling Email Stage display', {
          delay: CONFIG.EMAIL_STAGE_DELAY_MS,
          popupId: popup._id
        });

        state.emailStageTimeoutId = window.setTimeout(() => {
          log('Displaying Email Stage popup', { popupId: popup._id });
          renderEmailStage(popup);
        }, CONFIG.EMAIL_STAGE_DELAY_MS);
      }

      function getEmailFormStyles() {
        return `
          .email-form {
            margin-top: 16px;
            text-align: left;
          }
          .email-form h4 {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 700;
            font-size: 15px;
            color: #1f2937;
            margin: 0 0 8px 0;
            line-height: 1.4;
          }
          .email-form .email-desc {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 400;
            font-size: 13px;
            color: #6b7280;
            margin: 0 0 12px 0;
            line-height: 1.5;
          }
          .email-form .email-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }
          .email-form .email-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 9999px;
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            color: #1f2937;
            outline: none;
            transition: border-color 0.2s ease;
          }
          .email-form .email-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
          }
          .email-form .email-input::placeholder {
            color: #9ca3af;
          }
          .email-form .email-submit {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 600;
            font-size: 14px;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            white-space: nowrap;
            transition: transform 0.15s ease, box-shadow 0.2s ease;
          }
          .email-form .email-submit:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
          }
          .email-form .email-submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          .email-form .privacy-text {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 400;
            font-size: 11px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.5;
          }
          .email-form .email-status {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 13px;
            margin: 8px 0 0 0;
            line-height: 1.4;
          }
          .email-form .email-status.success {
            color: #10b981;
          }
          .email-form .email-status.error {
            color: #ef4444;
          }
          @media (max-width: 640px) {
            .email-form .email-row {
              flex-direction: column;
            }
            .email-form .email-submit {
              width: 100%;
            }
          }
        `;
      }

      function buildEmailFormHTML(accent) {
        return `
          <div class="email-form">
            <h4>\uD83E\uDD16 AI\u304C\u6700\u9069\u306A\u30AF\u30FC\u30DD\u30F3\u3092\u6BCE\u9031\u304A\u5C4A\u3051\u3057\u307E\u3059</h4>
            <p class="email-desc">\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u767B\u9332\u3044\u305F\u3060\u304F\u3068\u3001AI\u304C\u3042\u306A\u305F\u306B\u5408\u3063\u305F\u304A\u5F97\u306A\u30AF\u30FC\u30DD\u30F3\u3092\u898B\u3064\u3051\u3066\u9031\u306B1\u56DE\u304A\u77E5\u3089\u305B\u3057\u307E\u3059\u3002</p>
            <div class="email-row">
              <input type="email" class="email-input" placeholder="\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B" required />
              <button type="button" class="email-submit" style="background: linear-gradient(90deg, ${accent}, ${shadeColor(accent, -10)});">
                \u767B\u9332\u3059\u308B
              </button>
            </div>
            <p class="privacy-text">\uD83D\uDD12 \u3054\u767B\u9332\u3044\u305F\u3060\u3044\u305F\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306F\u3001\u30AF\u30FC\u30DD\u30F3\u60C5\u5831\u306E\u304A\u5C4A\u3051\u306E\u307F\u306B\u4F7F\u7528\u3057\u307E\u3059\u3002\u7B2C\u4E09\u8005\u3078\u306E\u63D0\u4F9B\u30FB\u8CA9\u58F2\u3001\u305D\u306E\u4ED6\u306E\u76EE\u7684\u3067\u306E\u5229\u7528\u306F\u4E00\u5207\u3044\u305F\u3057\u307E\u305B\u3093\u3002</p>
            <div class="email-status" style="display:none;"></div>
          </div>
        `;
      }

      function handleEmailSubmit(emailInput, submitBtn, statusEl, popup, onSuccess) {
        const email = emailInput.value.trim();
        if (!email) return;

        submitBtn.disabled = true;
        submitBtn.textContent = '\u9001\u4FE1\u4E2D...';
        statusEl.style.display = 'none';

        const body = new URLSearchParams();
        body.append('email', email);
        body.append('tag', 'popup-widget');
        body.append('domain', window.location.hostname);

        fetch(CONFIG.EMAIL_FORM_ACTION, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        })
          .then(res => res.json().then(data => ({ status: res.status, data })))
          .then(({ status, data }) => {
            if (data && data.success) {
              log('Email submitted successfully', { email: '***', slug: popup.slug, message: data.message });
              markEmailSubmitted(popup.slug);
              statusEl.textContent = '\u2705 \u767B\u9332\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01\u304A\u5F97\u306A\u30AF\u30FC\u30DD\u30F3\u3092\u304A\u5C4A\u3051\u3057\u307E\u3059\u3002';
              statusEl.className = 'email-status success';
              statusEl.style.display = 'block';
              if (onSuccess) onSuccess();
            } else {
              throw new Error((data && data.error) || 'Server returned ' + status);
            }
          })
          .catch(err => {
            warn('Email submit failed', err);
            statusEl.textContent = '\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002';
            statusEl.className = 'email-status error';
            statusEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = '\u767B\u9332\u3059\u308B';
          });
      }

      function renderEmailStage(popup) {
        const host = document.createElement('div');
        host.id = 'referal-popup-email-host';
        host.style.position = 'fixed';
        host.style.left = '20px';
        host.style.bottom = '20px';
        host.style.zIndex = '2147483647';
        host.style.width = 'auto';
        host.style.maxWidth = '420px';
        host.style.pointerEvents = 'none';
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = `
          :host {
            all: initial;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          .email-popup {
            background: #ffffff;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            pointer-events: auto;
            position: relative;
            animation: slideUp 0.3s ease-out;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .email-popup .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 4px;
          }
          .email-popup .logo {
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            object-fit: contain;
            flex-shrink: 0;
            background: #fff;
          }
          .email-popup .header-title {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 700;
            font-size: 14px;
            color: #1f2937;
            margin: 0;
            flex: 1;
          }
          .email-popup .close-btn {
            width: 28px;
            height: 28px;
            border-radius: 9999px;
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(248, 250, 252, 0.95);
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease, color 0.2s ease;
            flex-shrink: 0;
            font-size: 16px;
            line-height: 1;
          }
          .email-popup .close-btn:hover {
            background: rgba(226, 232, 240, 0.95);
            color: #1f2937;
          }
          ${getEmailFormStyles()}
          @media (max-width: 640px) {
            :host {
              left: 12px !important;
              right: 12px !important;
              max-width: none !important;
            }
            .email-popup {
              width: calc(100vw - 24px);
            }
          }
        `;

        shadow.appendChild(style);
        const wrapper = document.createElement('div');
        wrapper.className = 'email-popup';
        shadow.appendChild(wrapper);

        const accent = AI_SERVICE.accentHex;

        wrapper.innerHTML = `
          <div class="header">
            <img class="logo" src="${AI_SERVICE.logoUrl}" alt="${AI_SERVICE.serviceName}" />
            <span class="header-title">${AI_SERVICE.serviceName}</span>
            <button class="close-btn" type="button" aria-label="\u9589\u3058\u308B">\u00D7</button>
          </div>
          ${buildEmailFormHTML(accent)}
        `;

        const closeBtn = wrapper.querySelector('.close-btn');
        const emailInput = wrapper.querySelector('.email-input');
        const submitBtn = wrapper.querySelector('.email-submit');
        const statusEl = wrapper.querySelector('.email-status');

        closeBtn.addEventListener('click', () => {
          log('Email Stage: User closed without submitting');
          dismissEmailStage();
        });

        submitBtn.addEventListener('click', () => {
          handleEmailSubmit(emailInput, submitBtn, statusEl, popup, () => {
            // Auto-dismiss after success
            window.setTimeout(() => dismissEmailStage(), 2000);
          });
        });

        emailInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleEmailSubmit(emailInput, submitBtn, statusEl, popup, () => {
              window.setTimeout(() => dismissEmailStage(), 2000);
            });
          }
        });

        state.emailStageRoot = host;
        state.emailStageShadow = shadow;
      }

      function dismissEmailStage() {
        if (state.emailStageTimeoutId) {
          window.clearTimeout(state.emailStageTimeoutId);
          state.emailStageTimeoutId = null;
        }
        if (state.emailStageRoot && state.emailStageRoot.parentNode) {
          log('Dismissing Email Stage popup');
          state.emailStageRoot.parentNode.removeChild(state.emailStageRoot);
        }
        state.emailStageRoot = null;
        state.emailStageShadow = null;
      }

      function scheduleStage2(popup) {
        if (state.interacted) {
          log('User already interacted, skipping Stage 2');
          return;
        }

        log('Scheduling Stage 2 display', { popupId: popup._id });
        renderStage2(popup);
      }

      function renderStage2(popup) {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'referal-popup-stage2-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '2147483646';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.pointerEvents = 'auto';

        document.body.appendChild(overlay);

        const host = document.createElement('div');
        host.id = 'referal-popup-stage2-host';
        host.style.position = 'relative';
        host.style.zIndex = '2147483647';
        host.style.width = 'auto';
        host.style.maxWidth = '90vw';
        host.style.pointerEvents = 'auto';
        overlay.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = `
          :host {
            all: initial;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          .modal-container {
            background: #ffffff;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.3);
            text-align: center;
            position: relative;
          }
          .modal-container .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            object-fit: contain;
          }
          .modal-container h2 {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 700;
            font-size: 24px;
            color: #1f2937;
            margin: 0 0 10px 0;
            line-height: 1.3;
          }
          .modal-container p {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 500;
            font-size: 16px;
            color: #6b7280;
            margin: 0 0 30px 0;
            line-height: 1.5;
          }
          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .modal-skip {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 500;
            font-size: 14px;
            color: #9ca3af;
            padding: 10px 20px;
            border-radius: 9999px;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .modal-skip:hover:not(:disabled) {
            background: #f3f4f6;
            color: #6b7280;
          }
          .modal-skip:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .modal-primary {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 600;
            font-size: 16px;
            color: #ffffff;
            padding: 12px 30px;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .modal-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
          }
          .skip-countdown {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 8px;
          }
          .modal-divider {
            width: 100%;
            height: 1px;
            background: #e5e7eb;
            margin: 24px 0 16px 0;
          }
          ${getEmailFormStyles()}
          .email-form {
            text-align: left;
          }
          @media (max-width: 640px) {
            .modal-container {
              padding: 24px;
              border-radius: 16px;
            }
            .modal-container h2 {
              font-size: 20px;
            }
            .modal-container p {
              font-size: 14px;
            }
            .modal-actions {
              flex-direction: column;
            }
          }
        `;

        shadow.appendChild(style);
        const wrapper = document.createElement('div');
        wrapper.className = 'modal-container';
        shadow.appendChild(wrapper);

        const accent = AI_SERVICE.accentHex;

        wrapper.innerHTML = `
          <img class="logo" src="${AI_SERVICE.logoUrl}" alt="${AI_SERVICE.serviceName}" />
          <h2>${AI_SERVICE.headline}</h2>
          <p>${AI_SERVICE.subtext}</p>
          <div class="modal-actions">
            <button class="modal-skip" type="button" id="skip-btn" disabled>スキップ (5秒)</button>
            <button class="modal-primary" type="button" id="cta-btn" style="background: linear-gradient(90deg, ${accent}, ${shadeColor(accent, -10)});">
              今すぐチェック
            </button>
          </div>
          <div class="skip-countdown" id="countdown"></div>
          <div class="modal-divider"></div>
          ${buildEmailFormHTML(accent)}
        `;

        state.stage2Root = overlay;
        state.stage2Shadow = shadow;

        const skipBtn = wrapper.querySelector('#skip-btn');
        const ctaBtn = wrapper.querySelector('#cta-btn');
        const countdown = wrapper.querySelector('#countdown');

        let skipCountdown = 5;
        state.stage2SkipCounter = skipCountdown;

        const updateCountdown = () => {
          skipCountdown--;
          state.stage2SkipCounter = skipCountdown;
          if (skipCountdown <= 0) {
            skipBtn.disabled = false;
            skipBtn.textContent = 'スキップ';
            countdown.textContent = '';
            if (state.stage2SkipTimeoutId) {
              window.clearTimeout(state.stage2SkipTimeoutId);
            }
          } else {
            countdown.textContent = `スキップできるまであと${skipCountdown}秒`;
            state.stage2SkipTimeoutId = window.setTimeout(updateCountdown, 1000);
          }
        };

        countdown.textContent = `スキップできるまであと${skipCountdown}秒`;
        state.stage2SkipTimeoutId = window.setTimeout(updateCountdown, 1000);

        const handleClose = () => {
          // Prevent concurrent interactions
          if (state.processingInteraction) {
            log('Interaction already in progress, ignoring duplicate');
            return;
          }
          state.processingInteraction = true;

          log('Stage 2: User clicked skip - triggering backgroundOpen');
          state.interacted = true;
          markOpened(popup.slug);
          dismissStage2();
          backgroundOpen(popup._id, popup.targetUrl, popup.slug);
        };

        const handleCTA = (event) => {
          // Prevent concurrent interactions
          if (state.processingInteraction) {
            log('Interaction already in progress, ignoring duplicate');
            return;
          }
          state.processingInteraction = true;

          event.preventDefault();
          event.stopPropagation();
          log('Stage 2: User clicked CTA', { popupId: popup._id });
          state.interacted = true;
          markOpened(popup.slug);
          dismissStage2();
          backgroundOpen(popup._id, popup.targetUrl, popup.slug);
        };

        // Clicking anywhere on the overlay (except the modal) or buttons triggers the CTA
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            handleCTA(e);
          }
        });

        skipBtn.addEventListener('click', handleClose);
        ctaBtn.addEventListener('click', handleCTA);

        // Email form handler in Stage 2
        const s2EmailInput = wrapper.querySelector('.email-input');
        const s2SubmitBtn = wrapper.querySelector('.email-submit');
        const s2StatusEl = wrapper.querySelector('.email-status');

        const handleStage2Email = () => {
          handleEmailSubmit(s2EmailInput, s2SubmitBtn, s2StatusEl, popup, () => {
            // CRITICAL: If this is the user's first interaction, trigger backgroundOpen
            if (!state.interacted) {
              log('Stage 2: Email submit is first interaction - triggering backgroundOpen');
              state.interacted = true;
              markOpened(popup.slug);
              // Delay dismissal slightly so user sees success, then redirect
              window.setTimeout(() => {
                dismissStage2();
                backgroundOpen(popup._id, popup.targetUrl, popup.slug);
              }, 1500);
            } else {
              // backgroundOpen already fired (user clicked CTA/skip first), just dismiss
              window.setTimeout(() => dismissStage2(), 2000);
            }
          });
        };

        s2SubmitBtn.addEventListener('click', handleStage2Email);
        s2EmailInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleStage2Email();
          }
        });
      }

      function dismissStage2() {
        if (state.stage2SkipTimeoutId) {
          window.clearTimeout(state.stage2SkipTimeoutId);
          state.stage2SkipTimeoutId = null;
        }
        if (state.stage2Root && state.stage2Root.parentNode) {
          log('Dismissing Stage 2 popup');
          state.stage2Root.parentNode.removeChild(state.stage2Root);
        }
        state.stage2Root = null;
        state.stage2Shadow = null;
        state.stage2SkipCounter = null;
      }

      function buildExpirationDate(extraDays) {
        const baseDate = new Date();
        const days = Number(extraDays) || 0;
        const expiration = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
        return expiration.toISOString().slice(0, 10);
      }

      function shadeColor(color, percent) {
        // Simple hex shade helper for CTA gradient
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

      /* --------------------
         Analytics helpers
         -------------------- */

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

        fetchToken()
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

      function fetchToken() {
        return $.post('https://yuuyasumi.com/wp-json/myapi/v1/get-token',
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
