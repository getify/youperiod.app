// create the current date at open and makes the initial display calendar the current dates calendar
const MONTH_INFO = [
  { month: "January", days: 31, monthNum: 0 },
  { month: "February", days: 0, monthNum: 1 },
  { month: "March", days: 31, monthNum: 2 },
  { month: "April", days: 30, monthNum: 3 },
  { month: "May", days: 31, monthNum: 4 },
  { month: "June", days: 30 , monthNum: 5},
  { month: "July", days: 31, monthNum: 6 },
  { month: "August", days: 31, monthNum: 7 },
  { month: "September", days: 30, monthNum: 8 },
  { month: "October", days: 31, monthNum: 9 },
  { month: "November", days: 30, monthNum: 10 },
  { month: "December", days: 31, monthNum: 11 }
];
const [currentMonth, currentDay, currentYear] = getCurrentDate();
// create calendar object and pass in current month/year
makeCalendar(currentMonth, currentYear);

// for the directional buttons in the calendar header it adds the function to change the calendar
const clickHandlers = {
  "previous-year": () => changeCalendarArrows("minus"),
  "next-year": () => changeCalendarArrows("add")
};
document.getElementById("previous-year").addEventListener("click", clickHandlers["previous-year"]);
document.getElementById("next-year").addEventListener("click", clickHandlers["next-year"]);


/**
 * Determines if a year is a leap year
 * @param {number} year - The year to evaluate
 * @returns {boolean} True if leap year, false if not
*/
function isLeapYear(year) {
  if (typeof year !== "number") {
    throw new Error("Year must be a number");
  }
  if (year % 4 === 0) {
    return year % 100 === 0 ? year % 400 === 0 : true;
  }
  return false;
};

/**
 * Returns number of days in February for a given year.
 * @param {number} year - The year to check
 * @returns {number} Days in February for that year
*/
function februaryDays(year) {
  if (typeof year !== "number") {
    throw new Error("Year must be a number");
  }

  const isLeap = isLeapYear(year);

  return isLeap ? 29 : 28;
}

/**
 * Gets the current date and returns it broken into 
 * month, day and year values.
 * 
 * @returns {Array} An array containing:
 * - currentDateMonth {number} The current month number
 * - currentDateDay {number} The current day of the month
 * - currentDateYear {number} The current year
*/
function getCurrentDate() {
  const currentDate = new Date();
  const currentDateMonth = currentDate.getMonth();
  const currentDateDay = currentDate.getDate();
  const currentDateYear = currentDate.getFullYear();

  return [currentDateMonth, currentDateDay, currentDateYear];
}

/**
 * Gets the month information for the given month number.
 * 
 * Looks up the month details in the MONTH_INFO constant array.
 * For February, dynamically calculates the number of days 
 * by calling the februaryDays() function.
 *
 * @param {number|string} month - The month number (0-11) or name
 * @param {number} year - The year
 * @returns {Object} The month information object
*/
function getMonthInfo (month, year) {
  let monthNum;
  
  if (typeof month === "string") {
    monthNum = MONTH_INFO.findIndex(m => m.month === month);
  } else {
    monthNum = month;
  }

  const monthInfo = MONTH_INFO[monthNum];

  if (monthNum === 1) { // February
    monthInfo.days = februaryDays(year);
  }

  return monthInfo;
}

/**
 * 
 * @param {Object} activeMonthInfo 
 * @param {number} activeMonthFirstDay 
 * @param {number} activeYear 
 */
