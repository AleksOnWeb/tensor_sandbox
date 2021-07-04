import Demo from "../Demo";

export default class AbstractState {
    protected parent: Demo;

    constructor(parent: any) {
        this.parent = parent;
    }

    name(): string {
        return "AbstractState"
    }

    start(): void {
    }

    end(): void {
    }

    update(): void {
    }
}
