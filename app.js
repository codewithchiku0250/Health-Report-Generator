/**
 * Health Report Generator Logic
 */

// ==========================================
// STATE MANAGEMENT & DATA
// ==========================================
const AppState = {
    currentUser: null,
    reports: [],
    currentTheme: localStorage.getItem('theme') || 'light'
};

// Apply Initial Theme
if (AppState.currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// Check for existing user
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    AppState.currentUser = JSON.parse(savedUser);
    setTimeout(() => loginSuccess(), 100);
}

// Helper to get all users
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
}

// Helper to save users
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Generate Dummy Data for testing
function seedDummyData() {
    if (!localStorage.getItem('healthReports')) {
        const dummyReports = [
            {
                id: 'REP-' + Math.floor(Math.random() * 10000),
                date: new Date(Date.now() - 86400000 * 5).toLocaleDateString(), // 5 days ago
                timestamp: Date.now() - 86400000 * 5,
                patientName: 'John Doe',
                patientAge: 45,
                patientGender: 'Male',
                patientAddress: '123 Dummy St, City',
                type: 'Blood Test',
                results: { hemo: 11.5, rbc: 3.8, wbc: 12000, platelets: 140000, sugar: 155 },
                summary: [
                    "Hemoglobin is low, indicating potential anemia.",
                    "White blood cell count is elevated.",
                    "Fasting blood sugar is high."
                ]
            },
            {
                id: 'REP-' + Math.floor(Math.random() * 10000),
                date: new Date(Date.now() - 86400000 * 20).toLocaleDateString(), // 20 days ago
                timestamp: Date.now() - 86400000 * 20,
                patientName: 'Jane Smith',
                patientAge: 29,
                patientGender: 'Female',
                patientAddress: '456 Sample Ave, Town',
                type: 'Urine Test',
                results: { color: 'Yellow', ph: 6.5, protein: 'Negative', glucosuria: 'Negative', ketones: 'Negative' },
                summary: ["All tested parameters are within normal ranges."]
            }
        ];
        if (AppState.currentUser) {
            dummyReports.forEach(r => r.doctorEmail = AppState.currentUser.email);
        }
        localStorage.setItem('healthReports', JSON.stringify(dummyReports));
    }
}

// Load reports
function loadReports() {
    const data = localStorage.getItem('healthReports');
    const allReports = data ? JSON.parse(data) : [];
    if (AppState.currentUser) {
        AppState.reports = allReports.filter(r => r.doctorEmail === AppState.currentUser.email || !r.doctorEmail);
    } else {
        AppState.reports = allReports;
    }
}

// Save report
function saveReport(report) {
    if (AppState.currentUser) {
        report.doctorEmail = AppState.currentUser.email;
    }
    const data = localStorage.getItem('healthReports');
    const allReports = data ? JSON.parse(data) : [];
    allReports.unshift(report);
    localStorage.setItem('healthReports', JSON.stringify(allReports));
    AppState.reports.unshift(report); // Add to top
}

// ==========================================
// UI CONTROLS & NAVIGATION
// ==========================================
const DOM = {
    navbar: document.getElementById('navbar'),
    navUsername: document.getElementById('nav-username'),
    screens: document.querySelectorAll('.screen'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),

    // Profile Modal
    btnEditProfile: document.getElementById('btn-edit-profile'),
    modalProfile: document.getElementById('modal-profile'),
    btnCloseProfile: document.getElementById('btn-close-profile'),
    formProfile: document.getElementById('form-profile'),

    // Auth
    formLogin: document.getElementById('form-login'),
    formSignup: document.getElementById('form-signup'),

    // Dash
    dashboardStats: document.getElementById('stat-total-reports'),
    reportsList: document.getElementById('reports-list'),
    emptyState: document.getElementById('empty-state'),
    welcomeMsg: document.getElementById('welcome-message'),

    // Report Input
    formMedical: document.getElementById('form-medical-data'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Report Preview
    pdfContainer: document.getElementById('pdf-container')
};

function showScreen(screenId) {
    DOM.screens.forEach(s => s.classList.add('hidden'));
    DOM.screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    target.classList.remove('hidden');
    // small delay for animation
    setTimeout(() => {
        target.classList.add('active');
    }, 10);

    // Show/hide navbar
    if (screenId === 'screen-auth') {
        DOM.navbar.classList.add('hidden');
    } else {
        DOM.navbar.classList.remove('hidden');
    }

    if (screenId === 'screen-dashboard') {
        renderDashboard();
    }
}

function showToast(message, isError = false) {
    DOM.toastMessage.textContent = message;
    DOM.toast.style.backgroundColor = isError ? "var(--danger)" : "var(--primary)";
    DOM.toast.style.color = "#fff";
    DOM.toast.classList.add('show');
    setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// AUTHENTICATION LOGIC (Simulated)
// ==========================================
document.getElementById('link-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    DOM.formLogin.classList.add('hidden');
    DOM.formSignup.classList.remove('hidden');
});

document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    DOM.formSignup.classList.add('hidden');
    DOM.formLogin.classList.remove('hidden');
});

