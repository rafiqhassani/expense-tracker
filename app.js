import {
  addExpense,
  deleteExpense,
  editExpense,
  updateExpense,
  totalCalculate,
  searchExpenses,
  sortExpenses,
  checkboxChange,
  clearSelectedExpenses,
  createExpense,
  filterByMonth,
} from "./expense.js";
import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";
import { renderExpenses, clearAllExpenses, renderMsgForFilter } from "./ui.js";
let expenses = [];

try {
  const stored = getFromLocalStorage("expenses") || [];
  expenses = stored.map((item) => ({
    ...item,
    selected: typeof item.selected === "boolean" ? item.selected : false,
  }));
} catch (error) {
  console.error("Error loading expenses:", error);
  expenses = [];
}
const elements = {
  titleInput: document.getElementById("title"),
  amountInput: document.getElementById("amount"),
  categoryInput: document.getElementById("category"),
  addBtn: document.getElementById("addBtn"),
  dateInput: document.getElementById("dateInput"),
  container: document.getElementById("container"),
  searchInput: document.getElementById("searchExpenses"),
  sortSelection: document.getElementById("sortSelection"),
  filterMonthSelect: document.getElementById("filterByMonth"),
  monthlyTotal: document.getElementById("monthlyTotal"),
  totalAmount: document.getElementById("totalAmount"),
  clearAll: document.getElementById("clearAll"),
  modalContainer: document.getElementById("modalContainer"),
  modalMsg: document.getElementById("modalMsg"),
  closeModal: document.getElementById("closeModal"),
  clearChecked: document.getElementById("clearChecked"),
};
elements.searchInput.addEventListener("input", handleSearchExpenses);
elements.addBtn.addEventListener("click", handleAddOrUpdateExpense);
document.addEventListener("click", (e) => {
  if (e.target.closest("#searchBtn")) {
    handleSearchExpenses();
  }
  if (e.target.closest("#closeModal")) {
    elements.modalContainer.classList.remove("show");
  }
  if (e.target === elements.modalContainer) {
    elements.modalContainer.classList.remove("show");
  }
  if (e.target.closest("#clearAll")) {
    expenses = clearAllExpenses();
    saveToLocalStorage("expenses", expenses);
    handleRenderExpenses();
  }
  if (e.target.closest("#clearChecked")) {
    expenses = clearSelectedExpenses(expenses);
    saveToLocalStorage("expenses", expenses);
    handleRenderExpenses();
  }
});
elements.container.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  const id = button.dataset.id;
  if (button.classList.contains("delete-btn")) {
    handleDeleteExpense(id);
  }
  if (button.classList.contains("edit-btn")) {
    handleEditExpense(id);
  }
  if (button.classList.contains("cancel-btn")) {
    clearInputs();
  }
});
document.addEventListener("change", (e) => {
  if (e.target === elements.sortSelection) {
    handleSortExpenses();
  }

  if (e.target === elements.filterMonthSelect) {
    handleFilterByMonth();
  }
});

elements.container.addEventListener("change", (e) => {
  const checkbox = e.target.closest("input[type='checkbox']");
  if (!checkbox) return;
  const id = checkbox.dataset.id;
  const isChecked = checkbox.checked;
  if (checkbox.classList.contains("select-expense")) {
    handleCheckboxChange(id, isChecked);
  }
});

