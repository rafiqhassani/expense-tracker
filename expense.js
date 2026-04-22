export function addExpense(expenses, newExpense) {
  return [...expenses, newExpense];
}
export function createExpense(
  data,
  existingId = null,
  existingSelected = false,
) {
  const parsedAmount = parseFloat(data.amount.trim());

  return {
    id: existingId || crypto.randomUUID(),
    title: data.title.trim(),
    amount: isNaN(parsedAmount) ? 0 : parsedAmount,
    category: data.category.trim().toLowerCase(),
    date:
      data.date && !isNaN(new Date(data.date))
        ? data.date
        : new Date().toISOString().split("T")[0],
    selected: existingSelected,
  };
}
export function filterByMonth(expenses, month) {
  return expenses.filter((item) => {
    const d = new Date(item.date);
    return d.getMonth() + 1 === month;
  });
}
export function calculateByDate(expenses) {
  return expenses.reduce((sum, item) => sum + item.amount, 0);
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

export function clearCheckedButtons(expenses) {
  return expenses.filter((item) => !item.selected);
}

export function totalCalculate(data) {
  return data.reduce((sum, item) => sum + item.amount, 0);
}
