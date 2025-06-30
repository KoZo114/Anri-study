// HTMLの要素を取得
const genreTitle = document.getElementById('genre-title');
const quizSubject = document.getElementById('quiz-subject'); // ★追加
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const questionText = document.getElementById('question-text');
const answerCard = document.getElementById('answer-card');
const answerText = document.getElementById('answer-text');
const showAnswerBtn = document.getElementById('show-answer-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');

let quizData = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;

// quiz.txtファイルを読み込んでクイズをセットアップするメインの関数
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

// ★★★ テキストデータを解析する関数を改造 ★★★
function parseQuizData(text) {
    // [教科]で分割
    const textPartsBySubject = text.split('[教科]');
    const subjectsText = textPartsBySubject[1];
    
    // [答え]で分割
    const textPartsByAnswer = textPartsBySubject[0].split('[答え]');
    const answersText = textPartsByAnswer[1];
    
    // [問題]で分割
    const questionsText = textPartsByAnswer[0].replace('[問題]', '');

    // それぞれを改行で分割して配列にする（空行は除去）
    const questions = questionsText.trim().split('\n').filter(line => line.trim() !== '');
    const answers = answersText.trim().split('\n').filter(line => line.trim() !== '');
    const subjects = subjectsText.trim().split('\n').filter(line => line.trim() !== '');

    // 問題・答え・教科の数が合わない場合はエラー
    if (questions.length !== answers.length || questions.length !== subjects.length) {
        console.error('問題、答え、教科の数が一致しません。');
        return;
    }

    // 3つのデータを組み合わせて、quizData配列を作成
    quizData = questions.map((q, index) => {
        return {
            question: q,
            answer: answers[index],
            subject: subjects[index] // ★追加
        };
    });

    totalQuestions = quizData.length;
}


// ★★★ クイズを読み込む関数を改造 ★★★
function loadQuiz() {
    answerCard.classList.add('hidden');
    showAnswerBtn.classList.remove('hidden');
    nextQuestionBtn.classList.add('hidden');

    const currentQuiz = quizData[currentQuestionIndex];
    
    quizSubject.innerText = currentQuiz.subject; // ★追加：教科を表示
    questionText.innerText = `Q. ${currentQuiz.question}`;
    answerText.innerText = `A. ${currentQuiz.answer}`;
    progressText.innerText = `${currentQuestionIndex + 1} / ${totalQuestions}`;
    progressBar.style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;
}

// ボタンのイベントリスナー (ここは変更なし)
showAnswerBtn.addEventListener('click', () => {
    answerCard.classList.remove('hidden');
    showAnswerBtn.classList.add('hidden');
    nextQuestionBtn.classList.remove('hidden');
});

nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        loadQuiz();
    } else {
        alert('クイズ終了です！お疲れ様でした。');
        currentQuestionIndex = 0;
        loadQuiz();
    }
});

// ページが読み込まれたら、setupQuiz関数を実行してクイズを開始
setupQuiz();