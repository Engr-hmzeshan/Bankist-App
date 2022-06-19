'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-07-25T10:17:24.185Z',
    '2022-06-07T14:11:59.604Z',
    '2022-06-14T17:01:17.194Z',
    '2022-06-13T23:36:17.929Z',
    '2022-06-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'ur-PK', // de-DE
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
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
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

/////////////////////////////////////////////////
// Functions
// Dates of total Balance
const now = new Date();
const currentDate = function (curDate) {
  const day = `${curDate.getDate()}`.padStart(2, '0');
  const month = `${curDate.getMonth() + 1}`.padStart(2, '0'); // Month is 0 based
  const year = curDate.getFullYear();
  const hour = `${curDate.getHours()}`.padStart(2, '0');
  const second = `${curDate.getSeconds()}`.padStart(2, '0');
  return `${day}/${month}/${year}, ${hour}:${second}`;
};
// Dates of each movements
const moveDates = function (dates, locale) {
  // Calculate yesterday, days ago, today
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 24 * 60 * 60));
  const daysPassed = calcDaysPassed(new Date(), dates); // Current day, and movements Dates-days
  console.log('Days Passed=', daysPassed);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // Set date Manually without API
    // const day = `${dates.getDate()}`.padStart(2, '0');
    // const mon = `${dates.getMonth()}`.padStart(2, '0');
    // const year = dates.getFullYear();
    // return `${day}/${mon}/${year}`;

    // With API
    return new Intl.DateTimeFormat(locale).format(dates);
  }
};
// Internationalization Number and currancy for this app
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(Math.abs(value));
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // Date of movemnents
    const date = new Date(acc.movementsDates[i]);
    const displayDate = moveDates(date, acc.locale);
    const formatedMove = formatCurrency(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatedMove}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  // Without API
  // labelBalance.textContent = `${acc.balance.toFixed(2)}€`; // Add Decimal limits

  // Formating using API as per countery
  const formatedBalance = formatCurrency(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formatedBalance}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  // Without API
  // labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  // Formating using API as per countery
  const formatIncomes = formatCurrency(incomes, acc.locale, acc.currency);
  labelSumIn.textContent = `${formatIncomes}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  // Formating using API as per countery
  const formatOut = formatCurrency(out, acc.locale, acc.currency);
  labelSumOut.textContent = `${formatOut}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  // Formating using API as per countery
  const formatInterest = formatCurrency(interest, acc.locale, acc.currency);
  labelSumInterest.textContent = `${formatInterest}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};
const setLogOutTimer = function () {
  // Goals of this function:
  // 1.make exact timer(i.e 10min)
  // 2.check for login and logout time and make it work for that
  // 3.check timer for both user simultaionously and resolve issue
  // 4. check timer if user already login
  // 5. check the delay at 0.
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // in each time print remaining time
    labelTimer.textContent = `${min}:${sec}`;
    // when sec = 0 logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      // hide UI
      containerApp.style.opacity = 0;
    }
    // Decrease 1s
    time--;
  };
  // Set timer to 5 minutes
  let time = 120;
  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // Set the current date and time of balance (Manually set)
    // labelDate.textContent = currentDate(now);

    // Set the current date and time of balance (Automatically through API)
    // Experimenting with API
    const newDate = new Date();
    // Find the language locale
    // Rest language code can be found at 'Language code table'
    // const locale = navigator.languages;
    // console.log(locale);

    const options = {
      // Exactly same spells and options('numeric', 'long', '2-digit')
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // Internaitionalization API is great API to deal with dates and times internationally
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(newDate);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // Set Timer
    if (timer) clearInterval(timer);
    timer = setLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // Adding Transfer Date
    // When we add or remove new amount from array than the date array should also be change corrospondingly
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Reseting timer if user don't inactive if active than reset timer
    clearInterval(timer);
    timer = setLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); // We implement Math floor method to avoid decimal 2. Math.floor automatically type coercion (convert strings to numbers so we do not need to write +)

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add timer during loan approval
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);
      // Add movement date
      currentAccount.movementsDates.push(new Date().toISOString());
      // Reseting timer if user don't inactive if active than reset timer
      clearInterval(timer);
      timer = setLogOutTimer();
      // Update UI
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
// Fake login
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// Another forms of representating data i.e strings and array
// Numbers, Dates, Intl and Timers

// Numbers
// JavaScript always represents numbers in floating

// Numbers tools(1. Math.floor, tofixed, parseInt, parseFloot, isFinite, random, trunc, remainder(%) and many more)

// Base 10: 0 9
// Binary 2: 0 1
console.log(0.1 + 0.2); // 0.300000000
// CONVERSION
console.log(Number('23'));
console.log(+'23'); // Same result cause it's a type corecion(Topic needs to be clear)
// PARSING 1. get rid of extra symbol 2. should be start with a number 3. Returns only integer part
console.log(Number.parseInt('30px'));
console.log(Number.parseInt('  2px56  ', 10));
// FLOAT 1. Returns all decimal values
console.log(parseFloat('23.5rem'));
console.log(Number.parseFloat('23.5rem')); // RECOMENDED
// Check if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20'));
console.log(Number.isNaN(+'20X')); // Returns NaN
// Check if Value is Number
console.log(Number.isFinite(20)); // RECOMENDED method
console.log(Number.isFinite('20'));
console.log(isFinite(30 / 0)); // Returns infinity
// Check if value is integer(Only int)
console.log(Number.isInteger(25.2));
console.log(Number.isInteger(25));

// Random Number
const randomInt = (min, max) =>
  // Both inculsive(max, min)
  // Single inculsive(max, min) -> consult on MDN
  Math.floor(Math.random() * (max - min) + 1) + min; // it's better to use floor value cause it worked for both +ve and -Ve

console.log(randomInt(10, 20));
// Roundng
console.log(Math.round(23.5));
console.log(Math.round(23.9));
// Rounded Up
console.log(Math.ceil(23.9));
console.log(Math.ceil(23.3));
// Rounded Down
console.log(Math.floor(23.9));

console.log(Math.trunc(23.9));
console.log(Math.floor(23.3));
// Floor is RECOMMANDED cause its worked for both -ve and +ve
console.log(Math.trunc(-23.9));
console.log(Math.floor(-23.3));
// Desired decimal limit
console.log((23.9).toFixed(3)); // Return a string
console.log((23.234).toFixed(2));
// Rounded up + desired decimal
console.log(+(23.9355).toFixed(2));
// Other Math Oberations are sqrt, min, max, PI etc
console.log(25 ** 1 / 2); // SQRT
console.log(8 ** 1 / 3); // Cubic Root
console.log(Math.PI * Number.parseFloat('10px') ** 2); // Area calculate with units
// Remainder Operator
// Find nu b/w 0 20 even and odd
const evenOdd = function (range) {
  for (let i = range[0]; i <= range[1]; i++) {
    console.log(i % 2 === 0 ? `Even Number: ${i}` : `Odd Number: ${i}`);
  }
};
evenOdd([0, 20]);
// We can do this to implement our CSS as per event

// Primitives Data types(bigInt)
console.log(2 ** 53 - 1); // Maximum number that a javaScript engine can deal and store
// Number represents in 64 bit in javaScript engine (...anynumber upto 53 . after decimal remaining...) = 64
console.log(Number.MAX_SAFE_INTEGER);
// We may deal with it in Web API
console.log(Number.MIN_SAFE_INTEGER);
console.log(113216541348432165414646465464654n); //
// console.log(13213134161321346 + BigInt(1321646465946987946464)); // Cann't do type corecion
console.log(13213134161321346n - 1321646465946987946464n);
console.log(13213134161321346n - 1321646465946987946464n);
// BigInt Constructor function in javaScript engine
// Cann't work on huge numbers
console.log(BigInt(21321313));
// Operations
console.log(132165464n * 131324131n);
const huge = 1321321321321313213n;
const numb = 75;
console.log(huge * BigInt(numb));
// Exception
console.log(20n > 15);
console.log(20 > 15n);
console.log(20 === 20n); // Value and type are not same
console.log(huge + ' Very BIG!!'); // Type Corecion
// Math. Operaion cann't performed on BigInt

//Divison
console.log(10n / 3n); // Returns closest bigint
console.log(10 / 3);

// Dates and Time
// The month is 0's based 0 11
console.log(new Date(1998, 7, 6, 9, 25, 30, 16));
console.log(new Date('Auguest 1998,6'));
console.log(new Date()); // Current time
// 0 Represents the miliseconds of starting times
console.log(new Date(0)); // since the begining of unix systems
// Three days after begining of time
console.log(new Date(3 * 24 * 60 * 60 * 1000));
// It will become object so we can apply different methods
const future = new Date(2037, 10, 9, 5, 6);
console.log('Future Date:', future);
// Get methods
console.log(future.getDate());
console.log(future.getFullYear());
console.log(future.getHours());
console.log(future.getSeconds());
// ISO date
console.log(future.toISOString());
// Time stamp(miliseconds)
console.log(future.getTime());
console.log(new Date(2141337960000)); // REtrurn same date as per miliseconds
// Current time stamp
console.log(Date.now()); // Current time stamp
console.log(new Date(1655142008547));
// Set methods
future.setDate(2);
console.log(future);
// if we set wrong day i.e a month having 28 days than it automatically corrected and move to other day
future.setDate(35);
console.log(future);

// Dates operations
const date1 = new Date(2037, 10, 25);
const date2 = new Date(2037, 10, 10);

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 24 * 60 * 60);
// console.log(calcDaysPassed(date1, date2));

// Internationalization of Dates and Numbers

// Numbers
/*
const x = 125245.25;
const option = {
  style: 'currency', // currency, percent, unit and many more
  currency: 'EUR',
};
console.log('US: ', Intl.NumberFormat(navigator.language, option).format(x));
console.log('Arabic: ', Intl.NumberFormat('ar-SY', option).format(x));
console.log('Pakistan: ', Intl.NumberFormat('ur-PK', option).format(x));
*/
// Further formets on MDN docs

// Timers(stop, interval)
// setTimeout()
// Concept: 1. args -> callBackFn, time(milisec), ...args
// 2. We can pass an args and used it preferably an array
// 3. JavaScript engine doesn't stop at the point but keep the function behind the scene and run code ahead
// 4. Stop the timer
const ingr1 = 'Chicken';
const ingr2 = 'Mushrooms';
// const ingredients = ['Onion', 'Pickle'];
const ingredients = ['Pickle'];
const pizzaTimer = setTimeout(
  (ingr1, ingr2) =>
    console.log(
      `Your pizza dilevered with your ${ingr1} and ${ingr2} without ${ingredients}.!`
    ),
  3000,
  ingr1,
  ingr2,
  ...ingredients
);
console.log('Waiting...');
if (ingredients.includes('Onion')) {
  clearTimeout(pizzaTimer); // Cancel timer
}
// setTimeInterval
// let sec = 0;
// const seconds = setInterval(function () {
//   labelTimer.textContent = `00:00:0${sec}`;
//   sec++;
//   if (sec === 61) {
//     sec = 0;
//   }
// }, 1000);
// console.log(seconds);
