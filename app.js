const STATE_KEY = 'level4_state_v1'
let DATA = null
let state = { points: 0, knownWords: {}, quizIndex: 0, badges: [] }

async function loadData(){
  try{
      const base = window.ghPagesBase || ''
      const res = await fetch(`${base}/data/level4.json`)
    DATA = await res.json()
  }catch(e){
    console.error('Failed to load data', e)
    DATA = {lessons:[]}
  }
}

function saveState(){localStorage.setItem(STATE_KEY, JSON.stringify(state))}
function loadState(){
  const raw = localStorage.getItem(STATE_KEY)
  if(raw) state = Object.assign(state, JSON.parse(raw))
}

function qs(id){return document.getElementById(id)}

function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));qs(id).classList.remove('hidden')}

function renderLessons(){
  const list = qs('lessons-list')
  list.innerHTML = ''
  DATA.lessons.forEach(lesson=>{
    const div = document.createElement('div')
    div.className = 'lesson-item'
    div.textContent = `${lesson.id}. ${lesson.title}`
    div.onclick = ()=>showLesson(lesson)
    list.appendChild(div)
  })
}

function showLesson(lesson){
  const d = qs('lesson-detail')
  d.classList.remove('hidden')
  d.innerHTML = `<h3>${lesson.id}. ${lesson.title}</h3>`
  if(lesson.grammar){
    d.innerHTML += `<h4>Grammar</h4><pre>${lesson.grammar.focus}\n\n${lesson.grammar.notes || ''}</pre>`
  }
  if(lesson.vocabulary && lesson.vocabulary.length){
    d.innerHTML += '<h4>Vocabulary</h4><ul>' + lesson.vocabulary.map(v=>`<li><strong>${v.word}</strong> — ${v.definition||v.example||''}<div class="muted">Example: ${v.example||''}</div></li>`).join('') + '</ul>'
  }
}

// --- Flashcards ---
let fcIndex = 0
let flashItems = []
function initFlashcards(){
  flashItems = DATA.lessons.flatMap(l=>l.vocabulary||[])
  fcIndex = 0
  renderFlashcard()
}

function renderFlashcard(){
  if(!flashItems.length) return
  const item = flashItems[fcIndex]
  qs('flashcard-word').textContent = item.word || item.example || ''
  qs('flashcard-def').textContent = item.definition || item.example || ''
  qs('flashcard-def').classList.add('hidden')
}

// --- Quiz generator ---
function makeQuestionFromVocab(v){
  const correct = v.word
  const choices = new Set([correct])
  const pool = DATA.lessons.flatMap(l=>l.vocabulary||[]).map(x=>x.word).filter(w=>w!==correct)
  while(choices.size < 4 && pool.length){
    const pick = pool[Math.floor(Math.random()*pool.length)]
    choices.add(pick)
  }
  const arr = Array.from(choices).sort(()=>Math.random()-0.5)
  return {q:`Which word matches: "${v.definition || (v.example? v.example : '')}"?`, choices:arr, answer:correct}
}

let quizQueue = []
function initQuiz(){
  const vocab = DATA.lessons.flatMap(l=>l.vocabulary||[])
  quizQueue = vocab.map(v=>makeQuestionFromVocab(v))
  state.quizIndex = 0
  renderQuiz()
}

function renderQuiz(){
  const area = qs('quiz-area')
  if(!quizQueue.length){ area.querySelector('#quiz-q').textContent = 'No questions.'; return }
  const q = quizQueue[state.quizIndex % quizQueue.length]
  qs('quiz-q').textContent = `Q ${state.quizIndex+1}: ${q.q}`
  const choices = qs('quiz-choices')
  choices.innerHTML = ''
  q.choices.forEach(c=>{
    const b = document.createElement('button')
    b.textContent = c
    b.onclick = ()=>{
      if(c===q.answer){
        state.points += 10
        maybeAwardBadge('Quiz Novice', 50)
        alert('Correct! +10 points')
      } else {
        alert(`Wrong — correct: ${q.answer}`)
      }
      state.quizIndex += 1
      saveState()
      renderQuiz()
      renderProgress()
    }
    choices.appendChild(b)
  })
}

