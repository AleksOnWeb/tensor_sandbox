import AbstractState from "./AbstractState";

export default class Idle3 extends AbstractState{
    private _timeOut: any;

    name(): string {
        return "Idle3"
    }

    start() {
        this.parent.background.tint = 0x8888ff;
        this._timeOut = setTimeout(()=>{
            this.parent.currentState = this.parent.idle1
        },3000)
    }

    end() {
        clearTimeout(this._timeOut)
    }
}