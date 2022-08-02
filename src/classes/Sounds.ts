import StartSound from "@/assets/start.mp3";
import IdleSound from "@/assets/idle.ogg";
import StopSound from "@/assets/stop.mp3";
import TurnOnSound from "@/assets/turnOn.mp3";
import TurnOffSound from "@/assets/turnOff.mp3";
import TurnStartSound from "@/assets/turnStart.mp3";
import TurnIdleSound from "@/assets/turnIdle.mp3";
import TurnReleaseSound from "@/assets/turnRelease.mp3";
const startSound = new Audio(StartSound);
const idleSound = new Audio(IdleSound);
const stopSound = new Audio(StopSound);
const turnOnSound = new Audio(TurnOnSound);
const turnOffSound = new Audio(TurnOffSound);
const turnStartSound = new Audio(TurnStartSound);
const turnIdleSound = new Audio(TurnIdleSound);
const turnReleaseSound = new Audio(TurnReleaseSound);
let isTurning = false;
export default class Sounds {
  constructor() {}

  static startEngine() {
    turnOnSound.volume = 0.5;
    turnOnSound.play();
    stopSound.pause();
    stopSound.currentTime = 0;
    startSound.play();
    startSound.addEventListener("ended", () => {
      idleSound.volume = 0.7;
      idleSound.loop = true;
      idleSound.playbackRate = 0.6;
      idleSound.play();
    });
  }

  static turnStart() {
    if (isTurning) return;
    isTurning = true;
    turnReleaseSound.pause();
    turnReleaseSound.currentTime = 0;
    turnStartSound.play();
    turnStartSound.addEventListener("ended", () => {
      turnIdleSound.loop = true;
      turnIdleSound.play();
    });
  }
  static turnStop() {
    if (!isTurning) return;
    isTurning = false;
    turnStartSound.pause();
    turnIdleSound.pause();
    turnStartSound.currentTime = 0;
    turnIdleSound.currentTime = 0;
    turnReleaseSound.play();
  }

  static stopEngine() {
    turnOffSound.play();
    startSound.pause();
    idleSound.pause();
    startSound.currentTime = 0;
    idleSound.currentTime = 0;
    stopSound.play();
  }

  static click(off?: boolean) {
    if (off !== undefined) {
      return off ? turnOffSound.play() : turnOnSound.play();
    }
    Math.random() % 2 === 0 ? turnOnSound.play() : turnOffSound.play();
  }
}
