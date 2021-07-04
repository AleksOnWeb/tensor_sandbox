/**
 * Это глобальные типы и интерфейсы для объектов, классов и прочего, которые доступны глобально без импорта
 */

declare global {
    interface Window {
        GIT_VERSION: string;
        _: any;

        sceneWidth: number,
        sceneHeight: number,
        sizeHandler: Callback;
        changeResolution: Callback;
        isMobile: boolean;
        mobileAndTabletcheck: () => boolean;
        nativeMobileCheck: () => boolean;

        app: PIXI.Application;
        renderer: PIXI.Renderer | PIXI.CanvasRenderer;

        opera: any; //todo is it need?
    }

    interface Document {
        onready: () => void;
    }

    type Callback = (...args: any[]) => void;
    type Point = { x: number, y: number };

    type PackItem = { type: string, data: PackItemParams }

    type PackItemParams = {
        width?: number,
        height?: number,
        scalex?: number,
        scaley?: number,
        textureid?: string,
        stayid?: string,
        hoverid?: string,
        disableid?: string,
        downid?: string,
        nickname: string,
        anchorx?: number,
        anchory?: number,
        rotation?: number,
        x?: number,
        y?: number,
        tint?: number,
        alpha?: number,
        items?: PackItem[],
        frames?: { id: string }[],
        fps?: number,
        cycled?: boolean
        visible?: boolean,
        enabled?: boolean,
        fontid?: string,
        i18n?: string,
        i18nParams?: string,
        align?: string
        text?: string,
        picid?: { [key: string]: string }
    };

    type PIXIElement = PIXI.DisplayObject | PIXI.Sprite | PIXI.Text | PIXI.Container;
}
export {};
