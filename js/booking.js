document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const monthYearDisplay = document.getElementById("calendar-month-year");
    const calendarDays = document.getElementById("calendar-days");
    const prevBtn = document.getElementById("cal-prev");
    const nextBtn = document.getElementById("cal-next");
    const timezoneDisplay = document.getElementById("timezone-display");

    const timesContainer = document.getElementById("booking-times");
    const dateDisplay = document.getElementById("selected-date-display");
    const timeSlots = document.getElementById("time-slots");

    // State
    const today = new Date();
    // Start at current month
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let selectedDate = null;

    // Options
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Set Timezone
    try {
        timezoneDisplay.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ");
    } catch (e) {
        timezoneDisplay.textContent = "Your local time";
    }

    function renderCalendar() {
        // Clear previous days
        calendarDays.innerHTML = "";

        monthYearDisplay.textContent = `${months[currentMonth]} ${currentYear}`;

        // Find first day of the month (0 = Sun, 1 = Mon...)
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        // Days in month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Disable previous button if looking at past months (optional: Calendly allows looking depending on availability)
        // We'll just disable if month/year < current
        if (currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth <= today.getMonth())) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }

        // Add blank spaces for initial days
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement("div");
            calendarDays.appendChild(emptyDiv);
        }

        // Available times generator (Mock data: 9:00 AM to 5:00 PM, 30 min intervals)
        const generateTimes = (dateObj) => {
            // Disable weekends for our fake availability
            if (dateObj.getDay() === 0 || dateObj.getDay() === 6) return [];

            const times = [];
            let hour = 9; // 9 AM
            let min = 0;

            while (hour < 17) {
                const ampm = hour >= 12 ? 'pm' : 'am';
                const displayHour = hour > 12 ? hour - 12 : hour;
                const displayMin = min === 0 ? "00" : "30";
                times.push(`${displayHour}:${displayMin}${ampm}`);

                min += 30;
                if (min === 60) {
                    min = 0;
                    hour++;
                }
            }
            return times;
        };

        // Add days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("cal-day");
            dayDiv.textContent = i;

            const thisDate = new Date(currentYear, currentMonth, i);

            // Check if date is in the past
            // Zero out time for accurate comparision today
            const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            if (thisDate < todayReset) {
                dayDiv.classList.add("disabled");
            } else {
                // If it's selectable, add event
                const times = generateTimes(thisDate);
                if (times.length === 0) {
                    dayDiv.classList.add("disabled"); // e.g. weekends
                } else {
                    dayDiv.addEventListener("click", () => selectDate(thisDate, times, dayDiv));
                }
            }

            // Restore selection state if we navigate back
            if (selectedDate &&
                selectedDate.getDate() === i &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear) {
                dayDiv.classList.add("selected");
            }

            calendarDays.appendChild(dayDiv);
        }
    }

    function selectDate(dateObj, timesList, element) {
        // Remove previous selected
        document.querySelectorAll(".cal-day.selected").forEach(el => el.classList.remove("selected"));
        element.classList.add("selected");
        selectedDate = dateObj;

        // Format date: "Thursday, December 12"
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: 'long' });
        const monthName = months[dateObj.getMonth()];
        const dateNum = dateObj.getDate();
        dateDisplay.textContent = `${dayName}, ${monthName} ${dateNum}`;

        // Render timeslots
        timeSlots.innerHTML = "";

        timesList.forEach(t => {
            const btn = document.createElement("button");
            btn.classList.add("time-btn");
            btn.textContent = t;

            btn.addEventListener("click", () => {
                // Remove convert mode from others
                document.querySelectorAll(".time-btn.confirm-mode").forEach(el => {
                    const originalText = el.getAttribute("data-time");
                    el.className = "time-btn";
                    el.innerHTML = originalText;
                });

                // Set into confirm mode
                btn.className = "time-btn confirm-mode";
                btn.setAttribute("data-time", t);
                btn.innerHTML = `
                    <div class="time-btn-col time-val">${t}</div>
                    <div class="time-btn-col time-confirm-btn" tabindex="0">Next</div>
                `;

                // Add click event for confirm
                const confirmBtn = btn.querySelector('.time-confirm-btn');
                confirmBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Link to real Calendly here
                    // Format date as YYYY-MM-DD for Calendly URL params if needed
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    const y = dateObj.getFullYear();
                    const calendlyUrl = `https://calendly.com/kirtitandel/founder_discovery_call?month=${y}-${m}`;
                    window.open(calendlyUrl, "_blank");
                });
            });

            timeSlots.appendChild(btn);
        });

        // Show panel
        timesContainer.classList.add("active");
    }

    // Nav Events
    prevBtn.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextBtn.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Initial render
    renderCalendar();
});
