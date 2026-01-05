import { App, ButtonComponent, ColorComponent, DropdownComponent, Modal, Notice, PluginSettingTab, Setting, SliderComponent, TextComponent, ToggleComponent, setIcon } from "obsidian";
import TextClassPlugin from "./main";
import { TextClass } from "./types";
import { t } from "./i18n";
import { cssToVisualStyle, visualStyleToCSS, VisualStyleProps, colorToHex, FourSideValue, BORDER_STYLE_OPTIONS, TEXT_DECORATION_OPTIONS, BorderStyleType, TextDecorationType } from "./css-parser";

/**
 * 生成唯一ID
 */
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * 编辑/添加 Class 的模态框
 */
export class EditClassModal extends Modal {
    private textClass: TextClass | null;
    private onSave: (textClass: TextClass) => void;
    private formData: TextClass;
    private visualProps: VisualStyleProps;
    private previewEl: HTMLElement | null = null;
    private editorContainer: HTMLElement | null = null;
    private developerModeEnabled: boolean;
    
    // 用于动态更新禁用状态的元素引用
    private borderSizeSetting: HTMLElement | null = null;
    private borderColorSetting: HTMLElement | null = null;

    constructor(app: App, textClass: TextClass | null, onSave: (textClass: TextClass) => void, developerModeEnabled: boolean = false) {
        super(app);
        this.textClass = textClass;
        this.onSave = onSave;
        this.developerModeEnabled = developerModeEnabled;
        
        // 初始化表单数据
        this.formData = textClass ? { ...textClass } : {
            id: generateId(),
            name: "",
            cssStyle: "",
            enabled: true
        };
        
        // 解析现有 CSS 为可视化属性
        this.visualProps = cssToVisualStyle(this.formData.cssStyle);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("text-class-modal");

        this.titleEl.setText(t().editModalTitle);

        // 类名输入
        new Setting(contentEl)
            .setName(t().labelName)
            .addText((text: TextComponent) => {
                text.setPlaceholder(t().placeholderName)
                    .setValue(this.formData.name)
                    .onChange((value) => {
                        this.formData.name = value;
                    });
            });

        // 滚动区域容器
        const scrollContainer = contentEl.createDiv({ cls: "text-class-scroll-container" });
        
        // 样式编辑器容器（在滚动区域内）
        this.editorContainer = scrollContainer.createDiv({ cls: "text-class-editor-container" });
        this.renderEditor();

        // 固定底部区域
        const fixedBottom = contentEl.createDiv({ cls: "text-class-fixed-bottom" });

        // 预览区域
        const previewContainer = fixedBottom.createDiv({ cls: "text-class-preview-container" });
        this.previewEl = previewContainer.createEl("span", {
            text: t().previewText,
            cls: "text-class-preview"
        });
        this.updatePreview();

        // 按钮区域
        new Setting(fixedBottom)
            .addButton((btn: ButtonComponent) => {
                btn.setButtonText(t().buttonCancel)
                    .onClick(() => {
                        this.close();
                    });
            })
            .addButton((btn: ButtonComponent) => {
                btn.setButtonText(t().buttonSave)
                    .setCta()
                    .onClick(() => {
                        this.handleSave();
                    });
            });
    }

    /**
     * 渲染样式编辑器
     */
    private renderEditor() {
        if (!this.editorContainer) return;
        this.editorContainer.empty();

        if (this.developerModeEnabled) {
            this.renderDeveloperEditor();
        } else {
            this.renderNormalEditor();
        }
    }

