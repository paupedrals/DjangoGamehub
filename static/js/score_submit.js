// static/js/score_submit.js

// Helper function to get the value of a named cookie (needed for CSRF token)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++){
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to submit the final score to the current page's URL
function submitFinalScore(finalScore) {
    const csrftoken = getCookie('csrftoken');
    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrftoken
        },
        body: 'cheat_score=' + encodeURIComponent(finalScore)
    })
    .then(response => {
        // Optionally, handle the response here.
        console.log('Final score submitted:', finalScore);
    })
    .catch(error => {
        console.error('Error submitting final score:', error);
    });
}
