let currentQuizId = null; // Declare this at the top level of your script

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authSection = document.getElementById('auth-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    const dashboardSection = document.getElementById('dashboard-section');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const quizList = document.getElementById('quiz-list');
    const quizScoresSection = document.getElementById('quiz-scores');
    const quizTitleDisplay = document.getElementById('quiz-title-display');
    const scoresContainer = document.getElementById('scores-container');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    
    const createQuizSection = document.getElementById('create-quiz-section');
    const createQuizForm = document.getElementById('create-quiz-form');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    const shareLinkContainer = document.getElementById('share-link-container');
    const shareLinkInput = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const backToDashboardFromCreateBtn = document.getElementById('back-to-dashboard-from-create');
    
    const quizTakingSection = document.getElementById('quiz-taking-section');
    const quizTakingTitle = document.getElementById('quiz-taking-title');
    const quizForm = document.getElementById('quiz-form');
    const quizQuestionsContainer = document.getElementById('quiz-questions-container');
    const quizResult = document.getElementById('quiz-result');
    const finalScoreSpan = document.getElementById('final-score');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const takeAnotherQuizBtn = document.getElementById('take-another-quiz');
    
    // Check for a quiz link in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuizIdFromUrl = urlParams.get('quizId'); // Renamed to avoid conflict

    if (initialQuizIdFromUrl) {
        showQuizTakingSection(initialQuizIdFromUrl);
    } else {
        checkAuth();
    }

    // --- Authentication Logic ---
    function checkAuth() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            showDashboard();
        } else {
            showAuthSection();
        }
    }

    function showAuthSection() {
        authSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        createQuizSection.style.display = 'none';
        quizTakingSection.style.display = 'none';
        logoutBtn.style.display = 'none';
    }

    function showDashboard() {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        createQuizSection.style.display = 'none';
        quizTakingSection.style.display = 'none';
        logoutBtn.style.display = 'block';
        renderQuizList();
    }

    function showCreateQuizSection() {
        dashboardSection.style.display = 'none';
        createQuizSection.style.display = 'block';
        shareLinkContainer.style.display = 'none';
        // Reset form
        createQuizForm.reset();
        questionsContainer.innerHTML = '';
        addQuestionBlock();
    }
    
    function showQuizTakingSection(id) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'none';
        createQuizSection.style.display = 'none';
        quizTakingSection.style.display = 'block';
        loadQuizForTaking(id);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('#login-email').value;
        const password = e.target.querySelector('#login-password').value;
        // Simple auth check
        if (email && password) {
            localStorage.setItem('currentUser', JSON.stringify({ email: email }));
            showDashboard();
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.querySelector('#register-username').value;
        const email = e.target.querySelector('#register-email').value;
        const password = e.target.querySelector('#register-password').value;
        // Simple registration
        if (username && email && password) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push({ username, email, password });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please login.');
            showLoginLink.click();
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        showAuthSection();
        location.reload(); // Reload to clear quiz taking state
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // --- Quiz Creation Logic ---
    createQuizBtn.addEventListener('click', showCreateQuizSection);

    backToDashboardFromCreateBtn.addEventListener('click', showDashboard);

    addQuestionBtn.addEventListener('click', addQuestionBlock);

    function addQuestionBlock() {
        const questionCount = questionsContainer.querySelectorAll('.question-block').length + 1;
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.innerHTML = `
            <label>Question ${questionCount}:</label>
            <input type="text" class="question-text" required>
            <label>Options:</label>
            <input type="text" class="option" placeholder="Option A" required>
            <input type="text" class="option" placeholder="Option B" required>
            <input type="text" class="option" placeholder="Option C" required>
            <input type="text" class="option" placeholder="Option D" required>
            <label>Correct Answer (A, B, C, or D):</label>
            <input type="text" class="correct-answer" pattern="[A-D]" required>
        `;
        questionsContainer.appendChild(questionBlock);
    }
    
    createQuizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const quizTitle = e.target.querySelector('#quiz-title').value;
        const questions = [];
        questionsContainer.querySelectorAll('.question-block').forEach(block => {
            const questionText = block.querySelector('.question-text').value;
            const options = Array.from(block.querySelectorAll('.option')).map(input => input.value);
            const correctAnswer = block.querySelector('.correct-answer').value.toUpperCase();
            questions.push({
                question: questionText,
                options: options,
                correctAnswer: correctAnswer
            });
        });
        
        const quizId = 'quiz-' + Math.random().toString(36).substr(2, 9);
        const quizData = {
            id: quizId,
            title: quizTitle,
            creator: JSON.parse(localStorage.getItem('currentUser')).email,
            questions: questions,
            scores: []
        };
        
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        quizzes.push(quizData);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        const shareableLink = `${window.location.origin}${window.location.pathname}?quizId=${quizId}`;
        shareLinkInput.value = shareableLink;
        
        createQuizForm.style.display = 'none';
        shareLinkContainer.style.display = 'block';
    });

    copyLinkBtn.addEventListener('click', () => {
        shareLinkInput.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });

    // --- Dashboard and Score Viewing Logic ---
    function renderQuizList() {
        const currentUserEmail = JSON.parse(localStorage.getItem('currentUser')).email;
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        quizList.innerHTML = '';
        const userQuizzes = quizzes.filter(quiz => quiz.creator === currentUserEmail);
        
        if (userQuizzes.length === 0) {
            quizList.innerHTML = '<p>You have not created any quizzes yet.</p>';
            return;
        }

        userQuizzes.forEach(quiz => {
            const quizCard = document.createElement('div');
            quizCard.className = 'quiz-card';
            quizCard.innerHTML = `
                <span>${quiz.title}</span>
                <button data-quiz-id="${quiz.id}">View Scores</button>
            `;
            quizList.appendChild(quizCard);
        });

        quizList.querySelectorAll('.quiz-card button').forEach(button => {
            button.addEventListener('click', (e) => {
                const quizId = e.target.dataset.quizId;
                viewQuizScores(quizId);
            });
        });
    }

    function viewQuizScores(id) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const quiz = quizzes.find(q => q.id === id);
        
        if (quiz) {
            dashboardSection.querySelector('h2').style.display = 'none';
            quizList.style.display = 'none';
            createQuizBtn.style.display = 'none';
            quizScoresSection.style.display = 'block';
            quizTitleDisplay.textContent = `Quiz: "${quiz.title}"`;
            
            scoresContainer.innerHTML = '';
            if (quiz.scores.length === 0) {
                scoresContainer.innerHTML = '<p>No one has taken this quiz yet.</p>';
            } else {
                quiz.scores.forEach(score => {
                    const scoreCard = document.createElement('div');
                    scoreCard.className = 'score-card';
                    scoreCard.innerHTML = `
                        <p><strong>Participant:</strong> ${score.takerEmail}</p>
                        <p><strong>Score:</strong> ${score.score} / ${quiz.questions.length}</p>
                        <p><strong>Date:</strong> ${new Date(score.timestamp).toLocaleString()}</p>
                    `;
                    scoresContainer.appendChild(scoreCard);
                });
            }
        }
    }

    backToDashboardBtn.addEventListener('click', () => {
        dashboardSection.querySelector('h2').style.display = 'block';
        quizList.style.display = 'block';
        createQuizBtn.style.display = 'block';
        quizScoresSection.style.display = 'none';
        renderQuizList();
    });

    // --- Quiz Taking Logic ---
    async function loadQuizForTaking(id) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const quiz = quizzes.find(q => q.id === id);

        if (!quiz) {
            alert('Quiz not found!');
            return;
        }
        
        // --- Store the quiz ID in the global variable ---
        currentQuizId = id; 

        quizTakingTitle.textContent = quiz.title;
        quizQuestionsContainer.innerHTML = '';
        quizResult.style.display = 'none';
        quizForm.style.display = 'block';

        quiz.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-block';
            questionDiv.innerHTML = `
                <h4>Question ${index + 1}: ${question.question}</h4>
                <div class="options">
                    ${question.options.map((option, i) => `
                        <div>
                            <input type="radio" name="q${index}" id="q${index}-opt${i}" value="${String.fromCharCode(65 + i)}" required>
                            <label for="q${index}-opt${i}">${String.fromCharCode(65 + i)}. ${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            quizQuestionsContainer.appendChild(questionDiv);
        });
        
        // We're pushing a clean state to remove the quizId from the URL
        // after it's been loaded, preventing users from seeing the ID directly
        // in the URL while taking the quiz. The currentQuizId variable now holds it.
        window.history.pushState(null, '', window.location.pathname); 
    }
    
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // --- Use the global currentQuizId instead of parsing from URL ---
        const quizIdToScore = currentQuizId; 
        
        // Add a safeguard in case currentQuizId somehow became null (e.g., direct navigation)
        if (!quizIdToScore) {
            alert('Error: No quiz found to submit score. Please refresh or try again.');
            return;
        }

        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const quizIndex = quizzes.findIndex(q => q.id === quizIdToScore);
        
        if (quizIndex === -1) {
            alert('Quiz data not found for submission.');
            return;
        }
        
        const quiz = quizzes[quizIndex];
        
        let score = 0;
        const formData = new FormData(e.target);

        quiz.questions.forEach((question, index) => {
            const userAnswer = formData.get(`q${index}`);
            if (userAnswer === question.correctAnswer) {
                score++;
            }
        });

        // Store score
        const takerEmail = prompt('Please enter your email to save your score:');
        if (takerEmail) {
            const scoreData = {
                takerEmail,
                score,
                timestamp: new Date().toISOString()
            };
            quizzes[quizIndex].scores.push(scoreData);
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
        } else {
            alert('Score not saved. Email is required.');
        }

        // Display results
        quizForm.style.display = 'none';
        quizResult.style.display = 'block';
        finalScoreSpan.textContent = score;
        totalQuestionsSpan.textContent = quiz.questions.length;
    });

    takeAnotherQuizBtn.addEventListener('click', () => {
        // When taking another quiz, clear the currentQuizId and return to the base URL
        currentQuizId = null; 
        window.location.href = window.location.origin + window.location.pathname;
    });
});