document.addEventListener('DOMContentLoaded', () => {
    // Select Elements from DOM
    const transactionForm = document.getElementById('transaction-form');
    const transactionTableBody = document.getElementById('transaction-table').querySelector('tbody');
    const dateInput = document.getElementById('date');
    const typeInput = document.getElementById('type');
    const categoryInput = document.getElementById('category');
    const amountInput = document.getElementById('amount');
    const notesInput = document.getElementById('notes');
    const amountToConvertInput = document.getElementById('amount-to-convert');
    const exchangeRateDisplay = document.getElementById('exchange-rate');
    const convertedAmountDisplay = document.getElementById('converted-amount');
    const startingBalanceDisplay = document.getElementById('starting-balance');
    const closingBalanceDisplay = document.getElementById('closing-balance');

    // Filter Elements
    const filterCategory = document.getElementById('filter-category');
    const filterType = document.getElementById('filter-type');
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const applyFiltersButton = document.getElementById('apply-filters');

    // Initialize Date Field to Today's Date
    dateInput.value = new Date().toISOString().split('T')[0];

    // Load Transactions from localStorage
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Function to Save Transactions to localStorage
    const saveTransactions = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    // Function to Display Transactions in the Table
    const displayTransactions = (filteredTransactions = transactions) => {
        transactionTableBody.innerHTML = filteredTransactions.map((transaction, index) => `
            <tr>
                <td>${transaction.date}</td>
                <td>${transaction.type}</td>
                <td>${transaction.category}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>${transaction.notes}</td>
                <td style="text-align: center;"><button class="delete-btn" data-index="${index}">Delete</button></td>
            </tr>
        `).join('');

        // Update Balances
        updateBalances();

        // Add Event Listeners to Delete Buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteTransaction);
        });
    };

    // Input Validation
    const isValidTransaction = (date, type, category, amount) => {
        return date && type && category && !isNaN(amount) && amount > 0;
    };

    // Function to Add a New Transaction
    const addTransaction = (event) => {
        event.preventDefault();

        const date = dateInput.value;
        const type = typeInput.value;
        const category = categoryInput.value;
        const amount = parseFloat(amountInput.value);
        const notes = notesInput.value;

        if (!isValidTransaction(date, type, category, amount)) {
            alert('Please fill in all fields with valid data.');
            return;
        }

        transactions.push({ date, type, category, amount, notes });
        saveTransactions();
        displayTransactions();

        // Reset Form
        transactionForm.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
    };

    // Function to Delete Transaction
    const deleteTransaction = (event) => {
        const index = event.target.dataset.index;
        transactions.splice(index, 1);
        saveTransactions();
        displayTransactions();
    };

    // Function to Update Balances
    const updateBalances = () => {
        const closingBalance = transactions.reduce((total, { type, amount }) => {
            return type === 'Income' ? total + amount : total - amount;
        }, 0);
        startingBalanceDisplay.innerText = `$0.00`; // Can Adjust
        closingBalanceDisplay.innerText = `$${closingBalance.toFixed(2)}`;
    };

    // Function to Fetch Exchange Rate
    const fetchExchangeRate = async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                const rate = 0.65; // Simulated Rate: 1 AUD = 0.65 USD
                resolve(rate);
            }, 1000);
        });
    };

    // Function to Convert Amount from AUD to USD
    const convertAmount = async () => {
        const amountInAUD = parseFloat(amountToConvertInput.value) || 0;
        const rate = await fetchExchangeRate();
        const convertedAmount = amountInAUD * rate;
        exchangeRateDisplay.innerText = `1 AUD = ${rate} USD`;
        convertedAmountDisplay.innerText = `$${convertedAmount.toFixed(2)}`;
    };

    // Function to Filter Transactions
    const filterTransactions = () => {
        const category = filterCategory.value;
        const type = filterType.value;
        const startDate = new Date(filterStartDate.value);
        const endDate = new Date(filterEndDate.value);
        
        const filteredTransactions = transactions.filter(transaction => {
            const rowDate = new Date(transaction.date);
            const matchesCategory = category === "" || transaction.category === category;
            const matchesType = type === "" || transaction.type === type;
            const matchesDate = (!filterStartDate.value || rowDate >= startDate) &&
                                (!filterEndDate.value || rowDate <= endDate);
            
            return matchesCategory && matchesType && matchesDate;
        });

        displayTransactions(filteredTransactions);
        applyFiltersButton.innerText = 'Clear Filters'; 
    };

    // Function to Clear Filters
    const clearFilters = () => {
        // Reset all filter inputs
        filterCategory.value = '';
        filterType.value = '';
        filterStartDate.value = '';
        filterEndDate.value = '';

        // Display all transactions
        displayTransactions(transactions);
        applyFiltersButton.innerText = 'Apply Filters'; 
    };

    // Attach Event Listeners
    transactionForm.addEventListener('submit', addTransaction);
    amountToConvertInput.addEventListener('input', convertAmount);
    applyFiltersButton.addEventListener('click', () => {
        if (applyFiltersButton.innerText === 'Apply Filters') {
            filterTransactions();
        } else {
            clearFilters();
        }
    });

    // Initial Display of Transactions
    displayTransactions();
});