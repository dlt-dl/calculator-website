class Calculator {
  constructor() {
    this.display = document.getElementById("display");
    this.historyList = document.getElementById("historyList");

    this.history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    this.renderHistory();

    this.currencyPanel = document.getElementById("currencyPanel");

    this.amountInput = document.getElementById("currencyAmount");
    this.fromCurrency = document.getElementById("fromCurrency");
    this.toCurrency = document.getElementById("toCurrency");
    this.resultText = document.getElementById("currencyResult");

    this.init();
    this.loadCurrencies();
  }

  init() {
    document.querySelectorAll("[data-value]").forEach(btn =>
      btn.addEventListener("click", () => this.input(btn.dataset.value))
    );

    darkToggle.onclick = () => document.body.classList.toggle("dark");

    sciToggle.onclick = () =>
      scientificPanel.classList.toggle("show");

    historyToggle.onclick = () =>
      historyPanel.classList.toggle("show");

    currencyToggle.onclick = () =>
      this.currencyPanel.classList.toggle("show");

    clearHistory.onclick = () => {
      this.history = [];
      this.saveHistory();
      this.renderHistory();
    };

    convertCurrencyBtn.onclick = () => this.convertCurrency();
  }

  closeBrackets(expression) {
    let open = (expression.match(/\(/g) || []).length;
    let close = (expression.match(/\)/g) || []).length;
    while (close < open) expression += ")";
    return expression;
  }

  input(val) {
    if (val === "C") return (this.display.value = "");
    if (val === "DEL") return (this.display.value = this.display.value.slice(0, -1));
    if (val === "=") return this.evaluate();
    this.display.value += val;
  }

  evaluate() {
    try {
      let original = this.closeBrackets(this.display.value);

      let expr = original
        .replace(/π/g, "Math.PI")
        .replace(/\be\b/g, "Math.E")
        .replace(/\^/g, "**")
        .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/log\(([^)]+)\)/g, "Math.log10($1)")
        .replace(/ln\(([^)]+)\)/g, "Math.log($1)")
        .replace(/sin\(([^)]+)\)/g, "Math.sin(Math.PI/180*($1))")
        .replace(/cos\(([^)]+)\)/g, "Math.cos(Math.PI/180*($1))")
        .replace(/tan\(([^)]+)\)/g, "Math.tan(Math.PI/180*($1))");

      const result = Function("return " + expr)();
      this.display.value = result;

      this.addHistory(`${original} = ${result}`);
    } catch {
      this.display.value = "Error";
    }
  }

  addHistory(entry) {
    this.history.unshift(entry);
    this.history = this.history.slice(0, 50);
    this.saveHistory();
    this.renderHistory();
  }

  saveHistory() {
    localStorage.setItem("calcHistory", JSON.stringify(this.history));
  }

  renderHistory() {
    this.historyList.innerHTML = "";
    this.history.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.onclick = () => {
        this.display.value = item.split("=")[0].trim();
      };
      this.historyList.appendChild(li);
    });
  }

  loadCurrencies() {
    const currencies = ["USD", "EUR", "INR", "GBP", "JPY", "AUD", "CAD"];

    currencies.forEach(cur => {
      this.fromCurrency.innerHTML += `<option>${cur}</option>`;
      this.toCurrency.innerHTML += `<option>${cur}</option>`;
    });

    this.fromCurrency.value = "USD";
    this.toCurrency.value = "INR";
  }

  async convertCurrency() {
    let amount = this.amountInput.value;
    if (!amount) return alert("Enter amount!");

    let from = this.fromCurrency.value;
    let to = this.toCurrency.value;

    try {
      let res = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`
      );
      let data = await res.json();

      let rate = data.rates[to];
      let converted = (amount * rate).toFixed(2);

      this.resultText.textContent =
        `${amount} ${from} = ${converted} ${to}`;
    } catch {
      this.resultText.textContent = "Conversion Error!";
    }
  }
}

new Calculator();
