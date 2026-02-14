const STAGES = [
    { name: '스테이지 1', desc: '양옆 방향 화살표 4개', sequence: 4, directions: ['←', '→'], selectableDirections: ['←', '→'] },
    { name: '스테이지 2', desc: '양옆 방향 화살표 6개', sequence: 6, directions: ['←', '→'], selectableDirections: ['←', '→'] },
    { name: '스테이지 3', desc: '양옆, 위아래 방향 화살표 4개', sequence: 4, directions: ['←', '→', '↑', '↓'], selectableDirections: ['←', '→', '↑', '↓'] },
    { name: '스테이지 4', desc: '양옆, 위아래 방향 화살표 6개', sequence: 6, directions: ['←', '→', '↑', '↓'], selectableDirections: ['←', '→', '↑', '↓'] },
    { name: '스테이지 5', desc: '8방향 화살표 5개', sequence: 5, directions: ['←', '→', '↑', '↓', '↖', '↗', '↙', '↘'], selectableDirections: ['←', '→', '↑', '↓', '↖', '↗', '↙', '↘'] }
];

const SCARF_STAGES = ['🧣', '🧣🧣', '🧣🧣🧣', '🧣🧣🧣🧣', '🧣🧣🧣🧣🧣'];
const SUCCESS_MESSAGES = ['첫 번째 단을 완성했다!', '두 번째 단을 완성했다!', '세 번째 단을 완성했다!', '네 번째 단을 완성했다!', '마지막 단을 완성했다!'];

let gameState = {
    currentStage: 0,
    sequence: [],
    playerInput: [],
    sequenceShowing: false
};

let countdownInterval = null;

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function startGame() {
    gameState.currentStage = 0;
    gameState.sequence = [];
    gameState.playerInput = [];
    startCountdown();
}

function startCountdown() {
  showScreen('countdownScreen');

  const countdownNum = document.getElementById('countdownNum');

  // ✅ 이전 카운트다운이 남아있으면 정리
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  let count = 3;

  // ✅ 시작하자마자 3을 먼저 보여주기
  countdownNum.textContent = count;

  countdownInterval = setInterval(() => {
    count -= 1;
    countdownNum.textContent = count;

    if (count <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;

      // 0을 1초 보여주고 넘어가고 싶으면 setTimeout을 쓰면 됨
      setTimeout(() => startStage(), 250);
    }
  }, 1000);
}


function startStage() {
    showScreen('gameScreen');
    const stage = STAGES[gameState.currentStage];
    
    document.getElementById('stageName').textContent = stage.name;
    document.getElementById('stageDesc').textContent = stage.desc;
    
    // 시퀀스 생성
    gameState.sequence = generateSequence(stage.sequence, stage.directions);
    gameState.playerInput = [];
    
    // UI 업데이트
    updateSequenceDisplay();
    updatePlayerArrows();
    renderArrowButtons();
    
    // 입력 영역 숨김
    document.getElementById('playerInputArea').style.display = 'none';
    document.getElementById('sequenceDisplay').style.display = 'flex';
    
    // 5초 타이머
    let timeLeft = 5;
    const timerEl = document.getElementById('sequenceTimer');

    // ✅ 시작하자마자 5초 문구 먼저 표시
    timerEl.textContent = timeLeft + '초 안에 기억해주세요!';

    // ✅ 혹시 이전 타이머가 남아있을 수 있으니 전역으로 관리하면 더 안전
    if (window.sequenceTimerInterval) {
        clearInterval(window.sequenceTimerInterval);
    }

    window.sequenceTimerInterval = setInterval(() => {
        timeLeft--;

         // 0이 되면 입력 시작으로 넘기고 interval 종료
         if (timeLeft <= 0) {
            clearInterval(window.sequenceTimerInterval);
            window.sequenceTimerInterval = null;
            showPlayerInputArea();
            return;
            }

        timerEl.textContent = timeLeft + '초 안에 기억해주세요!';
    }, 1000);

    }

function generateSequence(length, directions) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(directions[Math.floor(Math.random() * directions.length)]);
    }
    return sequence;
}

function updateSequenceDisplay() {
    const container = document.getElementById('sequenceArrows');
    container.innerHTML = '';
    gameState.sequence.forEach((arrow, index) => {
        const span = document.createElement('span');
        span.className = 'arrow';
        span.textContent = arrow;
        container.appendChild(span);
    });
}

function updatePlayerArrows() {
    const container = document.getElementById('playerArrows');
    container.innerHTML = '';
    gameState.playerInput.forEach((arrow) => {
        const span = document.createElement('span');
        span.className = 'player-arrow';
        span.textContent = arrow;
        container.appendChild(span);
    });
}

