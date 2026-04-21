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

export function searchExpenses(expenses, titleSearch, amountSearch) {
  return expenses.filter((item) => {
    const titleMatch = titleSearch
      ? item.title.toLowerCase().includes(titleSearch.toLowerCase())
      : true;
    const amountMatch =
      amountSearch !== "" ? item.amount === amountSearch : true;
    return titleMatch && amountMatch;
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
export function selectCategories(expenses, selectedCategory) {
  return expenses.filter((item) => item.category === selectedCategory);
}

export function clearCheckedButtons(expenses) {
  return expenses.filter((item) => !item.selected);
}

export function totalCalculate(data) {
  return data.reduce((sum, item) => sum + item.amount, 0);
}
