document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('save-scheduled-power').addEventListener('click', saveScheduledPower);
    document.getElementById('save-data').addEventListener('click', saveData);

    loadData();

    calculateSum();
    calculateActualPower();
});

function saveData() {
    document.querySelectorAll('.toggle-btn').forEach(button => {
        const field = button.dataset.field;
        const state = button.textContent;
        localStorage.setItem(`${field}-state`, state);
    });

    // Save additional fields
    const additionalFields = [];
    document.querySelectorAll('#data-table tbody tr').forEach(row => {
        const field = row.cells[0].querySelector('input').value;
        const value = row.cells[1].querySelector('input').value;
        const state = row.cells[2].querySelector('button').textContent;
        additionalFields.push({ field, value, state });
    });
    localStorage.setItem('additionalFields', JSON.stringify(additionalFields));

    alert('Data saved!');
    calculateSum();
    calculateActualPower();
}

function loadData() {
    const scheduledPower = localStorage.getItem('scheduledPower') || '';
    document.getElementById('scheduled-power').value = scheduledPower;

    // Load additional fields
    const additionalFields = JSON.parse(localStorage.getItem('additionalFields')) || [];
    additionalFields.forEach(({ field, value, state }) => {
        addRow(field, state, value);
    });

    calculateSum();
    calculateActualPower();
}

function toggleField(event) {
    const button = event.target;
    const field = button.dataset.field;
    const input = document.getElementById(`${field}-input`);

    if (button.textContent === 'Off') {
        button.textContent = 'On';
        button.classList.remove('off-btn');
        button.classList.add('on-btn');
        input.disabled = false;
    } else {
        button.textContent = 'Off';
        button.classList.remove('on-btn');
        button.classList.add('off-btn');
        input.disabled = true;
    }

    calculateActualPower();
}

function calculateSum() {
    let sum = 0;
    document.querySelectorAll('#data-table tbody tr').forEach(row => {
        const value = parseFloat(row.cells[1].querySelector('input').value) || 0;
        sum += value;
    });
    document.getElementById('sum').value = sum;
}

function saveScheduledPower() {
    const scheduledPower = document.getElementById('scheduled-power').value;
    localStorage.setItem('scheduledPower', scheduledPower);
    calculateActualPower();
}

function calculateActualPower() {
    const sum = parseFloat(document.getElementById('sum').value) || 0;
    let actualPower = sum;

    document.querySelectorAll('.toggle-btn').forEach(button => {
        if (button.textContent === 'Off') {
            const field = button.dataset.field;
            const value = parseFloat(document.getElementById(`${field}-input`).value) || 0;
            if (value > 0) {
                actualPower -= value;
            }
        }
    });

    document.getElementById('actual-power').value = actualPower;
    calculateDifference();
}

function calculateDifference() {
    const scheduledPower = parseFloat(document.getElementById('scheduled-power').value) || 0;
    const actualPower = parseFloat(document.getElementById('actual-power').value) || 0;
    const difference = scheduledPower - actualPower;
    document.getElementById('difference').value = difference;

    updateFlowchart(difference);
}

function updateFlowchart(difference) {
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');
    const arrow = document.getElementById('arrow');
    const arrow2 = document.getElementById('arrow2');
    const arrow3 = document.getElementById('arrow3');
    const arrow4 = document.getElementById('arrow4');

    if (difference === 0) {
        line2.setAttribute('stroke', 'green');
        arrow.style.visibility = 'hidden';
        arrow2.style.visibility = 'hidden';
        arrow3.style.visibility = 'hidden';
        arrow4.style.visibility = 'hidden';
    } else if (difference > 0) {
        line1.setAttribute('stroke', 'green');
        line2.setAttribute('stroke', 'red');
        line3.setAttribute('stroke', 'green');
        arrow.style.visibility = 'visible';
        arrow2.style.visibility = 'visible';
        arrow3.style.visibility = 'hidden';
        arrow4.style.visibility = 'hidden';
    } else {
        line1.setAttribute('stroke', 'green');
        line2.setAttribute('stroke', 'red');
        line3.setAttribute('stroke', 'green');
        arrow.style.visibility = 'hidden';
        arrow2.style.visibility = 'hidden';
        arrow3.style.visibility = 'visible';
        arrow4.style.visibility = 'visible';        
    }
}

function addRow(field = '', state = 'Off', value = '') {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const newField = field || document.getElementById('new-field').value;

    if (newField.trim() === '') {
        alert('Please enter field data');
        return;
    }

    const newRow = table.insertRow();

    const fieldCell = newRow.insertCell(0);
    const valueCell = newRow.insertCell(1);
    const onOffCell = newRow.insertCell(2);
    const deleteCell = newRow.insertCell(3);

    const fieldInput = document.createElement('input');
    fieldInput.type = 'text';
    fieldInput.value = newField;
    fieldInput.disabled = true;
    fieldCell.appendChild(fieldInput);

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.value = value;
    valueInput.id = `${newField.toLowerCase().replace(/\s+/g, '-')}-input`;
    valueInput.disabled = state === 'Off';
    valueCell.appendChild(valueInput);

    const onOffButton = document.createElement('button');
    onOffButton.textContent = state;
    onOffButton.classList.add('toggle-btn');
    onOffButton.classList.add(state === 'On' ? 'on-btn' : 'off-btn');
    onOffButton.dataset.field = newField.toLowerCase().replace(/\s+/g, '-');
    onOffButton.onclick = function() {
        this.textContent = this.textContent === 'Off' ? 'On' : 'Off';
        this.classList.toggle('on-btn');
        this.classList.toggle('off-btn');
        valueInput.disabled = this.textContent === 'Off';
    };
    onOffCell.appendChild(onOffButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.onclick = function() {
        table.deleteRow(newRow.rowIndex - 1);
        saveData(); // Save the updated table data to localStorage
    };
    deleteCell.appendChild(deleteButton);

    if (!field) {
        document.getElementById('new-field').value = ''; // Clear the input field
    }
}