function renderArrowButtons() {
  const stage = STAGES[gameState.currentStage];
  const container = document.getElementById('arrowButtons');
  container.innerHTML = '';

  const n = stage.selectableDirections.length;

  // ✅ 스테이지별 레이아웃 고정
  // 2개(←→)는 2열, 4개는 4열, 8개는 4열(2줄)로
  const cols = (n === 2) ? 2 : (n === 4) ? 4 : 4;

  // ✅ 스테이지5(8개)는 버튼을 더 작게 해서 2줄이 카드 안에 다 보이게
  const btnSize = (n === 8) ? 95 : (n === 4) ? 150 : 170;


  stage.selectableDirections.forEach(direction => {
    const btn = document.createElement('button');
    btn.className = 'arrow-btn';
    btn.textContent = direction;
    btn.onclick = () => selectArrow(direction);
    container.appendChild(btn);
  });
}


function showPlayerInputArea() {
    document.getElementById('sequenceDisplay').style.display = 'none';
    document.getElementById('playerInputArea').style.display = 'block';
    document.getElementById('submitBtn').style.display = gameState.sequence.length > 0 ? 'inline-block' : 'none';
}

function selectArrow(direction) {
    gameState.playerInput.push(direction);
    updatePlayerArrows();
    

}

function undoInput() {
    if (gameState.playerInput.length > 0) {
        gameState.playerInput.pop();
        updatePlayerArrows();
    }
}

function submitInput() {
  // 길이 다르면 바로 실패(또는 아직 입력 덜 했으면 안내만 하고 return도 가능)
  if (gameState.playerInput.length !== gameState.sequence.length) {
    fail();
    return;
  }

  // 내용까지 정확히 비교
  for (let i = 0; i < gameState.sequence.length; i++) {
    if (gameState.playerInput[i] !== gameState.sequence[i]) {
      fail();
      return;
    }
  }

  success();
}


function success() {
  showScreen('successScreen');

  const currentIndex = gameState.currentStage;

  document.getElementById('successMessage').textContent = SUCCESS_MESSAGES[currentIndex];
  document.getElementById('scarfProgress').textContent = SCARF_STAGES[currentIndex];

  const nextBtn = document.getElementById('nextStageBtn'); // "다음 단 뜨기" 버튼
  const finalBtn = document.getElementById('finalBtn');     // "목도리 획득하기" 버튼

  // ✅ 항상 둘 다 먼저 안전하게 보이기 상태 초기화
  nextBtn.style.display = 'none';
  finalBtn.style.display = 'none';

  // ✅ 마지막 스테이지면 목도리 버튼만, 아니면 다음 단 버튼만
  if (currentIndex === STAGES.length - 1) {
    finalBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
  }
}


function nextStage() {
    gameState.currentStage++;
    if (gameState.currentStage < STAGES.length) {
        startStage();
    }
}

function fail() {
  showScreen('failScreen');   // ✅ 실패화면 먼저 보여줌
}

function restartGame() {
  gameState.currentStage = 0;
  gameState.sequence = [];
  gameState.playerInput = [];
  showScreen('mainScreen');   // 다시하기 누르면 메인으로
}


/**
 * "다시하기" 버튼이 기존에 failScreen에 있었다면,
 * 지금은 failScreen을 안 쓰니까, 다시하기 버튼이 어딨든
 * 이 함수는 "처음부터 시작"으로 동작
 */
function restartGame() {
  // 메인으로 보내고 끝(자동 시작 X) 원하면 여기서 startGame() 호출로 바꿀 수 있음
  showScreen('mainScreen');
}

function showFinalSuccess() {
    showScreen('finalScreen');
    createFireworks();
}

function createFireworks() {
    const firework1 = document.getElementById('firework1');
    const firework2 = document.getElementById('firework2');
    
    firework1.style.left = '10%';
    firework1.style.top = '20%';
    firework1.style.setProperty('--tx', Math.random() * 200 - 100 + 'px');
    firework1.style.setProperty('--ty', Math.random() * 200 - 100 + 'px');
    firework1.textContent = '✨';
    
    firework2.style.right = '10%';
    firework2.style.top = '20%';
    firework2.style.setProperty('--tx', Math.random() * 200 - 100 - 100 + 'px');
    firework2.style.setProperty('--ty', Math.random() * 200 - 100 + 'px');
    firework2.textContent = '✨';
}

function closeGame() {
    showScreen('mainScreen');
}

function showScarf() {
  showScreen('scarfScreen');
}

function backToMain() {
  showScreen('mainScreen');
}
