const elevatorMotion = 5000;
const elevatorRest = 2000;
const topLevel = 2;
const bottomLevel = 0;
let currentPosition = bottomLevel;
let movingUp = false;
let movingDown = false;
const UP = 0;
const DOWN = 1;

let levelsQueue = [];

for (let i = bottomLevel; i <= topLevel; i++) levelsQueue.push([false, false]);

const elevator = document.getElementById('lift-main');

let currentElevatorPosition = [];
for (let i = 0; i <= topLevel - bottomLevel; i++)
  currentElevatorPosition[i] = document.getElementById(`lift-level-${i}`);

const sound = document.getElementById('lift-audio');
function playSound() {
  sound.play();
}
function stopSound() {
  sound.pause();
  sound.currentTime = null;
}

function setBgColor(elementId, color) {
  document.getElementById(elementId).style.backgroundColor = color;
}
function checkLevelQueue(direction) {
  for (let i = bottomLevel; i <= topLevel; i++)
    if (levelsQueue[i][direction]) return true;
  return false;
}
async function elevatorMovement() {
  if (currentPosition === topLevel) {
    if (checkLevelQueue(DOWN)) {
      playSound();
      for (let floor = topLevel; floor > bottomLevel; floor--) {
        if (levelsQueue[floor][DOWN]) {
          stopSound();
          await setTimer(elevatorRest);
          levelsQueue[floor][DOWN] = false;
          setBgColor(`button-down-${floor}`, '#aaa');
          playSound();
        }
        addTransition(getLevelPosition(DOWN, floor));
        await setTimer(elevatorMotion);
        movingDown = false;
      }
      stopSound();
    } else movingDown = false;
  } else if (currentPosition === bottomLevel) {
    if (checkLevelQueue(UP)) {
      playSound();
      for (let floor = bottomLevel; floor < topLevel; floor++) {
        if (levelsQueue[floor][UP]) {
          stopSound();
          await setTimer(elevatorRest);
          levelsQueue[floor][UP] = false;
          setBgColor(`button-up-${floor}`, '#aaa');
          playSound();
        }
        addTransition(getLevelPosition(UP, floor));
        await setTimer(elevatorMotion);
        movingUp = false;
      }
      stopSound();
    } else movingUp = false;
  }
}
function move(direction, floor) {
  if (direction === 'UP' || direction === 'DOWN') {
    const movementDirection = direction === 'UP' ? UP : DOWN;
    levelsQueue[floor][movementDirection] = true;
    setBgColor(
      `button-${movementDirection === UP ? 'up' : 'down'}-${floor}`,
      '#2e2'
    );
    levelsQueue[topLevel][UP] = false;
    levelsQueue[bottomLevel][DOWN] = false;
    if (movementDirection === UP) {
      if (!movingUp) {
        movingUp = true;
        elevatorMovement();
      }
    } else {
      if (!movingDown) {
        movingDown = true;
        elevatorMovement();
      }
    }
  }
}

function getLevelPosition(direction, level) {
  const srcFloor = elevator[level];
  const destFloor =
    direction === UP
      ? currentElevatorPosition[level + 1]
      : currentElevatorPosition[level - 1];
  const clone = elevator.cloneNode();
  clone.style.visibility = 'hidden';
  destFloor.appendChild(clone);
  const newTop =
    clone.getBoundingClientRect().top - elevator.getBoundingClientRect().top;
  const newLeft =
    clone.getBoundingClientRect().left - elevator.getBoundingClientRect().left;
  clone.parentNode.removeChild(clone);
  return {
    top: newTop + 'px',
    left: newLeft + 'px',
    floor: direction === UP ? level + 1 : level - 1,
    to: destFloor,
  };
}
function addTransition({ top, left, floor, to }) {
  elevator.classList.add('lift-transition');
  elevator.style.top = top;
  elevator.style.left = left;
  setTimeout(() => {
    elevator.style.position = 'scroll';
    elevator.classList.remove('lift-transition');
    elevator.style.removeProperty('top');
    elevator.style.removeProperty('left');
    currentPosition = floor;
    to.appendChild(elevator);
  }, elevatorMotion);
}
function setTimer(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