DOM.formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email === 'al9434365@gmail.com' && password === 'Ankush@123') {
        AppState.currentUser = {
            name: 'Admin Ankush',
            email: email,
            role: 'admin'
        };
        localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
        loginSuccess();
        return;
    }

    // Simulate Login
    const users = getAllUsers();
    if (users[email]) {
        AppState.currentUser = users[email];
    } else {
        AppState.currentUser = {
            name: email.split('@')[0],
            email: email,
            clinicName: 'HealthGen Diagnostics',
            clinicAddress: '123 Medical Boulevard, Wellness City',
            clinicPhone: '(555) 123-4567',
            subscription: { isActive: false, plan: null, expiry: null }
        };
        users[email] = AppState.currentUser;
        saveUsers(users);
    }
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
    loginSuccess();
});

DOM.formSignup.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const clinicName = document.getElementById('signup-clinic').value;
    const clinicAddress = document.getElementById('signup-address').value;
    const clinicPhone = document.getElementById('signup-phone').value;

    // Simulate Signup
    const users = getAllUsers();
    AppState.currentUser = { 
        name, email, clinicName, clinicAddress, clinicPhone,
        subscription: { isActive: false, plan: null, expiry: null }
    };
    users[email] = AppState.currentUser;
    saveUsers(users);

    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
    loginSuccess();
});

