import Tone from 'tone'
import '@babel/polyfill'
import { sequenceSimple, sequenceHarmony, keys } from './constants'

const synth = new Tone.PolySynth(4, Tone.Synth).toMaster()

// const sequence = sequenceSimple
const sequence = sequenceHarmony

const pattern = new Tone.Pattern((time, notes) => {
  synth.triggerAttackRelease(notes, '8n')
  highlightNotes(notes)
}, sequence)

pattern.start(0)

let activeCol = -1;

const highlightNotes = (notes) => {
  document.querySelectorAll('td.active').forEach(td => {
    td.classList.remove('active')
  })
  notes.forEach(id => {
    document.getElementById(id).classList.add('active')
  })
}

const $play = document.getElementById('play')
const $stop = document.getElementById('stop')
const $player = document.getElementById('player')

$play.addEventListener('click', function playPattern() {
  Tone.Transport.start()
})

$stop.addEventListener('click', function stopPattern() {
  Tone.Transport.stop()
})

const charToNote = (keyCode) => {
  return keys[keyCode]
}

$player.addEventListener('keypress', noteOn)
$player.addEventListener('keyup', noteOff)
$player.addEventListener('keypress', checkChord)

async function checkChord(evt) {
  evt.preventDefault()
  const noteCode = charToNote(evt.keyCode)
  if (!noteCode) return
  const chord = await buildChord(noteCode, this)
  console.log(chord)
}

function noteOn(evt) {
  evt.preventDefault()
  const noteCode = charToNote(evt.keyCode)
  if (noteCode) {
    synth.triggerAttack(noteCode)
    document.getElementById(noteCode).classList.add('active')
  }
}

function noteOff(evt) {
  evt.preventDefault()
  const noteCode = charToNote(evt.keyCode)
  if (noteCode) {
    synth.triggerRelease(noteCode)
    document.getElementById(noteCode).classList.remove('active')
  }
}

function buildChord(noteCode, el) {
  return new Promise((resolve, reject) => {
    el.removeEventListener('keypress', checkChord)
    el.addEventListener('keypress', addNoteToChord)
    el.addEventListener('keyup', noteUpInChord)

    const chord = new Set([noteCode])
    const keysDown = new Set([noteCode])

    function addNoteToChord(evt) {
      evt.preventDefault()
      const noteCode = charToNote(evt.keyCode)
      if (!noteCode) return
      chord.add(noteCode)
      keysDown.add(noteCode)
    }

    function noteUpInChord(evt) {
      evt.preventDefault()
      const noteCode = charToNote(evt.keyCode)
      if (!noteCode) return
      keysDown.delete(noteCode)
      if (keysDown.size === 0) {
        el.addEventListener('keypress', checkChord)
        el.removeEventListener('keypress', addNoteToChord)
        el.removeEventListener('keyup', noteUpInChord)
        resolve(chord)
      }
    }
  })


}
