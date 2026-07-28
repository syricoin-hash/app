/* =========================================
   SyriCoin Telegram Mini App - Phase 3 & Final Integrated Logic
   ========================================= */

// Mock Application State with LocalStorage
let appState = {
    points: 1250,
    sypValue: '62,500 ليرة سورية',
    totalEarnings: '3,400 نقطة',
    todayEarnings: '450 نقطة',
    lastTask: 'إكمال مهمة - تثبيت تطبيق',
    lastVideo: 'مشاهدة فيديو رقم #42',
    lastWithdrawal: 'لا يوجد نشاط حالي',
    userFullName: '',
    userPhone: '',
    userNationalId: '',
    userQrCode: null,
    savedWithdrawals: []
};

let currentMode = 'credit'; // 'credit' (سحب رصيد) or 'cash' (سحب كاش)
let videoInterval = null; // To handle video timers safely

// Load and Save State
function loadState() {
    const saved = localStorage.getItem('syricoin_appState');
    if (saved) {
        try {
            appState = { ...appState, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Error parsing saved data", e);
        }
    }
}

function saveState() {
    localStorage.setItem('syricoin_appState', JSON.stringify(appState));
}

document.addEventListener('DOMContentLoaded', () => {
    // 0. Load Data
    loadState();

    // 1. Initialize Telegram WebApp Integration
    initTelegramWebApp();

    // 2. Initialize Welcome Screen
    initWelcomeScreen();

    // 3. Initialize Navigation System & Edge Swipe Back
    initNavigation();

    // 4. Initialize Interactive Buttons & Data State & Withdrawal Modal
    initActions();
    initWithdrawalSystem();

    // 5. Render Initial Dashboard Data
    updateDashboardData();
});

/* =========================================
   Telegram WebApp Integration
   ========================================= */
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        const user = tg.initDataUnsafe?.user;
        if (user) {
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = user.first_name || user.username || 'مستخدم Telegram';
            }
        }
    }
}

/* =========================================
   Welcome Screen Handling
   ========================================= */
function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const startBtn = document.getElementById('start-app-btn');
    
    if (startBtn && welcomeScreen) {
        startBtn.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
        });
    }
}

/* =========================================
   Navigation System & Edge Swipe Back & Reverse Animation
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

    // Back buttons return with smooth reverse transition
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllInternalPages();
        });
    });

    // Edge Swipe Back (iPhone style simulation)
    let touchStartX = 0;
    let activeInternalPage = null;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        activeInternalPage = document.querySelector('.internal-page.active');
    }, {passive: true});

    document.addEventListener('touchend', (e) => {
        if (!activeInternalPage) return;
        const touchEndX = e.changedTouches[0].clientX;
        // If swiped from left edge (within 40px) to right (> 80px distance)
        if (touchStartX < 40 && (touchEndX - touchStartX) > 80) {
            closeAllInternalPages();
        }
    }, {passive: true});
}

function openInternalPage(pageId) {
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
}

/* =========================================
   Interactive Buttons & Features (Videos & Withdrawal)
   ========================================= */
function initActions() {
    // Populate internal pages content dynamically
    populateInternalPagesContent();
}

/* =========================================
   Vertical Video Stream + Automatic / Manual Navigation
   ========================================= */
