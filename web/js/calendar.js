// create the current date at open and makes the initial display calendar the current dates calendar
const currentDate = new Date();
makeCalendar(currentDate.getMonth(), currentDate.getFullYear())

// for the directional buttons in the calendar header it adds the function to change the calendar
document.getElementById("previous-year").addEventListener("click", () => changeCalendarArrows("minus"));
document.getElementById("next-year").addEventListener("click", () => changeCalendarArrows("add"));

// checks to see if the year is a leap year for calendar day population
function checkLeapYear(year) {
  if (year % 4 === 0) {
    if (year % 100 === 0) {
      if (year % 400 === 0) {
        return true
      }
      return false
    }
    return true
  }
  return false
};

// using the check for leap year to populate february days in the monthDayInfo list
function februaryDays(year) {
  if (checkLeapYear(year)) {
    return 29
  } else {
    return 28
  }
}

// creating the calendar information, can take in the month and year to make it for any month
function makeCalendar(month, year) {
  // gets the current date and breaks it into the month, day and year to be used to set the current date within the calendar to put the proper marker
  // maybe don't need the duplication of the date but I am unsure
  const currentDateInfo = new Date();
  const currentDateInfoMonth = currentDateInfo.getMonth();
  const currentDateInfoDay = currentDateInfo.getDate();
  const currentDateInfoYear = currentDateInfo.getFullYear();

  // gets the first day of the month that is being passed to make sure the 1st is on the correct day in each calendar
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // list of the month and day info to be pulled from to make the calendar
  let monthDayInfo = [
    { month: "January", days: 31 },
    { month: "February", days: februaryDays(year) },
    { month: "March", days: 31 },
    { month: "April", days: 30 },
    { month: "May", days: 31 },
    { month: "June", days: 30 },
    { month: "July", days: 31 },
    { month: "August", days: 31 },
    { month: "September", days: 30 },
    { month: "October", days: 31 },
    { month: "November", days: 30 },
    { month: "December", days: 31 }
  ];

  //  getting the days, month and years html tags/info so that they can be set or made
  let daysOfMonth = document.querySelector(".calendar-days");
  let calendarMonth = document.querySelector(".month");
  let calendarYear = document.querySelector(".year");

  // setting the html to display the value needed for the specific calendar
  daysOfMonth.innerHTML = "";
  calendarMonth.innerHTML = monthDayInfo[month]["month"];
  calendarYear.innerHTML = year;

  // looping to make the actual days of the calendar
  // loops through the index for as long as it is shorter than the total days in the month plus the first of the month value
  // the first day has to be added to account for the loops that will have no number values because of when it should start adding day numbers
  for (let i = 0; i < monthDayInfo[month]["days"] + firstDayOfMonth; i++) {
    // creates a new div for each number
    let day = document.createElement("div");

    // when the index is finally equal or above the numerical value of the first day of the month the numbers for the days start to get added
    if (i >= firstDayOfMonth) {
      // take the index - the first day and add one to calculate each day value places the days at the proper spot
      day.innerHTML = i - firstDayOfMonth + 1;

      // checks if the calendars year, month and day are the current day
      //  since the index iterates even before the first day this will take the first day of the month away from it to only add 1 to only look within the indexes that have numerical values and compare that to the current date
      if (i - firstDayOfMonth + 1 === currentDateInfoDay && year === currentDateInfoYear && month === currentDateInfoMonth) {
        // create the current day indicator
        day.classList.add("current-date");
      }
    }
    // pushes the days made to the calendars month div to actually have days
    daysOfMonth.appendChild(day);
  }
};

// function for changing the calendar with the arrows
function changeCalendarArrows(change) {
  // gets the currently displaying calendar month and year
  const monthDisplayInfo = document.querySelector(".month").textContent;
  const yearDisplayInfo = document.querySelector(".year").textContent;

  // a dictionary to use the string info to know the numerical month value
  const monthInfo = {
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11,
  };

  // get numerical values for year and month to use in math or pass into the make calendar function again
  const currentMonthDisplay = monthInfo[monthDisplayInfo];
  const currentYearDisplay = parseInt(yearDisplayInfo);

  // the variables to make the new calendar set to 0 so they can be changed in the if else for changing
  let newMonthDisplay = 0;
  let newYearDisplay = 0;

  // checks if add was passed to the function for the next click
  if (change === "add") {
    // checks if the current month is december 
    if (currentMonthDisplay >= 11) {
      // when the month is currently december it changes the month value to 0 to go to january
      newMonthDisplay = 0;
      // it adds one to the year to account for the year change
      newYearDisplay = currentYearDisplay + 1;
    } else {
      // when the month isn't december it will just add one to the month to change them month and set the year to the currently displaying year
      newMonthDisplay = currentMonthDisplay + 1;
      newYearDisplay = currentYearDisplay;
    }
    // when the change function passes minus
  } else {
    if (currentMonthDisplay <= 0) {
      // when the month is currently january it changes the month value to 11 to go to December
      newMonthDisplay = 11;
      // it subtracts one to the year to account for the year change
      newYearDisplay = currentYearDisplay - 1;
    } else {
      // when the month isn't january it will just subtract one to the month to change them month and set the year to the currently displaying year
      newMonthDisplay = currentMonthDisplay - 1;
      newYearDisplay = currentYearDisplay;
    }

  }

  // calls the make calendar function again to make the new calendar
  makeCalendar(newMonthDisplay, newYearDisplay)
};

function startPeriod() {
  pass

  //  * pseudocode 
  // when the button is clicked to start the period
  // the button will take in the current date of today
  // it will then add the class period-day to the div for that day
  // it should then open maybe a module that will allow the user to select the flow strength of their period

  // ? will this need to call make calendar again
  
  // ? maybe the make calendar func above like with the current day will need to call this func in reference to the data logged for period so that when the users scroll months any data they have entered will show
}

function trackFlow(flowInfo) {
  pass
  
  // * pseudocode
  // it will have the option buttons for light, medium, heavy
  // user will select an option
  // the button will register the day and add the proper class to the div for that day to display
  
  // ? will this need to call make calendar again

  // ? maybe the make calendar func above like with the current day will need to call this func in reference to the data logged for period so that when the users scroll months any data they have entered will show
}
