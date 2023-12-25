
export default class BaseLoop {
    protected name: string;
    protected handler: (delta: number) => void;
    protected maxDelta = 100; // ms
    protected lastTime = 0;
    protected time = 0;
    protected isStop = false;
    protected acceleration = 1;
    constructor (name: string, handler: (delta: number) => void) {
        this.name = name;
        this.handler = handler;
        this.lastTime = Date.now();
        this.run();
    }

    private run() {
        const refresh = () => {
            this.update()
            requestAnimationFrame(refresh);
        }
        refresh();
    }

    private update() {
        if (this.isStop) return;

        let delta = (new Date().getTime() - this.lastTime) * this.acceleration;
        let maxDelta = 100;
        if (delta > maxDelta) delta = maxDelta;

        this.handle(delta);
    }

    public handle(delta: number) {
        // For override
    }
}