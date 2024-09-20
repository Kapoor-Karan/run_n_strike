// Retrieve the scores from localStorage
let scores = JSON.parse(localStorage.getItem('scores')) || [];

// Sort scores in descending order
scores.sort((a, b) => b - a);

// Select the leaderboard list
const leaderboardList = document.getElementById('leaderboard-list');

// Display scores on the leaderboard
scores.forEach((score, index) => {
    let li = document.createElement('li');
    li.textContent = `Rank ${index + 1}: ${score}`;
    leaderboardList.appendChild(li);
});
