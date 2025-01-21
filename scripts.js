document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', saveData);
    document.querySelector('tbody tr').appendChild(saveButton);

    document.getElementById('save-scheduled-power').addEventListener('click', saveScheduledPower);

    loadData();

    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', toggleField);
    });

    calculateSum();
    calculateActualPower();
});

function saveData() {
    const mill1 = document.getElementById('mill1-input').value;
    const mill2 = document.getElementById('mill2-input').value;
    const gall1 = document.getElementById('gall1-input').value;
    const gall2 = document.getElementById('gall2-input').value;

    localStorage.setItem('mill1', mill1);
    localStorage.setItem('mill2', mill2);
    localStorage.setItem('gall1', gall1);
    localStorage.setItem('gall2', gall2);

    document.querySelectorAll('.toggle-btn').forEach(button => {
        const field = button.dataset.field;
        const state = button.textContent;
        localStorage.setItem(`${field}-state`, state);
    });

    alert('Data saved!');
    calculateSum();
    calculateActualPower();
}

function loadData() {
    const mill1 = localStorage.getItem('mill1') || '';
    const mill2 = localStorage.getItem('mill2') || '';
    const gall1 = localStorage.getItem('gall1') || '';
    const gall2 = localStorage.getItem('gall2') || '';
    const scheduledPower = localStorage.getItem('scheduledPower') || '';

    document.getElementById('mill1-input').value = mill1;
    document.getElementById('mill2-input').value = mill2;
    document.getElementById('gall1-input').value = gall1;
    document.getElementById('gall2-input').value = gall2;
    document.getElementById('scheduled-power').value = scheduledPower;

    document.querySelectorAll('.toggle-btn').forEach(button => {
        const field = button.dataset.field;
        const state = localStorage.getItem(`${field}-state`) || 'Off';
        button.textContent = state;
        document.getElementById(`${field}-input`).disabled = state === 'Off';
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
        input.disabled = false;
    } else {
        button.textContent = 'Off';
        input.disabled = true;
    }

    calculateActualPower();
}

function calculateSum() {
    const mill1 = parseFloat(document.getElementById('mill1-input').value) || 0;
    const mill2 = parseFloat(document.getElementById('mill2-input').value) || 0;
    const gall1 = parseFloat(document.getElementById('gall1-input').value) || 0;
    const gall2 = parseFloat(document.getElementById('gall2-input').value) || 0;

    const sum = mill1 + mill2 + gall1 + gall2;
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

    if (difference === 0) {
        line2.setAttribute('stroke', 'green');
    } else if (difference > 0) {
        line1.setAttribute('stroke', 'green');
        line2.setAttribute('stroke', 'red');
        line3.setAttribute('stroke', 'green');
    } else {
        line1.setAttribute('stroke', 'green');
        line2.setAttribute('stroke', 'red');
        line3.setAttribute('stroke', 'green');
    }
}