document.getElementById('btn-guest-login').addEventListener('click', () => {
    const email = 'guest@clinic.com';
    const users = getAllUsers();
    
    if (users[email]) {
        AppState.currentUser = users[email];
    } else {
        AppState.currentUser = {
            name: 'Guest Doctor',
            email: email,
            clinicName: 'HealthGen Diagnostics',
            clinicAddress: '123 Medical Boulevard, Wellness City',
            clinicPhone: '(555) 123-4567',
            subscription: { isActive: false, plan: null, expiry: null }
        };
        users[email] = AppState.currentUser;
        saveUsers(users);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
    loginSuccess();
});

document.getElementById('btn-logout').addEventListener('click', () => {
    AppState.currentUser = null;
    localStorage.removeItem('currentUser');
    showScreen('screen-auth');
    showToast('Logged out successfully');
});

// Profile Modal Logic
if (DOM.btnEditProfile) {
    DOM.btnEditProfile.addEventListener('click', () => {
        if (AppState.currentUser) {
            document.getElementById('profile-name').value = AppState.currentUser.name || '';
            document.getElementById('profile-clinic').value = AppState.currentUser.clinicName || '';
            document.getElementById('profile-address').value = AppState.currentUser.clinicAddress || '';
            document.getElementById('profile-phone').value = AppState.currentUser.clinicPhone || '';
            document.getElementById('profile-email').value = AppState.currentUser.email || '';
        }
        DOM.modalProfile.classList.remove('hidden');
    });
}

if (DOM.btnCloseProfile) {
    DOM.btnCloseProfile.addEventListener('click', () => {
        DOM.modalProfile.classList.add('hidden');
    });
}

if (DOM.formProfile) {
    DOM.formProfile.addEventListener('submit', (e) => {
        e.preventDefault();
        if (AppState.currentUser) {
            const oldEmail = AppState.currentUser.email;

            AppState.currentUser.name = document.getElementById('profile-name').value;
            AppState.currentUser.clinicName = document.getElementById('profile-clinic').value;
            AppState.currentUser.clinicAddress = document.getElementById('profile-address').value;
            AppState.currentUser.clinicPhone = document.getElementById('profile-phone').value;
            AppState.currentUser.email = document.getElementById('profile-email').value;

            const users = getAllUsers();
            if (AppState.currentUser.email !== oldEmail) {
                delete users[oldEmail];
            }
            users[AppState.currentUser.email] = AppState.currentUser;
            saveUsers(users);

            localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
            DOM.navUsername.textContent = `Dr. ${AppState.currentUser.name}`;
            DOM.welcomeMsg.textContent = `Welcome back, Dr. ${AppState.currentUser.name}!`;
            showToast('Profile updated successfully!');
            DOM.modalProfile.classList.add('hidden');
        }
    });
}

function loginSuccess() {
    DOM.navUsername.textContent = AppState.currentUser.role === 'admin' ? AppState.currentUser.name : `Dr. ${AppState.currentUser.name}`;
    DOM.welcomeMsg.textContent = `Welcome back, ${AppState.currentUser.role === 'admin' ? '' : 'Dr. '}${AppState.currentUser.name}!`;
    
    if (AppState.currentUser.role === 'admin') {
        renderAdminDashboard();
        showScreen('screen-admin');
    } else {
        // Ensure subscription object exists for older accounts
        if (!AppState.currentUser.subscription) {
            AppState.currentUser.subscription = { isActive: false, plan: null, expiry: null };
            const users = getAllUsers();
            users[AppState.currentUser.email] = AppState.currentUser;
            saveUsers(users);
            localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
        }

        seedDummyData();
        loadReports();
        showScreen('screen-dashboard');
    }
    showToast('Logged in successfully');
}


// ==========================================
// THEME TOGGLE
// ==========================================
document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        AppState.currentTheme = 'light';
        document.querySelector('#btn-theme-toggle i').className = 'fa-solid fa-moon';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        AppState.currentTheme = 'dark';
        document.querySelector('#btn-theme-toggle i').className = 'fa-solid fa-sun';
    }
});