    /**
     * 渲染普通用户模式编辑器
     */
    private renderNormalEditor() {
        if (!this.editorContainer) return;

        // ========== Text 分组 ==========
        this.renderGroupHeader(t().groupText);

        // 字体大小
        this.renderTextInput(
            t().labelFontSize,
            this.visualProps.fontSize,
            (value) => { this.visualProps.fontSize = value; }
        );

        // 字体颜色
        this.renderColorPicker(
            t().labelTextColor,
            this.visualProps.textColor,
            (value) => { this.visualProps.textColor = value; }
        );

        // 加粗
        this.renderToggle(
            t().labelFontBold,
            this.visualProps.fontBold,
            (value) => { this.visualProps.fontBold = value; }
        );

        // 斜体
        this.renderToggle(
            t().labelFontItalic,
            this.visualProps.fontItalic,
            (value) => { this.visualProps.fontItalic = value; }
        );

        // 文本装饰
        this.renderDropdown(
            t().labelTextDecoration,
            TEXT_DECORATION_OPTIONS as unknown as string[],
            this.visualProps.textDecoration,
            (value) => { this.visualProps.textDecoration = value as TextDecorationType; }
        );

        // ========== Background 分组 ==========
        this.renderGroupHeader(t().groupBackground);

        // 背景颜色
        this.renderColorPicker(
            t().labelBackgroundColor,
            this.visualProps.backgroundColor,
            (value) => { this.visualProps.backgroundColor = value; }
        );

        // 背景透明度
        this.renderSlider(
            t().labelBackgroundOpacity,
            this.visualProps.backgroundOpacity,
            0, 100, 1,
            (value) => { this.visualProps.backgroundOpacity = value; },
            this.visualProps.backgroundOpacity === 100
        );

        // ========== Border 分组 ==========
        this.renderGroupHeader(t().groupBorder);

        // 边框样式
        this.renderDropdown(
            t().labelBorderStyle,
            BORDER_STYLE_OPTIONS as unknown as string[],
            this.visualProps.borderStyle,
            (value) => { this.visualProps.borderStyle = value as BorderStyleType; },
            () => { this.updateBorderFieldsDisabledState(); }
        );

        // 边框宽度（当边框样式为none时禁用）
        this.borderSizeSetting = this.renderTextInput(
            t().labelBorderSize,
            this.visualProps.borderSize,
            (value) => { this.visualProps.borderSize = value; },
            this.visualProps.borderStyle === "none"
        );

        // 边框颜色（当边框样式为none时禁用）
        this.borderColorSetting = this.renderColorPicker(
            t().labelBorderColor,
            this.visualProps.borderColor,
            (value) => { this.visualProps.borderColor = value; },
            this.visualProps.borderStyle === "none"
        );

        // 圆角（四方位）
        this.renderFourSideInputs(
            t().labelBorderRadius,
            this.visualProps.borderRadius,
            (side, value) => { this.visualProps.borderRadius[side] = value; },
            {
                top: t().labelBorderRadiusTopLeft,
                right: t().labelBorderRadiusTopRight,
                bottom: t().labelBorderRadiusBottomRight,
                left: t().labelBorderRadiusBottomLeft,
            }
        );

        // ========== Box 分组 ==========
        this.renderGroupHeader(t().groupBox);

        // 内边距（四方位）
        this.renderFourSideInputs(
            t().labelPadding,
            this.visualProps.padding,
            (side, value) => { this.visualProps.padding[side] = value; },
            {
                top: t().labelPaddingTop,
                right: t().labelPaddingRight,
                bottom: t().labelPaddingBottom,
                left: t().labelPaddingLeft,
            }
        );
    }

    /**
     * 渲染分组标题
     */
    private renderGroupHeader(title: string) {
        if (!this.editorContainer) return;
        const header = this.editorContainer.createDiv({ cls: "text-class-group-header" });
        header.createEl("span", { text: title });
    }

