/* =========================================
   SyriCoin Telegram Mini App - Phase 3
   JavaScript Logic & Interactivity
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Telegram WebApp Integration
    initTelegramWebApp();

    // 2. Initialize Navigation System
    initNavigation();

    // 3. Initialize Interactive Buttons & Data State
    initActions();

    // 4. Render Initial Dashboard Data
    updateDashboardData();
});

// Mock Application State (Ready for Backend Integration)
let appState = {
    points: 1250,
    sypValue: '62,500 ليرة سورية',
    totalEarnings: '3,400 نقطة',
    todayEarnings: '450 نقطة',
    lastTask: 'إكمال مهمة CPA - تثبيت تطبيق (منذ ساعتين)',
    lastVideo: 'مشاهدة فيديو رقم #42 (منذ 5 دقائق)',
    lastWithdrawal: 'طلب سحب بقيمة 1,000 نقطة (قيد المعالجة)'
};

/* =========================================
   Telegram WebApp Integration
   ========================================= */
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand(); // Expand mini app to full height
        
        const user = tg.initDataUnsafe?.user;
        if (user) {
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = user.first_name || user.username || 'مستخدم Telegram';
            }
            
            const avatarContainer = document.querySelector('.avatar-placeholder');
            if (avatarContainer && user.photo_url) {
                avatarContainer.innerHTML = `<img src="${user.photo_url}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
        }
    }
}

/* =========================================
   Navigation System
   ========================================= */
function initNavigation() {
    // Open internal pages via method cards
    const methodCards = document.querySelectorAll('.method-card');
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');
            if (targetId) {
                openInternalPage(targetId);
            }
        });
    });

    // Settings button opens profile page
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openInternalPage('profile-page');
        });
    }

    // Wallet & History button opens wallet page
    const walletHistoryBtn = document.getElementById('wallet-history-btn');
    if (walletHistoryBtn) {
        walletHistoryBtn.addEventListener('click', () => {
            openInternalPage('wallet-page');
        });
    }

    // Back buttons return to home page
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (targetId === 'home-page') {
                closeAllInternalPages();
            }
        });
    });
}

function openInternalPage(pageId) {
    closeAllInternalPages();
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
}

function closeAllInternalPages() {
    const internalPages = document.querySelectorAll('.internal-page');
    internalPages.forEach(page => {
        page.classList.remove('active');
    });
}

/* =========================================
   Data Updates & State Management
   ========================================= */
function updateDashboardData() {
    const pointsEl = document.querySelector('.points-value');
    if (pointsEl) {
        pointsEl.innerHTML = `${appState.points} <span class="unit">نقطة</span>`;
    }

    const sypEl = document.querySelector('.syp-value');
    if (sypEl) {
        sypEl.textContent = `القيمة: ${appState.sypValue}`;
    }

    const summaryDivs = document.querySelectorAll('.earnings-summary div');
    if (summaryDivs.length >= 2) {
        summaryDivs[0].innerHTML = `إجمالي الأرباح: <span>${appState.totalEarnings}</span>`;
        summaryDivs[1].innerHTML = `أرباح اليوم: <span>${appState.todayEarnings}</span>`;
    }

    const lastTaskEl = document.getElementById('last-task');
    if (lastTaskEl) lastTaskEl.textContent = `آخر مهمة: ${appState.lastTask}`;

    const lastVideoEl = document.getElementById('last-video');
    if (lastVideoEl) lastVideoEl.textContent = `آخر فيديو: ${appState.lastVideo}`;

    const lastWithdrawalEl = document.getElementById('last-withdrawal');
    if (lastWithdrawalEl) lastWithdrawalEl.textContent = `آخر عملية سحب: ${appState.lastWithdrawal}`;
}

/* =========================================
   Buttons & Interactive Elements
   ========================================= */
function initActions() {
    // Withdrawal request button
    const withdrawBtn = document.getElementById('request-withdrawal-btn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            showToast('تم تقديم طلب السحب بنجاح، سيتم معالجته قريباً.');
            appState.lastWithdrawal = 'طلب سحب جديد بقيمة ' + appState.points + ' نقطة (قيد المعالجة)';
            updateDashboardData();
        });
    }

    // Reels cards interaction (simulate watching/earning)
    const reelCards = document.querySelectorAll('.reel-card');
    reelCards.forEach((reel, index) => {
        reel.style.cursor = 'pointer';
        reel.addEventListener('click', () => {
            appState.points += 50;
            appState.todayEarnings = '500 نقطة';
            appState.lastVideo = `مشاهدة ريلز رقم #${index + 1} (+50 نقطة)`;
            updateDashboardData();
            showToast('مبروك! حصلت على 50 نقطة مشاهدة.');
        });
    });

    // Populate internal pages content dynamically without modifying HTML structure
    populateInternalPagesContent();
}