function openVideoStreamModal() {
    let videoModal = document.getElementById('video-stream-modal');
    if (!videoModal) return;

    videoModal.style.display = 'flex';
    const scrollContainer = document.getElementById('video-stream-scroll-container');
    
    // Mock vertical video feed items
    scrollContainer.innerHTML = `
        <div class="video-slide" data-index="1">
            <div style="position:absolute; inset:0; background:linear-gradient(135deg, #111, #222); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; font-weight:700;">فيديو ترويجي رقم 1</div>
            <div class="video-overlay-info">
                <div class="video-progress-bar-container"><div class="video-progress-bar-fill" id="vid-progress-1"></div></div>
                <h4 style="font-size:16px;">فيديو مكافأة SyriCoin #1</h4>
                <p style="font-size:13px; color:var(--neon-green);">شاهد للنهاية أو اسحب للأعلى للفيديو التالي (+40 نقطة)</p>
            </div>
        </div>
        <div class="video-slide" data-index="2">
            <div style="position:absolute; inset:0; background:linear-gradient(135deg, #1a1a2e, #16213e); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; font-weight:700;">فيديو ترويجي رقم 2</div>
            <div class="video-overlay-info">
                <div class="video-progress-bar-container"><div class="video-progress-bar-fill" id="vid-progress-2"></div></div>
                <h4 style="font-size:16px;">فيديو مكافأة SyriCoin #2</h4>
                <p style="font-size:13px; color:var(--neon-green);">شاهد للنهاية أو اسحب للأعلى للفيديو التالي (+50 نقطة)</p>
            </div>
        </div>
    `;

    // Close button
    document.getElementById('close-video-stream').onclick = () => {
        if (videoInterval) clearInterval(videoInterval);
        videoModal.style.display = 'none';
    };

    // Simulate automatic progress and auto-scroll upon 100% completion
    let currentSlideIndex = 0;
    const slides = scrollContainer.querySelectorAll('.video-slide');
    
    function simulateProgressForSlide(index) {
        let progressFill = document.getElementById(`vid-progress-${index + 1}`);
        if (!progressFill) return;
        
        let progress = 0;
        if (videoInterval) clearInterval(videoInterval);
        videoInterval = setInterval(() => {
            progress += 2; // reaches 100% in 5 seconds
            progressFill.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(videoInterval);
                appState.points += 45;
                saveState();
                updateDashboardData();
                showToast('أتممت مشاهدة الفيديو بنجاح! تمت إضافة النقاط والانتقال التلقائي.');
                
                // Auto scroll to next video
                if (index + 1 < slides.length) {
                    slides[index + 1].scrollIntoView({ behavior: 'smooth' });
                    simulateProgressForSlide(index + 1);
                } else {
                    videoModal.style.display = 'none';
                }
            }
        }, 100);
    }

    simulateProgressForSlide(0);
}

/* =========================================
   Unified Withdrawal Tabs UI logic
   ========================================= */
