/**
 * De La Mora Business Services - Built-in Privacy-Focused Website Analytics & CRO Tracker
 * Version: 2.0.0
 * Zero third-party dependencies, GDPR/CCPA compliant, zero cookies, instant local tracking.
 * Features:
 *  - Pageviews & Visitor Sessions
 *  - Traffic Source & UTM Attribution (utm_source, utm_medium, utm_campaign)
 *  - Language Preference & Toggle Tracking (EN vs ES)
 *  - High-Value Conversion Events (Calls, Plan Selections, Lead Submissions)
 *  - Scroll Depth (25%, 50%, 75%, 90%) & Time-on-Page Engagement
 *  - Built-in Interactive Admin Modal Dashboard (Ctrl+Shift+A or footer link or ?analytics=view)
 *  - Google Tag / GA4 / GTM Automatic Forwarding Bridge (GTM-MD4ZM8XW)
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'dlm_analytics_events';
    const SESSION_KEY = 'dlm_analytics_session';
    const MAX_STORED_EVENTS = 1000;

    // Helper: Generate anonymous unique ID
    function getUUID() {
        return 'dlm_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    }

    // Initialize or retrieve session
    function getSession() {
        let session = null;
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) session = JSON.parse(raw);
        } catch (e) {}

        if (!session || Date.now() - session.timestamp > 30 * 60 * 1000) {
            const urlParams = new URLSearchParams(window.location.search);
            session = {
                id: getUUID(),
                referrer: document.referrer || 'Direct',
                landingPage: window.location.pathname,
                utmSource: urlParams.get('utm_source') || '',
                utmMedium: urlParams.get('utm_medium') || '',
                utmCampaign: urlParams.get('utm_campaign') || '',
                device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                timestamp: Date.now()
            };
            try {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            } catch (e) {}
        }
        return session;
    }

    // Retrieve all stored events
    function getStoredEvents() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    // Save event to localStorage
    function saveEvent(eventObj) {
        try {
            const events = getStoredEvents();
            events.push(eventObj);
            if (events.length > MAX_STORED_EVENTS) {
                events.splice(0, events.length - MAX_STORED_EVENTS);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (e) {}
    }

    // Core Track Event Method
    function trackEvent(category, action, label = '', metadata = {}) {
        const session = getSession();
        const currentLang = document.documentElement.lang || 'en';
        const eventData = {
            id: getUUID(),
            timestamp: new Date().toISOString(),
            timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            category: category,
            action: action,
            label: label,
            lang: currentLang,
            page: window.location.pathname.split('/').pop() || 'index.html',
            sessionId: session.id,
            device: session.device,
            referrer: session.referrer,
            utm: session.utmSource ? `${session.utmSource} / ${session.utmMedium}` : '',
            ...metadata
        };

        saveEvent(eventData);

        // Google Tag / GA4 / GTM Automatic Forwarding Bridge
        if (typeof window.gtag === 'function') {
            window.gtag('event', action, {
                event_category: category,
                event_label: label,
                language: currentLang,
                ...metadata
            });
        }
        if (window.dataLayer && Array.isArray(window.dataLayer)) {
            window.dataLayer.push({
                event: 'dlm_' + action,
                dlm_category: category,
                dlm_action: action,
                dlm_label: label,
                dlm_language: currentLang,
                ...metadata
            });
        }

        window.dispatchEvent(new CustomEvent('dlm_analytics_tracked', { detail: eventData }));
    }

    // Expose API globally
    window.DLMAnalytics = {
        track: trackEvent,
        getEvents: getStoredEvents,
        clearData: function () {
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(SESSION_KEY);
        },
        openDashboard: openDashboardModal
    };

    // Auto Track Pageview
    trackEvent('Navigation', 'pageview', document.title);

    // Auto Track Call Clicks (tel:), Email Clicks, and Plan Selection CTAs
    document.addEventListener('click', function (e) {
        const target = e.target.closest('a, button');
        if (!target) return;

        const href = target.getAttribute('href') || '';
        const text = target.innerText.trim().substring(0, 50);

        if (href.startsWith('tel:')) {
            trackEvent('Conversion', 'call_click', href.replace('tel:', ''), { ctaText: text });
        } else if (href.includes('mailto:Karla@Delamorabusiness.com')) {
            trackEvent('Conversion', 'email_click', 'Email Karla', { ctaText: text });
        } else if (target.hasAttribute('onclick') && target.getAttribute('onclick').includes('selectPlan')) {
            const planMatch = target.getAttribute('onclick').match(/selectPlan\(['"]([^'"]+)['"]\)/);
            const planName = planMatch ? planMatch[1] : text;
            trackEvent('Engagement', 'plan_select_click', planName);
        } else if (target.classList.contains('lang-btn')) {
            const lang = target.dataset.lang || 'en';
            trackEvent('Engagement', 'language_switch', lang);
        }
    }, true);

    // Track Form Submissions
    window.addEventListener('submit', function (e) {
        const form = e.target;
        if (form && (form.id === 'leadForm' || form.id === 'contactForm')) {
            const businessName = form.querySelector('[name="business"], #businessName')?.value || '';
            const services = [];
            form.querySelectorAll('input[name="services"]:checked').forEach(cb => services.push(cb.value));
            trackEvent('Conversion', 'lead_form_submitted', services.join(', ') || 'General Consultation', {
                business: businessName,
                serviceCount: services.length
            });
        }
    }, true);

    // Track Scroll Depth (25%, 50%, 75%, 90%)
    const scrollThresholds = [25, 50, 75, 90];
    const reachedThresholds = new Set();
    window.addEventListener('scroll', function () {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        const currentPercentage = Math.round((window.scrollY / scrollHeight) * 100);

        scrollThresholds.forEach(th => {
            if (currentPercentage >= th && !reachedThresholds.has(th)) {
                reachedThresholds.add(th);
                trackEvent('Engagement', 'scroll_depth', `${th}%`);
            }
        });
    }, { passive: true });

    // Track Time on Page (30s, 60s, 180s)
    [30, 60, 180].forEach(seconds => {
        setTimeout(() => {
            trackEvent('Engagement', 'time_on_page', `${seconds}s`);
        }, seconds * 1000);
    });

    // Keyboard Shortcut to open Analytics Dashboard: Ctrl + Shift + A (or Cmd + Shift + A)
    window.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            openDashboardModal();
        }
    });

    // Check URL parameter ?analytics=view or hash #analytics on page load
    if (window.location.search.includes('analytics=view') || window.location.hash === '#analytics') {
        window.addEventListener('DOMContentLoaded', () => setTimeout(openDashboardModal, 500));
    }

    // Built-in Lightweight Admin Analytics Dashboard Modal
    function openDashboardModal() {
        let existingModal = document.getElementById('dlmAnalyticsModal');
        if (existingModal) {
            existingModal.remove();
        }

        const events = getStoredEvents();
        const totalPageviews = events.filter(e => e.action === 'pageview').length;
        const callClicks = events.filter(e => e.action === 'call_click').length;
        const emailClicks = events.filter(e => e.action === 'email_click').length;
        const formLeads = events.filter(e => e.action === 'lead_form_submitted').length;
        const planInquiries = events.filter(e => e.action === 'plan_select_click').length;
        
        // Language distribution
        const enEvents = events.filter(e => e.lang === 'en').length;
        const esEvents = events.filter(e => e.lang === 'es').length;
        const totalLang = enEvents + esEvents || 1;
        const enPct = Math.round((enEvents / totalLang) * 100);
        const esPct = Math.round((esEvents / totalLang) * 100);

        // Top inquired services
        const serviceCounts = {};
        events.filter(e => e.action === 'plan_select_click').forEach(e => {
            serviceCounts[e.label] = (serviceCounts[e.label] || 0) + 1;
        });

        // Recent 15 events
        const recentEvents = events.slice(-15).reverse();

        const modalHtml = `
            <div id="dlmAnalyticsModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(11,37,69,0.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:1.25rem; font-family:'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; box-sizing:border-box;">
                <div style="background:#FFFFFF; width:100%; max-width:880px; max-height:92vh; border-radius:20px; box-shadow:0 24px 60px rgba(0,0,0,0.3); display:flex; flex-direction:column; overflow:hidden; border:1px solid #CBD5E1;">
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg, #0B2545 0%, #004AAD 100%); color:#FFFFFF; padding:1.25rem 1.75rem; display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:0.75rem;">
                            <span style="font-size:1.6rem;">📊</span>
                            <div>
                                <h3 style="margin:0; font-size:1.25rem; font-weight:700; color:#FFFFFF;">De La Mora Business Services</h3>
                                <p style="margin:0.15rem 0 0; font-size:0.8rem; color:#BAE6FD; font-weight:500;">San Diego County & Bilingual CRO & Traffic Analytics (GTM: GTM-MD4ZM8XW)</p>
                            </div>
                        </div>
                        <button id="dlmCloseModalBtn" style="background:rgba(255,255,255,0.15); border:none; color:#FFFFFF; width:34px; height:34px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s;">✕</button>
                    </div>

                    <!-- Scrollable Body -->
                    <div style="padding:1.5rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.5rem;">
                        
                        <!-- Top KPI Grid -->
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:1rem;">
                            <div style="background:#F0F8FD; border:1px solid #BAE6FD; border-radius:12px; padding:1rem; text-align:center;">
                                <div style="font-size:1.8rem; font-weight:800; color:#004AAD;">${totalPageviews}</div>
                                <div style="font-size:0.8rem; font-weight:700; color:#0B2545; text-transform:uppercase; margin-top:0.25rem;">Page Views</div>
                            </div>
                            <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:12px; padding:1rem; text-align:center;">
                                <div style="font-size:1.8rem; font-weight:800; color:#059669;">${formLeads}</div>
                                <div style="font-size:0.8rem; font-weight:700; color:#065F46; text-transform:uppercase; margin-top:0.25rem;">Form Leads</div>
                            </div>
                            <div style="background:#FEF3C7; border:1px solid #FDE68A; border-radius:12px; padding:1rem; text-align:center;">
                                <div style="font-size:1.8rem; font-weight:800; color:#D97706;">${callClicks}</div>
                                <div style="font-size:0.8rem; font-weight:700; color:#92400E; text-transform:uppercase; margin-top:0.25rem;">Phone Calls</div>
                            </div>
                            <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:1rem; text-align:center;">
                                <div style="font-size:1.8rem; font-weight:800; color:#16A34A;">${emailClicks}</div>
                                <div style="font-size:0.8rem; font-weight:700; color:#14532D; text-transform:uppercase; margin-top:0.25rem;">Email Clicks</div>
                            </div>
                            <div style="background:#FFF7ED; border:1px solid #FDBA74; border-radius:12px; padding:1rem; text-align:center;">
                                <div style="font-size:1.8rem; font-weight:800; color:#EA580C;">${planInquiries}</div>
                                <div style="font-size:0.8rem; font-weight:700; color:#9A3412; text-transform:uppercase; margin-top:0.25rem;">Plan Inquiries</div>
                            </div>
                        </div>

                        <!-- Language & Engagement Split -->
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
                            <!-- Bilingual Ratio -->
                            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:1.25rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                                <h4 style="margin:0 0 0.75rem; font-size:0.95rem; font-weight:700; color:#0B2545; display:flex; align-items:center; gap:0.4rem;">
                                    🌐 Bilingual Traffic Split
                                </h4>
                                <div style="display:flex; height:20px; border-radius:10px; overflow:hidden; background:#E2E8F0; margin-bottom:0.75rem;">
                                    <div style="width:${enPct}%; background:#004AAD; transition:width 0.3s;" title="English: ${enPct}%"></div>
                                    <div style="width:${esPct}%; background:#E87E1E; transition:width 0.3s;" title="Spanish: ${esPct}%"></div>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600;">
                                    <span style="color:#004AAD;">🇺🇸 English: ${enPct}% (${enEvents})</span>
                                    <span style="color:#E87E1E;">🇲🇽 Español: ${esPct}% (${esEvents})</span>
                                </div>
                            </div>

                            <!-- Inquired Services Breakdown -->
                            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:1.25rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                                <h4 style="margin:0 0 0.75rem; font-size:0.95rem; font-weight:700; color:#0B2545;">
                                    🎯 High-Intent Plan Inquiries
                                </h4>
                                ${Object.keys(serviceCounts).length === 0 ? '<p style="color:#94A3B8; font-size:0.85rem; margin:0;">No plan inquiries logged yet.</p>' : `
                                    <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                        ${Object.entries(serviceCounts).map(([svc, count]) => `
                                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:0.35rem 0.6rem; background:#F8FAFC; border-radius:6px;">
                                                <span style="font-weight:600; color:#1E293B;">${svc}</span>
                                                <span style="font-weight:700; color:#004AAD;">${count} click${count > 1 ? 's' : ''}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Real-time Event Feed -->
                        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:1.25rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                                <h4 style="margin:0; font-size:0.95rem; font-weight:700; color:#0B2545;">
                                    🕒 Recent Visitor Activity (${events.length} total events)
                                </h4>
                                <span style="font-size:0.75rem; color:#64748B;">Target Area: San Diego County, CA</span>
                            </div>
                            <div style="max-height:220px; overflow-y:auto; border:1px solid #F1F5F9; border-radius:8px;">
                                <table style="width:100%; border-collapse:collapse; font-size:0.8rem; text-align:left;">
                                    <thead>
                                        <tr style="background:#F8FAFC; border-bottom:1px solid #E2E8F0; color:#64748B;">
                                            <th style="padding:0.5rem 0.75rem;">Time</th>
                                            <th style="padding:0.5rem 0.75rem;">Action</th>
                                            <th style="padding:0.5rem 0.75rem;">Details</th>
                                            <th style="padding:0.5rem 0.75rem;">Lang</th>
                                            <th style="padding:0.5rem 0.75rem;">Device</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${recentEvents.length === 0 ? '<tr><td colspan="5" style="padding:1rem; text-align:center; color:#94A3B8;">No activity logged yet. Browse the site or submit a test inquiry to see events!</td></tr>' : recentEvents.map(e => `
                                            <tr style="border-bottom:1px solid #F1F5F9;">
                                                <td style="padding:0.45rem 0.75rem; color:#64748B; white-space:nowrap;">${e.timeFormatted}</td>
                                                <td style="padding:0.45rem 0.75rem; font-weight:700; color:${e.category === 'Conversion' ? '#059669' : '#004AAD'};">${e.action}</td>
                                                <td style="padding:0.45rem 0.75rem; color:#334155;">${e.label || '-'}</td>
                                                <td style="padding:0.45rem 0.75rem; text-transform:uppercase; font-weight:600; color:#475569;">${e.lang}</td>
                                                <td style="padding:0.45rem 0.75rem; color:#64748B;">${e.device || 'Desktop'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    <!-- Footer Actions -->
                    <div style="background:#F8FAFC; border-top:1px solid #E2E8F0; padding:1rem 1.75rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
                        <div style="font-size:0.8rem; color:#64748B;">
                            Shortcut: <kbd style="background:#E2E8F0; padding:2px 6px; border-radius:4px; font-weight:700;">Ctrl+Shift+A</kbd> to reopen anytime.
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button id="dlmExportCsvBtn" style="background:#004AAD; color:#FFFFFF; border:none; padding:0.5rem 1rem; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:0.35rem;">
                                📥 Export CSV
                            </button>
                            <button id="dlmClearDataBtn" style="background:#F1F5F9; color:#DC2626; border:1px solid #FECACA; padding:0.5rem 0.9rem; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer;">
                                Reset Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Bind Close Button & Background Tap
        const modal = document.getElementById('dlmAnalyticsModal');
        document.getElementById('dlmCloseModalBtn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Bind Export CSV
        document.getElementById('dlmExportCsvBtn').addEventListener('click', () => {
            const stored = getStoredEvents();
            if (stored.length === 0) {
                alert('No analytics data to export.');
                return;
            }
            const headers = ['timestamp', 'action', 'category', 'label', 'lang', 'page', 'device', 'referrer'];
            const csvRows = [headers.join(',')];
            stored.forEach(e => {
                const values = headers.map(h => {
                    const escaped = ('' + (e[h] || '')).replace(/"/g, '""');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            });
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', `dlm_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
            a.click();
        });

        // Bind Clear Data
        document.getElementById('dlmClearDataBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all local analytics data?')) {
                window.DLMAnalytics.clearData();
                modal.remove();
                alert('Analytics data reset successfully.');
            }
        });
    }

})();
