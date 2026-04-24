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
let visibleCount = 40;
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
  loadMore: document.getElementById("loadMore"),
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
elements.closeModal.addEventListener("click", () => {
  elements.modalContainer.classList.remove("show");
});

elements.modalContainer.addEventListener("click", (e) => {
  if (e.target === elements.modalContainer) {
    elements.modalContainer.classList.remove("show");
  }
});
document.addEventListener("click", (e) => {
  if (e.target.closest("#clearAll")) {
    expenses = clearAllExpenses();
    saveToLocalStorage("expenses", expenses);
    handleRenderExpenses(getVisibleExpenses(expenses));
  }
  if (e.target.closest("#loadMore")) {
    if (visibleCount >= expenses.length) {
      elements.loadMore.style.display = "none";
    } else {
      elements.loadMore.style.display = "block";
    }
    loadMoreExpenses();
  }
  if (e.target.closest("#clearChecked")) {
    expenses = clearSelectedExpenses(expenses);
    saveToLocalStorage("expenses", expenses);
    handleRenderExpenses(getVisibleExpenses(expenses));
  }
});
elements.container.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button || !elements.container.contains(button)) return;
  const id = button.dataset.id;
  if (button.classList.contains("delete-btn")) {
    handleDeleteExpense(id);
  }
  if (button.classList.contains("edit-btn")) {
    handleEditExpense(id);
  }
  if (button.classList.contains("cancel-btn")) {
    resetForm();
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
function getVisibleExpenses(expenses) {
  return expenses.slice().reverse().slice(0, visibleCount);
}

function loadMoreExpenses() {
  visibleCount += 20;
  handleRenderExpenses(getVisibleExpenses(expenses));
}
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
  const category = elements.categoryInput.value.trim();
  const date = elements.dateInput.value;

  const amountValue = elements.amountInput.value;
  const amount = Number(amountValue);

  if (!title || !category || !date || amountValue === "") {
    showModal("Please fill in all fields correctly!");
    return false;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showModal("Amount must be a valid number!");
    return false;
  }

  return true;
}
const state = {
  mode: "add",
  editingId: null,
};

function handleAddOrUpdateExpense() {
  if (!validateInputs()) return;

  if (state.mode === "add") {
    handleAddExpense();
  } else if (state.mode === "edit") {
    handleUpdateExpense();
  }
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

  handleRenderExpenses(getVisibleExpenses(expenses));

  resetForm();
  showModal("Expense added");
}
function handleDeleteExpense(id) {
  expenses = deleteExpense(expenses, id);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses(getVisibleExpenses(expenses));
}
function handleEditExpense(id) {
  const item = editExpense(expenses, id);
  if (!item) return;

  state.mode = "edit";
  state.editingId = id;

  elements.titleInput.value = item.title || "";
  elements.amountInput.value = item.amount || "";
  elements.categoryInput.value = item.category || "";
  elements.dateInput.value = item.date || "";
}
function resetForm() {
  elements.titleInput.value = "";
  elements.amountInput.value = "";
  elements.categoryInput.value = "";
  elements.dateInput.value = "";

  state.mode = "add";
  state.editingId = null;
}

function handleCheckboxChange(id, isChecked) {
  expenses = checkboxChange(expenses, id, isChecked);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses(getVisibleExpenses(expenses));
}
function handleUpdateExpense() {
  if (!state.editingId) return;

  const oldData = expenses.find((item) => item.id === state.editingId);

  if (!oldData) {
    showModal("Expense not found");
    resetForm();
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

  const processedData = createExpense(newExpense, state.editingId, false);

  expenses = updateExpense(expenses, state.editingId, processedData);
  saveToLocalStorage("expenses", expenses);

  handleRenderExpenses(getVisibleExpenses(expenses));

  resetForm();
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

  handleRenderExpenses(getVisibleExpenses(filtered));
  if (searchExpense !== "" && filtered.length === 0) {
    elements.container.classList.add("hide");
  } else {
    elements.container.classList.remove("hide");
  }
}

function handleSortExpenses() {
  const sortBy = elements.sortSelection.value;
  const sortedExpenses = sortExpenses(expenses, sortBy);
  handleRenderExpenses(getVisibleExpenses(sortedExpenses));
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
  handleRenderExpenses(getVisibleExpenses(filteredExpenses));
}

let modalTimeout = null;

function showModal(message) {
  elements.modalMsg.textContent = message;
  elements.modalContainer.classList.add("show");

  if (modalTimeout) {
    clearTimeout(modalTimeout);
  }

  modalTimeout = setTimeout(() => {
    elements.modalContainer.classList.remove("show");
    modalTimeout = null;
  }, 3000);
}

function handleTotalCalculate(data = expenses) {
  const total = totalCalculate(data);
  elements.totalAmount.textContent = total;
}

handleRenderExpenses(getVisibleExpenses(expenses));
