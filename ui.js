export function renderExpenses(expense) {
  if (!expense) return null;
  const div = document.createElement("div");
  div.classList.add("list-item");
  if (expense.amount > 1000) {
    div.classList.add("expensive");
  }
  const infoContainer = document.createElement("div");
  infoContainer.classList.add("info-container");
  const h3 = document.createElement("h3");
  h3.textContent = expense.title;
  const metaElements = document.createElement("p");
  metaElements.classList.add("meta-info");
  const categorySpan = document.createElement("span");
  categorySpan.textContent = expense.category;
  const dotSpan = document.createElement("span");
  dotSpan.textContent = " . ";
  dotSpan.classList.add("dot");
  const dateSpan = document.createElement("span");
  dateSpan.textContent = new Date(expense.date).toLocaleDateString();

  metaElements.appendChild(categorySpan);
  metaElements.appendChild(dotSpan);
  metaElements.appendChild(dateSpan);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action-container");
  const amount = document.createElement("span");
  amount.textContent = `${expense.amount.toFixed(2)}`;
  amount.classList.add("amount");
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.classList.add("delete-btn", "group");
  deleteBtn.dataset.id = expense.id;
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.classList.add("cancel-btn", "group");
  cancelBtn.dataset.id = expense.id;
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.dataset.id = expense.id;
  editBtn.classList.add("edit-btn", "group");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("select-expense");
  checkbox.dataset.id = expense.id;
  checkbox.checked = expense.selected || false;
  infoContainer.appendChild(h3);
  infoContainer.appendChild(metaElements);
  actionContainer.appendChild(amount);
  actionContainer.appendChild(deleteBtn);
  actionContainer.appendChild(editBtn);
  actionContainer.appendChild(cancelBtn);
  actionContainer.appendChild(checkbox);
  div.appendChild(infoContainer);
  div.appendChild(actionContainer);
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
