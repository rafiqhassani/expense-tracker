import {
  addExpense,
  deleteExpense,
  editExpense,
  updateExpense,
  totalCalculate,
  searchExpenses,
  sortExpenses,
  selectCategories,
  extractCategories,
  checkboxChange,
  clearCheckedButtons,
  createExpense,
  filterByMonth,
  calculateByDate,
} from "./expense.js";
import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";
import {
  renderExpenses,
  createCategoryOptions,
  clearAllExpenses,
} from "./ui.js";

let expenses = getFromLocalStorage("expenses") || [];
try {
  const storedExpenses = getFromLocalStorage("expenses");
  expenses = storedExpenses || [];
} catch (error) {
  console.error(
    "Error occurred while fetching expenses from localStorage:",
    error,
  );
  expenses = [];
}
const elements = {
  titleInput: document.getElementById("title"),
  amountInput: document.getElementById("amount"),
  categoryInput: document.getElementById("category"),
  addBtn: document.getElementById("add"),
  categoryBtn: document.getElementById("categoryBtn"),
  dateInput: document.getElementById("dateInput"),
  container: document.getElementById("container"),
  searchTitle: document.getElementById("searchExpenses"),
  searchAmount: document.getElementById("searchAmount"),
  searchBtn: document.getElementById("searchBtn"),
  sortSelection: document.getElementById("sortSelection"),
  categorySelection: document.getElementById("categorySelection"),
  filterByMonth: document.getElementById("filterByMonth"),
  monthlyTotal: document.getElementById("monthlyTotal"),
  totalAmount: document.getElementById("totalAmount"),
  clearAll: document.getElementById("clearAll"),
  modalContainer: document.getElementById("modalContainer"),
  modalMsg: document.getElementById("modalMsg"),
  closeModal: document.getElementById("closeModal"),
  clearChecked: document.getElementById("clearChecked"),
};
let titleValue;
let amountRaw;
let categoryValue;
let dateValue;
let editingId = null;

function setupEvents() {
  elements.addBtn.addEventListener("click", () => {
    if (editingId) {
      handleUpdateExpense();
    } else {
      handleAddExpense();
    }
  });
  elements.categoryBtn.addEventListener("click", () => {
    elements.categoryInput.classList.toggle("category");
  });
  elements.searchBtn.addEventListener("click", handleSearchExpenses);
  elements.sortSelection.addEventListener("change", handleSortExpenses);
  elements.categorySelection.addEventListener("change", () => {
    handleSelectCategories();
  });
  elements.closeModal.addEventListener("click", () => {
    elements.modalContainer.classList.remove("show");
  });
  window.addEventListener("click", (e) => {
    if (e.target === elements.modalContainer) {
      elements.modalContainer.classList.remove("show");
    }
  });
  elements.clearAll.addEventListener("click", () => {
    expenses = clearAllExpenses();
    handleRenderExpenses();
    handleCategoryOptions();
  });
  elements.clearChecked.addEventListener("click", () => {
    expenses = clearCheckedButtons(expenses);
    saveToLocalStorage("expenses", expenses);
    handleRenderExpenses();
    handleCategoryOptions();
  });
  elements.container.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const id = Number(button.dataset.id);
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
  elements.container.addEventListener("change", (e) => {
    const checkbox = e.target.closest("input[type='checkbox']");
    if (!checkbox) return;
    const id = Number(checkbox.dataset.id);
    const isChecked = checkbox.checked;
    if (checkbox.classList.contains("select-expense")) {
      handleCheckboxChange(id, isChecked);
    }
  });
  elements.filterByMonth.addEventListener("change", () => {
    handleFilterByMonth();
  });
}

function handleRenderExpenses(data = expenses) {
  elements.container.textContent = "";
  data.forEach((exp) => {
    const divElement = renderExpenses(exp);
    elements.container.appendChild(divElement);
  });
  handleTotalCalcule(data);
}

function handleAddExpense() {
  titleValue = elements.titleInput.value.trim();
  amountRaw = elements.amountInput.value.trim();
  categoryValue = elements.categoryInput.value.trim();
  dateValue = elements.dateInput.value;
  const rawValues = {
    title: titleValue,
    amount: amountRaw,
    category: categoryValue,
    date: dateValue,
  };
  const validation = validateExpense(rawValues);
  if (!validation.valid) {
    showModal(validation.message);
    return;
  }
  const expense = createExpense(rawValues);
  expenses = addExpense(expenses, expense);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses();
  handleCategoryOptions();
  clearInputs();
  showModal("Expense added successfully!");
}

