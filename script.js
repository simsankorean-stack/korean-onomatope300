let questions = [];
let quizQuestions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let currentKoreanWord = "";

const startButton = document.getElementById("startButton");
const startArea = document.getElementById("startArea");
const quizArea = document.getElementById("quizArea");

const questionText = document.getElementById("question");
const choicesArea = document.getElementById("choices");
const resultText = document.getElementById("result");
const explanationText = document.getElementById("explanation");

const nextButton = document.getElementById("nextButton");
const speakButton = document.getElementById("speakButton");
const scoreText = document.getElementById("score");
const homeButton = document.getElementById("homeButton");

// ======================
// データ読み込み
// ======================
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data;
    })
    .catch(error => {
        console.error("読み込みエラー", error);
    });

// ======================
// スタート
// ======================
startButton.onclick = function() {
    startArea.style.display = "none";
    quizArea.style.display = "block";
    startQuiz();
};

// ======================
// クイズ開始
// ======================
function startQuiz() {
    quizQuestions = [...questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    currentQuestion = 0;
    score = 0;
    scoreText.innerHTML = "現在の得点：0 / 10";
    showQuestion();
}

// ======================
// 問題表示
// ======================
function showQuestion() {
    answered = false;

    resultText.innerHTML = "";
    resultText.style.display = "none";

    explanationText.innerHTML = "";
    explanationText.style.display = "none";

    nextButton.style.display = "none";
    choicesArea.innerHTML = "";

    let q = quizQuestions[currentQuestion];

    questionText.innerHTML = `${currentQuestion + 1}問目 / 10問<br><br>${q.question}`;
    currentKoreanWord = q.question.split(" の意味")[0];

    let validChoices = q.choices.filter(choice => choice && choice.trim() !== "");

    if (!validChoices.includes(q.answer)) {
        validChoices.push(q.answer);
    }

    let finalChoices = validChoices.slice(0, 4);
    finalChoices.sort(() => Math.random() - 0.5);

    finalChoices.forEach(choice => {
        let button = document.createElement("button");
        button.textContent = choice;
        button.onclick = function() {
            checkAnswer(choice, q);
        };
        choicesArea.appendChild(button);
    });
}

// ======================
// 発音
// ======================
speakButton.onclick = function() {
    if (!currentKoreanWord) return;
    
    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance();
    speech.text = currentKoreanWord;
    speech.lang = "ko-KR";
    speech.rate = 0.8;
    speechSynthesis.speak(speech);
};

// ======================
// 答え確認（★シムさんの毎回のセリフを削除してシンプルに）
// ======================
function checkAnswer(choice, q) {
    if (answered) return;
    answered = true;

    const buttons = document.querySelectorAll("#choices button");

    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === q.answer) {
            button.classList.add("correct");
        }
        if (button.textContent === choice && choice !== q.answer) {
            button.classList.add("wrong");
        }
    });

    if (choice === q.answer) {
        score++;
        scoreText.innerHTML = `現在の得点：${score} / 10`;
        resultText.innerHTML = "⭕ 正解！";
    } else {
        resultText.innerHTML = `❌ 不正解<br>正解：${q.answer}`;
    }

    explanationText.innerHTML = `📖 解説<br>${q.explanation || "解説なし"}`;

    resultText.style.display = "block";
    explanationText.style.display = "block";
    nextButton.style.display = "block";
}

// ======================
// 次の問題、または終了画面（★最後にシムさんが一言！）
// ======================
nextButton.onclick = function() {
    currentQuestion++;

    if (currentQuestion < quizQuestions.length) {
        showQuestion();
    } else {
        // クイズエリアをリライト（最後にシムさんからお疲れ様でしたの挨拶）
        quizArea.innerHTML = `
            <h2>🎉終了！</h2>
            <p>得点：${score} / 10</p>
            <p style="color: #4a5568; padding: 10px; font-weight: bold; font-size: 1.1em;">
                🐶「수고하셨습니다! <br>
                （スゴハショッスmニダ！お疲れ様でした！）」
            </p>
            <br>
            <button id="retryButton">もう一度挑戦する</button>
            <br><br>
            <button id="resultHomeButton">トップへ戻る</button>
        `;

        document.getElementById("retryButton").onclick = () => location.reload();
        document.getElementById("resultHomeButton").onclick = () => location.reload();
    }
};

// ======================
// 途中で戻る
// ======================
homeButton.onclick = function() {
    const result = confirm("クイズを終了してトップ画面に戻りますか？");

    if (result) {
        quizArea.style.display = "none";
        startArea.style.display = "block";
        
        currentQuestion = 0;
        score = 0;
        answered = false;
        currentKoreanWord = "";

        questionText.innerHTML = "";
        choicesArea.innerHTML = "";
        
        resultText.innerHTML = "";
        resultText.style.display = "none";

        explanationText.innerHTML = "";
        explanationText.style.display = "none";

        nextButton.style.display = "none";
    }
};