function handleRenderExpenses(data = expenses) {
  elements.container.textContent = "";
  if (data.length === 0 && elements.searchInput.value !== "") {
    elements.container.classList.remove("hide");
    const showMsg = renderMsgForFilter(
      `No expenses found for  "${elements.searchInput.value}"`,
    );
    elements.container.appendChild(showMsg);
  }
  data.forEach((exp) => {
    const divElement = renderExpenses(exp);

    elements.container.appendChild(divElement);
  });

  handleTotalCalculate(data);
}
function validateInputs() {
  const title = elements.titleInput.value.trim();
  const amount = elements.amountInput.value.trim();
  const category = elements.categoryInput.value.trim();
  const date = elements.dateInput.value.trim();

  if (!title || !amount || !category || !date) {
    showModal("Please fill in all fields correctly!");
    return false;
  }

  const amountNum = Number(amount);

  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    showModal("Amount must be a valid number!");
    return false;
  }

  return true;
}
let editingId = null;
function handleAddOrUpdateExpense() {
  if (!validateInputs()) return;

  if (editingId === null) {
    handleAddExpense();
    return;
  }

  const oldData = expenses.find((item) => item.id === editingId);

  if (!oldData) {
    showModal("Expense not found");
    editingId = null;
    clearInputs();
    return;
  }

  const newExpense = {
    title: elements.titleInput.value,
    amount: elements.amountInput.value,
    category: elements.categoryInput.value,
    date: elements.dateInput.value,
  };

  if (!isDataChanged(oldData, newExpense)) {
    showModal("No changes made");
    return;
  }

  handleUpdateExpense();
  editingId = null;
}
function handleAddExpense() {
  const newExpense = {
    title: elements.titleInput.value,
    amount: elements.amountInput.value,
    category: elements.categoryInput.value,
    date: elements.dateInput.value,
  };

  const processedData = createExpense(newExpense);

  expenses = addExpense(expenses, processedData);
  saveToLocalStorage("expenses", expenses);

  handleRenderExpenses();
  clearInputs();
  showModal("Expense added");
}

function handleDeleteExpense(id) {
  expenses = deleteExpense(expenses, id);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses();
}

function handleEditExpense(id) {
  editingId = id;

  const item = editExpense(expenses, id);
  if (!item) return;

  elements.titleInput.value = item.title || "";
  elements.amountInput.value = isNaN(item.amount) ? "" : item.amount;
  elements.categoryInput.value = item.category || "";
  elements.dateInput.value = item.date || "";
}
function clearInputs() {
  elements.titleInput.value = "";
  elements.amountInput.value = "";
  elements.categoryInput.value = "";
  elements.dateInput.value = "";
}

function handleCheckboxChange(id, isChecked) {
  expenses = checkboxChange(expenses, id, isChecked);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses();
}
function handleUpdateExpense() {
  if (editingId === null) return;
  const newExpense = {
    title: elements.titleInput.value,
    amount: elements.amountInput.value,
    category: elements.categoryInput.value,
    date: elements.dateInput.value,
  };
  const processedData = createExpense(newExpense, editingId, false);
  expenses = updateExpense(expenses, editingId, processedData);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses();
  editingId = null;
  clearInputs();
  showModal("Expense updated");
}
function isDataChanged(oldData, newData) {
  return (
    oldData.title !== newData.title ||
    parseFloat(oldData.amount) !== parseFloat(newData.amount) ||
    oldData.category !== newData.category ||
    oldData.date !== newData.date
  );
}
function handleSearchExpenses() {
  const searchExpense = elements.searchInput.value;
  const filtered = searchExpenses(expenses, searchExpense);

  handleRenderExpenses(filtered);
  if (searchExpense !== "" && filtered.length === 0) {
    elements.container.classList.add("hide");
  } else {
    elements.container.classList.remove("hide");
  }
}

function handleSortExpenses() {
  const sortBy = elements.sortSelection.value;
  const sortedExpenses = sortExpenses(expenses, sortBy);
  handleRenderExpenses(sortedExpenses);
}

function handleFilterByMonth() {
  const selectedMonth = elements.filterMonthSelect.value.trim().toLowerCase();
  const filteredExpenses =
    selectedMonth === "all"
      ? expenses
      : filterByMonth(expenses, Number(selectedMonth));
  const totalByMonth = filteredExpenses.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  elements.monthlyTotal.textContent = totalByMonth;
  handleRenderExpenses(filteredExpenses);
}

function showModal(message) {
  elements.modalMsg.textContent = "";
  elements.modalMsg.textContent = message;
  elements.modalContainer.classList.add("show");
  setTimeout(() => {
    elements.modalContainer.classList.remove("show");
  }, 3000);
}

function handleTotalCalculate(data = expenses) {
  const total = totalCalculate(data);
  elements.totalAmount.textContent = total;
}

handleRenderExpenses();