function validateExpense(data) {
  if (
    data.title.trim() === "" ||
    data.amount.trim() === "" ||
    data.category.trim() === "" ||
    data.date === ""
  ) {
    return {
      valid: false,
      message: "Please fill fields correctly!",
    };
  }
  if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
    return {
      valid: false,
      message: "Amount must be a valid positive number!",
    };
  }
  if (!data.date || isNaN(new Date(data.date).getTime())) {
    return {
      valid: false,
      message: "Please select a valid date!",
    };
  }
  return { valid: true };
}

function handleDeleteExpense(id) {
  expenses = deleteExpense(expenses, id);
  saveToLocalStorage("expenses", expenses);
  handleRenderExpenses();
  handleCategoryOptions();
}

function handleEditExpense(id) {
  editingId = id;
  const item = editExpense(expenses, id);
  if (!item) return;
  elements.titleInput.value = item.title.trim();
  elements.amountInput.value = item.amount;
  elements.categoryInput.value = item.category.trim();
  elements.dateInput.value = new Date(item.date).toISOString().split("T")[0];
  if (
    [...elements.categorySelection.options].some(
      (option) => option.value === item.category,
    )
  ) {
    elements.categorySelection.value = item.category;
  }
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
  handleCategoryOptions();
}

function handleUpdateExpense() {
  if (editingId === null) {
    return;
  }
  const newData = {
    title: elements.titleInput.value.trim(),
    amount: elements.amountInput.value.trim(),
    category: elements.categoryInput.value.trim(),
    date: elements.dateInput.value,
  };
  const validation = validateExpense(newData);
  if (!validation.valid) {
    showModal(validation.message);
    return;
  }
  const formattedData = createExpense(newData);
  expenses = updateExpense(expenses, editingId, formattedData);
  if (!expenses.length) return;
  saveToLocalStorage("expenses", expenses);
  handleSortExpenses();
  editingId = null;
  clearInputs();
  showModal("Expense updated successfully!");
}

function handleSearchExpenses() {
  let titleSearch = elements.searchTitle.value.toLowerCase().trim();
  let amountSearch =
    elements.searchAmount.value === ""
      ? ""
      : parseFloat(elements.searchAmount.value.trim());

  if (titleSearch === "" && amountSearch === "") {
    handleRenderExpenses();
    return;
  }
  let filteredExpenses = searchExpenses(expenses, titleSearch, amountSearch);
  if (filteredExpenses.length === 0) {
    elements.container.innerHTML = "<p>No resuts found</p>";
  } else {
    handleRenderExpenses(filteredExpenses);
    handleMonthlyTotal(filteredExpenses);
    handleTotalCalcule(filteredExpenses);
  }
}

function handleSortExpenses() {
  const sortBy = elements.sortSelection.value;
  const sortedExpenses = sortExpenses(expenses, sortBy);
  handleRenderExpenses(sortedExpenses);
}

function handleSelectCategories() {
  const selectedCategory = elements.categorySelection.value;
  const filteredExpenses =
    selectedCategory === "All"
      ? expenses
      : selectCategories(expenses, selectedCategory);
  handleRenderExpenses(filteredExpenses);
  handleMonthlyTotal(filteredExpenses);
  handleTotalCalcule(filteredExpenses);
}

function handleFilterByMonth(data = expenses) {
  const selectedMonth = Number(elements.filterByMonth.value);
  const filteredExpenses =
    selectedMonth === "all" ? data : filterByMonth(data, selectedMonth);
  const totalByMonth = calculateByDate(filteredExpenses);
  elements.monthlyTotal.textContent = "Total Monthly: " + totalByMonth;
  handleRenderExpenses(filteredExpenses);
}

function showModal(message) {
  elements.modalMsg.textContent = message;
  elements.modalContainer.classList.add("show");
  setTimeout(() => {
    elements.modalContainer.classList.remove("show");
  }, 3000);
}

function createUniqueCategories() {
  const allCategories = extractCategories(expenses);
  const categoriesArray = ["All", ...new Set(allCategories)];
  return categoriesArray;
}

function handleCategoryOptions(data = expenses) {
  const categories = createUniqueCategories(data);
  elements.categorySelection.textContent = "";
  categories.forEach((category) => {
    const selectOptions = createCategoryOptions(category);
    elements.categorySelection.appendChild(selectOptions);
  });
}

function handleTotalCalcule(data = expenses) {
  const total = totalCalculate(data);
  elements.totalAmount.textContent = "Total Amount: " + total;
}

getFromLocalStorage("expenses");
handleRenderExpenses();
setupEvents();
handleCategoryOptions();
