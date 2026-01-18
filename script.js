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
        <div class="t-amount ${amountClass}">${sign}$${amount.toFixed(2)}</div>
    </div>
    `;

    // Insert after the title (or at start of list)
    // We insert as the first child to show most recent at top
    list.insertAdjacentHTML('afterbegin', html);
}

function updateBalance(newBalance) {
     const dashboardBalance = document.getElementById('balance');
     const depositBalance = document.getElementById('depositBalanceDisplay');

     let formattedBalance = '$' + newBalance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});

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
    let currentBalance = parseFloat(dashboardBalance.innerText.replace(/[$,]/g, ''));
    
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
    alert(`Successfully deposited $${amount}!`);
    showScreen('dashboard');
}

function handleTransfer() {
    const amountInput = document.getElementById('transferAmount');
    const nameInput = document.getElementById('transferName');
    
    const amount = parseFloat(amountInput.value);
    const name = nameInput.value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (!name) {
        alert('Please enter recipient name');
        return;
    }

    // Get current balance elements
    const dashboardBalance = document.getElementById('balance');
    let currentBalance = parseFloat(dashboardBalance.innerText.replace(/[$,]/g, ''));

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
    addTransaction('debit', name, 'Transfer', amount);
    saveData(); // Save again to capture transaction

    // Reset inputs
    amountInput.value = '';
    nameInput.value = '';
    document.getElementById('transferAccountNumber').value = '';

    // Show success and redirect
    alert(`Successfully sent $${amount} to ${name}!`);
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
    let currentBalance = parseFloat(dashboardBalance.innerText.replace(/[$,]/g, ''));

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

    alert(`Successfully paid $${amount} for ${billType}!`);
    showScreen('dashboard');
}


