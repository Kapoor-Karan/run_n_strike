window.onload = function() {
    const leaderboard = document.getElementById('leaderboard');
    let scores = JSON.parse(localStorage.getItem('scores')) || [];

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
};