// --- Timed challenge ---
let challengeTimer = null
let challengeTime = 60
let challengeScore = 0
function startChallenge(){
  challengeTime = 60
  challengeScore = 0
  qs('timer-val').textContent = challengeTime
  challengeTick()
  challengeTimer = setInterval(challengeTick,1000)
}

function stopChallenge(){
  clearInterval(challengeTimer)
  challengeTimer = null
  alert(`Challenge finished. Score: ${challengeScore}`)
  state.points += challengeScore
  saveState()
  renderProgress()
}

function challengeTick(){
  challengeTime -= 1
  qs('timer-val').textContent = challengeTime
  if(challengeTime <= 0){ stopChallenge(); return }
  // show a quick question
  const vocab = DATA.lessons.flatMap(l=>l.vocabulary||[])
  const v = vocab[Math.floor(Math.random()*vocab.length)]
  const q = makeQuestionFromVocab(v)
  qs('challenge-q').textContent = q.q
  const choices = qs('challenge-choices')
  choices.innerHTML = ''
  q.choices.forEach(c=>{
    const b = document.createElement('button')
    b.textContent = c
    b.onclick = ()=>{
      if(c===q.answer){ challengeScore += 5 }
      // immediate next question
    }
    choices.appendChild(b)
  })
}

// --- Progress and badges ---
function renderProgress(){
  const area = qs('progress-area')
  area.innerHTML = `<p>Points: <strong>${state.points}</strong></p>`
  area.innerHTML += `<p>Badges: ${state.badges.join(', ') || '—'}</p>`
  area.innerHTML += `<p>Known words: ${Object.keys(state.knownWords).length}</p>`
  // leaderboard
  const lb = qs('leaderboard-list')
  const playersRaw = localStorage.getItem('level4_leaderboard')
  const players = playersRaw ? JSON.parse(playersRaw) : []
  lb.innerHTML = players.sort((a,b)=>b.points-a.points).slice(0,10).map(p=>`<li>${p.name} — ${p.points}</li>`).join('')
}

function maybeAwardBadge(name, threshold){
  if(state.points >= threshold && !state.badges.includes(name)){
    state.badges.push(name)
    alert(`Badge earned: ${name}`)
  }
}

// --- UI wiring ---
document.addEventListener('DOMContentLoaded', async ()=>{
  loadState()
  await loadData()
  renderLessons()
  initFlashcards()
  renderProgress()

  qs('btn-lessons').onclick = ()=>{ showView('view-lessons') }
  qs('btn-flashcards').onclick = ()=>{ showView('view-flashcards') }
  qs('btn-quiz').onclick = ()=>{ initQuiz(); showView('view-quiz') }
  qs('btn-challenge').onclick = ()=>{ showView('view-challenge') }
  qs('btn-progress').onclick = ()=>{ renderProgress(); showView('view-progress') }

  // flashcard controls
  qs('fc-next').onclick = ()=>{ fcIndex = (fcIndex+1) % flashItems.length; renderFlashcard() }
  qs('fc-prev').onclick = ()=>{ fcIndex = (fcIndex-1+flashItems.length) % flashItems.length; renderFlashcard() }
  qs('fc-show').onclick = ()=>{ qs('flashcard-def').classList.toggle('hidden') }
  qs('fc-know').onclick = ()=>{ const w = flashItems[fcIndex].word; state.knownWords[w]=true; state.points += 2; saveState(); renderProgress(); qs('fc-next').click() }
  qs('fc-dont').onclick = ()=>{ const w = flashItems[fcIndex].word; delete state.knownWords[w]; saveState(); qs('fc-next').click() }

  // quiz next
  qs('quiz-next').onclick = ()=>{ state.quizIndex += 1; saveState(); renderQuiz() }

  // challenge controls
  qs('challenge-start').onclick = ()=>{ startChallenge() }
  qs('challenge-stop').onclick = ()=>{ stopChallenge() }

  // allow adding name to leaderboard
  document.addEventListener('keyup', e=>{
    if(e.key === 'L' && (e.ctrlKey || e.metaKey)){
      const name = prompt('Enter your name for the local leaderboard:')
      if(!name) return
      const playersRaw = localStorage.getItem('level4_leaderboard')
      const players = playersRaw ? JSON.parse(playersRaw) : []
      players.push({name, points: state.points || 0})
      localStorage.setItem('level4_leaderboard', JSON.stringify(players))
      renderProgress()
    }
  })
})