// ==========================================
// DASHBOARD LOGIC
// ==========================================
function renderDashboard() {
    DOM.dashboardStats.textContent = AppState.reports.length;
    DOM.reportsList.innerHTML = '';

    if (AppState.reports.length === 0) {
        DOM.emptyState.classList.remove('hidden');
    } else {
        DOM.emptyState.classList.add('hidden');

        // Sort by newest
        const sorted = [...AppState.reports].sort((a, b) => b.timestamp - a.timestamp);

        sorted.forEach((report, index) => {
            const card = document.createElement('div');
            card.className = 'report-card';
            card.innerHTML = `
                <div class="rc-header">
                    <span class="rc-id">${report.id}</span>
                    <span class="rc-date">${report.date}</span>
                </div>
                <div class="rc-title">${report.type}</div>
                <div class="rc-patient"><i class="fa-solid fa-user"></i> ${report.patientName} (${report.patientAge}${report.patientGender.charAt(0)})</div>
                <div class="rc-actions">
                    <button class="btn btn-outline btn-sm btn-view-report" data-index="${index}"><i class="fa-solid fa-eye"></i> View</button>
                    <button class="btn btn-secondary btn-sm text-danger btn-delete-report" data-id="${report.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            DOM.reportsList.appendChild(card);
        });

        // Add event listeners for dynamically created buttons
        document.querySelectorAll('.btn-view-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                const rep = sorted[idx];
                renderReportPreview(rep);
                showScreen('screen-report');
            });
        });

        document.querySelectorAll('.btn-delete-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this report?')) {
                    AppState.reports = AppState.reports.filter(r => r.id !== id);
                    
                    const data = localStorage.getItem('healthReports');
                    let allReports = data ? JSON.parse(data) : [];
                    allReports = allReports.filter(r => r.id !== id);
                    localStorage.setItem('healthReports', JSON.stringify(allReports));
                    
                    renderDashboard();
                    showToast('Report deleted', true);
                }
            });
        });
    }
}

document.getElementById('btn-new-report').addEventListener('click', () => {
    if (AppState.currentUser && AppState.currentUser.subscription && !AppState.currentUser.subscription.isActive) {
        showScreen('screen-subscription');
    } else {
        DOM.formMedical.reset();
        document.getElementById('report-date').valueAsDate = new Date(); // set today's date
        showScreen('screen-input');
    }
});

document.getElementById('btn-back-to-dash').addEventListener('click', () => {
    showScreen('screen-dashboard');
});

document.getElementById('btn-sub-back-to-dash').addEventListener('click', () => {
    showScreen('screen-dashboard');
});

// ==========================================
// RAZORPAY & SUBSCRIPTION LOGIC
// ==========================================
let selectedPlan = null;
let selectedAmount = null;

document.querySelectorAll('.btn-pay').forEach(btn => {
    btn.addEventListener('click', (e) => {
        selectedPlan = e.target.getAttribute('data-plan');
        selectedAmount = parseInt(e.target.getAttribute('data-amount')) * 100; // Razorpay needs amount in paise
        
        const options = {
            "key": "rzp_test_dummykey_replace_me", // Enter the Key ID generated from the Dashboard
            "amount": selectedAmount,
            "currency": "INR",
            "name": "HealthGen Diagnostics",
            "description": `${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
            "image": "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
            "handler": function (response){
                // On Success
                handlePaymentSuccess(response.razorpay_payment_id);
            },
            "prefill": {
                "name": AppState.currentUser.name,
                "email": AppState.currentUser.email,
                "contact": AppState.currentUser.clinicPhone
            },
            "theme": {
                "color": "#1E6091"
            }
        };

        if (options.key === "rzp_test_dummykey_replace_me") {
            showToast("Simulating Payment (No Real Key Provided)...");
            setTimeout(() => {
                handlePaymentSuccess('pay_simulated_' + Math.floor(Math.random() * 1000000));
            }, 1000);
            return;
        }

        try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
                showToast('Payment Failed: ' + response.error.description, true);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay script not loaded or error initializing", error);
            showToast("Error initializing payment gateway. Use Simulate button for testing.", true);
        }
    });
});

document.getElementById('btn-simulate-payment').addEventListener('click', () => {
    if (!selectedPlan) {
        selectedPlan = 'yearly';
        selectedAmount = 349900;
    }
    handlePaymentSuccess('pay_simulated_' + Math.floor(Math.random() * 1000000));
});

function handlePaymentSuccess(paymentId) {
    const expiryDate = new Date();
    if (selectedPlan === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    AppState.currentUser.subscription = {
        isActive: true,
        plan: selectedPlan,
        expiry: expiryDate.getTime(),
        paymentId: paymentId
    };

    // Save to local storage
    const users = getAllUsers();
    users[AppState.currentUser.email] = AppState.currentUser;
    saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));

    // Also record revenue
    const revenue = JSON.parse(localStorage.getItem('systemRevenue')) || 0;
    localStorage.setItem('systemRevenue', revenue + (selectedAmount / 100));

    showToast('Payment Successful! Subscription activated.');
    
    // Proceed to new report page
    DOM.formMedical.reset();
    document.getElementById('report-date').valueAsDate = new Date();
    showScreen('screen-input');
}

// ==========================================
// ADMIN DASHBOARD LOGIC
// ==========================================
function renderAdminDashboard() {
    const users = getAllUsers();
    let totalDoctors = 0;
    const tableBody = document.getElementById('admin-doctors-list');
    tableBody.innerHTML = '';

    for (const email in users) {
        if (users[email].role === 'admin') continue;
        
        totalDoctors++;
        const doc = users[email];
        const subStatus = doc.subscription && doc.subscription.isActive 
            ? `<span class="text-success"><i class="fa-solid fa-check-circle"></i> Active (${doc.subscription.plan})</span>`
            : `<span class="text-danger"><i class="fa-solid fa-times-circle"></i> Inactive</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>Dr. ${doc.name}</strong></td>
            <td>${doc.email}</td>
            <td>${doc.clinicName}</td>
            <td>${subStatus}</td>
        `;
        tableBody.appendChild(tr);
    }

    document.getElementById('admin-total-doctors').textContent = totalDoctors;
    
    const totalRevenue = JSON.parse(localStorage.getItem('systemRevenue')) || 0;
    document.getElementById('admin-total-revenue').textContent = `₹${totalRevenue}`;
}


