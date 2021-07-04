import AbstractState from "./states/AbstractState";
import Idle1 from "./states/Idle1";
import Idle2 from "./states/Idle2";
import Idle3 from "./states/Idle3";
import Rotate from "./states/Rotate";

export default class Demo {
    private _currentState: AbstractState;

    public idle1: AbstractState;
    public idle2: AbstractState;
    public idle3: AbstractState;
    public rotate: AbstractState;

    public background: PIXI.Sprite;
    public anim: PIXI.Sprite;
    public editButton: PIXI.Sprite;

    constructor() {
        this.idle1 = new Idle1(this);
        this.idle2 = new Idle2(this);
        this.idle3 = new Idle3(this);
        this.rotate = new Rotate(this);

        this.background = this.makeBg();
        this.editButton = this.makeEditBtn();
        this.addFighter();
    }

    set currentState(state: AbstractState) {
        if (this._currentState !== undefined) {
            this._currentState.end();
            console.log(`${this._currentState.name()} ==> ${state.name()}`);
        } else {
            console.log(` ==> ${state.name()}`);
        }
        this._currentState = state;
        this._currentState.start();
    }

    get currentState() {
        return this._currentState;
    }

    buttonClick(): void {
        if (this.currentState === this.rotate) {
            this.currentState = this.idle1
        } else {
            this.currentState = this.rotate;
        }
    }

    start() {
        this.currentState = this.idle1;

        window.app.ticker.add(() => {
            this.update();
        });
    }

    update() {
        if (this.currentState) {
            this.currentState.update()
        }
    }

    makeBg(): PIXI.Sprite {
        const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.width = window.sceneWidth;
        bg.height = window.sceneHeight;
        this.addToStage(bg);
        return bg;
    }

    makeEditBtn(): PIXI.Sprite {
        const btn = new PIXI.Sprite(PIXI.Texture.WHITE);
        btn.width = 100;
        btn.height = 100;
        btn.buttonMode = true;
        btn.interactive = true;
        btn.on('pointerdown', this.buttonClick.bind(this));
        this.addToStage(btn);
        return btn;
    }

    addFighter(): void {
        window.app.loader
            .add('assets/fighter.json')
            .load(() => {
                // create an array of textures from an image path
                const frames = [];

                for (let i = 0; i < 30; i++) {
                    const val = i < 10 ? `0${i}` : i;

                    // magically works since the spritesheet was loaded with the pixi loader
                    frames.push(PIXI.Texture.from(`rollSequence00${val}.png`));
                }

                // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
                const anim = new PIXI.AnimatedSprite(frames);

                /*
                 * An AnimatedSprite inherits all the properties of a PIXI sprite
                 * so you can change its position, its anchor, mask it, etc
                 */
                anim.x = window.app.screen.width / 2;
                anim.y = window.app.screen.height / 2;
                anim.anchor.set(0.5);
                anim.animationSpeed = 0.5;
                anim.play();

                this.addToStage(anim);
                this.anim = anim;
            });
    }

    addToStage(element: PIXIElement) {
        window.app.stage.addChild(element);
    }
}