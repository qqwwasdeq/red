document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const entryList = document.getElementById('entry-list');
    const resultSection = document.getElementById('result-section');
    const oldestNameDisplay = document.getElementById('oldest-name');
    const oldestAgeDetailed = document.getElementById('oldest-age-detailed');
    const timerDisplay = document.getElementById('timer-display');
    const errorMsg = document.getElementById('error-msg');

    let entries = [];
    let oldestPerson = null;

    // Date Mask: DD.MM.YYYY
    dateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        let formattedValue = '';
        if (value.length > 0) {
            formattedValue += value.substring(0, 2);
            if (value.length > 2) {
                formattedValue += '.' + value.substring(2, 4);
                if (value.length > 4) {
                    formattedValue += '.' + value.substring(4, 8);
                }
            }
        }
        e.target.value = formattedValue;
    });

    addBtn.addEventListener('click', addEntry);

    [nameInput, dateInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addEntry();
        });
    });

    function addEntry() {
        const name = nameInput.value.trim();
        const dateStr = dateInput.value.trim();

        if (!name || dateStr.length < 10) {
            showError('Пожалуйста, заполните все поля корректно.');
            return;
        }

        const dateObj = parseDate(dateStr);
        if (!dateObj || dateObj > new Date()) {
            showError('Некорректная дата рождения.');
            return;
        }

        const entry = {
            id: Date.now(),
            name,
            birthDate: dateObj,
            originalDateStr: dateStr
        };

        entries.push(entry);
        renderEntries();
        updateOldest();
        clearInputs();
        hideError();
    }

    function removeEntry(id) {
        entries = entries.filter(entry => entry.id !== id);
        renderEntries();
        updateOldest();
    }

    function parseDate(dateStr) {
        const parts = dateStr.split('.');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

        const date = new Date(year, month, day);
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null;
        }

        return date;
    }

    function updateOldest() {
        if (entries.length === 0) {
            oldestPerson = null;
            resultSection.classList.add('hidden');
            timerDisplay.textContent = '--д --ч --м --с';
            return;
        }

        oldestPerson = entries.reduce((prev, curr) => {
            return (curr.birthDate < prev.birthDate) ? curr : prev;
        });

        oldestNameDisplay.textContent = oldestPerson.name;
        resultSection.classList.remove('hidden');
        updateDetailedAgeAndCountdown();
    }

    function renderEntries() {
        entryList.innerHTML = '';
        entries.forEach(entry => {
            const li = document.createElement('li');
            li.className = 'entry-item';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'entry-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'entry-name';
            nameSpan.textContent = entry.name;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'entry-date';
            dateSpan.textContent = entry.originalDateStr;

            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(dateSpan);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Удалить';
            removeBtn.onclick = () => removeEntry(entry.id);

            li.appendChild(infoDiv);
            li.appendChild(removeBtn);
            entryList.appendChild(li);
        });
    }

    function updateDetailedAgeAndCountdown() {
        if (!oldestPerson) return;

        const now = new Date();
        const birth = oldestPerson.birthDate;

        // Calculate detailed age down to seconds
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        let hours = now.getHours() - birth.getHours();
        let minutes = now.getMinutes() - birth.getMinutes();
        let seconds = now.getSeconds() - birth.getSeconds();

        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
            const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += lastMonth.getDate();
            months--;
        }
        if (months < 0) { months += 12; years--; }

        oldestAgeDetailed.textContent = `${years}л ${months}м ${days}д ${hours}ч ${minutes}м ${seconds}с`;

        // Calculate countdown to next birthday
        let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate(), birth.getHours(), birth.getMinutes(), birth.getSeconds());
        if (nextBirthday < now) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
        }

        const diff = nextBirthday - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        timerDisplay.textContent = `${d}д ${h}ч ${m}м ${s}с`;
    }

    setInterval(updateDetailedAgeAndCountdown, 1000);

    function clearInputs() {
        nameInput.value = '';
        dateInput.value = '';
        nameInput.focus();
    }

    function showError(msg) {
        errorMsg.textContent = msg;
    }

    function hideError() {
        errorMsg.textContent = '';
    }
});
