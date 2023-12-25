import type BaseLoop from "./Loops/BaseLoop";
import FPSLoop from "./Loops/FPSLoop";
import FixedLoop from "./Loops/FixedLoop";

export default class LoopEngine {
    private loops: Map<string, BaseLoop> = new Map();
    public addFPSLoop(name: string, handler: (delta: number) => void) {
        this.loops.set(name, new FPSLoop(name, handler));
    }
    public addFixedLoop(name: string, handler: (delta: number) => void, interval: number) {
        this.loops.set(name, new FixedLoop(name, handler, interval));
    }
    public removeLoop(name: string) {
        this.loops.delete(name);
    }
}