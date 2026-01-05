/**
 * CSS 解析器模块
 * 用于在可视化样式属性和 CSS 字符串之间转换
 */

/**
 * 四方位值接口（上右下左）
 */
export interface FourSideValue {
    top: string;
    right: string;
    bottom: string;
    left: string;
}

/**
 * 默认四方位值
 */
export const DEFAULT_FOUR_SIDE: FourSideValue = {
    top: "",
    right: "",
    bottom: "",
    left: "",
};

/**
 * border-style 选项
 */
export const BORDER_STYLE_OPTIONS = [
    "none",
    "solid",
    "dashed",
    "dotted",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
] as const;

export type BorderStyleType = typeof BORDER_STYLE_OPTIONS[number];

/**
 * text-decoration 选项
 */
export const TEXT_DECORATION_OPTIONS = [
    "none",
    "underline",
    "overline",
    "line-through",
] as const;

export type TextDecorationType = typeof TEXT_DECORATION_OPTIONS[number];

/**
 * 可视化样式属性接口
 */
export interface VisualStyleProps {
    // Text 分组
    textColor: string;
    fontSize: string;
    fontBold: boolean;
    fontItalic: boolean;
    textDecoration: TextDecorationType;
    // Background 分组
    backgroundColor: string;
    backgroundOpacity: number; // 0-100 透明度
    // Border 分组
    borderStyle: BorderStyleType;
    borderSize: string;
    borderRadius: FourSideValue;
    borderColor: string;
    // Box 分组
    padding: FourSideValue;
}

/**
 * 默认可视化样式属性
 */
export const DEFAULT_VISUAL_STYLE: VisualStyleProps = {
    // Text 分组
    textColor: "",
    fontSize: "",
    fontBold: false,
    fontItalic: false,
    textDecoration: "none",
    // Background 分组
    backgroundColor: "",
    backgroundOpacity: 100,
    // Border 分组
    borderStyle: "none",
    borderSize: "",
    borderRadius: { ...DEFAULT_FOUR_SIDE },
    borderColor: "",
    // Box 分组
    padding: { ...DEFAULT_FOUR_SIDE },
};

/**
 * 检查四方位值是否有任何值
 */
function hasFourSideValue(value: FourSideValue): boolean {
    return !!(value.top || value.right || value.bottom || value.left);
}

/**
 * 将四方位值转换为CSS值字符串
 */
function fourSideToCSS(value: FourSideValue, unit: string = "px"): string {
    const top = value.top ? ((/^\d+$/.test(value.top)) ? `${value.top}${unit}` : value.top) : "0";
    const right = value.right ? ((/^\d+$/.test(value.right)) ? `${value.right}${unit}` : value.right) : "0";
    const bottom = value.bottom ? ((/^\d+$/.test(value.bottom)) ? `${value.bottom}${unit}` : value.bottom) : "0";
    const left = value.left ? ((/^\d+$/.test(value.left)) ? `${value.left}${unit}` : value.left) : "0";
    
    // 优化输出：如果四个值相同
    if (top === right && right === bottom && bottom === left) {
        return top;
    }
    // 如果上下相同、左右相同
    if (top === bottom && left === right) {
        return `${top} ${right}`;
    }
    // 如果左右相同
    if (left === right) {
        return `${top} ${right} ${bottom}`;
    }
    // 四个值都不同
    return `${top} ${right} ${bottom} ${left}`;
}

/**
 * 将可视化样式属性转换为 CSS 字符串
 */
export function visualStyleToCSS(props: VisualStyleProps): string {
    const parts: string[] = [];

    // Background 分组
    if (props.backgroundColor) {
        parts.push(`background-color: ${props.backgroundColor}`);
    }
    
    // 透明度是独立属性，不依赖背景色
    if (props.backgroundOpacity !== undefined && props.backgroundOpacity < 100) {
        parts.push(`opacity: ${props.backgroundOpacity / 100}`);
    }

    // Text 分组
    if (props.textColor) {
        parts.push(`color: ${props.textColor}`);
    }

    if (props.fontSize) {
        const size = props.fontSize.trim();
        if (size && /^\d+$/.test(size)) {
            parts.push(`font-size: ${size}px`);
        } else if (size) {
            parts.push(`font-size: ${size}`);
        }
    }

    if (props.fontBold) {
        parts.push("font-weight: bold");
    }

    if (props.fontItalic) {
        parts.push("font-style: italic");
    }

    if (props.textDecoration && props.textDecoration !== "none") {
        parts.push(`text-decoration: ${props.textDecoration}`);
    }

    // Border 分组
    if (props.borderStyle && props.borderStyle !== "none") {
        const size = props.borderSize ? ((/^\d+$/.test(props.borderSize)) ? `${props.borderSize}px` : props.borderSize) : "1px";
        const color = props.borderColor || "currentColor";
        parts.push(`border: ${size} ${props.borderStyle} ${color}`);
    }

    if (hasFourSideValue(props.borderRadius)) {
        parts.push(`border-radius: ${fourSideToCSS(props.borderRadius)}`);
    }

    // Box 分组
    if (hasFourSideValue(props.padding)) {
        parts.push(`padding: ${fourSideToCSS(props.padding)}`);
    }

    // 每个属性单独一行
    return parts.map(p => p + ";").join("\n");
}

