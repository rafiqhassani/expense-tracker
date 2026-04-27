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

let expenses = getFromLocalStorage("expenses") || [];

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
  form: document.getElementById("expenseForm"),
  titleInput: document.getElementById("title"),
  amountInput: document.getElementById("amount"),
  categoryInput: document.getElementById("category"),
  dateInput: document.getElementById("dateInput"),
  searchInput: document.getElementById("searchExpenses"),
  filterMonthSelect: document.getElementById("filterByMonth"),
  sortSelection: document.getElementById("sortSelection"),
  monthlyTotal: document.getElementById("monthlyTotal"),
  modalContainer: document.getElementById("modalContainer"),
  modalMsg: document.getElementById("modalMsg"),
  closeModal: document.getElementById("closeModal"),
  container: document.getElementById("container"),
  loadMore: document.getElementById("loadMore"),
  clearChecked: document.getElementById("clearChecked"),
  totalAmount: document.getElementById("totalAmount"),
  clearAll: document.getElementById("clearAll"),
};

elements.form.addEventListener("submit", handleSubmitBtn);

elements.modalContainer.addEventListener("click", (e) => {
  if (e.target.closest("#modalContainer")) {
    elements.modalContainer.classList.remove("show", "error", "success");
  }
});

elements.loadMore.addEventListener("click", handleLoadMore);
elements.clearAll.addEventListener("click", () => {
  expenses = clearAllExpenses();
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses(getVisibleExpenses(expenses));
});

elements.closeModal.addEventListener("click", (e) => {
  const closeMsg = e.target.closest("#closeModal");
  if (!closeMsg) return;

  elements.modalContainer.classList.remove("show", "error", "success");
});

elements.clearChecked.addEventListener("click", () => {
  expenses = clearSelectedExpenses(expenses);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses(getVisibleExpenses(expenses));
});

elements.searchInput.addEventListener("input", handleSearchExpenses);
elements.sortSelection.addEventListener("change", handleSortExpenses);
elements.filterMonthSelect.addEventListener("change", handleFilterByMonth);

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
    resetForm();
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

let visibleCount = 40;

function getVisibleExpenses(expenses) {
  return expenses.slice().reverse().slice(0, visibleCount);
}

function handleLoadMore() {
  if (visibleCount >= expenses.length) {
    elements.loadMore.style.display = "none";
    return;
  }
  visibleCount += 20;
  handleRenderExpenses(getVisibleExpenses(expenses));
  if (visibleCount >= expenses.length) {
    elements.loadMore.style.display = "none";
  } else {
    elements.loadMore.style.display = "block";
  }
}

function handleRenderExpenses(data = expenses) {
  elements.container.textContent = "";
  if (data.length === 0 && elements.searchInput.value !== "") {
    elements.container.classList.remove("message");
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

function getInputsData() {
  return {
    title: elements.titleInput.value.trim(),
    amount: elements.amountInput.value.trim(),
    category: elements.categoryInput.value.trim(),
    date: elements.dateInput.value,
  };
}

function validateInputs(data) {
  if (
    data.title === "" ||
    data.amount === "" ||
    data.category === "" ||
    data.date === ""
  )
    return {
      type: "error",
      message: "Please fill in all fields correctly",
    };

  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { type: "error", message: "Amount must be greater than 0" };
  }
  return { type: "success" };
}

const state = {
  mode: "add",
  editingId: null,
};

function handleSubmitBtn(e) {
  e.preventDefault();

  const button = e.target.querySelector("button[type='submit']");
  if (button.disabled) return;
  button.disabled = true;

  try {
    const userData = getInputsData();
    const validation = validateInputs(userData);
    if (validation.type === "error") {
      showModal(validation.message, "error");
      return;
    }

    if (state.mode === "add") {
      handleAddExpense(userData);
      showModal("Expense added", "success");
      handleRenderExpenses(getVisibleExpenses(expenses));
      resetForm();
      return;
    }

    const oldData = expenses.find((item) => item.id === state.editingId);
    if (!oldData) {
      showModal("No data found", "error");
      return;
    }

    const isChanged = isDataChanged(oldData, userData);
    if (isChanged) {
      showModal("No changes made", "error");
      return;
    }

    handleUpdateExpense(state.editingId, userData);
    showModal("Expense updated", "success");
    state.mode = "add";
    state.editingId = null;

    handleRenderExpenses(getVisibleExpenses(expenses));
    resetForm();
  } finally {
    setTimeout(() => {
      button.disabled = false;
    }, 0);
  }
}

function handleAddExpense(userData) {
  const processedData = createExpense(userData);
  expenses = addExpense(expenses, processedData);
  saveToLocalStorage("expenses", expenses);
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

function handleUpdateExpense(editingId, userData) {
  if (!editingId) return;
  const processedData = createExpense(userData, editingId, false);
  expenses = updateExpense(expenses, editingId, processedData);
  saveToLocalStorage("expenses", expenses);
}

function isDataChanged(oldData, newData) {
  return (
    oldData.title === newData.title &&
    Number(oldData.amount) === Number(newData.amount) &&
    oldData.category === newData.category &&
    oldData.date === newData.date
  );
}

function handleSearchExpenses() {
  const searchExpense = elements.searchInput.value;
  const filtered = searchExpenses(expenses, searchExpense);
  handleRenderExpenses(getVisibleExpenses(filtered));
  if (searchExpense !== "" && filtered.length === 0) {
    elements.container.classList.add("message");
  } else {
    elements.container.classList.remove("message");
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
function showModal(message, type) {
  elements.modalMsg.textContent = message;
  elements.modalContainer.classList.add("show");
  elements.modalContainer.classList.remove("error", "success");
  elements.modalContainer.classList.add(type);

  if (modalTimeout) clearTimeout(modalTimeout);
  modalTimeout = setTimeout(() => {
    elements.modalMsg.textContent = "";
    elements.modalContainer.classList.remove("show", "error", "success");
    modalTimeout = null;
  }, 3000);
}

function handleTotalCalculate(data = expenses) {
  const total = totalCalculate(data);
  elements.totalAmount.textContent = total;
}

handleRenderExpenses(getVisibleExpenses(expenses));