function updateWithdrawalTabsUI(mode) {
    currentMode = mode;
    const tabsContainer = document.getElementById('withdrawal-tabs-container');
    const qrSectionContainer = document.getElementById('qr-section-container');
    
    if (!tabsContainer || !qrSectionContainer) return;

    if (mode === 'credit') {
        qrSectionContainer.style.display = 'none';
        tabsContainer.innerHTML = `
            <button class="tab-btn active" data-tab="mtn">MTN رصيد</button>
            <button class="tab-btn" data-tab="syriatel">سيرياتيل رصيد</button>
        `;
    } else {
        qrSectionContainer.style.display = 'flex';
        tabsContainer.innerHTML = `
            <button class="tab-btn active" data-tab="sham">شام كاش</button>
            <button class="tab-btn" data-tab="syriatel-cash">سيرياتيل كاش</button>
        `;
    }

    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/* =========================================
   Advanced Withdrawal System & QR Code Processing
   ========================================= */
function initWithdrawalSystem() {
    const requestWithdrawalBtn = document.getElementById('request-withdrawal-btn');
    const withdrawalModal = document.getElementById('withdrawal-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const uploadQrBtn = document.getElementById('upload-qr-btn');
    const qrFileInput = document.getElementById('qr-file-input');
    const qrStatusText = document.getElementById('qr-status-text');
    const smartConfirmBtn = document.getElementById('smart-confirm-withdrawal-btn');

    if (requestWithdrawalBtn && withdrawalModal) {
        requestWithdrawalBtn.addEventListener('click', () => {
            withdrawalModal.classList.add('active');
            updateWithdrawalTabsUI('credit');
            loadAutoSavedBillingInfo();
        });
    }

    if (closeModalBtn && withdrawalModal) {
        closeModalBtn.addEventListener('click', () => {
            withdrawalModal.classList.remove('active');
        });
    }

    // QR Image Picker & jsQR Decoder integration
    if (uploadQrBtn && qrFileInput) {
        uploadQrBtn.addEventListener('click', () => {
            qrFileInput.click();
        });

        qrFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            qrStatusText.textContent = 'جاري قراءة كود الـ QR...';
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const canvasCtx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvasCtx.drawImage(img, 0, 0);
                    const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    if (window.jsQR) {
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            appState.userQrCode = code.data;
                            qrStatusText.textContent = 'تمت قراءة الكود بنجاح: ' + code.data;
                            qrStatusText.style.color = 'var(--neon-green)';
                        } else {
                            qrStatusText.textContent = 'تعذر قراءة الكود، حاول رفع صورة أوضح.';
                            qrStatusText.style.color = 'var(--error-red)';
                        }
                    } else {
                        appState.userQrCode = 'Uploaded_QR_Mock_ID';
                        qrStatusText.textContent = 'تم رفع كود الـ QR بنجاح.';
                        qrStatusText.style.color = 'var(--neon-green)';
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Front-End Validation & Smart Confirm Button State
    const fullnameInput = document.getElementById('withdrawal-fullname');
    const phoneInput = document.getElementById('withdrawal-phone');
    const nationalIdInput = document.getElementById('withdrawal-national-id');
    const amountInput = document.getElementById('withdrawal-amount');

    function validateInputs() {
        const fullname = fullnameInput.value.trim();
        const phone = phoneInput.value.trim();
        const natId = nationalIdInput.value.trim();
        const amount = amountInput.value.trim();

        let isValid = true;
        if (!fullname || phone.length !== 8 || natId.length !== 11 || !amount) {
            isValid = false;
        }
        if (currentMode === 'cash' && !appState.userQrCode) {
            isValid = false;
        }

        if (isValid) {
            smartConfirmBtn.classList.remove('error-state');
            smartConfirmBtn.textContent = 'تأكيد التحويل';
        } else {
            smartConfirmBtn.classList.add('error-state');
            smartConfirmBtn.textContent = 'يرجى إكمال البيانات المطلوبة بدقة';
        }
        return isValid;
    }

    [fullnameInput, phoneInput, nationalIdInput, amountInput].forEach(input => {
        if (input) {
            input.addEventListener('input', validateInputs);
        }
    });

    if (smartConfirmBtn) {
        smartConfirmBtn.addEventListener('click', () => {
            if (validateInputs()) {
                // Save persistently for Profile Auto-Saved Billing Info
                appState.userFullName = fullnameInput.value.trim();
                appState.userPhone = '09' + phoneInput.value.trim();
                appState.userNationalId = nationalIdInput.value.trim();

                appState.lastWithdrawal = `طلب سحب بقيمة ${amountInput.value} نقطة (قيد المعالجة)`;
                appState.savedWithdrawals.unshift({
                    type: currentMode === 'credit' ? 'سحب رصيد' : 'سحب كاش',
                    amount: amountInput.value,
                    date: 'اليوم'
                });
                
                saveState();
                updateDashboardData();
                withdrawalModal.classList.remove('active');
                showToast('تم تقديم طلب السحب بنجاح وحفظ بياناتك تلقائياً.');
            } else {
                showToast('خطأ: تأكد من إكمال كافة الحقول بالشروط المحددة.');
            }
        });
    }
}

function loadAutoSavedBillingInfo() {
    const fullnameInput = document.getElementById('withdrawal-fullname');
    const phoneInput = document.getElementById('withdrawal-phone');
    const nationalIdInput = document.getElementById('withdrawal-national-id');

    if (fullnameInput && appState.userFullName) fullnameInput.value = appState.userFullName;
    if (phoneInput && appState.userPhone) phoneInput.value = appState.userPhone.replace(/^09/, '');
    if (nationalIdInput && appState.userNationalId) nationalIdInput.value = appState.userNationalId;
}

/* =========================================
   Internal Pages Dynamic Content Population (Profile & Wallet)
   ========================================= */
function populateInternalPagesContent() {
    // Videos page content (integrated with Video Stream Modal trigger)
    const videosContent = document.querySelector('#videos-page .internal-content');
    if (videosContent && videosContent.children.length === 0) {
        videosContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:20px; border-radius:var(--radius-md); text-align:center;">
                    <h3 style="font-size:16px; font-weight:700; margin-bottom:8px;">خلاصة فيديوهات SyriCoin</h3>
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">تصفح الفيديوهات بالتمرير اليدوي أو اتركها تنتقل تلقائياً عند الاكتمال.</p>
                    <button id="launch-video-stream-btn" style="background:var(--neon-green); color:#000; font-weight:700; width:100%; padding:14px; border-radius:var(--radius-sm); box-shadow:var(--neon-glow);">بدء المشاهدة وكسب النقاط</button>
                </div>
            </div>
        `;
        document.getElementById('launch-video-stream-btn').addEventListener('click', () => {
            openVideoStreamModal();
        });
    }

    // CPA Tasks page content
    const cpaContent = document.querySelector('#cpa-page .internal-content');
    if (cpaContent && cpaContent.children.length === 0) {
        cpaContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:16px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="font-size:15px; margin-bottom:4px;">تنزيل وتثبيت تطبيق اللعبة</h4>
                        <span style="font-size:13px; color:var(--neon-green);">المكافأة: +200 نقطة</span>
                    </div>
                    <button class="cpa-task-btn" style="background:var(--neon-green); color:#000; padding:8px 16px; border-radius:var(--radius-sm); font-weight:700;">تنفيذ المهمة</button>
                </div>
            </div>
        `;
        cpaContent.querySelectorAll('.cpa-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                appState.points += 200;
                appState.lastTask = 'إكمال مهمة تنزيل تطبيق (+200 نقطة)';
                saveState();
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
                <div style="display:flex; gap:12px;">
                    <button class="tab-btn active" id="btn-tab-credit" style="flex:1;">سحب رصيد</button>
                    <button class="tab-btn" id="btn-tab-cash" style="flex:1;">سحب كاش</button>
                </div>
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:20px; border-radius:var(--radius-md); text-align:center;">
                    <h3 style="font-size:14px; color:var(--text-secondary); margin-bottom:8px;">رصيد السحب المتاح</h3>
                    <div style="font-size:28px; font-weight:800; color:var(--neon-green);" id="wallet-points-display">${appState.points} نقطة</div>
                </div>
            </div>
        `;
        
        document.getElementById('btn-tab-credit').addEventListener('click', (e) => {
            document.querySelectorAll('#wallet-page .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const withdrawalModal = document.getElementById('withdrawal-modal');
            withdrawalModal.classList.add('active');
            updateWithdrawalTabsUI('credit');
        });

        document.getElementById('btn-tab-cash').addEventListener('click', (e) => {
            document.querySelectorAll('#wallet-page .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const withdrawalModal = document.getElementById('withdrawal-modal');
            withdrawalModal.classList.add('active');
            updateWithdrawalTabsUI('cash');
        });
    } else if (walletContent) {
        const walletDisplay = document.getElementById('wallet-points-display');
        if (walletDisplay) {
            walletDisplay.textContent = `${appState.points} نقطة`;
        }
    }

    // Referrals page content (named نظام المشارك)
    const referralsContent = document.querySelector('#referrals-page .internal-content');
    if (referralsContent && referralsContent.children.length === 0) {
        referralsContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px; text-align:center;">
                <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:20px; border-radius:var(--radius-md);">
                    <h4 style="font-size:15px; margin-bottom:8px;">شارك رابط المشارك الخاص بك واكسب 100 نقطة عن كل صديق</h4>
                    <input type="text" readonly value="https://t.me/SyriCoinBot?start=ref_12345" style="width:100%; padding:12px; background:rgba(0,0,0,0.4); border:1px solid var(--glass-border); border-radius:var(--radius-sm); color:var(--text-primary); text-align:center; font-size:12px; margin:12px 0;" id="ref-link-input">
                    <button id="copy-ref-btn" style="background:var(--neon-green); color:#000; font-weight:700; width:100%; padding:12px; border-radius:var(--radius-sm);">نسخ رابط المشارك</button>
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
                    showToast('تم نسخ رابط المشارك إلى الحافظة!');
                }
            });
        }
    }

    // Profile page content (Restructured with Expandable Cards and General Settings / Withdrawal History accordion)
    const profileContent = document.querySelector('#profile-page .internal-content');
    if (profileContent && profileContent.children.length === 0) {
        profileContent.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- 1. First Expandable Card: إعدادات الحساب -->
                <div class="expandable-card" id="profile-expand-card">
                    <div class="expandable-header">
                        <span>إعدادات الحساب</span>
                        <span style="font-size:20px; color:var(--text-secondary);">⌄</span>
                    </div>
                    <div class="expandable-content">
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                            <button id="change-avatar-btn" style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:8px 16px; border-radius:var(--radius-sm); font-size:13px; color:var(--text-primary);">تغيير الصورة الشخصية</button>
                        </div>
                        <div class="input-group">
                            <label>اسم المستخدم</label>
                            <input type="text" id="profile-username-input" value="مستخدم SyriCoin">
                        </div>
                        <h4 style="font-size:14px; font-weight:700; margin-top:8px; color:var(--neon-green);">البيانات الشخصية المحفوظة آلياً</h4>
                        <div style="background:rgba(0,0,0,0.3); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--glass-border); font-size:13px; display:flex; flex-direction:column; gap:6px;">
                            <div>الاسم الثلاثي: <span id="saved-info-name" style="color:var(--text-secondary);">${appState.userFullName || 'غير محدد'}</span></div>
                            <div>رقم الهاتف: <span id="saved-info-phone" style="color:var(--text-secondary);">${appState.userPhone || 'غير محدد'}</span></div>
                            <div>الرقم الوطني: <span id="saved-info-nat" style="color:var(--text-secondary);">${appState.userNationalId || 'غير محدد'}</span></div>
                        </div>
                    </div>
                </div>

                <!-- 2. Second Expandable Card: الإعدادات العامة -->
                <div class="expandable-card" id="general-expand-card">
                    <div class="expandable-header">
                        <span>الإعدادات العامة</span>
                        <span style="font-size:20px; color:var(--text-secondary);">⌄</span>
                    </div>
                    <div class="expandable-content">
                        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--glass-border); font-size:14px;">
                            <span>اللغة</span>
                            <span style="color:var(--text-primary);">العربية</span>
                        </div>
                    </div>
                </div>

                <!-- 3. Third Card / Accordion for سجل السحب -->
                <div class="expandable-card" id="withdrawal-history-card">
                    <div class="expandable-header">
                        <span>سجل السحب</span>
                        <span style="font-size:20px; color:var(--text-secondary);">⌄</span>
                    </div>
                    <div class="expandable-content" id="withdrawal-history-list">
                        <div style="color:var(--text-secondary); font-size:13px; text-align:center; padding:10px;">لا توجد عمليات سحب سابقة مسجلة</div>
                    </div>
                </div>
            </div>
        `;

        // Expandable toggle logic
        document.querySelectorAll('.expandable-header').forEach(header => {
            header.addEventListener('click', () => {
                const card = header.parentElement;
                card.classList.toggle('expanded');
            });
        });

        // Add Avatar Functionality
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => {
                showToast('ميزة تغيير الصورة الشخصية ستتوفر في التحديث القادم.');
            });
        }
    }

    // Populate withdrawal history list dynamically
    updateWithdrawalHistoryUI();
}

function updateWithdrawalHistoryUI() {
    const historyListContainer = document.getElementById('withdrawal-history-list');
    if (!historyListContainer) return;

    if (appState.savedWithdrawals.length === 0) {
        historyListContainer.innerHTML = `<div style="color:var(--text-secondary); font-size:13px; text-align:center; padding:10px;">لا توجد عمليات سحب سابقة مسجلة</div>`;
    } else {
        let html = '';
        appState.savedWithdrawals.forEach(item => {
            html += `
                <div style="background:rgba(0,0,0,0.3); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--glass-border); display:flex; justify-content:space-between; align-items:center; font-size:13px;">
                    <div>
                        <div style="font-weight:700; color:var(--text-primary);">${item.type}</div>
                        <div style="color:var(--text-secondary); font-size:11px;">${item.date}</div>
                    </div>
                    <div style="color:var(--neon-green); font-weight:700;">${item.amount} نقطة</div>
                </div>
            `;
        });
        historyListContainer.innerHTML = html;
    }

    // Also update profile auto-saved labels if loaded
    const savedName = document.getElementById('saved-info-name');
    const savedPhone = document.getElementById('saved-info-phone');
    const savedNat = document.getElementById('saved-info-nat');
    if (savedName) savedName.textContent = appState.userFullName || 'غير محدد';
    if (savedPhone) savedPhone.textContent = appState.userPhone || 'غير محدد';
    if (savedNat) savedNat.textContent = appState.userNationalId || 'غير محدد';
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
