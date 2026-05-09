
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selectors ---
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links a[data-page]');
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-links');
    const questionText = document.getElementById('question-text');
    const responseInput = document.getElementById('response-input');
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackArea = document.getElementById('feedback-area');
    const feedbackText = document.getElementById('feedback-text');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const fetchBtn = document.getElementById('fetch-btn');

    // --- State Variables ---
    let quizQuestions = {};
    let selectedField = 'frontend';
    let questionIndex = 0;
    let practiceHistory = JSON.parse(localStorage.getItem('practiceHistory')) || [];

    // --- Functions ---

    function navigateToPage(pageId) {
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
                window.location.hash = pageId;
            } else {
                page.classList.remove('active');
            }
        });

        navLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function fetchQuizQuestions() {
        fetch('./questions.json')
            .then(res => res.json())
            .then(data => {
                quizQuestions = data;
                renderFieldSelector();
            })
            .catch(err => {
                console.error('Error loading questions:', err);
                questionText.textContent = '⚠️ Failed to load questions.';
            });
    }

    function renderFieldSelector() {
        const categorySelector = document.querySelector('.category-selector');
        if (!categorySelector) return;
        categorySelector.innerHTML = `
            <button class="category-btn active" data-field="frontend">Frontend</button>
            <button class="category-btn" data-field="backend">Backend</button>
            <button class="category-btn" data-field="hr">HR</button>
        `;
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedField = btn.dataset.field;
                questionIndex = 0;
                resetPracticeUI();
            });
        });
    }

    function startPractice() {
        questionIndex = 0;
        showQuestion();
    }

    function showQuestion() {
        const fieldQuestions = quizQuestions[selectedField];
        if (!fieldQuestions) {
            questionText.textContent = '⚠️ No questions found for this category.';
            return;
        }

        if (questionIndex >= fieldQuestions.length) {
            questionText.innerHTML = "🎉 You've completed all questions!";
            submitBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        const q = fieldQuestions[questionIndex];
        questionText.innerHTML = `<strong>Q${questionIndex + 1}:</strong> ${q.question}`;

        let optionsHTML = '';
        q.options.forEach((opt, idx) => {
            optionsHTML += `<div>
                <input type="radio" name="quiz-option" value="${opt}" id="opt${idx}">
                <label for="opt${idx}">${opt}</label>
            </div>`;
        });

        questionText.innerHTML += `<div class="options">${optionsHTML}</div>`;
        responseInput.style.display = 'none';
        startBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        feedbackArea.classList.remove('show');
    }

    function submitResponse() {
        const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
        if (!selectedOption) {
            alert('Please select an answer!');
            return;
        }
        const userAnswer = selectedOption.value;
        const q = quizQuestions[selectedField][questionIndex];

        if (userAnswer === q.correctAnswer) {
            feedbackText.innerHTML = `✅ Correct! <br>${q.explanation}`;
            feedbackArea.style.background = '#d4edda';
        } else {
            feedbackText.innerHTML = `❌ Wrong! Correct Answer: <strong>${q.correctAnswer}</strong><br>${q.explanation}`;
            feedbackArea.style.background = '#f8d7da';
        }
        feedbackArea.classList.add('show');
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
    }

    function nextQuestion() {
        questionIndex++;
        showQuestion();
    }

    function resetPracticeUI() {
        questionText.textContent = "Select 'Start Practice' to begin!";
        responseInput.style.display = 'none';
        startBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        feedbackArea.classList.remove('show');
    }

    function sendMessage() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        alert('Thank you for your message!');
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('message').value = '';
    }

    // --- Event Listeners ---

    // Navbar & footer navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            if (pageId) navigateToPage(pageId);
            if (navMenu.classList.contains('active')) navMenu.classList.remove('active');
        });
    });

    mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('active'));

    startBtn.addEventListener('click', startPractice);
    submitBtn.addEventListener('click', submitResponse);
    nextBtn.addEventListener('click', nextQuestion);
    sendMessageBtn.addEventListener('click', sendMessage);

    // Home page "Start Practicing" button
    if (fetchBtn) {
        fetchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.getElementById('practice')) {
                navigateToPage('practice');
                startPractice();
            }
        });
    }

    // Feature cards alerts
    ['feature-1','feature-2','feature-3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', () => {
                let msg = '';
                if(id==='feature-1') msg='AI-Powered Practice: Get realistic interview questions!';
                if(id==='feature-2') msg='Track Progress: Monitor improvement with analytics!';
                if(id==='feature-3') msg='Save & Review: Organize and revisit sessions anytime!';
                alert(msg);
            });
        }
    });

    // Load questions and UI
    fetchQuizQuestions();

    // Load correct page if hash exists
    if(window.location.hash) {
        const hashPage = window.location.hash.replace('#','');
        if(document.getElementById(hashPage)) navigateToPage(hashPage);
    } else {
        navigateToPage('home');
    }
});





document.getElementById("login-btn").addEventListener("click", function () {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value.trim();

  const messageBox = document.getElementById("login-message");

  // Email format check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password rules:
  const passPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
  // Must contain:
  // ✔ At least 6 chars
  // ✔ 1 capital letter
  // ✔ 1 small letter
  // ✔ 1 number

  // Check empty
  if (email === "" || pass === "") {
    showMessage("Please enter both email and password.", "error");
    return;
  }

  // Invalid email format
  if (!emailPattern.test(email)) {
    showMessage("Invalid email format. Example: user@gmail.com", "error");
    return;
  }

  // Weak password
  if (!passPattern.test(pass)) {
    showMessage("Password must be at least 6 characters and include uppercase, lowercase, and numbers.", "error");
    return;
  }

  // SUCCESS
  showMessage("Login successful! ✔", "success");
});

// Function to show messages cleanly
function showMessage(text, type) {
  const box = document.getElementById("login-message");
  box.innerText = text;

  if (type === "error") {
    box.style.color = "red";
  } else {
    box.style.color = "green";
  }
}

// Navigation se Login page kholne ke liye
document.querySelector('[data-page="login"]').addEventListener("click", () => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('login').classList.add('active');
});
