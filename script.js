'use strict';

/////////////////////////////////////////////////
// BANKIST APP
/////////////////////////////////////////////////

/////////////////////////////////////////////////
// DATA
/////////////////////////////////////////////////
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

/////////////////////////////////////////////////
// ELEMENTS
/////////////////////////////////////////////////
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);
const accounts = [account1, account2, account3, account4];
/////////////////////////////////////////////////
// FUNCTIONS & variables
/////////////////////////////////////////////////
let loggedAccount;
let loggedAccountBalance;
// create usernames - initals of a name
const createUseranme = accountList => {
  accountList.forEach(
    account =>
      (account.username = account.owner
        .toLowerCase()
        .split(` `)
        .map(word => word[0])
        .join(``))
  );
};
//adding movement rows to html
const printMovements = acc => {
  const eurMovements = acc.movements.map(move => Math.floor(move * 1.1));
  containerMovements.innerHTML = ``;
  acc.movements.forEach((move, index) => {
    const moveType = move > 0 ? `deposit` : `withdrawal`;
    const html = `       
    <div class="movements__row">
      <div class="movements__type movements__type--${moveType}">${
      index + 1
    } ${moveType} </div>
      <div class="movements__date">3 days ago</div>
    <div class="movements__value">${move} €</div>
  </div>`;
    containerMovements.insertAdjacentHTML(`afterbegin`, html);
  });
};
const calcDisplayBalance = acc => {
  loggedAccountBalance = acc.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = `${loggedAccountBalance} €`;
};
const calcDisplaySummary = acc => {
  labelSumIn.textContent = `${acc.movements
    .filter(move => move > 0)
    .reduce((acc, move) => acc + move, 0)} €`;
  labelSumOut.textContent = `${acc.movements
    .filter(move => move < 0)
    .reduce((acc, move) => acc + Math.abs(move), 0)} €`;
  labelSumInterest.textContent = `${acc.movements
    .filter(move => move > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .reduce((acc, int) => (int >= 1 ? acc + int : acc), 0)} €`;
};
const UpdateUi = account => {
  if (loggedAccount) {
    calcDisplayBalance(loggedAccount);
    calcDisplaySummary(loggedAccount);
    printMovements(loggedAccount);
  } else {
    containerApp.style.opacity = `0`;
  }
};
let movementsNotSorted;
let movementsSorted;
const login = e => {
  e.preventDefault();
  // check correct pin and username
  loggedAccount = checkInfo(
    inputLoginUsername.value,
    Number(inputLoginPin.value)
  );
  // if found, display ui and calcs
  if (loggedAccount) {
    labelWelcome.textContent = `Welcome Back, ${
      loggedAccount.owner.split(` `)[0]
    }`;
    UpdateUi(loggedAccount);
    containerApp.style.opacity = `1`;
    movementsNotSorted = [...loggedAccount.movements];
    movementsSorted = [...loggedAccount.movements].sort();
  }
  // reset input fields
  inputLoginUsername.value = ``;
  inputLoginPin.value = ``;
  inputLoginUsername.blur();
  inputLoginPin.blur();
};
const checkInfo = (username, pin = null) => {
  return accounts.find(
    acc => acc.username === username && (!pin || acc.pin === pin)
  );
};
const transferMoney = e => {
  e.preventDefault();
  // get username amount and the person object
  const transferAmount = Number(inputTransferAmount.value);
  const transferToObject = checkInfo(inputTransferTo.value);
  if (
    transferToObject &&
    transferAmount > 0 &&
    loggedAccountBalance > 0 &&
    loggedAccountBalance >= transferAmount &&
    loggedAccount !== transferToObject
  ) {
    transferToObject.movements.push(transferAmount);
    loggedAccount.movements.push(-transferAmount);
    UpdateUi(loggedAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = ``;
  inputTransferTo.blur();
  inputTransferAmount.blur();
};
const closeAccount = e => {
  e.preventDefault();
  if (
    loggedAccount ===
    checkInfo(inputCloseUsername.value, Number(inputClosePin.value))
  ) {
    accounts.splice(
      accounts.findIndex(acc => acc.name === loggedAccount.name),
      1
    );
    loggedAccount = null;
    UpdateUi(loggedAccount);
  }
  inputCloseUsername.value = ``;
  inputClosePin.value = ``;
  inputCloseUsername.blur();
  inputClosePin.blur();
};
const requestLoan = e => {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  if (
    loggedAccount.movements.some(move => move >= loanAmount * 0.1) &&
    loanAmount > 0
  ) {
    loggedAccount.movements.push(loanAmount);
    UpdateUi(loggedAccount);
  }
  inputLoanAmount.value = ``;
  inputLoanAmount.blur();
};
let sorted = true;

const sortMoves = e => {
  e.preventDefault();
  if (sorted) {
    sorted = false;
    loggedAccount.movements = movementsSorted;
  } else {
    sorted = true;
    loggedAccount.movements = movementsNotSorted;
  }
  UpdateUi(loggedAccount);
};
createUseranme(accounts);
btnLogin.addEventListener(`click`, login);
btnTransfer.addEventListener(`click`, transferMoney);
btnClose.addEventListener(`click`, closeAccount);
btnLoan.addEventListener(`click`, requestLoan);
btnSort.addEventListener(`click`, sortMoves);
/////////////////////////////////////////////
// LECTURES
/////////////////////////////////////////////
