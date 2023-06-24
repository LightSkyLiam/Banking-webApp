'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Liam Lasry',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2023-06-20T14:11:59.604Z',
    '2023-06-21T17:01:17.194Z',
    '2023-06-22T23:36:17.929Z',
    '2023-06-23T10:51:36.790Z',
  ],
  currency: 'ILS',
  locale: 'he-IL', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2023-06-22T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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
  containerMovements.innerHTML = ``;
  acc.movements.forEach((move, index) => {
    const moveDate = new Date(acc.movementsDates[index]);
    const moveType = move > 0 ? `deposit` : `withdrawal`;
    const html = `       
    <div class="movements__row">
      <div class="movements__type movements__type--${moveType}">${
      index + 1
    } ${moveType} </div>
      <div class="movements__date"> ${formatDate(moveDate, `date`)}</div>
    <div class="movements__value">${formatCurr(move)}</div>
  </div>`;
    containerMovements.insertAdjacentHTML(`afterbegin`, html);
  });
};
const calcDisplayBalance = acc => {
  loggedAccountBalance = acc.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = formatCurr(loggedAccountBalance);
};

const calcDisplaySummary = acc => {
  const sums = {
    in: acc.movements
      .filter(move => move > 0)
      .reduce((acc, move) => acc + move, 0)
      .toFixed(2),
    out: acc.movements
      .filter(move => move < 0)
      .reduce((acc, move) => acc + Math.abs(move), 0)
      .toFixed(2),
    interest: acc.movements
      .filter(move => move > 0)
      .map(deposit => +(deposit * acc.interestRate) / 100)
      .reduce((acc, int) => (int >= 1 ? acc + int : acc), 0)
      .toFixed(2),
  };
  labelSumIn.textContent = formatCurr(sums.in);
  labelSumOut.textContent = formatCurr(sums.out);
  labelSumInterest.textContent = formatCurr(sums.interest);
};
const nowDate = new Date();
const UpdateUi = account => {
  if (loggedAccount) {
    calcDisplayBalance(loggedAccount);
    calcDisplaySummary(loggedAccount);
    printMovements(loggedAccount);
  } else {
    containerApp.style.opacity = `0`;
  }
};
const logOutTimer = () => {
  let time = 120;
  const tick = () => {
    labelTimer.textContent = `${String(Math.floor(time / 60)).padStart(
      2,
      0
    )}:${String(time % 60).padStart(2, 0)}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = `0`;
    }
    time--;
  };
  tick();
  timer = setInterval(tick, 1000);
  return timer;
};
let movementsNotSorted, movementsSorted, timer;
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
    movementsSorted = [...loggedAccount.movements].sort((a, b) => a - b);
    labelDate.textContent = formatDate(nowDate, `dateHours`, `fullDate`);
    if (timer) clearInterval(timer);
    timer = logOutTimer();
  }
  // reset input fields
  inputLoginUsername.value = ``;
  inputLoginPin.value = ``;
  inputLoginUsername.blur();
  inputLoginPin.blur();
  clearInterval(timer);
  timer = logOutTimer();
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
    transferToObject.movementsDates.push(nowDate);
    loggedAccount.movementsDates.push(nowDate);
    UpdateUi(loggedAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = ``;
  inputTransferTo.blur();
  inputTransferAmount.blur();
  clearInterval(timer);
  timer = logOutTimer();
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
  clearInterval(timer);
};
const requestLoan = e => {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = ``;
  inputLoanAmount.blur();
  setTimeout(() => {
    if (
      loggedAccount.movements.some(move => move >= loanAmount * 0.1) &&
      loanAmount > 0
    ) {
      loggedAccount.movements.push(loanAmount);
      loggedAccount.movementsDates.push(nowDate);
      UpdateUi(loggedAccount);
    }
  }, 2000);
  clearInterval(timer);
  timer = logOutTimer();
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
  clearInterval(timer);
  timer = logOutTimer();
};
const formatDate = (date, format, type = `short`) => {
  const daysPassed = Math.round(
    Math.abs(date.getTime() - nowDate.getTime()) / (1000 * 3600 * 24)
  );
  if (daysPassed === 0 && type !== `fullDate`) {
    return `Today`;
  } else if (daysPassed === 1 && type !== `fullDate`) {
    return `Yesterday`;
  } else if (daysPassed <= 7 && type !== `fullDate`) {
    return `${daysPassed} days ago`;
  } else if (format === `dateHours`) {
    return new Intl.DateTimeFormat(loggedAccount.locale, {
      hour: `numeric`,
      minute: `numeric`,
      day: `numeric`,
      month: `numeric`,
      year: `numeric`,
    }).format(date);
  } else if (format === `date`) {
    return new Intl.DateTimeFormat(loggedAccount.locale, {
      day: `numeric`,
      month: `numeric`,
      year: `numeric`,
    }).format(date);
  }
};
const formatCurr = text => {
  return new Intl.NumberFormat(loggedAccount.locale, {
    style: `currency`,
    currency: loggedAccount.currency,
  }).format(text);
};
createUseranme(accounts);
btnLogin.addEventListener(`click`, login);
btnTransfer.addEventListener(`click`, transferMoney);
btnClose.addEventListener(`click`, closeAccount);
btnLoan.addEventListener(`click`, requestLoan);
btnSort.addEventListener(`click`, sortMoves);
