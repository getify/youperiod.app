const currentDate = new Date();
makeCalendar(currentDate.getMonth(), currentDate.getFullYear())

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

function februaryDays(year) {
  if (checkLeapYear(year)) {
    return 29
  } else {
    return 28
  }
}

function makeCalendar(month, year) {
  const currentDateInfo = new Date();
  const currentDateInfoMonth = currentDateInfo.getMonth();
  const currentDateInfoDay = currentDateInfo.getDate();
  const currentDateInfoYear = currentDateInfo.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1).getDay();


  let monthInfo = [
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


  let daysOfMonth = document.querySelector(".calendar-days");
  let calendarMonth = document.querySelector(".month");
  let calendarYear = document.querySelector(".year");


  daysOfMonth.innerHTML = "";
  calendarMonth.innerHTML = monthInfo[month]["month"];
  calendarYear.innerHTML = year;

  for (let i = 0; i < monthInfo[month]["days"] + firstDayOfMonth; i++) {
    let day = document.createElement("div");

    if (i >= firstDayOfMonth) {
      day.innerHTML = i - firstDayOfMonth + 1;

      if (i - firstDayOfMonth + 1  === currentDateInfoDay && year === currentDateInfoYear && month === currentDateInfoMonth) {
        day.classList.add("current-date");
      }
    }
    daysOfMonth.appendChild(day);
  }  
};

