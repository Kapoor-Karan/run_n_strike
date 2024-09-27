window.onload = function() {
    const leaderboard = document.getElementById('leaderboard');
    const timeModeSelect = document.getElementById('timeModeSelect');

    // Load the leaderboard based on the selected time mode
    function loadLeaderboard(timeMode) {
        // Adjusted key format to match what is stored in localStorage
        let scores = JSON.parse(localStorage.getItem(`leaderboard${timeMode}`)) || [];

        // Clear the leaderboard content
        leaderboard.innerHTML = '';

        // Populate the leaderboard
        if (scores.length > 0) {
            scores.forEach((entry, index) => {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
                leaderboard.appendChild(li);
            });
        } else {
            leaderboard.textContent = 'No scores available.';
        }
    }

    // Event listener for changing the time mode
    timeModeSelect.addEventListener('change', (event) => {
        const selectedTimeMode = event.target.value;
        loadLeaderboard(selectedTimeMode);
    });

    // Load the leaderboard for the initially selected time mode
    loadLeaderboard(timeModeSelect.value);
};
