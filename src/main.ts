import { App, Editor, MarkdownView, Menu, MenuItem, Notice, Plugin } from "obsidian";
import { TextClassSettingTab } from "./settings";
import { DEFAULT_SETTINGS, TextClass, TextClassSettings } from "./types";
import { initI18n, t } from "./i18n";

export default class TextClassPlugin extends Plugin {
    settings: TextClassSettings = DEFAULT_SETTINGS;
    private styleSheet: CSSStyleSheet | null = null;
    private readonly CLASS_PREFIX = "tc-class-";

    async onload() {
        await this.loadSettings();

        // 初始化语言
        const locale = document.documentElement.lang || "en";
        initI18n(locale);

        // 注入样式
        this.updateStyles();

        // 添加设置页面
        this.addSettingTab(new TextClassSettingTab(this.app, this));

        // 注册右键菜单
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, view: MarkdownView) => {
                this.addContextMenu(menu, editor);
            })
        );

        // 添加命令：应用样式
        this.addCommand({
            id: "apply-class",
            name: t().commandApplyStyle,
            editorCheckCallback: (checking: boolean, editor: Editor) => {
                // 支持智能选中模式
                const targetInfo = this.getTargetText(editor);
                if (targetInfo) {
                    if (!checking) {
                        this.showClassPicker(editor);
                    }
                    return true;
                }
                return false;
            }
        });

        // 添加命令：移除样式
        this.addCommand({
            id: "remove-class",
            name: t().commandRemoveStyle,
            editorCheckCallback: (checking: boolean, editor: Editor) => {
                // 支持智能选中模式
                const targetInfo = this.getTargetText(editor);
                if (targetInfo) {
                    if (!checking) {
                        this.removeTextClass(editor);
                    }
                    return true;
                }
                return false;
            }
        });
    }

    onunload() {
        // 移除注入的样式
        if (this.styleSheet) {
            const index = document.adoptedStyleSheets.indexOf(this.styleSheet);
            if (index !== -1) {
                document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
                    (sheet) => sheet !== this.styleSheet
                );
            }
            this.styleSheet = null;
        }
    }

    async loadSettings() {
        const data = await this.loadData() as Partial<TextClassSettings> | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    /**
     * 更新/注入CSS样式
     * 使用 CSSStyleSheet API 动态管理用户自定义样式类
     */
    updateStyles() {
        // 移除旧的样式表
        if (this.styleSheet) {
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
                (sheet) => sheet !== this.styleSheet
            );
        }

        // 创建新的样式表
        this.styleSheet = new CSSStyleSheet();

        // 生成CSS规则（只生成启用的样式）
        const cssRules = this.settings.classes
            .filter((textClass: TextClass) => textClass.enabled !== false)
            .map((textClass: TextClass) => {
                return `.${this.CLASS_PREFIX}${textClass.id} { ${textClass.cssStyle} }`;
            }).join("\n");

        this.styleSheet.replaceSync(cssRules);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.styleSheet];
    }

    /**
     * 添加右键菜单
     */
    private addContextMenu(menu: Menu, editor: Editor) {
        // 获取目标文本（选中文本或智能定位的文本）
        const targetInfo = this.getTargetText(editor);
        if (!targetInfo) return;

        // 如果是智能选中模式（用户没有手动选中文本），高亮显示智能选中的文本
        const hasManualSelection = editor.getSelection().length > 0;
        if (!hasManualSelection && targetInfo.text) {
            // 设置选区，让用户看到智能选中的范围
            editor.setSelection(targetInfo.from, targetInfo.to);
        }

        // 检测当前选中文本应用了哪些class
        const appliedClasses = this.getAppliedClasses(targetInfo.text);
        const hasAppliedStyle = appliedClasses.size > 0;

        // 添加分隔符
        menu.addSeparator();

        // 添加样式子菜单
        if (this.settings.classes.length > 0) {
            menu.addItem((item: MenuItem) => {
                item.setTitle(t().menuApplyStyle)
                    .setIcon("palette");
                
                // 创建子菜单
                const submenu = (item as MenuItem & { setSubmenu: () => Menu }).setSubmenu();
                
                // 为每个样式类添加子菜单项
                this.settings.classes.forEach((textClass: TextClass) => {
                    const isApplied = appliedClasses.has(textClass.id);
                    submenu.addItem((subItem: MenuItem) => {
                        subItem.setTitle(textClass.name)
                            .setIcon(isApplied ? "check" : "minus")
                            .onClick(() => {
                                this.applyTextClass(editor, textClass);
                            });
                        
                        // 获取菜单项DOM元素
                        const menuItem = subItem as MenuItem & { dom: HTMLElement };
                        
                        // 添加预览文本
                        const previewEl = menuItem.dom.createEl("span", {
                            text: "Aa",
                            cls: "text-class-menu-preview"
                        });
                        previewEl.setAttribute("style", textClass.cssStyle);
                        
                        // 如果已应用，添加高亮样式类（使用主题 accent 颜色）
                        if (isApplied) {
                            menuItem.dom.addClass("text-class-menu-applied");
                        }
                    });
                });
            });

            // 移除样式（仅当有已应用的样式时显示）
            if (hasAppliedStyle) {
                menu.addItem((item: MenuItem) => {
                    item.setTitle(t().menuRemoveStyle)
                        .setIcon("eraser")
                        .onClick(() => {
                            this.removeTextClass(editor);
                        });
                    
                    // 添加 danger 颜色样式
                    const menuItem = item as MenuItem & { dom: HTMLElement };
                    menuItem.dom.addClass("text-class-menu-danger");
                });
            }
        } else {
            menu.addItem((item: MenuItem) => {
                item.setTitle(t().menuAddStyleHint)
                    .setIcon("settings")
                    .onClick(() => {
                        // 打开设置页面并定位到本插件
                        const app = this.app as App & { setting: { open: () => void; openTabById: (id: string) => void } };
                        app.setting.open();
                        app.setting.openTabById(this.manifest.id);
                    });
            });
        }
    }

    /**
     * 获取目标文本信息
     * 优先级：选中文本 > 光标所在的span标签 > 光标所在的文本段（以span为边界）
     */
    private getTargetText(editor: Editor): { text: string; from: { line: number; ch: number }; to: { line: number; ch: number } } | null {
        const selection = editor.getSelection();
        
        // 如果有选中文本，直接返回
        if (selection) {
            const from = editor.getCursor("from");
            const to = editor.getCursor("to");
            return { text: selection, from, to };
        }

        // 没有选中文本，尝试智能定位
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        
        if (!line) return null;

        // 查找光标所在位置的文本段
        const segmentInfo = this.findTextSegment(line, cursor.ch);
        
        if (segmentInfo) {
            return {
                text: segmentInfo.text,
                from: { line: cursor.line, ch: segmentInfo.start },
                to: { line: cursor.line, ch: segmentInfo.end }
            };
        }

        // 回退：返回整个段落
        return {
            text: line,
            from: { line: cursor.line, ch: 0 },
            to: { line: cursor.line, ch: line.length }
        };
    }

    /**
     * 查找光标所在位置的文本段
     * 如果光标在span内，返回整个span
     * 如果光标在普通文本中，返回从上一个span结束到下一个span开始的文本
     */
    private findTextSegment(line: string, cursorCh: number): { text: string; start: number; end: number } | null {
        const spanRegex = new RegExp(`<span class="${this.CLASS_PREFIX}[^"]*">.+?</span>`, 'g');
        const spans: { start: number; end: number; text: string }[] = [];
        let match;

        // 收集所有span的位置
        while ((match = spanRegex.exec(line)) !== null) {
            spans.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });
        }

        // 检查光标是否在某个span内
        for (const span of spans) {
            if (cursorCh >= span.start && cursorCh <= span.end) {
                return { text: span.text, start: span.start, end: span.end };
            }
        }

        // 光标不在span内，找到光标所在的普通文本段
        // 确定文本段的边界（上一个span的结束位置和下一个span的开始位置）
        let segmentStart = 0;
        let segmentEnd = line.length;

        // 跳过 Markdown 段落首部标记（标题、列表、引用等）
        const prefixMatch = line.match(/^(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+|\s*)/);
        if (prefixMatch) {
            segmentStart = prefixMatch[0].length;
        }

        for (const span of spans) {
            if (span.end <= cursorCh) {
                // span在光标左侧，更新起始位置
                segmentStart = Math.max(segmentStart, span.end);
            }
            if (span.start >= cursorCh) {
                // span在光标右侧，更新结束位置
                segmentEnd = Math.min(segmentEnd, span.start);
                break; // 只需要最近的一个
            }
        }

        // 如果光标在 Markdown 前缀区域内，返回 null
        if (cursorCh < segmentStart) {
            return null;
        }

        // 如果文本段为空或只有空白，返回null
        const text = line.substring(segmentStart, segmentEnd);
        if (!text.trim()) {
            return null;
        }

        return { text, start: segmentStart, end: segmentEnd };
    }

    /**
     * 显示样式选择器
     */
    private showClassPicker(editor: Editor) {
        if (this.settings.classes.length === 0) {
            new Notice(t().noticeNoStyles);
            return;
        }

        // 创建一个简单的菜单
        const menu = new Menu();
        this.settings.classes.forEach((textClass: TextClass) => {
            menu.addItem((item: MenuItem) => {
                item.setTitle(textClass.name)
                    .onClick(() => {
                        this.applyTextClass(editor, textClass);
                    });
            });
        });

        // 获取编辑器光标位置并在该位置显示菜单
        // 使用 CodeMirror 的 coordsAtPos API
        const editorView = (editor as Editor & { cm?: { coordsAtPos: (pos: number) => { left: number; top: number; bottom: number } | null } }).cm;
        if (editorView?.coordsAtPos) {
            const cursor = editor.getCursor();
            const offset = editor.posToOffset(cursor);
            const coords = editorView.coordsAtPos(offset);
            if (coords) {
                menu.showAtPosition({ x: coords.left, y: coords.bottom });
                return;
            }
        }
        
        // 回退：在屏幕中间显示
        menu.showAtPosition({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
    }

    /**
     * 应用文本样式类
     */
    private applyTextClass(editor: Editor, textClass: TextClass) {
        const targetInfo = this.getTargetText(editor);
        if (!targetInfo) {
            new Notice(t().noticeCannotDetermineTarget);
            return;
        }

        const { text, from, to } = targetInfo;

        // 检查是否已经有span标签包裹
        const spanRegex = new RegExp(`^<span class="${this.CLASS_PREFIX}[^"]*">(.+)<\\/span>$`, 's');
        const match = text.match(spanRegex);

        let newText: string;
        if (match) {
            // 替换已有的class
            newText = `<span class="${this.CLASS_PREFIX}${textClass.id}">${match[1]}</span>`;
        } else {
            // 添加新的span包裹
            newText = `<span class="${this.CLASS_PREFIX}${textClass.id}">${text}</span>`;
        }

        // 替换目标范围的文本
        editor.replaceRange(newText, from, to);
        if (this.settings.showNotifications) {
            new Notice(t().noticeApplied(textClass.name));
        }
    }

    /**
     * 获取选中文本中已应用的class ID集合
     */
    private getAppliedClasses(text: string): Set<string> {
        const appliedClasses = new Set<string>();
        
        // 匹配所有 ${CLASS_PREFIX}xxx 的class
        const classRegex = new RegExp(`class="${this.CLASS_PREFIX}([^"]+)"`, 'g');
        let match;
        while ((match = classRegex.exec(text)) !== null) {
            const classId = match[1];
            if (classId) {
                appliedClasses.add(classId);
            }
        }
        
        return appliedClasses;
    }

    /**
     * 移除文本样式类
     */
    private removeTextClass(editor: Editor) {
        const targetInfo = this.getTargetText(editor);
        if (!targetInfo) {
            new Notice(t().noticeCannotDetermineTarget);
            return;
        }

        const { text, from, to } = targetInfo;

        // 匹配span标签
        const spanRegex = new RegExp(`<span class="${this.CLASS_PREFIX}[^"]*">(.+?)<\\/span>`, 'gs');

        // 移除所有 ${CLASS_PREFIX} span标签，保留内容
        const newText = text.replace(spanRegex, "$1");

        if (newText === text) {
            if (this.settings.showNotifications) {
                new Notice(t().noticeNoStyleApplied);
            }
            return;
        }

        // 替换目标范围的文本
        editor.replaceRange(newText, from, to);
        if (this.settings.showNotifications) {
            new Notice(t().noticeRemoved);
        }
    }
}
