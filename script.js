// Data Persistence: Save Data to Local Storage
function saveData() {
    const dashboardBalance = document.getElementById('balance');
    const transactionList = document.querySelector('.transaction-list');
    
    // Parse current balance
    const currentBalance = dashboardBalance.innerText;
    
    // Get all transactions
    const transactions = transactionList.innerHTML;

    const data = {
        balance: currentBalance,
        transactions: transactions
    };

    localStorage.setItem('credixData', JSON.stringify(data));
}

// Data Persistence: Load Data from Local Storage
function loadData() {
    const savedData = localStorage.getItem('credixData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Restore Balance
        document.getElementById('balance').innerText = data.balance;
        document.getElementById('depositBalanceDisplay').innerText = data.balance;
        
        // Restore Transactions
        document.querySelector('.transaction-list').innerHTML = data.transactions;
    }
}

function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show the target screen
    const target = document.getElementById(screenId);
    if(target) {
        target.classList.add('active');
    }
}

// Mock Exchange Rates (Base: USD)
const rates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    NGN: 1450,
    KRW: 1300
};

function calculateExchange() {
    const fromAmount = parseFloat(document.getElementById('fromAmount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (isNaN(fromAmount)) {
        document.getElementById('toAmount').value = '';
        return;
    }

    // Rate calculation: (Target Rate / Base Rate)
    const rate = rates[toCurrency] / rates[fromCurrency];
    const result = fromAmount * rate;

    // Update To Amount
    document.getElementById('toAmount').value = result.toFixed(2);

    // Update Rate Display
    document.getElementById('rateDisplay').innerText = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
}

function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    calculateExchange();
}

document.addEventListener('DOMContentLoaded', () => {
    // Load persisted data
    loadData();
    // Check if we are on the rates screen initially
    calculateExchange();
});

// Deposit Logic
function selectMethod(element) {
    // Remove selected class from all items
    document.querySelectorAll('.method-item').forEach(item => {
        item.classList.remove('selected');
    });
    // Add to clicked item
    element.classList.add('selected');
}

// Helper to add transaction to history
function addTransaction(type, name, category, amount) {
    const list = document.querySelector('.transaction-list');
    
    // Determine info based on type
    const isCredit = type === 'credit';
    const iconClass = isCredit ? 'fas fa-arrow-down' : 'fas fa-paper-plane';
    const iconColor = isCredit ? '#2ECC71' : '#E74C3C'; // Green for credit, Red for debit
    const sign = isCredit ? '+' : '-';
    const amountClass = isCredit ? 'credit' : 'debit';

    // Create HTML string
    const html = `
    <div class="transaction-item">
        <div class="t-info">
            <div class="t-icon"><i class="${iconClass}" style="color: ${iconColor};"></i></div>
            <div class="t-details">
                <h4>${name}</h4>
                <p>${category}</p>
            </div>
        </div>
        <div class="t-amount ${amountClass}">${sign}₦${amount.toFixed(2)}</div>
    </div>
    `;

    // Insert after the title (or at start of list)
    // We insert as the first child to show most recent at top
    list.insertAdjacentHTML('afterbegin', html);
}

function updateBalance(newBalance) {
     const dashboardBalance = document.getElementById('balance');
     const depositBalance = document.getElementById('depositBalanceDisplay');

     let formattedBalance = '₦' + newBalance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});

     dashboardBalance.innerText = formattedBalance;
     depositBalance.innerText = formattedBalance;
     
     // Save Data
     saveData();
}

function handleDeposit() {
    const amountInput = document.getElementById('depositAmount');
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    // Get current balance elements
    const dashboardBalance = document.getElementById('balance');
    let currentBalance = parseFloat(dashboardBalance.innerText.replace(/[₦,]/g, ''));
    
    // Add deposit
    let newBalance = currentBalance + amount;

    // Update Balance & Save
    updateBalance(newBalance);

    // Log Transaction
    addTransaction('credit', 'Topup', 'Wallet Fund', amount);
    saveData(); // Save again to capture transaction

    // Reset input
    amountInput.value = '';

    // Show success and redirect
    alert(`Successfully deposited ₦${amount}!`);
    showScreen('dashboard');
}

function handleTransfer() {
    const amountInput = document.getElementById('transferAmount');
    const bankInput = document.getElementById('transferBank');
    
    const amount = parseFloat(amountInput.value);
    const bankName = bankInput.value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (!bankName) {
        alert('Please select a bank');
        return;
    }

    // Get current balance elements
    const dashboardBalance = document.getElementById('balance');
    let currentBalance = parseFloat(dashboardBalance.innerText.replace(/[₦,]/g, ''));

    // Check availability
    if (currentBalance < amount) {
        alert('Insufficient funds!');
        return;
    }
    
    // Deduct amount
    let newBalance = currentBalance - amount;

    // Update Balance & Save
    updateBalance(newBalance);

    // Log Transaction
    addTransaction('debit', bankName, 'Transfer', amount);
    saveData(); // Save again to capture transaction

    // Reset inputs
    amountInput.value = '';
    bankInput.value = '';
    document.getElementById('transferAccountNumber').value = '';

    // Show success and redirect
    alert(`Successfully sent ₦${amount} to ${bankName}!`);
    showScreen('dashboard');
}

function handlePayBill() {
    const amountInput = document.getElementById('billAmount');
    const customerIdInput = document.getElementById('billCustomerId');
    const billType = document.getElementById('billType').value;

    const amount = parseFloat(amountInput.value);
    const customerId = customerIdInput.value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (!customerId) {
        alert('Please enter Customer ID');
        return;
    }

    const dashboardBalance = document.getElementById('balance');
    let currentBalance = parseFloat(dashboardBalance.innerText.replace(/[₦,]/g, ''));

    if (currentBalance < amount) {
        alert('Insufficient funds!');
        return;
    }

    let newBalance = currentBalance - amount;
    
    updateBalance(newBalance);
    
    addTransaction('debit', billType, 'Bill Payment', amount);
    saveData();

    amountInput.value = '';
    customerIdInput.value = '';

    alert(`Successfully paid ₦${amount} for ${billType}!`);
    showScreen('dashboard');
}