function createCalendarDayDivs (activeMonthInfo, activeMonthFirstDay, activeYear) {
  const daysOfMonth = document.querySelector(".calendar-days");
  daysOfMonth.innerHTML = "";

  for (let dayIndex = 0; dayIndex < activeMonthInfo.days + activeMonthFirstDay; dayIndex++) {
    // creates a new div for each number
    let day = document.createElement("div");

    // when the index is finally equal or above the numerical value of the first day of the month the numbers for the days start to get added
    if (dayIndex >= activeMonthFirstDay) {
      /*By doing dayIndex - firstDayOfMonth, we essentially reset the count to start at 1 on the day that the 1st of the month falls on. Then we add 1 back to get the correct day number.

      This allows us to iterate through the entire grid of dates, but only print the day numbers starting in the correct spot based on firstDayOfMonth. */
      day.innerHTML = dayIndex - activeMonthFirstDay + 1;

      // checks if the calendars year, month and day are the current day
      //  since the index iterates even before the first day this will take the first day of the month away from it to only add 1 to only look within the indexes that have numerical values and compare that to the current date
      if (dayIndex - activeMonthFirstDay + 1 === currentDay && activeMonthInfo.monthNum === currentMonth && activeYear === currentYear) {
        // create the current day indicator
        day.setAttribute("id", "current-date");
      }
    }

    // pushes the days made to the calendars month div to actually have days
    daysOfMonth.appendChild(day);
  }
}

/**
 * Creates a calendar for the given month and year
 * @param {number} month - The month number (0-11)
 * @param {number} year - The year
*/
function makeCalendar(month, year) {
  if (typeof month !== "number"  || typeof year !== "number") {
    throw new Error("Month and year must be numbers");
  }
  // gets the first day of the month that is being passed to make sure the 1st is on the correct day in each calendar
  let monthInfo = getMonthInfo(month, year);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  //  getting the days, month and years html tags/info so that they can be set or made
  // let daysOfMonth = document.querySelector(".calendar-days");
  const calendarMonth = document.querySelector(".month");
  const calendarYear = document.querySelector(".year");

  // setting the html to display the value needed for the specific calendar
  calendarYear.innerHTML = year;
  calendarMonth.innerHTML = monthInfo.month;

  createCalendarDayDivs(monthInfo, firstDayOfMonth, year);
};

/**
* Changes the displayed calendar month and year based on the 
* provided change direction.
*
* @param {string} change - Either "add" or "minus" to indicate changing 
* the calendar ahead or behind one month
*/
function changeCalendarArrows(change) {
  // gets the currently displaying calendar month and year
  const monthDisplayInfo = document.querySelector(".month").innerHTML;
  const yearDisplayInfo = document.querySelector(".year").innerHTML;

  // get numerical values for year and month to use in math or pass into the make calendar function again
  const currentYearDisplay = parseInt(yearDisplayInfo);
  const currentMonthDisplay = getMonthInfo(monthDisplayInfo, currentYearDisplay).monthNum;

  // the variables to make the new calendar set to 0 so they can be changed in the if else for changing
  let newMonthDisplay = currentMonthDisplay;
  let newYearDisplay = currentYearDisplay;

  if (change === "add") {
    // if we are in december, go to january and increment the year
    if (currentMonthDisplay === 11) {
      newMonthDisplay = 0;
      newYearDisplay = currentYearDisplay + 1;
    } else {
      newMonthDisplay = currentMonthDisplay + 1;
    }
  } 
  if (change === "minus") {
    if (currentMonthDisplay <= 0) {
      newMonthDisplay = 11;
      newYearDisplay = currentYearDisplay - 1;
    } else {
      newMonthDisplay = currentMonthDisplay - 1;
    }
  }

  // calls the make calendar function again to make the new calendar
  makeCalendar(newMonthDisplay, newYearDisplay);
};

function startPeriod() {
  pass;

  //  * pseudocode 
  // when the button is clicked to start the period
  // the button will take in the current date of today
  // it will then add the class period-day to the div for that day
  // it should then open maybe a module that will allow the user to select the flow strength of their period

  // ? will this need to call make calendar again

  // ? maybe the make calendar func above like with the current day will need to call this func in reference to the data logged for period so that when the users scroll months any data they have entered will show
}

function trackFlow(flowInfo) {
  pass;

  // * pseudocode
  // it will have the option buttons for light, medium, heavy
  // user will select an option
  // the button will register the day and add the proper class to the div for that day to display

  // ? will this need to call make calendar again

  // ? maybe the make calendar func above like with the current day will need to call this func in reference to the data logged for period so that when the users scroll months any data they have entered will show
}