/**
 * 解析CSS四方位值（如 padding、border-radius）
 */
function parseFourSideValue(value: string): FourSideValue {
    const result: FourSideValue = { ...DEFAULT_FOUR_SIDE };
    const parts = value.trim().split(/\s+/).map(stripUnit);
    
    if (parts.length === 1 && parts[0]) {
        // 一个值：四个方向相同
        result.top = result.right = result.bottom = result.left = parts[0];
    } else if (parts.length === 2 && parts[0] && parts[1]) {
        // 两个值：上下 / 左右
        result.top = result.bottom = parts[0];
        result.right = result.left = parts[1];
    } else if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        // 三个值：上 / 左右 / 下
        result.top = parts[0];
        result.right = result.left = parts[1];
        result.bottom = parts[2];
    } else if (parts.length >= 4 && parts[0] && parts[1] && parts[2] && parts[3]) {
        // 四个值：上 / 右 / 下 / 左
        result.top = parts[0];
        result.right = parts[1];
        result.bottom = parts[2];
        result.left = parts[3];
    }
    
    return result;
}

/**
 * 将 CSS 字符串解析为可视化样式属性
 */
export function cssToVisualStyle(css: string): VisualStyleProps {
    const props: VisualStyleProps = { 
        ...DEFAULT_VISUAL_STYLE,
        borderRadius: { ...DEFAULT_FOUR_SIDE },
        padding: { ...DEFAULT_FOUR_SIDE },
    };

    if (!css) return props;

    // 解析 CSS 字符串为键值对
    const declarations = css.split(";").filter(s => s.trim());

    for (const decl of declarations) {
        const colonIndex = decl.indexOf(":");
        if (colonIndex === -1) continue;

        const property = decl.substring(0, colonIndex).trim().toLowerCase();
        const value = decl.substring(colonIndex + 1).trim();

        switch (property) {
            case "background-color":
            case "background":
                // 只处理纯颜色值
                if (isColorValue(value)) {
                    // 解析 rgba 中的透明度
                    const rgbaResult = parseRgba(value);
                    if (rgbaResult) {
                        props.backgroundColor = rgbaResult.hex;
                        // rgba的透明度映射到opacity
                        props.backgroundOpacity = rgbaResult.opacity;
                    } else {
                        props.backgroundColor = value;
                        props.backgroundOpacity = 100;
                    }
                }
                break;

            case "opacity": {
                // 直接解析opacity值
                const opacityVal = parseFloat(value);
                if (!isNaN(opacityVal)) {
                    props.backgroundOpacity = Math.round(opacityVal * 100);
                }
                break;
            }

            case "color":
                props.textColor = value;
                break;

            case "font-size":
                props.fontSize = stripUnit(value);
                break;

            case "font-weight":
                props.fontBold = value === "bold" || value === "700" || value === "800" || value === "900";
                break;

            case "font-style":
                props.fontItalic = value === "italic" || value === "oblique";
                break;

            case "text-decoration":
            case "text-decoration-line":
                if (TEXT_DECORATION_OPTIONS.includes(value as TextDecorationType)) {
                    props.textDecoration = value as TextDecorationType;
                }
                break;

            case "border": {
                // 解析简写形式: border: 1px solid #000
                const borderParts = value.split(/\s+/);
                for (const part of borderParts) {
                    if (BORDER_STYLE_OPTIONS.includes(part as BorderStyleType)) {
                        props.borderStyle = part as BorderStyleType;
                    } else if (isColorValue(part)) {
                        props.borderColor = part;
                    } else if (/^\d+/.test(part)) {
                        props.borderSize = stripUnit(part);
                    }
                }
                break;
            }

            case "border-style":
                if (BORDER_STYLE_OPTIONS.includes(value as BorderStyleType)) {
                    props.borderStyle = value as BorderStyleType;
                }
                break;

            case "border-width":
                props.borderSize = stripUnit(value);
                break;

            case "border-color":
                props.borderColor = value;
                break;

            case "padding":
                props.padding = parseFourSideValue(value);
                break;

            case "padding-top":
                props.padding.top = stripUnit(value);
                break;
            case "padding-right":
                props.padding.right = stripUnit(value);
                break;
            case "padding-bottom":
                props.padding.bottom = stripUnit(value);
                break;
            case "padding-left":
                props.padding.left = stripUnit(value);
                break;

            case "border-radius":
                props.borderRadius = parseFourSideValue(value);
                break;

            case "border-top-left-radius":
                props.borderRadius.top = stripUnit(value);
                break;
            case "border-top-right-radius":
                props.borderRadius.right = stripUnit(value);
                break;
            case "border-bottom-right-radius":
                props.borderRadius.bottom = stripUnit(value);
                break;
            case "border-bottom-left-radius":
                props.borderRadius.left = stripUnit(value);
                break;
        }
    }

    return props;
}

