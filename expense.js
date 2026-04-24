export function addExpense(expenses, newExpense) {
  const added = [...expenses, newExpense];
  if (added.length > 500) {
    added.shift();
  }
  return added;
}
export function createExpense(
  data,
  existingId = null,
  existingSelected = false,
) {
  const parsedAmount = Number(data.amount);

  const isValidDate = data.date && !isNaN(Date.parse(data.date));

  return {
    id: existingId || crypto.randomUUID(),
    title: data.title.trim(),
    amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
    category: data.category.trim(), 
    date: isValidDate ? data.date : new Date().toISOString().split("T")[0],
    selected: Boolean(existingSelected),
  };
}
export function filterByMonth(expenses, month) {
  return expenses.filter((item) => {
    const d = new Date(item.date);
    return d.getMonth() + 1 === month;
  });
}

export function deleteExpense(expenses, id) {
  return expenses.filter((item) => item.id !== id);
}

export function editExpense(expenses, id) {
  return expenses.find((item) => item.id === id);
}

export function checkboxChange(expenses, id, isChecked) {
  return expenses.map((item) =>
    item.id === id ? { ...item, selected: isChecked } : item,
  );
}

export function updateExpense(expenses, editingId, newData) {
  return expenses.map((item) =>
    item.id === editingId
      ? {
          ...item,
          ...newData,
        }
      : item,
  );
}

export function searchExpenses(expenses, searchExpense) {
  const inputText = searchExpense.trim().toLowerCase();

  return expenses.filter((expense) => {
    return (
      expense.title.toLowerCase().includes(inputText) ||
      expense.amount.toString().includes(inputText) ||
      expense.category.toLowerCase().includes(inputText)
    );
  });
}

export function sortExpenses(expenses, sortBy) {
  const sorted = [...expenses];
  if (sortBy === "smallest") {
    sorted.sort((a, b) => a.amount - b.amount);
  } else if (sortBy === "largest") {
    sorted.sort((a, b) => b.amount - a.amount);
  } else if (sortBy === "title-ascending") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "title-descending") {
    sorted.sort((a, b) => b.title.localeCompare(a.title));
  }
  return sorted;
}

export function clearSelectedExpenses(expenses) {
  return expenses.filter((item) => !item.selected);
}

export function totalCalculate(data) {
  return data.reduce((sum, item) => sum + item.amount, 0);
}
