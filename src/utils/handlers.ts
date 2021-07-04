export default class Handlers {

    constructor() {
    }

    init(): void {
        let renderer = window.renderer;

        window.nativeMobileCheck = function () {
            let check = false;
            (function (a) {
                if (
                    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                        a
                    ) ||
                    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                        a.substr(0, 4)
                    )
                ) {
                    check = true;
                }
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        };

        /**
         * обработчик изменения размера экрана
         */
        window.sizeHandler = function () {
            let w = window.sceneWidth;
            let h = window.sceneHeight;

            const isMob = window.nativeMobileCheck();
            let maxWidth: number;
            let maxHeight: number;

            let isHorizontal = () => {
                return window.orientation && (Math.abs(<number>window.orientation) === 90);
            };

            if (isMob) {
                // переключились на использование inner-размеров для корректного отображения в сафари
                if (isHorizontal()) {
                    maxWidth = window.innerHeight || screen.height;
                    maxHeight = window.innerWidth || screen.width;
                } else {
                    maxWidth = window.innerWidth || screen.width;
                    maxHeight = window.innerHeight || screen.height;
                }
            } else {
                maxWidth = window.innerWidth;
                maxHeight = window.innerHeight;
            }

            let ratio = maxWidth / w;
            if (h * ratio > maxHeight) {
                ratio = maxHeight / h;
            }

            let aw = w * ratio;
            let ah = h * ratio;
            let dx = maxWidth - aw;
            let dy = maxHeight - ah;

            if (isMob) {
                /**
                 * Мобильные устройства
                 */
                renderer.view.style.top = "0";
                renderer.view.style.left = "0";
                renderer.view.style.width = "100%";
                if (isHorizontal()) {
                    //renderer.view.style.height = "100%";
                    //так ставятся правильные размеры для сафари
                    renderer.view.style.height = aw + "px";
                    // дополнительные классы дла управления размерами через css
                    // были внедрены для реализации фулл-скрина в мобильном сафари
                    // safari_crutch_begin
                    document.documentElement.classList.remove("vertical");
                    document.documentElement.classList.add("horizontal");
                    if (screen.width === window.innerHeight) {
                        document.documentElement.classList.remove("hand");
                    } else {
                        document.documentElement.classList.add("hand");
                    }
                    // safari_crutch_end
                } else {
                    if (dy < 1) {
                        renderer.view.style.height = "100%";
                    } else {
                        // центрирование по вертикали
                        renderer.view.style.top = ~~(dy / 2) + "px";
                        renderer.view.style.height = "auto";
                    }
                    document.documentElement.classList.remove("horizontal");
                    document.documentElement.classList.add("vertical");
                }
                // сафари(а может и не только) изменяя размер шапки браузера скролит содержимое станицы
                window.scrollTo({top: 0, left: 0});
            } else {
                /**
                 * Десктоп
                 */
                if (dx > 0) {
                    renderer.view.style.left = ~~(dx / 2) + "px";
                } else {
                    renderer.view.style.left = "0";
                }
                if (dy > 0) {
                    renderer.view.style.top = ~~(dy / 2) + "px";
                } else {
                    renderer.view.style.top = "0";
                }
                renderer.view.style.width = aw + "px";
                renderer.view.style.height = ah + "px";
            }
        };

        /**
         * сменить разрешение
         * @param w
         * @param h
         */
        window.changeResolution = function (w, h) {
            if (window.sceneWidth !== w || window.sceneHeight !== h) {
                window.sceneWidth = w;
                window.sceneHeight = h;
                renderer.resize(w, h);
                window.sizeHandler();
            }
        };

        window.mobileAndTabletcheck = function () {
            // возможно, desktop или mobile выставлена в настройках (тогда проигнорим nativeMobileCheck)
            let mobile = localStorage.getItem("mobile");
            if (mobile) {
                return mobile === "1";
            }

            return window.nativeMobileCheck();
        };

        // установим перехватчики изменения размеров нашей рабочей области
        window.onresize = function () {
            window.sizeHandler();
        };

        window.sizeHandler();
    }
}