// --- Mock authentication and login handling ---
const DEMO_USER = { email: 'admin@test.com', password: 'password123' };

function showLoginError(msg) {
    const el = document.getElementById('loginError');
    if (el) el.textContent = msg || '';
}

function handleLogin() {
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    if (!emailEl || !passwordEl) return;

    const email = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email) {
        showLoginError('Please enter your email');
        return;
    }
    if (!password) {
        showLoginError('Please enter your password');
        return;
    }

    // Try to match against locally stored users (if any)
    let users = [];
    try { users = JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { users = []; }

    const matched = users.find(u => u.email === email && u.password === password);

    if (matched || (email === DEMO_USER.email && password === DEMO_USER.password)) {
        // Save a simple auth token (demo)
        localStorage.setItem('credixAuth', JSON.stringify({ email, token: 'demo-token' }));

        // Ensure some initial app data exists for first-time users
        if (!localStorage.getItem('credixData')) {
            const initial = { balance: '₦0', transactions: '' };
            localStorage.setItem('credixData', JSON.stringify(initial));
        }

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        return;
    }

    showLoginError('Invalid email or password');
}

document.addEventListener('DOMContentLoaded', () => {
    // Attach login form handler if present
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showLoginError('');
            handleLogin();
        });
    }

    // Phone quick-login: set auth by phone and redirect
    const phoneBtn = document.getElementById('phoneNext');
    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            const phone = document.getElementById('phone')?.value?.trim();
            if (!phone) {
                showLoginError('Please enter a phone number');
                return;
            }
            localStorage.setItem('credixAuth', JSON.stringify({ phone, token: 'demo-phone-token' }));
            if (!localStorage.getItem('credixData')) {
                localStorage.setItem('credixData', JSON.stringify({ balance: '₦0', transactions: '' }));
            }
            window.location.href = 'dashboard.html';
        });
    }

    // Forgot password form handler (uses same styles and local redirect)
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        const forgotMessage = document.getElementById('forgotMessage');
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (forgotMessage) forgotMessage.textContent = '';

            const email = document.getElementById('forgotEmail')?.value?.trim() || '';
            if (!email) {
                if (forgotMessage) {
                    forgotMessage.style.color = '#c0392b';
                    forgotMessage.textContent = 'Please enter your email address';
                }
                return;
            }

            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
            if (!re.test(email)) {
                if (forgotMessage) {
                    forgotMessage.style.color = '#c0392b';
                    forgotMessage.textContent = 'Please enter a valid email address';
                }
                return;
            }

            // Simulate sending reset link
            if (forgotMessage) {
                forgotMessage.style.color = 'var(--primary-dark)';
                forgotMessage.textContent = 'If that email exists, a reset link has been sent.';
            }

            localStorage.setItem('credixPasswordReset', JSON.stringify({ identifier: email, sentAt: Date.now() }));

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1800);
        });
    }
});



// Signup Logic
function showSignupError(msg) {
    const el = document.getElementById('signupError');
    if (el) el.textContent = msg || '';
}

function handleSignup() {
    const fullnameEl = document.getElementById('fullname');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const passwordEl = document.getElementById('password');
    const confirmPasswordEl = document.getElementById('confirmPassword');
    const termsEl = document.getElementById('terms');

    if (!fullnameEl || !emailEl || !phoneEl || !passwordEl || !confirmPasswordEl || !termsEl) return;

    const fullname = fullnameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = phoneEl.value.trim();
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    const termsAccepted = termsEl.checked;

    // Validation
    if (!fullname) {
        showSignupError('Please enter your full name');
        return;
    }
    if (!email) {
        showSignupError('Please enter your email');
        return;
    }
    if (!phone) {
        showSignupError('Please enter your phone number');
        return;
    }
    if (!password) {
        showSignupError('Please enter a password (minimum 6 characters)');
        return;
    }
    if (password.length < 6) {
        showSignupError('Password must be at least 6 characters long');
        return;
    }
    if (password !== confirmPassword) {
        showSignupError('Passwords do not match');
        return;
    }
    if (!termsAccepted) {
        showSignupError('You must accept the Terms and Conditions');
        return;
    }

    // Check if user already exists
    let users = [];
    try { 
        users = JSON.parse(localStorage.getItem('users') || '[]'); 
    } catch (e) { 
        users = []; 
    }

    const userExists = users.find(u => u.email === email);
    if (userExists) {
        showSignupError('Email already registered. Please log in instead.');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        fullname,
        email,
        phone: '+234' + phone,
        password,
        createdAt: new Date().toISOString()
    };

    // Save user to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto-login the user
    localStorage.setItem('credixAuth', JSON.stringify({ 
        email, 
        fullname,
        token: 'demo-token-' + Date.now() 
    }));

    // Initialize user's app data
    localStorage.setItem('credixData', JSON.stringify({ 
        balance: '₦0', 
        transactions: '' 
    }));

    // Show success and redirect to dashboard
    alert(`Welcome ${fullname}! Your account has been created successfully.`);
    window.location.href = 'dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showSignupError('');
            handleSignup();
        });
    }
});

// Password Visibility Toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.toggle-password');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Find the input associated with this toggle
            const input = this.previousElementSibling;
            
            if (input && input.tagName === 'INPUT') {
                // Toggle type
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                // Toggle icon
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    });
});
