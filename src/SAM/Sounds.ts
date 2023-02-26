import SOUNDS from '@/const/SOUNDS';
const startSound = new Audio(SOUNDS.START);
const idleSound = new Audio(SOUNDS.IDLE);
const stopSound = new Audio(SOUNDS.STOP);
const turnOnSound = new Audio(SOUNDS.TURN_ON);
const turnOffSound = new Audio(SOUNDS.TURN_OFF);
const turnStartSound = new Audio(SOUNDS.TURN_START);
const turnIdleSound = new Audio(SOUNDS.TURN_IDLE);
const startMissileSound = new Audio(SOUNDS.START_MISSILE);
  const rotateClicks = [
    new Audio(SOUNDS.ROTATE_CLICK_1),
    new Audio(SOUNDS.ROTATE_CLICK_2),
    new Audio(SOUNDS.ROTATE_CLICK_3),
    new Audio(SOUNDS.ROTATE_CLICK_4),

 ]
let isTurning = false;
export default class Sounds {
  static isEnabled = true;
  static onEndedStartSound() {
    idleSound.addEventListener("timeupdate", function () {
      var buffer = 0.1;
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = buffer;
        this.play();
      }
    });
    idleSound.volume = 0.7;
    idleSound.playbackRate = 0.7;
    idleSound.play();
  }

  static onEndedStartTunringSound() {
    turnIdleSound.addEventListener("timeupdate", function () {
      var buffer = 0.1;
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = buffer;
        this.play();
      }
    });
    turnIdleSound.play();
  }

  static startEngine() {
    if (!Sounds.isEnabled) return
    turnOnSound.volume = 0.5;
    turnOnSound.play();
    stopSound.pause();
    stopSound.currentTime = 0;
    startSound.play();
    startSound.addEventListener("ended", Sounds.onEndedStartSound);
  }

  static turnStart() {
    if (!Sounds.isEnabled) return
    if (isTurning) return;
    isTurning = true;
    turnStartSound.play();
    turnStartSound.addEventListener("ended", Sounds.onEndedStartTunringSound);
  }
  static turnStop() {
    if (!Sounds.isEnabled) return
    if (!isTurning) return;
    isTurning = false;
    turnStartSound.pause();
    turnIdleSound.pause();
    turnStartSound.currentTime = 0;
    turnIdleSound.currentTime = 0;
    turnIdleSound.removeEventListener("ended", Sounds.onEndedStartSound);
  }

  static stopEngine() {
    if (!Sounds.isEnabled) return
    turnOffSound.play();
    startSound.pause();
    idleSound.pause();
    startSound.currentTime = 0;
    idleSound.currentTime = 0;
    stopSound.play();
    idleSound.removeEventListener("ended", Sounds.onEndedStartSound);
  }

  static click(off?: boolean) {
    if (!Sounds.isEnabled) return
    if (off !== undefined) {
      return off ? turnOffSound.play() : turnOnSound.play();
    }
    Math.random() % 2 === 0 ? turnOnSound.play() : turnOffSound.play();
  }

  static missileStart() {
    if (!Sounds.isEnabled) return
    startMissileSound.currentTime = 0;
    startMissileSound.play();
  }

  static rotateClick() {
    if (!Sounds.isEnabled) return
    const sound = rotateClicks[Math.round(Math.random() * 3)];
    sound.volume = 0.5;
    sound.play();
  }
}
