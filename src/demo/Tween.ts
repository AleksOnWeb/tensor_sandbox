import DisplayObject = PIXI.DisplayObject;

type Callback = () => void;
type TweenController = ((c: DisplayObject, k: number) => void);
type EasingFunction = (k: number) => number;

/**
 * Класс управления функциями интерполирования параметров контролов.
 * Например, для плавного перемещения или смены цветы.
 * @author Черняев А.С.
 */
export default class Tween {
    /**
     * Массив контролов у которых будут изменяться параметры
     */
    controls: DisplayObject[];
    /**
     * Запущен ли твин
     */
    started: boolean;
    /**
     * Закончил ли твин работу
     */
    finished: boolean;
    /**
     * Контроллеры функций твина. Один контроллер - одна функция. Количество контролов не ограничено
     * @private
     */
    private controllers: TweenController[];
    /**
     * Целевая длительность работы твина
     * @private
     */
    private length: number;
    /**
     * Текущее время работы твина.
     * Увеличивается итеративно через update каждого кадра
     * @private
     */
    private timer: number;
    /**
     * Число повторений
     * @private
     */
    private repeat: number;
    /**
     * Коллбек на окончание работы твина
     * @private
     */
    private callback: Callback | undefined;

    constructor() {
        this.controls = [];
        this.started = false; // устанавливается на старте твина и снимается когда твин отработал
        this.finished = false; // устанавливается когда твин отработал
        this.controllers = []; // функции-обработчики
        this.length = 0;
        this.callback = undefined;
    }

    /**
     * Добавить контрол в набор, которыми будем манипулировать
     * @param c объект, который добавляем
     */
    addControl(c: DisplayObject): Tween {
        this.controls.push(c);
        return this;
    }

    /**
     * Формирование контроллера
     * @param map - параметры по которым будет происходит интерполирование
     * @param ease - Функция интерполирования
     */
    do(map: { [param: string]: Array<(number | string)> }, ease: Function = Tween.Linear): Tween {
        let controller: TweenController;
        let simpleParams = true;
        for (const param in map) {
            if (map.hasOwnProperty(param)) {
                for (let i = 0; i < 2; i++) {
                    if (isNaN(map[param][i] as number)) {
                        simpleParams = false;
                        break;
                    }
                }
                if (!simpleParams) {
                    break;
                }
            }
        }

        if (simpleParams) {
            // if params simple then make controller with less checks on every iteration
            controller = (c: DisplayObject, k: number) => {
                for (const param in map) {
                    if (c[param] !== undefined) {
                        c[param] = Number(map[param][0]) + (Number(map[param][1]) - Number(map[param][0])) * ease(k);
                    }
                }
            };
        } else {
            controller = (c: DisplayObject, k: number) => {
                for (const param in map) {
                    if (c[param] !== undefined) {
                        const ps = (isNaN(map[param][0] as number) ? c[map[param][0]] : map[param][0]) as number;
                        const pe = (isNaN(map[param][1] as number) ? c[map[param][1]] : map[param][1]) as number;
                        c[param] = ps + (pe - ps) * ease(k);
                    }
                }
            };
        }

        this.addController(controller);
        return this;
    }

    /**
     * Добавление произвольного контроллера
     * @param controller
     * @returns {Tween}
     */
    addController(controller: TweenController): Tween {
        this.controllers.push(controller);
        return this;
    }

    /**
     * Удаление контроллеров твина
     * @returns {Tween}
     */
    clearControllers(): Tween {
        this.controllers = [];
        return this;
    }

    /**
     * Очистка списка модифицируемых твином контролов
     * @returns {Tween}
     */
    clearControls(): Tween {
        this.controls = [];
        return this;
    }

    /**
     * Установка стартовых значений всем контролам
     */
    setStartValues(): Tween {
        this.controls.forEach((c) => {
            this.controllers.forEach((fun) => fun(c, 0));
        });
        return this;
    }

    /**
     * Запуск твина
     * @param time длительность
     * @param callback коллбэк, который будет вызван после окончания работы твина
     * @param repeat кол-во повторов. -1 === бесконечно
     * @returns {Tween}
     */
    start(time: number, callback?: Callback, repeat: number = 0): Tween {
        this.length = time;
        this.callback = callback;
        this.started = true;
        this.timer = 0;
        this.repeat = repeat;
        return this;
    }

