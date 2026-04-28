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
  categorySpan.classList.add("category");
  const dotSpan = document.createElement("span");
  dotSpan.textContent = " . ";
  dotSpan.classList.add("dot");
  const dateSpan = document.createElement("span");
  dateSpan.textContent = new Date(expense.date).toLocaleDateString("en-GB");
  dateSpan.classList.add("date");

  metaElements.appendChild(categorySpan);
  metaElements.appendChild(dotSpan);
  metaElements.appendChild(dateSpan);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action-container");
  const amount = document.createElement("span");
  amount.textContent = `Rs ${expense.amount}`;
  amount.classList.add("amount");

  const actionRight = document.createElement("div");
  actionRight.classList.add("action-right");
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
  infoContainer.appendChild(h3);
  infoContainer.appendChild(metaElements);

  actionContainer.appendChild(amount);
  actionRight.appendChild(deleteBtn);
  actionRight.appendChild(editBtn);
  actionRight.appendChild(cancelBtn);
  actionRight.appendChild(checkbox);
  actionContainer.appendChild(actionRight);

  div.appendChild(infoContainer);
  div.appendChild(actionContainer);
  return div;
}

export function renderMsgForFilter(message) {
  const p = document.createElement("p");
  p.className = "message-box message";
  p.textContent = message;
  return p;
}

export function clearAllExpenses() {
  return [];
}
