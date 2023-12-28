import BaseLoop from "./BaseLoop";

export default class FPSLoop extends BaseLoop {
    private fps = 60;
    constructor(name: string, handler: (time: number) => void, maxFPS?: number) {
        super(name, handler);
        this.fps = maxFPS || 60;
    }

    public handle(delta: number): void {
        if (delta < this.fps / 1000) return;
        this.lastTime = new Date().getTime();
        this.time += delta;
        this.handler(this.time / 1000);
    }
}