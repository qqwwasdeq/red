document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    const nameInput = document.getElementById('name-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const entryList = document.getElementById('entry-list');
    const errorMsg = document.getElementById('error-msg');

    const statsContainer = document.getElementById('stats-container');
    const noDataStats = document.getElementById('no-data-stats');
    const oldestNameDisplay = document.getElementById('oldest-name');
    const oldestAgeDetailed = document.getElementById('oldest-age-detailed');
    const timerDisplay = document.getElementById('timer-display');

    const celebResults = document.getElementById('celeb-results');
    const celebSearchStatus = document.getElementById('celeb-search-status');
    const celebTitle = document.getElementById('celeb-title');
    const celebList = document.getElementById('celeb-list');

    // State
    let entries = [];
    let oldestPerson = null;
    let selectedPersonId = null;

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });

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

    // Add Entry
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

        // Auto-select the first entry if none selected
        if (!selectedPersonId) {
            selectPerson(entry.id);
        }
    }

    function removeEntry(id, e) {
        e.stopPropagation();
        entries = entries.filter(entry => entry.id !== id);
        if (selectedPersonId === id) {
            selectedPersonId = entries.length > 0 ? entries[0].id : null;
        }
        renderEntries();
        updateOldest();
        if (selectedPersonId) {
            const person = entries.find(e => e.id === selectedPersonId);
            fetchCelebs(person.birthDate, person.name);
        } else {
            celebResults.classList.add('hidden');
            celebSearchStatus.classList.remove('hidden');
        }
    }

    function selectPerson(id) {
        selectedPersonId = id;
        renderEntries();
        const person = entries.find(e => e.id === id);
        fetchCelebs(person.birthDate, person.name);
    }

    function parseDate(dateStr) {
        const parts = dateStr.split('.');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) ? date : null;
    }

    function updateOldest() {
        if (entries.length === 0) {
            oldestPerson = null;
            statsContainer.classList.add('hidden');
            noDataStats.classList.remove('hidden');
            return;
        }

        oldestPerson = entries.reduce((prev, curr) => (curr.birthDate < prev.birthDate) ? curr : prev);
        oldestNameDisplay.textContent = oldestPerson.name;
        statsContainer.classList.remove('hidden');
        noDataStats.classList.add('hidden');
    }

    function renderEntries() {
        entryList.innerHTML = '';
        entries.forEach(entry => {
            const li = document.createElement('li');
            li.className = `entry-item ${entry.id === selectedPersonId ? 'selected' : ''}`;
            li.onclick = () => selectPerson(entry.id);

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
            removeBtn.onclick = (e) => removeEntry(entry.id, e);

            li.appendChild(infoDiv);
            li.appendChild(removeBtn);
            entryList.appendChild(li);
        });
    }

    function updateDetailedAgeAndCountdown() {
        if (!oldestPerson) return;
        const now = new Date();
        const birth = oldestPerson.birthDate;

        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        let hours = now.getHours() - birth.getHours();
        let minutes = now.getMinutes() - birth.getMinutes();
        let seconds = now.getSeconds() - birth.getSeconds();

        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) { days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); months--; }
        if (months < 0) { months += 12; years--; }

        oldestAgeDetailed.textContent = `${years}л ${months}мес ${days}д ${hours}ч ${minutes}мин ${seconds}с`;

        let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
        const diff = nextBirthday - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        timerDisplay.textContent = `${d}д ${h}ч ${m}мин ${s}с`;
    }

    setInterval(updateDetailedAgeAndCountdown, 1000);

    async function fetchCelebs(date, personName) {
        celebSearchStatus.textContent = 'Загрузка знаменитостей...';
        celebSearchStatus.classList.remove('hidden');
        celebResults.classList.add('hidden');

        const day = date.getDate();
        const monthNames = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        const monthLower = monthNames[date.getMonth()];
        const dayStr = day.toString().padStart(2, '0');

        try {
            // Using Wikimedia Births API (English Wikipedia has better coverage for this API)
            const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${monthLower}/${dayStr}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.births && data.births.length > 0) {
                const births = data.births.slice(0, 10);
                celebList.innerHTML = '';
                births.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'celeb-item';
                    li.textContent = `${item.year}: ${item.text}`;
                    celebList.appendChild(li);
                });

                const monthRU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
                celebTitle.textContent = `Знаменитости, родившиеся ${day} ${monthRU[date.getMonth()]} (как и ${personName})`;
                celebResults.classList.remove('hidden');
                celebSearchStatus.classList.add('hidden');
            } else {
                celebSearchStatus.textContent = 'Информация о знаменитостях не найдена.';
            }
        } catch (error) {
            celebSearchStatus.textContent = 'Ошибка при загрузке данных о знаменитостях.';
            console.error(error);
        }
    }

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