// ==========================================
// FORM TABS LOGIC
// ==========================================
DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        const targetId = targetBtn.getAttribute('data-target');
        const targetContent = document.getElementById(targetId);

        if (targetBtn.classList.contains('active')) {
            // Prevent deselecting if it's the only one active
            if (document.querySelectorAll('.tab-btn.active').length > 1) {
                targetBtn.classList.remove('active');
                targetContent.classList.add('hidden');
            } else {
                showToast('At least one test must be selected', true);
            }
        } else {
            targetBtn.classList.add('active');
            targetContent.classList.remove('hidden');
        }
    });
});


// ==========================================
// MEDICAL LOGIC ENGINE
// ==========================================
function evaluateBloodTest(results) {
    let summary = [];
    let formattedRows = [];

    const checkValue = (val, min, max, name, unit) => {
        if (val === null || val === "" || isNaN(val)) return null;
        let status = 'Normal';
        let cssClass = 'text-success';

        if (val < min) { status = 'Low'; cssClass = 'text-warning'; summary.push(`${name} is low (${val}), minimum is ${min}.`); }
        else if (val > max) { status = 'High'; cssClass = 'text-danger'; summary.push(`${name} is elevated (${val}), maximum is ${max}.`); }

        return `<tr>
            <td><strong>${name}</strong></td>
            <td class="${cssClass}">${val} ${status !== 'Normal' ? `(${status})` : ''}</td>
            <td>${unit}</td>
            <td>${min} - ${max}</td>
        </tr>`;
    };

    const hemo = checkValue(results.hemo, 12.0, 17.0, 'Hemoglobin', 'g/dL');
    const rbc = checkValue(results.rbc, 4.0, 5.9, 'RBC Count', 'mill./mcL');
    const wbc = checkValue(results.wbc, 4500, 11000, 'WBC Count', 'cells/mcL');
    const plats = checkValue(results.platelets, 150000, 450000, 'Platelets', 'cells/mcL');
    const sugar = checkValue(results.sugar, 70, 100, 'Blood Sugar (Fasting)', 'mg/dL');

    if (hemo) formattedRows.push(hemo);
    if (rbc) formattedRows.push(rbc);
    if (wbc) formattedRows.push(wbc);
    if (plats) formattedRows.push(plats);
    if (sugar) formattedRows.push(sugar);

    if (summary.length === 0 && formattedRows.length > 0) {
        summary.push("All tested blood parameters are within normal biological reference intervals.");
    }

    return { rows: formattedRows.join(''), summary };
}

function evaluateUrineTest(results) {
    let summary = [];
    let formattedRows = [];

    const addRow = (name, val, normalRange, isNormal) => {
        if (!val) return null;
        let css = isNormal ? 'text-success' : 'text-danger';
        return `<tr>
            <td><strong>${name}</strong></td>
            <td class="${css}">${val}</td>
            <td>${normalRange}</td>
        </tr>`;
    };

    if (results.color) {
        let isNormal = ['Pale Yellow', 'Yellow'].includes(results.color);
        if (!isNormal) summary.push(`Urine color is abnormal (${results.color}).`);
        formattedRows.push(addRow('Color', results.color, 'Pale Yellow / Yellow', isNormal));
    }

    if (results.ph) {
        let phNum = parseFloat(results.ph);
        let isNormal = phNum >= 4.5 && phNum <= 8.0;
        if (!isNormal) summary.push(`pH level is ${phNum < 4.5 ? 'acidic' : 'alkaline'} completely outside normal range.`);
        formattedRows.push(addRow('pH Level', phNum, '4.5 - 8.0', isNormal));
    }

    // Proteins, Glucose, Ketones should ideally be Negative
    const checkCompound = (name, val) => {
        if (!val) return;
        let isNormal = val === 'Negative';
        if (!isNormal) summary.push(`Presence of ${name} detected (${val}).`);
        formattedRows.push(addRow(name, val, 'Negative', isNormal));
    }

    checkCompound('Protein', results.protein);
    checkCompound('Glucose', results.glucosuria);
    checkCompound('Ketones', results.ketones);

    if (summary.length === 0 && formattedRows.length > 0) {
        summary.push("Urinalysis shows no abnormalities.");
    }

    return { rows: formattedRows.join(''), summary };
}