/**
 * 检查值是否是颜色值
 */
function isColorValue(value: string): boolean {
    // 支持 hex, rgb, rgba, hsl, hsla, 命名颜色
    const colorPatterns = [
        /^#[0-9a-fA-F]{3,8}$/,
        /^rgb\(/i,
        /^rgba\(/i,
        /^hsl\(/i,
        /^hsla\(/i,
        /^[a-zA-Z]+$/, // 命名颜色如 red, blue 等
    ];
    return colorPatterns.some(pattern => pattern.test(value.trim()));
}

/**
 * 移除单位，只保留数字
 */
function stripUnit(value: string): string {
    const match = value.match(/^(\d+(?:\.\d+)?)/);
    return match && match[1] ? match[1] : value;
}

/**
 * 检查 CSS 是否可以完全用可视化模式表示
 * 如果包含不支持的属性，返回 false
 */
export function canConvertToVisualStyle(css: string): boolean {
    if (!css || !css.trim()) return true;

    const supportedProperties = new Set([
        "background-color",
        "background",
        "opacity",
        "color",
        "font-size",
        "font-weight",
        "font-style",
        "text-decoration",
        "text-decoration-line",
        "border",
        "border-style",
        "border-width",
        "border-color",
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "border-radius",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius",
    ]);

    const declarations = css.split(";").filter(s => s.trim());

    for (const decl of declarations) {
        const colonIndex = decl.indexOf(":");
        if (colonIndex === -1) continue;

        const property = decl.substring(0, colonIndex).trim().toLowerCase();
        
        // 检查是否是支持的属性
        if (!supportedProperties.has(property)) {
            return false;
        }

        // 检查 background 是否只是颜色
        if (property === "background") {
            const value = decl.substring(colonIndex + 1).trim();
            if (!isColorValue(value)) {
                return false;
            }
        }
    }

    return true;
}

/**
 * 将颜色值转换为 hex 格式（用于颜色选择器）
 */
export function colorToHex(color: string): string {
    if (!color) return "";
    
    // 已经是 hex 格式
    if (color.startsWith("#")) {
        // 将 3 位 hex 转为 6 位
        if (color.length === 4) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        }
        return color.substring(0, 7); // 只取前 7 位（#RRGGBB）
    }

    // 先尝试解析 rgba
    const rgbaResult = parseRgba(color);
    if (rgbaResult) {
        return rgbaResult.hex;
    }

    // 使用临时元素转换颜色
    const tempEl = document.createElement("div");
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    const computed = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    // rgb(r, g, b) 转 hex
    const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match && match[1] && match[2] && match[3]) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    return color;
}

/**
 * 解析 rgba 颜色值，返回 hex 和透明度
 */
export function parseRgba(color: string): { hex: string; opacity: number } | null {
    if (!color) return null;
    
    // 匹配 rgba(r, g, b, a) 格式
    const rgbaMatch = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i);
    if (rgbaMatch && rgbaMatch[1] && rgbaMatch[2] && rgbaMatch[3] && rgbaMatch[4]) {
        const r = parseInt(rgbaMatch[1], 10);
        const g = parseInt(rgbaMatch[2], 10);
        const b = parseInt(rgbaMatch[3], 10);
        const a = parseFloat(rgbaMatch[4]);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        return { hex, opacity: Math.round(a * 100) };
    }
    
    // 匹配 8位 hex 格式 #RRGGBBAA
    if (color.startsWith("#") && color.length === 9) {
        const hex = color.substring(0, 7);
        const alphaHex = color.substring(7, 9);
        const opacity = Math.round((parseInt(alphaHex, 16) / 255) * 100);
        return { hex, opacity };
    }
    
    return null;
}

/**
 * 将 hex 颜色和透明度转换为 rgba 格式
 */
export function hexToRgba(hex: string, opacity: number): string {
    if (!hex) return "";
    
    // 确保是 6 位 hex
    let cleanHex = hex.startsWith("#") ? hex.substring(1) : hex;
    if (cleanHex.length === 3) {
        const c0 = cleanHex[0] ?? "0";
        const c1 = cleanHex[1] ?? "0";
        const c2 = cleanHex[2] ?? "0";
        cleanHex = c0 + c0 + c1 + c1 + c2 + c2;
    }
    
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const a = opacity / 100;
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
