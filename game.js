"use strict";
/* Simple 10-question capitals quiz.
   Replace or extend `PAIRS` as desired.
*/

const PAIRS = [
  ["France","Paris"],
  ["Japan","Tokyo"],
  ["Brazil","Brasília"],
  ["Canada","Ottawa"],
  ["Australia","Canberra"],
  ["Egypt","Cairo"],
  ["Kenya","Nairobi"],
  ["Argentina","Buenos Aires"],
  ["India","New Delhi"],
  ["Mexico","Mexico City"],
  ["Germany","Berlin"],
  ["Italy","Rome"],
  ["Spain","Madrid"],
  ["Norway","Oslo"],
  ["Sweden","Stockholm"],
  ["Turkey","Ankara"],
  ["South Korea","Seoul"],
  ["Indonesia","Jakarta"],
  ["Nigeria","Abuja"],
  ["Thailand","Bangkok"]
];

const QUESTIONS_PER_ROUND = 10;
const TIME_PER_QUESTION = 15; // seconds

// DOM
const startBtn = document.getElementById('startBtn');
const redoBtn = document.getElementById('redoBtn');
const promptEl = document.getElementById('prompt');
const choicesEl = document.getElementById('choices');
const scoreEl = document.getElementById('score');
const qnumEl = document.getElementById('qnum');
const timerEl = document.getElementById('timer');

let state = {
  pool: [],
  current: null,
  score: 0,
  qIndex: 0,
  timer: null,
  timeLeft: TIME_PER_QUESTION
};

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
}

function pickQuestion(){
  if(state.qIndex >= QUESTIONS_PER_ROUND) return null;
  const choice = state.pool.pop();
  return choice;
}

function startGame(){
  state.pool = PAIRS.slice();
  shuffle(state.pool);
  // pick QUESTIONS_PER_ROUND distinct pairs
  state.pool = state.pool.slice(0, QUESTIONS_PER_ROUND);
  state.score = 0;
  state.qIndex = 0;
  scoreEl.textContent = state.score;
  redoBtn.hidden = true;
  startBtn.hidden = true;
  nextQuestion();
}

function nextQuestion(){
  clearInterval(state.timer);
  state.current = pickQuestion();
  if(!state.current){
    endGame();
    return;
  }
  state.qIndex++;
  qnumEl.textContent = state.qIndex;
  state.timeLeft = TIME_PER_QUESTION;
  timerEl.textContent = state.timeLeft;
  renderQuestion(state.current);
  state.timer = setInterval(()=> {
    state.timeLeft--;
    timerEl.textContent = state.timeLeft;
    if(state.timeLeft <= 0){
      clearInterval(state.timer);
      markTimeout();
    }
  }, 1000);
}

function renderQuestion(pair){
  const [country, capital] = pair;
  promptEl.textContent = `What is the capital of ${country}?`;
  // build choices: correct + 3 random capitals
  const capitalsPool = PAIRS.map(p=>p[1]).filter(c => c !== capital);
  shuffle(capitalsPool);
  const options = [capital, capitalsPool[0], capitalsPool[1], capitalsPool[2]];
  shuffle(options);
  choicesEl.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('div');
    btn.className = 'choice';
    btn.textContent = opt;
    btn.tabIndex = 0;
    btn.addEventListener('click', ()=> handleChoice(btn, opt, capital));
    btn.addEventListener('keydown', (e)=> { if(e.key === 'Enter') handleChoice(btn, opt, capital); });
    choicesEl.appendChild(btn);
  });
}

function handleChoice(btn, picked, correct){
  // prevent multiple clicks
  if(!btn || btn.classList.contains('disabled')) return;
  clearInterval(state.timer);
  const all = Array.from(choicesEl.children);
  all.forEach(x=> x.classList.add('disabled'));
  if(picked === correct){
    btn.classList.add('correct');
    state.score++;
    scoreEl.textContent = state.score;
  } else {
    btn.classList.add('wrong');
    // highlight correct
    const correctEl = all.find(x => x.textContent === correct);
    if(correctEl) correctEl.classList.add('correct');
  }
  // brief delay then next question
  setTimeout(nextQuestion, 900);
}

function markTimeout(){
  // reveal correct and mark wrong
  const all = Array.from(choicesEl.children);
  all.forEach(x=> x.classList.add('disabled'));
  const correct = state.current[1];
  const correctEl = all.find(x => x.textContent === correct);
  if(correctEl) correctEl.classList.add('correct');
  setTimeout(nextQuestion, 900);
}

function endGame(){
  promptEl.textContent = `Round complete. Final score ${state.score}/${QUESTIONS_PER_ROUND}.`;
  choicesEl.innerHTML = '';
  startBtn.hidden = true;
  redoBtn.hidden = false;
  clearInterval(state.timer);
}

startBtn.addEventListener('click', startGame);
redoBtn.addEventListener('click', startGame);