    /**
     * 渲染颜色选择器
     * @returns 返回 setting 元素，用于后续更新禁用状态
     */
    private renderColorPicker(label: string, value: string, onChange: (value: string) => void, disabled: boolean = false): HTMLElement | null {
        if (!this.editorContainer) return null;
        
        const setting = new Setting(this.editorContainer).setName(label);
        let colorPicker: ColorComponent;
        let clearBtn: ButtonComponent;
        
        // 如果禁用，添加禁用样式
        if (disabled) {
            setting.settingEl.addClass("text-class-setting-disabled");
        }
        
        setting.addColorPicker((color: ColorComponent) => {
            colorPicker = color;
            const hexColor = colorToHex(value);
            color.setValue(hexColor || "#ffffff")
                .onChange((newValue) => {
                    // 检查 DOM 实际状态而非闭包变量
                    if (setting.settingEl.hasClass("text-class-setting-disabled")) return;
                    onChange(newValue);
                    this.syncAndUpdatePreview();
                    // 更新清除按钮状态
                    clearBtn?.setDisabled(!newValue);
                    // 移除透明样式
                    const pickerEl = (color as ColorComponent & { colorPickerEl?: HTMLElement }).colorPickerEl;
                    if (pickerEl) {
                        pickerEl.removeClass("text-class-color-empty");
                    }
                });
            if (!value) {
                const pickerEl = (color as ColorComponent & { colorPickerEl?: HTMLElement }).colorPickerEl;
                if (pickerEl) {
                    pickerEl.addClass("text-class-color-empty");
                }
            }
            // 如果禁用，禁用颜色选择器
            if (disabled) {
                const pickerEl = (color as ColorComponent & { colorPickerEl?: HTMLElement }).colorPickerEl;
                if (pickerEl) {
                    pickerEl.addClass("text-class-color-disabled");
                }
            }
        });
        
        setting.addButton((btn: ButtonComponent) => {
            clearBtn = btn;
            btn.setIcon("x")
                .setTooltip("Clear")
                .setDisabled(!value || disabled)
                .onClick(() => {
                    // 检查 DOM 实际状态而非闭包变量
                    if (setting.settingEl.hasClass("text-class-setting-disabled")) return;
                    onChange("");
                    this.syncAndUpdatePreview();
                    // 更新按钮状态
                    btn.setDisabled(true);
                    // 添加透明样式
                    const pickerEl = (colorPicker as ColorComponent & { colorPickerEl?: HTMLElement }).colorPickerEl;
                    if (pickerEl) {
                        pickerEl.addClass("text-class-color-empty");
                    }
                });
        });
        
        return setting.settingEl;
    }

    /**
     * 渲染文本输入框
     * @returns 返回 setting 元素，用于后续更新禁用状态
     */
    private renderTextInput(label: string, value: string, onChange: (value: string) => void, disabled: boolean = false): HTMLElement | null {
        if (!this.editorContainer) return null;
        
        let clearBtn: ButtonComponent;
        let textInput: TextComponent;
        const setting = new Setting(this.editorContainer)
            .setName(label)
            .addText((text: TextComponent) => {
                textInput = text;
                text.setPlaceholder(t().placeholderPixel)
                    .setValue(value)
                    .setDisabled(disabled)
                    .onChange((newValue) => {
                        // 检查 DOM 实际状态而非闭包变量
                        if (setting.settingEl.hasClass("text-class-setting-disabled")) return;
                        onChange(newValue);
                        this.syncAndUpdatePreview();
                        clearBtn?.setDisabled(!newValue);
                    });
                text.inputEl.type = "number";
                text.inputEl.min = "0";
            });
        
        // 如果禁用，添加禁用样式
        if (disabled) {
            setting.settingEl.addClass("text-class-setting-disabled");
        }
        
        setting.addButton((btn: ButtonComponent) => {
            clearBtn = btn;
            btn.setIcon("x")
                .setTooltip("Clear")
                .setDisabled(!value || disabled)
                .onClick(() => {
                    // 检查 DOM 实际状态而非闭包变量
                    if (setting.settingEl.hasClass("text-class-setting-disabled")) return;
                    onChange("");
                    this.syncAndUpdatePreview();
                    btn.setDisabled(true);
                    textInput?.setValue("");
                });
        });
        
        return setting.settingEl;
    }

    /**
     * 渲染开关
     */
    private renderToggle(label: string, value: boolean, onChange: (value: boolean) => void) {
        if (!this.editorContainer) return;
        
        let toggleComponent: ToggleComponent;
        let clearBtn: ButtonComponent;
        const setting = new Setting(this.editorContainer)
            .setName(label)
            .addToggle((toggle: ToggleComponent) => {
                toggleComponent = toggle;
                toggle.setValue(value)
                    .onChange((newValue) => {
                        onChange(newValue);
                        this.syncAndUpdatePreview();
                        clearBtn?.setDisabled(!newValue);
                    });
            });
        
        setting.addButton((btn: ButtonComponent) => {
            clearBtn = btn;
            btn.setIcon("x")
                .setTooltip("Clear")
                .setDisabled(!value)
                .onClick(() => {
                    onChange(false);
                    this.syncAndUpdatePreview();
                    btn.setDisabled(true);
                    toggleComponent?.setValue(false);
                });
        });
    }

