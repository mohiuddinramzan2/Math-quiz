// গ্লোবাল ভেরিয়েবল
let currentOperation = '+';
let currentDifficulty = 'easy';
let questionCount = 10;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 30;
let selectedAnswer = null;
let wrongAnswers = [];

// DOM এলিমেন্ট
const homeScreen = document.getElementById('homeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const nextBtn = document.getElementById('nextBtn');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerSpan = document.getElementById('timer');
const finalScore = document.getElementById('finalScore');
const maxScore = document.getElementById('maxScore');
const performanceMessage = document.getElementById('performanceMessage');
const wrongAnswersList = document.getElementById('wrongAnswersList');
const highScoreSpan = document.getElementById('highScore');

// ইনিশিয়ালাইজ
document.addEventListener('DOMContentLoaded', () => {
    // অপারেশন বাটন
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentOperation = e.target.dataset.op;
        });
    });
    
    // ডিফিকাল্টি বাটন
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentDifficulty = e.target.dataset.diff;
        });
    });
    
    // প্রশ্ন সংখ্যা
    document.getElementById('questionCount').addEventListener('change', (e) => {
        questionCount = parseInt(e.target.value);
    });
    
    // হাই স্কোর লোড
    const savedHighScore = localStorage.getItem('mathQuizHighScore') || 0;
    highScoreSpan.textContent = savedHighScore;
});

// কুইজ শুরু
function startQuiz() {
    generateQuestions();
    currentQuestionIndex = 0;
    score = 0;
    wrongAnswers = [];
    updateScore();
    
    homeScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    totalQuestionsSpan.textContent = questionCount;
    showQuestion();
}

// প্রশ্ন জেনারেট
function generateQuestions() {
    questions = [];
    const ops = currentOperation === 'mixed' ? ['+', '-', '*', '/'] : [currentOperation];
    
    for (let i = 0; i < questionCount; i++) {
        const op = ops[Math.floor(Math.random() * ops.length)];
        let num1, num2, answer;
        
        switch(currentDifficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                break;
            case 'hard':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                break;
        }
        
        // নিশ্চিত করি ভাগফল পূর্ণসংখ্যা হয় এবং বড় সংখ্যা আগে থাকে বিয়োগের ক্ষেত্রে
        if (op === '/') {
            answer = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            num1 = answer * num2;
        } else if (op === '-') {
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            answer = num1 - num2;
        } else if (op === '+') {
            answer = num1 + num2;
        } else if (op === '*') {
            answer = num1 * num2;
        }
        
        let questionText;
        let operatorSymbol;
        switch(op) {
            case '+': operatorSymbol = '+'; break;
            case '-': operatorSymbol = '−'; break;
            case '*': operatorSymbol = '×'; break;
            case '/': operatorSymbol = '÷'; break;
        }
        
        questionText = `${num1} ${operatorSymbol} ${num2} = ?`;
        
        // অপশন জেনারেট
        const options = [answer];
        while (options.length < 4) {
            let fakeAnswer;
            if (op === '/') {
                fakeAnswer = Math.floor(Math.random() * 20) + 1;
            } else {
                const offset = Math.floor(Math.random() * 10) + 1;
                fakeAnswer = Math.random() > 0.5 ? answer + offset : answer - offset;
                fakeAnswer = Math.max(0, fakeAnswer);
            }
            
            if (!options.includes(fakeAnswer)) {
                options.push(fakeAnswer);
            }
        }
        
        // শাফল অপশন
        options.sort(() => Math.random() - 0.5);
        
        questions.push({
            text: questionText,
            answer: answer,
            options: options,
            operator: op
        });
    }
}

// প্রশ্ন দেখানো
function showQuestion() {
    clearInterval(timerInterval);
    const question = questions[currentQuestionIndex];
    
    questionText.textContent = question.text;
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    
    // অপশন জেনারেট
    optionsContainer.innerHTML = '';
    question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => selectAnswer(option, btn);
        optionsContainer.appendChild(btn);
    });
    
    // টাইমার শুরু
    timeLeft = 30;
    updateTimer();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOut();
        }
    }, 1000);
    
    nextBtn.disabled = true;
    selectedAnswer = null;
}

