document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const entryList = document.getElementById('entry-list');
    const resultSection = document.getElementById('result-section');
    const oldestNameDisplay = document.getElementById('oldest-name');
    const oldestAgeDisplay = document.getElementById('oldest-age');
    const errorMsg = document.getElementById('error-msg');

    let entries = [];

    addBtn.addEventListener('click', addEntry);

    // Allow Enter key to trigger add
    [nameInput, dateInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addEntry();
        });
    });

    function addEntry() {
        const name = nameInput.value.trim();
        const dateStr = dateInput.value.trim();

        if (!name || !dateStr) {
            showError('Please fill in both fields.');
            return;
        }

        const dateObj = parseDate(dateStr);
        if (!dateObj) {
            showError('Invalid date format. Use DD/MM/YYYY.');
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
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

        const date = new Date(year, month, day);

        // Basic validity check (e.g., handles 31/02/2021 as invalid)
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null;
        }

        return date;
    }

    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function updateOldest() {
        if (entries.length === 0) {
            resultSection.classList.add('hidden');
            return;
        }

        // Find the person with the earliest birth date
        const oldest = entries.reduce((prev, curr) => {
            return (curr.birthDate < prev.birthDate) ? curr : prev;
        });

        oldestNameDisplay.textContent = oldest.name;
        const age = calculateAge(oldest.birthDate);
        oldestAgeDisplay.textContent = `${age} years old`;

        resultSection.classList.remove('hidden');
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
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = () => removeEntry(entry.id);

            li.appendChild(infoDiv);
            li.appendChild(removeBtn);
            entryList.appendChild(li);
        });
    }

    // Expose removeEntry to global window for the onclick attribute
    window.removeEntry = removeEntry;

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