function populateInternalPagesContent() {
    // Videos page content
    const videosContent = document.querySelector('#videos-page .internal-content');
    if (videosContent && videosContent.children.length === 0) {
        videosContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:16px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="font-size:15px; margin-bottom:4px;">فيديو ترويجي #1</h4>
                        <span style="font-size:13px; color:var(--neon-green);">المكافأة: +30 نقطة</span>
                    </div>
                    <button class="watch-vid-btn" style="background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-primary); padding:8px 16px; border-radius:var(--radius-sm); font-weight:600;">مشاهدة</button>
                </div>
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:16px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="font-size:15px; margin-bottom:4px;">فيديو ترويجي #2</h4>
                        <span style="font-size:13px; color:var(--neon-green);">المكافأة: +40 نقطة</span>
                    </div>
                    <button class="watch-vid-btn" style="background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-primary); padding:8px 16px; border-radius:var(--radius-sm); font-weight:600;">مشاهدة</button>
                </div>
            </div>
        `;
        videosContent.querySelectorAll('.watch-vid-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                appState.points += 35;
                appState.lastVideo = 'مشاهدة فيديو ترويجي داخلي (+35 نقطة)';
                updateDashboardData();
                showToast('تمت مشاهدة الفيديو بنجاح وأضيفت النقاط!');
            });
        });
    }

    // CPA Tasks page content
    const cpaContent = document.querySelector('#cpa-page .internal-content');
    if (cpaContent && cpaContent.children.length === 0) {
        cpaContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:16px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="font-size:15px; margin-bottom:4px;">تنزيل تطبيق اللعبة الرقمية</h4>
                        <span style="font-size:13px; color:var(--neon-green);">المكافأة: +200 نقطة</span>
                    </div>
                    <button class="cpa-task-btn" style="background:var(--neon-green); color:#000; padding:8px 16px; border-radius:var(--radius-sm); font-weight:700;">تنفيذ المهمة</button>
                </div>
            </div>
        `;
        cpaContent.querySelectorAll('.cpa-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                appState.points += 200;
                appState.lastTask = 'إكمال مهمة تنزيل تطبيق CPA (+200 نقطة)';
                updateDashboardData();
                showToast('أتممت المهمة بنجاح! تم إضافة 200 نقطة.');
            });
        });
    }

    // Wallet page content
    const walletContent = document.querySelector('#wallet-page .internal-content');
    if (walletContent && walletContent.children.length === 0) {
        walletContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:20px; border-radius:var(--radius-md); text-align:center;">
                    <h3 style="font-size:14px; color:var(--text-secondary); margin-bottom:8px;">رصيد السحب المتاح</h3>
                    <div style="font-size:28px; font-weight:800; color:var(--neon-green);">1,250 نقطة</div>
                </div>
                <h4 style="font-size:16px; font-weight:700;">سجل العمليات السابقة</h4>
                <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:13px; color:var(--text-secondary);">
                    <li style="background:var(--glass-bg); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--glass-border);">سحب 1,000 نقطة - مكتمل (منذ 3 أيام)</li>
                    <li style="background:var(--glass-bg); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--glass-border);">سحب 500 نقطة - مكتمل (منذ أسبوع)</li>
                </ul>
            </div>
        `;
    }

    // Referrals page content
    const referralsContent = document.querySelector('#referrals-page .internal-content');
    if (referralsContent && referralsContent.children.length === 0) {
        referralsContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px; text-align:center;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:20px; border-radius:var(--radius-md);">
                    <h4 style="font-size:15px; margin-bottom:8px;">شارك رابط إحالتك واكسب 100 نقطة عن كل صديق</h4>
                    <input type="text" readonly value="https://t.me/SyriCoinBot?start=ref_12345" style="width:100%; padding:12px; background:rgba(0,0,0,0.4); border:1px solid var(--glass-border); border-radius:var(--radius-sm); color:var(--text-primary); text-align:center; font-size:12px; margin:12px 0;" id="ref-link-input">
                    <button id="copy-ref-btn" style="background:var(--neon-green); color:#000; font-weight:700; width:100%; padding:12px; border-radius:var(--radius-sm);">نسخ رابط الإحالة</button>
                </div>
            </div>
        `;
        const copyBtn = referralsContent.querySelector('#copy-ref-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const input = referralsContent.querySelector('#ref-link-input');
                if (input) {
                    input.select();
                    navigator.clipboard.writeText(input.value);
                    showToast('تم نسخ رابط الإحالة إلى الحافظة!');
                }
            });
        }
    }

    // Profile page content
    const profileContent = document.querySelector('#profile-page .internal-content');
    if (profileContent && profileContent.children.length === 0) {
        profileContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:20px; border-radius:var(--radius-md); display:flex; align-items:center; gap:16px;">
                    <div style="width:60px; height:60px; border-radius:50%; background:var(--glass-bg); border:1px solid var(--glass-border); display:flex; align-items:center; justify-content:center;">صورة</div>
                    <div>
                        <h4 style="font-size:16px; font-weight:700;">مستخدم SyriCoin</h4>
                        <span style="font-size:13px; color:var(--text-secondary);">ID: #SY-84920</span>
                    </div>
                </div>
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:16px; border-radius:var(--radius-md);">
                    <h4 style="font-size:15px; margin-bottom:12px;">إعدادات الحساب</h4>
                    <div style="display:flex; flex-direction:column; gap:10px; font-size:14px; color:var(--text-secondary);">
                        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--glass-border);">
                            <span>اللغة</span>
                            <span style="color:var(--text-primary);">العربية</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 0;">
                            <span>الإشعارات</span>
                            <span style="color:var(--neon-green);">مفعلة</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/* =========================================
   Toast Notification System
   ========================================= */
function showToast(message) {
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(20, 20, 30, 0.95);
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 30px;
        border: 1px solid rgba(0, 250, 101, 0.4);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        font-size: 14px;
        font-weight: 600;
        z-index: 99999;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
        opacity: 0;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        text-align: center;
        max-width: 90%;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