    /**
     * Промис для метода start
     * @param time длительность
     * @param repeat кол-во повторов. -1 === бесконечно
     */
    startPromise(time: number, repeat: number = 0): Promise<void> {
        return new Promise<void>((resolve) => this.start(time, resolve, repeat));
    }

    /**
     * Обновление состояний твинов
     * Вызывается каждый кадр
     * @param delta - время в ms c прошлой итерации
     */
    update(delta: number): void {
        if (!this.started || this.controllers.length === 0) {
            return;
        }

        this.timer += delta;
        // TODO продумать repeat ещё раз (т.к. вот из-за этой строчки repeat будет работать криво)
        this.timer = this.timer > this.length ? this.length : this.timer;
        const k = this.timer / this.length;
        this.controls.forEach((c) => {
            this.controllers.forEach((fun) => fun(c, k));
        });

        if (this.timer >= this.length) {
            if (this.repeat > 0) {
                this.repeat--;
            }
            if (this.repeat === 0) {
                this.stop();

                if (this.callback) {
                    this.callback();
                }
            } else {
                this.timer = 0;
            }
        }
    }

    /**
     * Остановка твина (без вызова коллбэка (!))
     * @return number k - момент, на котором остановились (от 0 до 1 (без учёта ease!))
     */
    stop(): number {
        this.started = false;
        this.finished = true;

        // вернём текущую k
        return this.timer / this.length;
    }

    /**
     * деструктор твина
     */
    destroy(): void {
        this.stop();
        this.clearControls();
        this.clearControllers();
    }

    // ==============================================================================================
    // ======================================== EASE-функции ========================================
    // ==============================================================================================

    /**
     * pipe для ease-функций, т.е. суперпозиция нескольких ease (для универсального реверса, например)
     * функции-параметры применяются слева направо
     * @example Tween.Pipe(Tween.LinearBack, Tween.Reverse, Tween.CubicIn)
     * @param easings функции
     * @returns {*|(function(...[*]): *)} суперпозиция слева направо
     */
    static Pipe = (...easings: Array<((k: number) => number)>) => easings.reduce((f, g) => (k: number) => g(f(k)));

    // TODO удалить избыточность (проверить соответствия результатов суперпозиций с соответствующими функциями)

    // ============ с параметрами ============

    /**
     * Easing выстраиваемый по точкам
     * @param p массив точек, где параметр k в каждом следующем элементе должен быть не меньше k в предыдущем
     * @example Tween.PointEasing({ k: 0, t: 0 }, { k: 0.2, t: 1 }, { k: 0.4, t: 0 }, { k: 1, t: 0 });
     */
    static PointEasing: Function = (...p: Array<{ k: number, t: number }>): EasingFunction => {
        let ki;
        return (k) => {
            ki = 0;
            while (ki < p.length && k >= p[ki].k) {
                ki++;
            }
            return ki < p.length ? (p[ki].t + ((p[ki].t - p[ki - 1].t) /
                (p[ki].k - p[ki - 1].k)) * (k - p[ki].k)) : p[ki - 1].t;
        };
    }

    /**
     * Циклический сдвиг
     * (сдвигает все easing'и после себя вправо по x на d)
     */
    static Shift: Function = (d: number): EasingFunction => {
        d -= Math.floor(d);
        return (k) => (k - d > 0 ? k - d : k - d + 1);
    }

    /**
     * Умножение (сжимает easing по x)
     */
    static Mult: Function = (d: number): EasingFunction => {
        return (k) => k * d;
    }

    // =========== без параметров ============

    static Linear: Function = (k: number): number => {
        return k;
    }

    static Reverse: Function = (k: number): number => {
        return -k + 1;
    }

    static Cut: Function = (k: number): number => {
        if (k > 1) {
            return 1;
        }
        if (k < 0) {
            return 0;
        }
        return k;
    }

    static LinearBack: Function = (k: number): number => {
        return k < 0.5 ? 2 * k : -2 * k + 2;
    }

    static QuadraticIn: Function = (k: number): number => {
        return k * k;
    }
    static QuadraticOut: Function = (k: number): number => {
        return k * (2 - k);
    }
    static QuadraticInOut: Function = (k: number): number => {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    }

