import AbstractState from "./AbstractState";

export default class Idle2 extends AbstractState{
    private _timeOut: any;

    name(): string {
        return "Idle2"
    }

    start() {
        this.parent.background.tint = 0x88ff88;
        this._timeOut = setTimeout(()=>{
            this.parent.currentState = this.parent.idle3
        },2000)
    }

    end() {
        clearTimeout(this._timeOut)
    }
}