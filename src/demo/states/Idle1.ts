import AbstractState from "./AbstractState";

export default class Idle1 extends AbstractState{
    private _timeOut: any;

    name(): string {
        return "Idle1"
    }

    start() {
        this.parent.background.tint = 0xff8888;
        this._timeOut = setTimeout(()=>{
            this.parent.currentState = this.parent.idle2
        },2000)
    }

    end() {
        clearTimeout(this._timeOut)
    }
}