// টাইমার আপডেট
function updateTimer() {
    timerSpan.textContent = timeLeft.toString().padStart(2, '0');
    
    if (timeLeft <= 5) {
        timerSpan.style.color = '#f56565';
    } else {
        timerSpan.style.color = '#555';
    }
}

// টাইম আউট
function timeOut() {
    const question = questions[currentQuestionIndex];
    const btns = optionsContainer.children;
    
    for (let btn of btns) {
        btn.disabled = true;
        if (parseInt(btn.textContent) === question.answer) {
            btn.classList.add('correct');
        }
    }
    
    wrongAnswers.push({
        question: question.text,
        yourAnswer: 'সময় শেষ',
        correctAnswer: question.answer
    });
    
    nextBtn.disabled = false;
}

// উত্তর সিলেক্ট
function selectAnswer(answer, btn) {
    if (selectedAnswer !== null) return;
    
    clearInterval(timerInterval);
    selectedAnswer = answer;
    const question = questions[currentQuestionIndex];
    const btns = optionsContainer.children;
    
    // সব বাটন ডিজেবল
    for (let b of btns) {
        b.disabled = true;
    }
    
    // সঠিক/ভুল চিহ্নিত
    let isCorrect = false;
    for (let b of btns) {
        if (parseInt(b.textContent) === question.answer) {
            b.classList.add('correct');
        }
        if (b === btn && parseInt(b.textContent) === question.answer) {
            isCorrect = true;
        }
    }
    
    if (!isCorrect) {
        btn.classList.add('wrong');
    }
    
    if (answer === question.answer) {
        score++;
        updateScore();
    } else {
        wrongAnswers.push({
            question: question.text,
            yourAnswer: answer,
            correctAnswer: question.answer
        });
    }
    
    nextBtn.disabled = false;
}

// স্কোর আপডেট
function updateScore() {
    scoreDisplay.textContent = score;
}

// পরবর্তী প্রশ্ন
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        endQuiz();
    }
}

// কুইজ শেষ
function endQuiz() {
    clearInterval(timerInterval);
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    
    finalScore.textContent = score;
    maxScore.textContent = questionCount;
    
    // হাই স্কোর আপডেট
    const savedHighScore = parseInt(localStorage.getItem('mathQuizHighScore') || 0);
    if (score > savedHighScore) {
        localStorage.setItem('mathQuizHighScore', score);
        highScoreSpan.textContent = score;
    }
    
    // পারফরমেন্স মেসেজ
    const percentage = (score / questionCount) * 100;
    let message = '';
    if (percentage >= 90) message = '🎯 অসাধারণ! তুমি গণিতে এক্সপার্ট!';
    else if (percentage >= 70) message = '👍 খুব ভালো! তুমি গণিতে দক্ষ!';
    else if (percentage >= 50) message = '🙂 ভালো হয়েছে! আরেকটু প্র্যাকটিস করলে আরও ভালো হবে!';
    else message = '📚 চিন্তা কোরো না! আরেকবার ট্রাই করো, দেখবে উন্নতি হবে!';
    
    performanceMessage.textContent = message;
    
    // ভুল উত্তর দেখানো
    wrongAnswersList.innerHTML = '';
    if (wrongAnswers.length > 0) {
        wrongAnswersList.innerHTML = '<h3>❌ ভুল উত্তরগুলো:</h3>';
        wrongAnswers.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'wrong-item';
            div.innerHTML = `
                <strong>${index + 1}. ${item.question}</strong><br>
                তোমার উত্তর: ${item.yourAnswer}<br>
                সঠিক উত্তর: ${item.correctAnswer}
            `;
            wrongAnswersList.appendChild(div);
        });
    }
}

// রিস্টার্ট
function restartQuiz() {
    resultScreen.classList.remove('active');
    startQuiz();
}

// হোমে ফেরা
function goHome() {
    resultScreen.classList.remove('active');
    quizScreen.classList.remove('active');
    homeScreen.classList.add('active');
    
    // হাই স্কোর রিফ্রেশ
    const savedHighScore = localStorage.getItem('mathQuizHighScore') || 0;
    highScoreSpan.textContent = savedHighScore;
      }