function evaluateLipidProfile(results) {
    let summary = [];
    let formattedRows = [];

    const checkValue = (val, type, name, unit, normalRangeStr) => {
        if (val === null || val === "" || isNaN(val)) return null;
        let status = 'Normal';
        let cssClass = 'text-success';

        if (type === 'max' && val > normalRangeStr) {
            status = 'High'; cssClass = 'text-danger'; summary.push(`${name} is elevated (${val}), should be < ${normalRangeStr}.`);
        } else if (type === 'min' && val < normalRangeStr) {
            status = 'Low'; cssClass = 'text-warning'; summary.push(`${name} is low (${val}), should be > ${normalRangeStr}.`);
        }

        return `<tr>
            <td><strong>${name}</strong></td>
            <td class="${cssClass}">${val} ${status !== 'Normal' ? `(${status})` : ''}</td>
            <td>${unit}</td>
            <td>${type === 'max' ? '< ' + normalRangeStr : '> ' + normalRangeStr}</td>
        </tr>`;
    };

    const chol = checkValue(results.cholesterol, 'max', 'Total Cholesterol', 'mg/dL', 200);
    const trig = checkValue(results.triglycerides, 'max', 'Triglycerides', 'mg/dL', 150);
    const hdl = checkValue(results.hdl, 'min', 'HDL Cholesterol', 'mg/dL', 40);
    const ldl = checkValue(results.ldl, 'max', 'LDL Cholesterol', 'mg/dL', 100);

    if (chol) formattedRows.push(chol);
    if (trig) formattedRows.push(trig);
    if (hdl) formattedRows.push(hdl);
    if (ldl) formattedRows.push(ldl);

    if (summary.length === 0 && formattedRows.length > 0) {
        summary.push("Lipid profile is within normal limits, indicating a healthy cardiovascular risk profile.");
    }

    return { rows: formattedRows.join(''), summary };
}

function evaluateLFT(results) {
    let summary = [];
    let formattedRows = [];

    const checkValue = (val, min, max, name, unit) => {
        if (val === null || val === "" || isNaN(val)) return null;
        let status = 'Normal';
        let cssClass = 'text-success';

        if (val < min) { status = 'Low'; cssClass = 'text-warning'; summary.push(`${name} is low (${val}), minimum is ${min}.`); }
        else if (val > max) { status = 'High'; cssClass = 'text-danger'; summary.push(`${name} is elevated (${val}), maximum is ${max}.`); }

        return `<tr>
            <td><strong>${name}</strong></td>
            <td class="${cssClass}">${val} ${status !== 'Normal' ? `(${status})` : ''}</td>
            <td>${unit}</td>
            <td>${min} - ${max}</td>
        </tr>`;
    };

    const bil = checkValue(results.bilirubin, 0.1, 1.2, 'Total Bilirubin', 'mg/dL');
    const sgpt = checkValue(results.sgpt, 7, 56, 'SGPT / ALT', 'U/L');
    const sgot = checkValue(results.sgot, 8, 40, 'SGOT / AST', 'U/L');
    const alp = checkValue(results.alp, 44, 147, 'Alkaline Phosphatase', 'U/L');

    if (bil) formattedRows.push(bil);
    if (sgpt) formattedRows.push(sgpt);
    if (sgot) formattedRows.push(sgot);
    if (alp) formattedRows.push(alp);

    if (summary.length === 0 && formattedRows.length > 0) {
        summary.push("Liver enzymes and bilirubin levels are within normal physiological ranges.");
    }

    return { rows: formattedRows.join(''), summary };
}

