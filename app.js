document.addEventListener('DOMContentLoaded', () => {
  // Input elements
  const netSalaryInput = document.getElementById('netSalary');
  const annualExpensesInput = document.getElementById('annualExpenses');
  const taxRateInput = document.getElementById('taxRate');
  const workHoursWeekInput = document.getElementById('workHoursWeek');
  const billablePercentInput = document.getElementById('billablePercent');
  const vacationWeeksInput = document.getElementById('vacationWeeks');
  const sickDaysInput = document.getElementById('sickDays');
  const profitMarginInput = document.getElementById('profitMargin');
  const projectHoursInput = document.getElementById('projectHours');
  const riskMultiplierInput = document.getElementById('riskMultiplier');

  // Output elements
  const hourlyRateDisplay = document.getElementById('hourlyRateDisplay');
  const dailyRateDisplay = document.getElementById('dailyRateDisplay');
  const grossRevenueDisplay = document.getElementById('grossRevenueDisplay');
  const billableHoursDisplay = document.getElementById('billableHoursDisplay');
  const taxAmountDisplay = document.getElementById('taxAmountDisplay');
  const profitAmountDisplay = document.getElementById('profitAmountDisplay');
  const projectQuoteDisplay = document.getElementById('projectQuoteDisplay');

  // Chart segments
  const barNet = document.getElementById('barNet');
  const barTax = document.getElementById('barTax');
  const barOverhead = document.getElementById('barOverhead');
  const barProfit = document.getElementById('barProfit');

  function calculateRates() {
    const netSalary = parseFloat(netSalaryInput.value) || 0;
    const annualExpenses = parseFloat(annualExpensesInput.value) || 0;
    const taxRate = (parseFloat(taxRateInput.value) || 0) / 100;
    const workHoursWeek = parseFloat(workHoursWeekInput.value) || 0;
    const billablePercent = (parseFloat(billablePercentInput.value) || 0) / 100;
    const vacationWeeks = parseFloat(vacationWeeksInput.value) || 0;
    const sickDays = parseFloat(sickDaysInput.value) || 0;
    const profitMargin = (parseFloat(profitMarginInput.value) || 0) / 100;

    // Calculate working weeks and total billable hours per year
    const workingWeeksPerYear = Math.max(0, 52 - vacationWeeks - (sickDays / 5));
    const totalWorkingHours = workingWeeksPerYear * workHoursWeek;
    const annualBillableHours = totalWorkingHours * billablePercent;

    if (annualBillableHours <= 0) {
      hourlyRateDisplay.textContent = '$0.00';
      dailyRateDisplay.textContent = 'Daily Rate: $0.00';
      return;
    }

    // Tax pre-grossing
    // Net Income + Overhead = Pre-Tax Operating Target
    const baseRequirement = netSalary + annualExpenses;
    
    // Tax burden calculation (Gross Revenue before Tax)
    const grossRevenueBeforeProfit = taxRate < 1 ? baseRequirement / (1 - taxRate) : baseRequirement * 1.5;
    const estimatedTaxes = grossRevenueBeforeProfit - baseRequirement;

    // Adding Profit Buffer
    const profitBuffer = grossRevenueBeforeProfit * profitMargin;
    const grossRevenueNeeded = grossRevenueBeforeProfit + profitBuffer;

    // Rates
    const hourlyRate = grossRevenueNeeded / annualBillableHours;
    const dailyRate = hourlyRate * (workHoursWeek / 5);

    // Update UI Displays
    hourlyRateDisplay.textContent = formatCurrency(hourlyRate);
    dailyRateDisplay.textContent = `Daily Rate: ${formatCurrency(dailyRate)}`;
    grossRevenueDisplay.textContent = formatCurrency(grossRevenueNeeded);
    billableHoursDisplay.textContent = `${Math.round(annualBillableHours)} hrs/yr`;
    taxAmountDisplay.textContent = formatCurrency(estimatedTaxes);
    profitAmountDisplay.textContent = formatCurrency(profitBuffer);

    // Update Stacked Visual Bar
    const totalSum = netSalary + estimatedTaxes + annualExpenses + profitBuffer;
    if (totalSum > 0) {
      const netPct = (netSalary / totalSum) * 100;
      const taxPct = (estimatedTaxes / totalSum) * 100;
      const overheadPct = (annualExpenses / totalSum) * 100;
      const profitPct = (profitBuffer / totalSum) * 100;

      barNet.style.width = `${netPct}%`;
      barTax.style.width = `${taxPct}%`;
      barOverhead.style.width = `${overheadPct}%`;
      barProfit.style.width = `${profitPct}%`;
    }

    // Calculate Quick Project Quote
    updateProjectQuote(hourlyRate);
  }

  function updateProjectQuote(hourlyRate) {
    const projectHours = parseFloat(projectHoursInput.value) || 0;
    const riskMultiplier = parseFloat(riskMultiplierInput.value) || 1.0;
    const projectTotal = projectHours * hourlyRate * riskMultiplier;
    projectQuoteDisplay.textContent = formatCurrency(projectTotal);
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  }

  // Attach Listeners
  const allInputs = [
    netSalaryInput, annualExpensesInput, taxRateInput, workHoursWeekInput,
    billablePercentInput, vacationWeeksInput, sickDaysInput, profitMarginInput,
    projectHoursInput, riskMultiplierInput
  ];

  allInputs.forEach(input => {
    input.addEventListener('input', calculateRates);
    input.addEventListener('change', calculateRates);
  });

  // Initial Run
  calculateRates();
});