    /**
     * 渲染下拉选择框
     */
    private renderDropdown(label: string, options: string[], value: string, onChange: (value: string) => void, onAfterChange?: () => void) {
        if (!this.editorContainer) return;
        
        let dropdownComponent: DropdownComponent;
        let clearBtn: ButtonComponent;
        const defaultValue = options[0] || "none";
        
        const setting = new Setting(this.editorContainer)
            .setName(label)
            .addDropdown((dropdown: DropdownComponent) => {
                dropdownComponent = dropdown;
                options.forEach(opt => {
                    dropdown.addOption(opt, opt);
                });
                dropdown.setValue(value)
                    .onChange((newValue) => {
                        onChange(newValue);
                        this.syncAndUpdatePreview();
                        clearBtn?.setDisabled(newValue === defaultValue);
                        onAfterChange?.();
                    });
            });
        
        setting.addButton((btn: ButtonComponent) => {
            clearBtn = btn;
            btn.setIcon("x")
                .setTooltip("Clear")
                .setDisabled(value === defaultValue)
                .onClick(() => {
                    onChange(defaultValue);
                    this.syncAndUpdatePreview();
                    btn.setDisabled(true);
                    dropdownComponent?.setValue(defaultValue);
                    onAfterChange?.();
                });
        });
    }

    /**
     * 渲染滑块
     */
    private renderSlider(label: string, value: number, min: number, max: number, step: number, onChange: (value: number) => void, isDefault: boolean) {
        if (!this.editorContainer) return;
        
        let sliderComponent: SliderComponent;
        let clearBtn: ButtonComponent;
        const setting = new Setting(this.editorContainer)
            .setName(label)
            .addSlider((slider: SliderComponent) => {
                sliderComponent = slider;
                slider.setLimits(min, max, step)
                    .setValue(value)
                    .setDynamicTooltip()
                    .onChange((newValue) => {
                        onChange(newValue);
                        this.syncAndUpdatePreview();
                        clearBtn?.setDisabled(newValue === 100);
                    });
            });
        
        setting.addButton((btn: ButtonComponent) => {
            clearBtn = btn;
            btn.setIcon("x")
                .setTooltip("Clear")
                .setDisabled(isDefault)
                .onClick(() => {
                    onChange(100);
                    this.syncAndUpdatePreview();
                    btn.setDisabled(true);
                    sliderComponent?.setValue(100);
                });
        });
    }