// Generate New Report Event
DOM.formMedical.addEventListener('submit', (e) => {
    e.preventDefault();

    // Determine Active Tabs
    let selectedTypes = [];
    let selectedTargets = [];
    const activeTabs = document.querySelectorAll('.tab-btn.active');
    activeTabs.forEach(tab => {
        const target = tab.getAttribute('data-target');
        selectedTargets.push(target);
        if (target === 'blood-test-fields') selectedTypes.push('Blood Test');
        else if (target === 'urine-test-fields') selectedTypes.push('Urine Test');
        else if (target === 'lipid-profile-fields') selectedTypes.push('Lipid Profile');
        else if (target === 'lft-fields') selectedTypes.push('Liver Function Test');
    });

    if (selectedTypes.length === 0) {
        showToast('Please select at least one test.', true);
        return;
    }

    // Gather patient info
    const patientName = document.getElementById('patient-name').value;
    const patientAge = document.getElementById('patient-age').value;
    const patientGender = document.getElementById('patient-gender').value;
    const reportDate = document.getElementById('report-date').value;
    const patientAddress = document.getElementById('patient-address').value;

    const report = {
        id: 'HRG-' + Math.floor(Math.random() * 90000 + 10000), // e.g. HRG-54123
        date: new Date(reportDate).toLocaleDateString(),
        timestamp: new Date(reportDate).getTime(),
        patientName,
        patientAge,
        patientGender,
        patientAddress,
        type: selectedTypes.join(' + '),
        results: {},
        summary: []
    };

    if (selectedTargets.includes('blood-test-fields')) {
        report.results.hemo = parseFloat(document.getElementById('val-hemo').value);
        report.results.rbc = parseFloat(document.getElementById('val-rbc').value);
        report.results.wbc = parseFloat(document.getElementById('val-wbc').value);
        report.results.platelets = parseFloat(document.getElementById('val-platelets').value);
        report.results.sugar = parseFloat(document.getElementById('val-sugar').value);
        const evaluation = evaluateBloodTest(report.results);
        report.summary = report.summary.concat(evaluation.summary);
    } 
    
    if (selectedTargets.includes('urine-test-fields')) {
        report.results.color = document.getElementById('val-color').value;
        report.results.ph = document.getElementById('val-ph').value;
        report.results.protein = document.getElementById('val-protein').value;
        report.results.glucosuria = document.getElementById('val-glucosuria').value;
        report.results.ketones = document.getElementById('val-ketones').value;
        const evaluation = evaluateUrineTest(report.results);
        report.summary = report.summary.concat(evaluation.summary);
    } 
    
    if (selectedTargets.includes('lipid-profile-fields')) {
        report.results.cholesterol = parseFloat(document.getElementById('val-cholesterol').value);
        report.results.triglycerides = parseFloat(document.getElementById('val-triglycerides').value);
        report.results.hdl = parseFloat(document.getElementById('val-hdl').value);
        report.results.ldl = parseFloat(document.getElementById('val-ldl').value);
        const evaluation = evaluateLipidProfile(report.results);
        report.summary = report.summary.concat(evaluation.summary);
    } 
    
    if (selectedTargets.includes('lft-fields')) {
        report.results.bilirubin = parseFloat(document.getElementById('val-bilirubin').value);
        report.results.sgpt = parseFloat(document.getElementById('val-sgpt').value);
        report.results.sgot = parseFloat(document.getElementById('val-sgot').value);
        report.results.alp = parseFloat(document.getElementById('val-alp').value);
        const evaluation = evaluateLFT(report.results);
        report.summary = report.summary.concat(evaluation.summary);
    }

    saveReport(report);
    showToast('Report Generated Successfully!');
    renderReportPreview(report);
    showScreen('screen-report');
});

document.getElementById('btn-close-report').addEventListener('click', () => {
    showScreen('screen-dashboard');
});


