const balanceDisplay = document.getElementById('net-balance');
const incomeDisplay = document.getElementById('total-income');
const expensesDisplay = document.getElementById('total-expenses');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeIncomeRadio = document.getElementById('type-income');
const typeExpenseRadio = document.getElementById('type-expense');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const transactionList = document.getElementById('transaction-list');
const filterRadios = document.querySelectorAll('input[name="filter"]');
const transactionIdInput = document.getElementById('transaction-id');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editingId = null;

const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

const saveTransactions = () => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    displayTransactions(document.querySelector('input[name="filter"]:checked').value);
    updateSummary();
};

const addOrUpdateTransaction = (description, amount, type) => {
    if (editingId) {
        transactions = transactions.map(t =>
            t.id === editingId ? { ...t, description, amount, type } : t
        );
        editingId = null;
        transactionIdInput.value = '';
        submitBtn.textContent = 'Add Transaction';
    } else {
        const newTransaction = {
            id: generateId(),
            description,
            amount,
            type,
            date: new Date().toISOString()
        };
        transactions.push(newTransaction);
    }
    saveTransactions();
    resetForm();
};

const deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    if (editingId === id) {
        resetForm();
    }
};

const editTransaction = (id) => {
    const transactionToEdit = transactions.find(t => t.id === id);
    if (transactionToEdit) {
        descriptionInput.value = transactionToEdit.description;
        amountInput.value = transactionToEdit.amount;
        if (transactionToEdit.type === 'income') {
            typeIncomeRadio.checked = true;
        } else {
            typeExpenseRadio.checked = true;
        }
        editingId = id;
        transactionIdInput.value = id;
        submitBtn.textContent = 'Update Transaction';
    }
};

const updateSummary = () => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    incomeDisplay.textContent = `$${totalIncome.toFixed(2)}`;
    expensesDisplay.textContent = `$${totalExpenses.toFixed(2)}`;
    balanceDisplay.textContent = `$${netBalance.toFixed(2)}`;

    if (netBalance >= 0) {
        balanceDisplay.classList.remove('expense-text');
        balanceDisplay.classList.add('net-balance-text');
    } else {
        balanceDisplay.classList.remove('net-balance-text');
        balanceDisplay.classList.add('expense-text');
    }
};

const displayTransactions = (filterType) => {
    transactionList.innerHTML = '';

    const filteredTransactions = transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredTransactions.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = `No ${filterType === 'all' ? '' : filterType} transactions found.`;
        transactionList.appendChild(emptyMessage);
        return;
    }

    filteredTransactions.forEach(transaction => {
        const listItem = document.createElement('li');
        listItem.className = `transaction-item ${transaction.type}`;
        listItem.dataset.id = transaction.id;

        const amountText = transaction.type === 'expense' ? `-$${transaction.amount.toFixed(2)}` : `+$${transaction.amount.toFixed(2)}`;

        listItem.innerHTML = `
            <div>
                <p>${transaction.description}</p>
                <span>${new Date(transaction.date).toLocaleDateString()}</span>
            </div>
            <div class="action-buttons">
                <span class="transaction-amount ${transaction.type}">${amountText}</span>
                <button class="edit-btn" aria-label="Edit transaction">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-7.536 7.536a1 1 0 00-1.226 0l-1.604 1.604a1 1 0 000 1.226l2.828 2.828a1 1 0 001.226 0l1.604-1.604a1 1 0 000-1.226l-2.828-2.828z" />
                    </svg>
                </button>
                <button class="delete-btn" aria-label="Delete transaction">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
        transactionList.appendChild(listItem);
    });
};

const resetForm = () => {
    descriptionInput.value = '';
    amountInput.value = '';
    typeIncomeRadio.checked = false;
    typeExpenseRadio.checked = false;
    editingId = null;
    transactionIdInput.value = '';
    submitBtn.textContent = 'Add Transaction';
    descriptionInput.focus();
};

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = document.querySelector('input[name="type"]:checked')?.value;

    if (!description || isNaN(amount) || amount <= 0 || !type) {
        alert('Please enter a valid description, amount, and select a type (Income/Expense).');
        return;
    }

    addOrUpdateTransaction(description, amount, type);
});

resetBtn.addEventListener('click', resetForm);

transactionList.addEventListener('click', (e) => {
    const targetBtn = e.target.closest('.edit-btn, .delete-btn');
    if (targetBtn) {
        const listItem = targetBtn.closest('.transaction-item');
        const id = listItem.dataset.id;

        if (targetBtn.classList.contains('edit-btn')) {
            editTransaction(id);
        } else if (targetBtn.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(id);
            }
        }
    }
});

filterRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        displayTransactions(e.target.value);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    if (transactions.length > 0) {
        document.getElementById('filter-all').checked = true;
    }
    displayTransactions('all');
    updateSummary();
});