    /**
     * 渲染四方位输入框组
     */
    private renderFourSideInputs(
        label: string, 
        value: FourSideValue, 
        onChange: (side: keyof FourSideValue, value: string) => void,
        labels: { top: string; right: string; bottom: string; left: string }
    ) {
        if (!this.editorContainer) return;
        
        // 使用一行布局：标签 + 四个输入框 + 清除按钮
        const container = this.editorContainer.createDiv({ cls: "text-class-four-side-container" });
        
        // 标签
        container.createEl("span", { text: label, cls: "text-class-four-side-label" });
        
        // 保存所有输入框引用
        const inputs: Map<keyof FourSideValue, HTMLInputElement> = new Map();
        
        // 清除按钮（先创建引用，后面添加事件）
        const hasValue = value.top || value.right || value.bottom || value.left;
        const clearBtn = container.createEl("button", { 
            cls: "text-class-four-side-clear",
            attr: { type: "button" }
        });
        
        // 四个输入框
        const sides: (keyof FourSideValue)[] = ["top", "right", "bottom", "left"];
        sides.forEach((side) => {
            const sideContainer = container.createDiv({ cls: "text-class-four-side-input" });
            sideContainer.createEl("span", { text: labels[side], cls: "text-class-four-side-input-label" });
            const input = sideContainer.createEl("input", {
                type: "number",
                cls: "text-class-four-side-input-field",
                attr: { min: "0", placeholder: "0" }
            });
            input.value = value[side];
            inputs.set(side, input);
            input.addEventListener("input", () => {
                onChange(side, input.value);
                this.syncAndUpdatePreview();
                // 更新清除按钮状态
                const newHasValue = value.top || value.right || value.bottom || value.left;
                if (newHasValue) {
                    clearBtn.removeClass("text-class-btn-disabled");
                } else {
                    clearBtn.addClass("text-class-btn-disabled");
                }
            });
        });
        
        // 将清除按钮移到最后
        container.appendChild(clearBtn);
        setIcon(clearBtn, "x");
        clearBtn.title = "Clear";
        if (!hasValue) {
            clearBtn.addClass("text-class-btn-disabled");
        }
        clearBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            // 检查当前实际值
            const currentHasValue = value.top || value.right || value.bottom || value.left;
            if (currentHasValue) {
                // 清除所有值
                onChange("top", "");
                onChange("right", "");
                onChange("bottom", "");
                onChange("left", "");
                this.syncAndUpdatePreview();
                // 清除输入框显示
                inputs.forEach((input) => {
                    input.value = "";
                });
                // 更新按钮状态
                clearBtn.addClass("text-class-btn-disabled");
            }
        });
    }

    /**
     * 渲染开发者模式编辑器
     */
    private renderDeveloperEditor() {
        if (!this.editorContainer) return;
        
        // 开发者模式标签
        new Setting(this.editorContainer).setName(t().labelCssStyle);


        // 多行输入框
        const textArea = this.editorContainer.createEl("textarea", {
            cls: "text-class-input-textarea",
            attr: {
                placeholder: t().placeholderCss
            }
        });
        textArea.value = this.formData.cssStyle;
        textArea.addEventListener("input", () => {
            this.formData.cssStyle = textArea.value;
            this.updatePreview();
        });
    }

    /**
     * 同步可视化属性到 CSS 并更新预览
     */
    private syncAndUpdatePreview() {
        this.formData.cssStyle = visualStyleToCSS(this.visualProps);
        this.updatePreview();
    }

    /**
     * 更新边框相关字段的禁用状态
     */
    private updateBorderFieldsDisabledState() {
        const disabled = this.visualProps.borderStyle === "none";
        
        // 更新 borderSize 设置的禁用状态
        if (this.borderSizeSetting) {
            if (disabled) {
                this.borderSizeSetting.addClass("text-class-setting-disabled");
            } else {
                this.borderSizeSetting.removeClass("text-class-setting-disabled");
            }
            // 更新内部输入框的禁用状态
            const input = this.borderSizeSetting.querySelector("input");
            if (input) {
                input.disabled = disabled;
            }
            // 更新清除按钮（使用更通用的选择器）
            const btn = this.borderSizeSetting.querySelector("button.clickable-icon");
            if (btn) {
                if (disabled) {
                    (btn as HTMLButtonElement).disabled = true;
                    btn.addClass("is-disabled");
                } else {
                    (btn as HTMLButtonElement).disabled = !this.visualProps.borderSize;
                    if (this.visualProps.borderSize) {
                        btn.removeClass("is-disabled");
                    } else {
                        btn.addClass("is-disabled");
                    }
                }
            }
        }
        
        // 更新 borderColor 设置的禁用状态
        if (this.borderColorSetting) {
            if (disabled) {
                this.borderColorSetting.addClass("text-class-setting-disabled");
            } else {
                this.borderColorSetting.removeClass("text-class-setting-disabled");
            }
            // 更新颜色选择器的禁用状态 - 直接查找并更新所有相关元素
            if (disabled) {
                // 添加禁用类：找到 input[type='color'] 的父元素
                const colorInput = this.borderColorSetting.querySelector("input[type='color']");
                if (colorInput && colorInput.parentElement) {
                    colorInput.parentElement.addClass("text-class-color-disabled");
                }
            } else {
                // 移除禁用类：查找所有带有该类的元素
                const disabledEls = this.borderColorSetting.querySelectorAll(".text-class-color-disabled");
                disabledEls.forEach(el => el.removeClass("text-class-color-disabled"));
            }
            // 更新清除按钮（使用更通用的选择器）
            const btn = this.borderColorSetting.querySelector("button.clickable-icon");
            if (btn) {
                if (disabled) {
                    (btn as HTMLButtonElement).disabled = true;
                    btn.addClass("is-disabled");
                } else {
                    (btn as HTMLButtonElement).disabled = !this.visualProps.borderColor;
                    if (this.visualProps.borderColor) {
                        btn.removeClass("is-disabled");
                    } else {
                        btn.addClass("is-disabled");
                    }
                }
            }
        }
    }

    /**
     * 更新预览
     */
    private updatePreview() {
        if (this.previewEl) {
            this.previewEl.setAttribute("style", this.formData.cssStyle);
        }
    }

    /**
     * 处理保存
     */
    private handleSave() {
        if (!this.formData.name.trim()) {
            new Notice(t().noticeEnterName);
            return;
        }

        // 如果是普通模式，同步可视化属性到 CSS
        if (!this.developerModeEnabled) {
            this.formData.cssStyle = visualStyleToCSS(this.visualProps);
        }

        if (!this.formData.cssStyle.trim()) {
            new Notice(!this.developerModeEnabled ? t().noticeEnterStyle : t().noticeEnterCss);
            return;
        }

        this.onSave(this.formData);
        this.close();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * 插件设置页面
 */
export class TextClassSettingTab extends PluginSettingTab {
    plugin: TextClassPlugin;

    constructor(app: App, plugin: TextClassPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass("text-class-settings");

        // 标题和添加按钮
        new Setting(containerEl)
            .setName(t().settingsTitle)
            .setDesc(t().settingsDesc)
            .addButton((btn: ButtonComponent) => {
                btn.setButtonText(t().addStyle)
                    .setCta()
                    .onClick(() => {
                        new EditClassModal(this.app, null, (newClass) => {
                            this.plugin.settings.classes.push(newClass);
                            void this.plugin.saveSettings().then(() => {
                                this.plugin.updateStyles();
                                this.display();
                            });
                        }, this.plugin.settings.developerMode).open();
                    });
            });

        // 标题行
        const headerEl = containerEl.createDiv({ cls: "text-class-header" });
        headerEl.createEl("span", { text: t().columnName, cls: "text-class-col-name" });
        headerEl.createEl("span", { text: t().columnPreview, cls: "text-class-col-preview" });
        headerEl.createEl("span", { text: t().columnEnabled, cls: "text-class-col-enabled" });
        headerEl.createEl("span", { text: t().columnActions, cls: "text-class-col-actions" });

        // 样式列表
        const listEl = containerEl.createDiv({ cls: "text-class-list" });

        if (this.plugin.settings.classes.length === 0) {
            listEl.createEl("p", {
                text: t().noStyles,
                cls: "text-class-empty-hint"
            });
        } else {
            this.plugin.settings.classes.forEach((textClass, index) => {
                this.renderClassItem(listEl, textClass, index);
            });
        }

        // 通知设置
        new Setting(containerEl)
            .setName(t().settingShowNotifications)
            .setDesc(t().settingShowNotificationsDesc)
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.showNotifications)
                    .onChange((value) => {
                        this.plugin.settings.showNotifications = value;
                        void this.plugin.saveSettings();
                    });
            });

        // 开发者模式设置
        new Setting(containerEl)
            .setName(t().settingDeveloperMode)
            .setDesc(t().settingDeveloperModeDesc)
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.developerMode)
                    .onChange((value) => {
                        this.plugin.settings.developerMode = value;
                        void this.plugin.saveSettings();
                    });
            });

        // 反馈地址
        new Setting(containerEl)
            .setName(t().aboutFeedback)
            .setDesc(t().aboutFeedbackDesc)
            .addButton((btn: ButtonComponent) => {
                btn.setButtonText("GitHub issues")
                    .onClick(() => {
                        window.open("https://github.com/elling19/obsidian-text-class/issues", "_blank");
                    });
            });
    }

    private draggedIndex: number | null = null;
    private touchStartY: number = 0;
    private touchedElement: HTMLElement | null = null;

    private renderClassItem(container: HTMLElement, textClass: TextClass, index: number) {
        const itemEl = container.createDiv({ cls: "text-class-item" });
        
        itemEl.dataset.index = String(index);

        // 桌面端拖拽结束
        itemEl.addEventListener("dragend", () => {
            this.draggedIndex = null;
            itemEl.removeClass("text-class-dragging");
            // 移除所有拖拽相关样式
            container.querySelectorAll(".text-class-item").forEach(el => {
                el.removeClass("text-class-drag-over");
            });
        });

        // 桌面端拖拽经过
        itemEl.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "move";
            }
            if (this.draggedIndex !== null && this.draggedIndex !== index) {
                itemEl.addClass("text-class-drag-over");
            }
        });

        // 拖拽离开
        itemEl.addEventListener("dragleave", () => {
            itemEl.removeClass("text-class-drag-over");
        });

        // 放置
        itemEl.addEventListener("drop", (e) => {
            e.preventDefault();
            itemEl.removeClass("text-class-drag-over");
            
            if (this.draggedIndex !== null && this.draggedIndex !== index) {
                // 重新排序
                const classes = this.plugin.settings.classes;
                const draggedItem = classes[this.draggedIndex];
                if (draggedItem) {
                    classes.splice(this.draggedIndex, 1);
                    classes.splice(index, 0, draggedItem);
                    
                    void this.plugin.saveSettings().then(() => {
                        this.display();
                    });
                }
            }
        });

        // 可拖拽的名称区域（包含拖拽手柄和名称）
        const draggableArea = itemEl.createDiv({ cls: "text-class-draggable-area" });
        draggableArea.setAttribute("draggable", "true");

        // 桌面端拖拽开始（绑定到可拖拽区域）
        draggableArea.addEventListener("dragstart", (e) => {
            this.draggedIndex = index;
            itemEl.addClass("text-class-dragging");
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = "move";
            }
        });

        // 拖拽手柄
        const dragHandle = draggableArea.createEl("span", { 
            text: "⋮⋮",
            cls: "text-class-drag-handle" 
        });

        // 移动端触摸事件支持
        this.setupTouchDrag(dragHandle, itemEl, container, index);

        // 名称列
        draggableArea.createEl("span", { text: textClass.name, cls: "text-class-col-name" });

        // 预览列
        const previewCell = itemEl.createDiv({ cls: "text-class-col-preview" });
        const previewEl = previewCell.createEl("span", {
            text: t().columnPreview,
            cls: "text-class-preview-text"
        });
        previewEl.setAttribute("style", textClass.cssStyle);

        // 开关列
        const toggleCell = itemEl.createDiv({ cls: "text-class-col-enabled" });
        const toggleComponent = new ToggleComponent(toggleCell);
        const isEnabled = textClass.enabled !== false;
        toggleComponent.setValue(isEnabled)
            .onChange((value) => {
                const item = this.plugin.settings.classes[index];
                if (item) {
                    item.enabled = value;
                    void this.plugin.saveSettings().then(() => {
                        this.plugin.updateStyles();
                    });
                }
            });

        // 操作按钮列
        const actionsCell = itemEl.createDiv({ cls: "text-class-col-actions" });

        // 编辑按钮
        new ButtonComponent(actionsCell)
            .setIcon("pencil")
            .setTooltip(t().tooltipEdit)
            .onClick(() => {
                this.editItem(textClass, index);
            });

        // 删除按钮
        new ButtonComponent(actionsCell)
            .setIcon("trash")
            .setTooltip(t().tooltipDelete)
            .setWarning()
            .onClick(() => {
                this.confirmDelete(textClass, index);
            });
    }

    /**
     * 设置触摸拖拽支持（移动端）
     */
    private setupTouchDrag(dragHandle: HTMLElement, itemEl: HTMLElement, container: HTMLElement, index: number) {
        let touchStartY = 0;
        let isDragging = false;

        dragHandle.addEventListener("touchstart", (e) => {
            const touch = e.touches[0];
            if (touch) {
                touchStartY = touch.clientY;
                this.draggedIndex = index;
                this.touchedElement = itemEl;
                isDragging = false;
            }
        }, { passive: true });

        dragHandle.addEventListener("touchmove", (e) => {
            if (this.draggedIndex === null || !this.touchedElement) return;
            
            const touch = e.touches[0];
            if (!touch) return;

            // 检测是否真正开始拖拽（移动超过10px）
            if (!isDragging && Math.abs(touch.clientY - touchStartY) > 10) {
                isDragging = true;
                this.touchedElement.addClass("text-class-dragging");
            }

            if (!isDragging) return;

            e.preventDefault();

            // 查找触摸位置下的元素
            const items = container.querySelectorAll(".text-class-item");
            items.forEach(item => {
                item.removeClass("text-class-drag-over");
                const rect = item.getBoundingClientRect();
                if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    const targetIndex = parseInt((item as HTMLElement).dataset.index || "-1", 10);
                    if (targetIndex !== -1 && targetIndex !== this.draggedIndex) {
                        item.addClass("text-class-drag-over");
                    }
                }
            });
        }, { passive: false });

        dragHandle.addEventListener("touchend", (e) => {
            if (this.draggedIndex === null || !isDragging) {
                this.cleanupTouchDrag(container);
                return;
            }

            const touch = e.changedTouches[0];
            if (!touch) {
                this.cleanupTouchDrag(container);
                return;
            }

            // 查找放置目标
            const items = container.querySelectorAll(".text-class-item");
            let targetIndex = -1;
            
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    targetIndex = parseInt((item as HTMLElement).dataset.index || "-1", 10);
                }
            });

            // 执行排序
            if (targetIndex !== -1 && targetIndex !== this.draggedIndex) {
                const classes = this.plugin.settings.classes;
                const draggedItem = classes[this.draggedIndex];
                if (draggedItem) {
                    classes.splice(this.draggedIndex, 1);
                    classes.splice(targetIndex, 0, draggedItem);
                    
                    void this.plugin.saveSettings().then(() => {
                        this.display();
                    });
                }
            }

            this.cleanupTouchDrag(container);
        });

        dragHandle.addEventListener("touchcancel", () => {
            this.cleanupTouchDrag(container);
        });
    }

    /**
     * 清理触摸拖拽状态
     */
    private cleanupTouchDrag(container: HTMLElement) {
        this.draggedIndex = null;
        if (this.touchedElement) {
            this.touchedElement.removeClass("text-class-dragging");
            this.touchedElement = null;
        }
        container.querySelectorAll(".text-class-item").forEach(el => {
            el.removeClass("text-class-drag-over");
        });
    }

    private editItem(textClass: TextClass, index: number) {
        new EditClassModal(this.app, textClass, (updatedClass) => {
            this.plugin.settings.classes[index] = updatedClass;
            void this.plugin.saveSettings().then(() => {
                this.plugin.updateStyles();
                this.display();
            });
        }, this.plugin.settings.developerMode).open();
    }

    private confirmDelete(textClass: TextClass, index: number) {
        const modal = new Modal(this.app);
        modal.titleEl.setText(t().confirmDeleteTitle);
        modal.contentEl.createEl("p", { text: t().confirmDeleteMessage(textClass.name) });
        
        new Setting(modal.contentEl)
            .addButton((btn: ButtonComponent) => {
                btn.setButtonText(t().buttonCancel)
                    .onClick(() => {
                        modal.close();
                    });
            })
            .addButton((btn: ButtonComponent) => {
                btn.setButtonText(t().buttonDelete)
                    .setWarning()
                    .onClick(() => {
                        this.plugin.settings.classes.splice(index, 1);
                        void this.plugin.saveSettings().then(() => {
                            this.plugin.updateStyles();
                            this.display();
                        });
                        modal.close();
                    });
            });
        
        modal.open();
    }
}
