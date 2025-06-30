// HTMLの要素を取得
const scoreDisplay = document.getElementById('score-display');
const progressText = document.getElementById('progress-text');
const quizSubject = document.getElementById('quiz-subject');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');
const feedbackText = document.getElementById('feedback-text');
const nextQuestionBtn = document.getElementById('next-question-btn');

let quizData = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
let score = 0; // スコアを記録する変数
let answered = false; // 回答済みかどうかのフラグ

// クイズデータを準備する
async function setupQuiz() {
    try {
        const response = await fetch('quiz.txt');
        const textData = await response.text();
        parseQuizData(textData);

        if (totalQuestions > 0) {
            loadQuiz();
        } else {
            alert('クイズデータが空か、形式が正しくありません。');
        }
    } catch (error) {
        console.error('クイズデータの読み込みに失敗しました:', error);
        alert('クイズデータの読み込みに失敗しました。');
    }
}

// テキストデータを解析する（変更なし）
function parseQuizData(text) {
    const textPartsBySubject = text.split('[教科]');
    const subjectsText = textPartsBySubject[1];
    const textPartsByAnswer = textPartsBySubject[0].split('[答え]');
    const answersText = textPartsByAnswer[1];
    const questionsText = textPartsByAnswer[0].replace('[問題]', '');

    const questions = questionsText.trim().split('\n').filter(line => line.trim() !== '');
    const answers = answersText.trim().split('\n').filter(line => line.trim() !== '');
    const subjects = subjectsText.trim().split('\n').filter(line => line.trim() !== '');

    if (questions.length !== answers.length || questions.length !== subjects.length) {
        console.error('問題、答え、教科の数が一致しません。');
        return;
    }

    quizData = questions.map((q, index) => ({
        question: q,
        answer: answers[index],
        subject: subjects[index]
    }));
    totalQuestions = quizData.length;
}

// クイズを読み込んで表示する関数（大改造）
function loadQuiz() {
    answered = false;
    feedbackText.innerText = '';
    nextQuestionBtn.classList.add('hidden');
    choicesContainer.innerHTML = ''; // 前の選択肢をクリア

    // 現在の問題データを取得
    const currentQuiz = quizData[currentQuestionIndex];

    // 各種情報を更新
    quizSubject.innerText = currentQuiz.subject;
    questionText.innerText = `Q. ${currentQuiz.question}`;
    progressText.innerText = `${currentQuestionIndex + 1} / ${totalQuestions}`;
    scoreDisplay.innerText = `スコア: ${score}`;

    // --- 選択肢の自動生成 ---
    const correctAnswer = currentQuiz.answer;
    let choices = [correctAnswer];

    // ダミーの答えをランダムに取得
    let allAnswers = quizData.map(q => q.answer);
    allAnswers = allAnswers.filter(ans => ans !== correctAnswer); // 正解の答えを除く
    shuffleArray(allAnswers); // 全ての答えをシャッフル

    // ダミー選択肢を3つ追加
    for (let i = 0; i < 3; i++) {
        if (allAnswers[i]) {
            choices.push(allAnswers[i]);
        }
    }
    
    // 最終的な選択肢をシャッフル
    shuffleArray(choices);

    // 選択肢ボタンを生成して表示
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice;
        button.classList.add('choice-btn');
        button.addEventListener('click', selectAnswer);
        choicesContainer.appendChild(button);
    });
}

// 回答を選択したときの処理
function selectAnswer(e) {
    if (answered) return; // すでに回答済みの場合は何もしない
    answered = true;

    const selectedButton = e.target;
    const selectedAnswer = selectedButton.innerText;
    const correctAnswer = quizData[currentQuestionIndex].answer;

    // 全てのボタンをクリック不可にする
    const allChoiceButtons = document.querySelectorAll('.choice-btn');
    allChoiceButtons.forEach(btn => {
        btn.disabled = true;
        // 正解のボタンを緑色にする
        if (btn.innerText === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (selectedAnswer === correctAnswer) {
        score++;
        scoreDisplay.innerText = `スコア: ${score}`;
        feedbackText.innerText = '正解！';
        feedbackText.style.color = '#28a745';
    } else {
        selectedButton.classList.add('incorrect'); // 不正解の選択肢を赤色に
        feedbackText.innerText = `不正解... 正解は「${correctAnswer}」`;
        feedbackText.style.color = '#dc3545';
    }

    // 「次の問題へ」ボタンを表示
    nextQuestionBtn.classList.remove('hidden');
}

// 「次の問題へ」ボタンの処理
nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        loadQuiz();
    } else {
        // クイズ終了
        alert(`クイズ終了！\nあなたのスコアは ${totalQuestions} 問中 ${score} 問正解です！`);
        // 最初に戻る
        score = 0;
        currentQuestionIndex = 0;
        loadQuiz();
    }
});

// 配列をシャッフルするヘルパー関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ページが読み込まれたらクイズを開始
setupQuiz();