// ==========================================
// RENDER REPORT PREVIEW
// ==========================================
function renderReportPreview(report) {
    document.getElementById('r-patient-name').textContent = report.patientName;
    document.getElementById('r-patient-age').textContent = report.patientAge;
    document.getElementById('r-patient-gender').textContent = report.patientGender;
    document.getElementById('r-patient-address').textContent = report.patientAddress || 'N/A';
    document.getElementById('r-report-date').textContent = report.date;
    document.getElementById('r-report-id').textContent = report.id;

    if (AppState.currentUser) {
        document.getElementById('r-clinic-name').textContent = AppState.currentUser.clinicName || 'HealthGen Diagnostics';
        document.getElementById('r-clinic-address').textContent = AppState.currentUser.clinicAddress || '123 Medical Boulevard, Wellness City';
        document.getElementById('r-clinic-phone').textContent = AppState.currentUser.clinicPhone || '(555) 123-4567';
        document.getElementById('r-clinic-email').textContent = AppState.currentUser.email || 'lab@healthgen.com';
        document.getElementById('r-doctor-name').textContent = `Dr. ${AppState.currentUser.name}`;
    }

    const bloodSection = document.getElementById('r-blood-section');
    const urineSection = document.getElementById('r-urine-section');
    const lipidSection = document.getElementById('r-lipid-section');
    const lftSection = document.getElementById('r-lft-section');

    bloodSection.style.display = report.type.includes('Blood Test') ? 'block' : 'none';
    urineSection.style.display = report.type.includes('Urine Test') ? 'block' : 'none';
    if(lipidSection) lipidSection.style.display = report.type.includes('Lipid Profile') ? 'block' : 'none';
    if(lftSection) lftSection.style.display = report.type.includes('Liver Function Test') ? 'block' : 'none';

    if (report.type.includes('Blood Test')) {
        const evaluation = evaluateBloodTest(report.results);
        document.getElementById('r-blood-table-body').innerHTML = evaluation.rows || '<tr><td colspan="4">No data provided</td></tr>';
    } 
    if (report.type.includes('Urine Test')) {
        const evaluation = evaluateUrineTest(report.results);
        document.getElementById('r-urine-table-body').innerHTML = evaluation.rows || '<tr><td colspan="3">No data provided</td></tr>';
    } 
    if (report.type.includes('Lipid Profile') && lipidSection) {
        const evaluation = evaluateLipidProfile(report.results);
        document.getElementById('r-lipid-table-body').innerHTML = evaluation.rows || '<tr><td colspan="4">No data provided</td></tr>';
    } 
    if (report.type.includes('Liver Function Test') && lftSection) {
        const evaluation = evaluateLFT(report.results);
        document.getElementById('r-lft-table-body').innerHTML = evaluation.rows || '<tr><td colspan="4">No data provided</td></tr>';
    }

    // AI Summary
    const summaryHtml = '<ul class="ai-summary-list">' + report.summary.map(s => `<li>${s}</li>`).join('') + '</ul>';
    document.getElementById('r-ai-summary').innerHTML = summaryHtml;
}


// ==========================================
// PDF DOWNLOAD LOGIC
// ==========================================
document.getElementById('btn-download-pdf').addEventListener('click', () => {
    const element = document.getElementById('pdf-container');
    const patientName = document.getElementById('r-patient-name').textContent.replace(/ /g, '_');
    const reportDate = document.getElementById('r-report-date').textContent.replace(/\//g, '-');
    const filename = `report_${patientName}_${reportDate}.pdf`;

    const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Show loading state
    const btn = document.getElementById('btn-download-pdf');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        showToast('PDF Downloaded successfully!');
    });
});

// Share Report
document.getElementById('btn-share-report').addEventListener('click', async () => {
    const reportId = document.getElementById('r-report-id').textContent;
    const shareText = `Check out health report ${reportId} on HealthGen!`;
    const shareData = {
        title: 'Health Report',
        text: shareText,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('Report shared successfully!');
        } catch (err) {
            console.error('Error sharing:', err);
            // Fallback if sharing is aborted or fails
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        }
    } else {
        copyToClipboard(shareText);
    }
});

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
        showToast('Report ID copied to clipboard!');
    } else {
        // Fallback for older browsers or non-secure contexts
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Report ID copied to clipboard!');
        } catch (err) {
            console.error('Fallback copy failed', err);
            showToast('Failed to copy to clipboard', true);
        }
        textArea.remove();
    }
}
