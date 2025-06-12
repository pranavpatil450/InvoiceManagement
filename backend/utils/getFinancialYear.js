module.exports = function getFinancialYear(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
  
    if (month < 3) {
      return `${year - 1}-${year}`;
    } else {
      return `${year}-${year + 1}`;
    }
  };
  