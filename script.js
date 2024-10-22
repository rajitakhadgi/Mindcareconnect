document.addEventListener('DOMContentLoaded', function() {
    const mobileNav = document.querySelector('.nav-links');
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    
    if (window.innerWidth <= 768) {
        document.querySelector('nav').appendChild(hamburger);
        hamburger.addEventListener('click', () => {
            const isExpanded = mobileNav.style.display === 'flex';
            mobileNav.style.display = isExpanded ? 'none' : 'flex';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });
    }
});

// Modal Creation Utility
function createModal(title) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modalTitle');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">${title}</h2>
                <button class="close-button" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body"></div>
        </div>
    `;
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Close modal events
    const closeModal = () => modalOverlay.remove();
    modal.querySelector('.close-button').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    return modal;
}

// Self-Help Tools
function startExercise(type) {
    const exercises = {
        breathing: {
            title: 'Deep Breathing Exercise',
            steps: [
                'Find a comfortable position',
                'Breathe in slowly through your nose for 4 counts',
                'Hold your breath for 4 counts',
                'Exhale slowly through your mouth for 4 counts',
                'Repeat 5 times'
            ]
        },
        muscle: {
            title: 'Progressive Muscle Relaxation',
            steps: [
                'Start with your toes',
                'Tense the muscles for 5 seconds',
                'Release and relax for 10 seconds',
                'Move to the next muscle group',
                'Continue until you reach your head'
            ]
        },
        visualization: {
            title: 'Visualization Exercise',
            steps: [
                'Close your eyes',
                'Imagine a peaceful place',
                'Focus on the details',
                'Engage all your senses',
                'Stay here for 5-10 minutes'
            ]
        }
    };
    
    const exercise = exercises[type];
    if (!exercise) return;
    
    const modal = createModal(exercise.title);
    const list = document.createElement('ol');
    exercise.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        list.appendChild(li);
    });
    modal.querySelector('.modal-body').appendChild(list);
}

// Mood Tracking
let moodData = JSON.parse(localStorage.getItem('moodData')) || [];

function trackMood() {
    const modal = createModal('Track Your Mood');
    const form = document.createElement('form');
    form.className = 'mood-form';
    form.innerHTML = `
        <div class="mood-options">
            <label>
                <input type="radio" name="mood" value="great">
                <span class="mood-emoji">😄</span>
                <span class="mood-label">Great</span>
            </label>
            <label>
                <input type="radio" name="mood" value="good">
                <span class="mood-emoji">🙂</span>
                <span class="mood-label">Good</span>
            </label>
            <label>
                <input type="radio" name="mood" value="okay">
                <span class="mood-emoji">😐</span>
                <span class="mood-label">Okay</span>
            </label>
            <label>
                <input type="radio" name="mood" value="low">
                <span class="mood-emoji">😕</span>
                <span class="mood-label">Low</span>
            </label>
        </div>
        <textarea name="notes" placeholder="Add any notes (optional)" rows="3"></textarea>
        <button type="submit" class="btn btn-primary">Save</button>
    `;
    
    modal.querySelector('.modal-body').appendChild(form);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const moodEntry = {
            mood: formData.get('mood'),
            notes: formData.get('notes'),
            timestamp: new Date().toISOString()
        };
        
        moodData.push(moodEntry);
        localStorage.setItem('moodData', JSON.stringify(moodData));
        modal.closest('.modal-overlay').remove();
        updateMoodDisplay();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-emoji');
    const addMoodBtn = document.getElementById('add-mood-btn');
    let selectedMood = null;
    let moodChart = null;

    // Initialize mood data with the last 7 days
    let moodData = {
        labels: getLast7Days(),
        datasets: [{
            label: 'Mood',
            data: [3, 3, 3, 3, 3, 3, 3], // Default neutral mood
            borderColor: '#4a90e2',
            tension: 0.4,
            fill: false
        }]
    };

    // Initialize chart
    initChart();

    // Set up event listeners
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedMood = parseInt(button.getAttribute('data-mood'));
            addMoodBtn.disabled = false;
        });
    });

    addMoodBtn.addEventListener('click', () => {
        if (selectedMood) {
            updateMoodData(selectedMood);
            resetSelection();
        }
    });

    function initChart() {
        const ctx = document.getElementById('moodChart').getContext('2d');
        moodChart = new Chart(ctx, {
            type: 'line',
            data: moodData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            display: false
                        },
                        grid: {
                            display: true
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function updateMoodData(newMood) {
        // Remove first element and add new mood at the end
        moodData.datasets[0].data.shift();
        moodData.datasets[0].data.push(newMood);
        
        // Update chart
        moodChart.update();
    }

    function resetSelection() {
        selectedMood = null;
        moodButtons.forEach(btn => btn.classList.remove('selected'));
        addMoodBtn.disabled = true;
    }

    function getLast7Days() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            result.push(days[date.getDay()]);
        }
        return result;
    }
});


const professionals = [
    {
        name: "Dr. Rusta Shahi",
        specialty: "Therapists",
        location: "Kathmandu",
        quote: "Dedicated to providing compassionate and personalized care",
        available: true
    },
    {
        name: "Aayusha Kattle",
        specialty: "Psychiatrist",
        location: "Lalitpur",
        quote: "Committed to mental health and well-being through expert care",
        available: false
    },
    {
        name: "Dr. Smriti Bhattarai",
        specialty: "Counselor",
        location: "Bhaktapur",
        quote: "Empowering individuals through compassionate therapy",
        available: true
    },
    {
        name: "Rubit Khadgi",
        specialty: "Counselor",
        location: "Kathmandu",
        quote: "Guiding you to better mental health with personalized care",
        available: true
    }
];

let showOnlyAvailable = false;

function createProfessionalCard(professional) {
    return `
        <div class="professional-card" data-specialty="${professional.specialty}" data-location="${professional.location}" data-available="${professional.available}">
            <div class="professional-img"></div>
            <h3>${professional.name}</h3>
            <p>Specialty: ${professional.specialty}</p>
            <p>Location: ${professional.location}</p>
            <p>"${professional.quote}"</p>
            <button class="button ${professional.available ? 'primary-button' : 'secondary-button'}">
                ${professional.available ? 'Available Now' : 'Not Available'}
            </button>
        </div>
    `;
}

function renderProfessionals() {
    const grid = document.getElementById('professionalGrid');
    grid.innerHTML = professionals.map(createProfessionalCard).join('');
}

function filterProfessionals() {
    const specialty = document.getElementById('specialties').value;
    const location = document.getElementById('location').value.toLowerCase();

    const cards = document.querySelectorAll('.professional-card');
    cards.forEach(card => {
        const cardSpecialty = card.dataset.specialty;
        const cardLocation = card.dataset.location.toLowerCase();
        const cardAvailable = card.dataset.available === 'true';

        const specialtyMatch = !specialty || cardSpecialty === specialty;
        const locationMatch = !location || cardLocation.includes(location);
        const availabilityMatch = !showOnlyAvailable || cardAvailable;

        if (specialtyMatch && locationMatch && availabilityMatch) {
            card.classList.remove('hidden');
            card.classList.toggle('glow', !!specialty && cardSpecialty === specialty);
        } else {
            card.classList.add('hidden');
            card.classList.remove('glow');
        }
    });
}

function toggleAvailability() {
    showOnlyAvailable = !showOnlyAvailable;
    const availableButton = document.querySelector('.secondary-button');
    availableButton.textContent = showOnlyAvailable ? 'Show All' : 'Available Now';
    availableButton.classList.toggle('primary-button', showOnlyAvailable);
    filterProfessionals();
}

// Initial render
renderProfessionals();
