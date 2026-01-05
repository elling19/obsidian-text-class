/**
 * 定义一个文本样式类
 */
export interface TextClass {
    /** 类名ID，用于标识 */
    id: string;
    /** 显示名称 */
    name: string;
    /** CSS样式内容 */
    cssStyle: string;
    /** 是否启用 */
    enabled: boolean;
}

/**
 * 插件设置
 */
export interface TextClassSettings {
    /** 所有定义的文本类 */
    classes: TextClass[];
    /** 是否开启开发者模式 */
    developerMode: boolean;
    /** 应用/移除样式时是否显示通知 */
    showNotifications: boolean;
}

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: TextClassSettings = {
    developerMode: false,
    showNotifications: false,
    classes: [
        {
            id: "mjzf77fe4vo26",
            name: "Red",
            cssStyle: "background-color: #ff0000;color: #ffffff;font-size: 20px;font-weight: bold;font-style: italic;padding: 5px;",
            enabled: true
        }
    ]
};
