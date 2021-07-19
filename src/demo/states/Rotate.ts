import AbstractState from "./AbstractState";

export default class Rotate extends AbstractState{

    name(): string {
        return "Rotate"
    }

    start() {
        this.parent.background.tint = 0x888888;
    }

    update(): void {
        if(this.parent.anim){
            this.parent.anim.rotation += 0.01;
        }
    }

    end() {
    }
}