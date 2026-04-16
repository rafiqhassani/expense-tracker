export function renderExpenses(expense) {
  if (!expense) return null;
  const div = document.createElement("div");
  if (expense.amount > 1000) {
    div.classList.add("expensive");
  }
  const h3 = document.createElement("h3");
  h3.textContent = "Title: " + expense.title;
  const paraAmount = document.createElement("p");
  paraAmount.textContent = "Amount: " + expense.amount;
  const paraCategory = document.createElement("p");
  paraCategory.textContent = "Category: " + expense.category;
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.dataset.id = expense.id;
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.classList.add("cancel-btn");
  cancelBtn.dataset.id = expense.id;
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.dataset.id = expense.id;
  editBtn.classList.add("edit-btn");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("select-expense");
  checkbox.dataset.id = expense.id;
  checkbox.checked = expense.selected || false;
  const date = document.createElement("p");
  date.textContent = "Date: " + new Date(expense.date).toLocaleDateString();
  div.appendChild(h3);
  div.appendChild(paraAmount);
  div.appendChild(paraCategory);
  div.appendChild(date);
  div.appendChild(deleteBtn);
  div.appendChild(editBtn);
  div.appendChild(cancelBtn);
  div.appendChild(checkbox);
  return div;
}

export function createCategoryOptions(category) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  return option;
}

export function clearAllExpenses() {
  return [];
}
