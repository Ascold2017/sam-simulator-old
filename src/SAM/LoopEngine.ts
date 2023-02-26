interface ILoop {
    func: (time?: number) => void;
    isPaused: boolean;
    time: 0;
}

interface IFixedLoop {
    func: (time?: number) => void;
    isPaused: boolean;
    time: 0;
    interval: number;
}

export default class LoopHelper {
    protected loops: Record<string, ILoop> = {};
    protected fixedLoops: Record<string, IFixedLoop> = {};
    protected maxDelta = 100; // ms
    protected fps = 75;
    protected lastTime = 0;
    protected isStop = false;
    protected acceleration = 1;
    constructor() {
        this.lastTime = Date.now();
        const render = () => {
            this.update()
            requestAnimationFrame(render);
        }
        render();
    }

    setAcceleration(acc: number) {
        this.acceleration = acc;
        if (acc <= 0) {
            this.isStop = true;
        } else {
            this.isStop = false;
        }
    }

    addLoop(name: string, func: (time?: number) => void) {
        this.loops[name] = { func, isPaused: false, time: 0 };
    }

    addFixedLoop(name: string, interval: number, func: () => void) {
        this.fixedLoops[name] = { func, isPaused: false, time: 0, interval }
    }
    removeLoop(name: string) {
        delete this.loops[name];
    }
    removeFixedLoop(name: string) {
        delete this.fixedLoops[name];
    }

    private update() {
        if (this.isStop) return;
        let delta = ((Date.now() - this.lastTime)) * this.acceleration;
        if (delta > this.maxDelta) delta = this.maxDelta;

        if (delta < 1000 / this.fps) return;

        this.lastTime = Date.now();

        for (const l in this.loops) {
            const loop = this.loops[l];
            if (!loop.isPaused) {
                loop.time += delta;
                loop.func(loop.time);
            }
        }

        for (const fl in this.fixedLoops) {
            const loop = this.fixedLoops[fl];
            if (!loop.isPaused) {
                loop.time += delta;
                if (loop.time >= loop.interval) {
                    loop.func()
                    loop.time = 0;
                }
                
            }
        }
    }
}