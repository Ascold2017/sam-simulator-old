import BaseLoop from "./BaseLoop";

export default class FixedLoop extends BaseLoop {
    private interval = 1000;
    constructor(name: string, handler: (time: number) => void, interval: number) {
        super(name, handler);
        this.interval = interval;
    }

    public handle(delta: number): void {
        this.lastTime = new Date().getTime();
        this.time += delta;
        if (this.time >= this.interval) {
            this.handler(this.time / 1000);
            this.time = 0;
        }
    }
}