    static CubicIn: Function = (k: number): number => {
        return k * k * k;
    }
    static CubicOut: Function = (k: number): number => {
        return --k * k * k + 1;
    }
    static CubicInOut: Function = (k: number): number => {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k + 2);
    }

    static CubicInReverse: Function = (k: number): number => {
        let rs;
        if (k * 2 < 1) {
            rs = Tween.CubicIn(k * 2);
        } else {
            rs = Tween.CubicIn((1 - k) * 2);
        }
        return rs;
    }

    static QuarticIn: Function = (k: number): number => {
        return k * k * k * k;
    }
    static QuarticOut: Function = (k: number): number => {
        return 1 - --k * k * k * k;
    }
    static QuarticInOut: Function = (k: number): number => {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k;
        }
        return -0.5 * ((k -= 2) * k * k * k - 2);
    }

    static QuarticInReverse: Function = (k: number): number => {
        let rs;
        if (k * 2 < 1) {
            rs = Tween.QuarticIn(k * 2);
        } else {
            rs = Tween.QuarticIn((1 - k) * 2);
        }
        return rs;
    }

    static QuinticIn: Function = (k: number): number => {
        return k * k * k * k * k;
    }
    static QuinticOut: Function = (k: number): number => {
        return --k * k * k * k * k + 1;
    }
    static QuinticInOut: Function = (k: number): number => {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }

    /**
     * @return {number}
     */
    static BounceIn: Function = (k: number): number => {
        return 1 - Tween.BounceOut(1 - k);
    }
    /**
     * @return {number}
     */
    static BounceOut: Function = (k: number): number => {
        if (k < 1 / 2.75) {
            return 7.5625 * k * k;
        } else if (k < 2 / 2.75) {
            return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
        } else if (k < 2.5 / 2.75) {
            return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
        } else {
            return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
        }
    }
    static BounceInOut: Function = (k: number): number => {
        if (k < 0.5) {
            return Tween.BounceIn(k * 2) * 0.5;
        }
        return Tween.BounceOut(k * 2 - 1) * 0.5 + 0.5;
    }
    /**
     * @return {number}
     */
    static SinusoidalIn: Function = (k: number): number => {
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        return 1 - Math.cos(k * Math.PI / 2);
    }
    /**
     * @return {number}
     */
    static SinusoidalOut: Function = (k: number): number => {
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        return Math.sin(k * Math.PI / 2);
    }
    /**
     * @return {number}
     */
    static SinusoidalInOut: Function = (k: number): number => {
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    static ExponentialIn: Function = (k: number): number => {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    }
    static ExponentialOut: Function = (k: number): number => {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    }
    static ExponentialInOut: Function = (k: number): number => {
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        if ((k *= 2) < 1) {
            return 0.5 * Math.pow(1024, k - 1);
        }
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    }

    static CircularIn: Function = (k: number): number => {
        return 1 - Math.sqrt(1 - k * k);
    }
    static CircularOut: Function = (k: number): number => {
        return Math.sqrt(1 - --k * k);
    }
    static CircularInOut: Function = (k: number): number => {
        if ((k *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }

    static ElasticIn: Function = (k: number): number => {
        let s;
        let a = 0.1;
        const p = 0.4;
        if (k === 0 || k === 1) {
            return k;
        }
        s = (!a || a < 1) ? p / 4 : p * Math.asin(1 / a) / (2 * Math.PI);
        a = (!a || a < 1) ? 1 : a;
        return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    }

    static ElasticOut: Function = (k: number): number => {
        let s;
        let a = 0.1;
        const p = 0.4;
        if (k === 0 || k === 1) {
            return k;
        }
        s = (!a || a < 1) ? p / 4 : p * Math.asin(1 / a) / (2 * Math.PI);
        a = (!a || a < 1) ? 1 : a;
        return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
    }

    static ElasticInOut: Function = (k: number): number => {
        let s;
        let a = 0.1;
        const p = 0.4;
        if (k === 0 || k === 1) {
            return k;
        }
        s = (!a || a < 1) ? p / 4 : p * Math.asin(1 / a) / (2 * Math.PI);
        a = (!a || a < 1) ? 1 : a;
        if ((k *= 2) < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        }
        return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
    }

    static BackIn: Function = (k: number): number => {
        const s = 1.70158;
        return k * k * ((s + 1) * k - s);
    }
    static BackOut: Function = (k: number): number => {
        const s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    }
    static BackInOut: Function = (k: number): number => {
        const s = 1.70158 * 1.525;
        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
}
