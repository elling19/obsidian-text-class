/**
 * 多语言支持模块
 */

export interface Translations {
    // 设置页面
    settingsTitle: string;
    settingsDesc: string;
    addStyle: string;
    noStyles: string;
    columnName: string;
    columnPreview: string;
    columnEnabled: string;
    columnActions: string;
    
    // 编辑模态框
    editModalTitle: string;
    labelName: string;
    labelCssStyle: string;
    placeholderName: string;
    placeholderCss: string;
    previewText: string;
    buttonCancel: string;
    buttonSave: string;
    buttonDelete: string;
    
    // 编辑模式切换
    modeNormal: string;
    modeDeveloper: string;
    modeToggleHint: string;
    
    // 可视化样式编辑器 - 分组标题
    groupText: string;
    groupBackground: string;
    groupBorder: string;
    groupBox: string;
    
    // 可视化样式编辑器 - 字段标签
    labelBackgroundColor: string;
    labelBackgroundOpacity: string;
    labelTextColor: string;
    labelFontSize: string;
    labelFontBold: string;
    labelFontItalic: string;
    labelTextDecoration: string;
    labelPadding: string;
    labelPaddingTop: string;
    labelPaddingRight: string;
    labelPaddingBottom: string;
    labelPaddingLeft: string;
    labelBorderRadius: string;
    labelBorderRadiusTopLeft: string;
    labelBorderRadiusTopRight: string;
    labelBorderRadiusBottomRight: string;
    labelBorderRadiusBottomLeft: string;
    labelBorderStyle: string;
    labelBorderSize: string;
    labelBorderColor: string;
    placeholderPixel: string;
    hintBackgroundColor: string;
    hintTextColor: string;
    hintFontSize: string;
    hintPadding: string;
    hintBorderRadius: string;
    
    // 删除确认
    confirmDeleteTitle: string;
    confirmDeleteMessage: (name: string) => string;
    
    // 右键菜单
    menuApplyStyle: string;
    menuRemoveStyle: string;
    menuAddStyleHint: string;
    
    // 通知消息
    noticeApplied: (name: string) => string;
    noticeRemoved: string;
    noticeNoStyleApplied: string;
    noticeCannotDetermineTarget: string;
    noticeNoStyles: string;
    noticeEnterName: string;
    noticeEnterCss: string;
    noticeEnterStyle: string;
    
    // 命令
    commandApplyStyle: string;
    commandRemoveStyle: string;
    
    // 提示
    tooltipEdit: string;
    tooltipDelete: string;
    
    // 开发者模式设置
    settingDeveloperMode: string;
    settingDeveloperModeDesc: string;
    
    // 通知设置
    settingShowNotifications: string;
    settingShowNotificationsDesc: string;
    
    // 关于
    aboutFeedback: string;
    aboutFeedbackDesc: string;
}

const zh: Translations = {
    // 设置页面
    settingsTitle: "样式类管理",
    settingsDesc: "管理可应用到选中文本的 CSS 样式类",
    addStyle: "添加样式",
    noStyles: "暂无样式类",
    columnName: "名称",
    columnPreview: "预览",
    columnEnabled: "启用",
    columnActions: "操作",
    
    // 编辑模态框
    editModalTitle: "编辑样式类",
    labelName: "名称",
    labelCssStyle: "CSS样式",
    placeholderName: "例如: 黄色高亮",
    placeholderCss: "例如: background-color: yellow;",
    previewText: "预览文本",
    buttonCancel: "取消",
    buttonSave: "保存",
    buttonDelete: "删除",
    
    // 编辑模式切换
    modeNormal: "普通模式",
    modeDeveloper: "开发者模式",
    modeToggleHint: "切换到开发者模式可直接编辑 CSS",
    
    // 可视化样式编辑器 - 分组标题
    groupText: "文本",
    groupBackground: "背景",
    groupBorder: "边框",
    groupBox: "盒模型",
    
    // 可视化样式编辑器 - 字段标签
    labelBackgroundColor: "背景颜色",
    labelBackgroundOpacity: "透明度",
    labelTextColor: "字体颜色",
    labelFontSize: "字体大小",
    labelFontBold: "加粗",
    labelFontItalic: "斜体",
    labelTextDecoration: "文本装饰",
    labelPadding: "内边距",
    labelPaddingTop: "上",
    labelPaddingRight: "右",
    labelPaddingBottom: "下",
    labelPaddingLeft: "左",
    labelBorderRadius: "圆角",
    labelBorderRadiusTopLeft: "左上",
    labelBorderRadiusTopRight: "右上",
    labelBorderRadiusBottomRight: "右下",
    labelBorderRadiusBottomLeft: "左下",
    labelBorderStyle: "边框样式",
    labelBorderSize: "边框宽度",
    labelBorderColor: "边框颜色",
    placeholderPixel: "像素值",
    hintBackgroundColor: "设置文本背景颜色",
    hintTextColor: "设置文本颜色",
    hintFontSize: "设置字体大小（像素）",
    hintPadding: "设置内边距（像素）",
    hintBorderRadius: "设置圆角（像素）",
    
    // 删除确认
    confirmDeleteTitle: "确认删除",
    confirmDeleteMessage: (name: string) => `确定要删除「${name}」吗？`,
    
    // 右键菜单
    menuApplyStyle: "应用样式",
    menuRemoveStyle: "移除样式",
    menuAddStyleHint: "应用样式 (点击添加)",
    
    // 通知消息
    noticeApplied: (name: string) => `已应用样式: ${name}`,
    noticeRemoved: "已移除文本样式",
    noticeNoStyleApplied: "目标文本没有应用样式",
    noticeCannotDetermineTarget: "无法确定目标文本",
    noticeNoStyles: "暂无样式类，请先在设置中添加",
    noticeEnterName: "请输入名称",
    noticeEnterCss: "请输入CSS样式",
    noticeEnterStyle: "请至少设置一个样式属性",
    
    // 命令
    commandApplyStyle: "应用文本样式",
    commandRemoveStyle: "移除文本样式",
    
    // 提示
    tooltipEdit: "编辑",
    tooltipDelete: "删除",
    
    // 开发者模式设置
    settingDeveloperMode: "开发者模式",
    settingDeveloperModeDesc: "⚠️ 警告：只有拥有前端开发基础的用户才应该开启此选项。开启后可在样式编辑页面直接编写 CSS 代码。",
    
    // 通知设置
    settingShowNotifications: "显示操作通知",
    settingShowNotificationsDesc: "在应用或移除样式时显示通知消息。",
    
    // 关于
    aboutFeedback: "反馈与建议",
    aboutFeedbackDesc: "如果您发现问题或有任何建议，请在 GitHub Issues 中提交。",
};

const en: Translations = {
    // 设置页面
    settingsTitle: "Style Class Management",
    settingsDesc: "Manage CSS style classes to apply to selected text",
    addStyle: "Add style",
    noStyles: "No style classes yet",
    columnName: "Name",
    columnPreview: "Preview",
    columnEnabled: "Enabled",
    columnActions: "Actions",
    
    // 编辑模态框
    editModalTitle: "Edit Style Class",
    labelName: "Name",
    labelCssStyle: "CSS Style",
    placeholderName: "e.g., Yellow Highlight",
    placeholderCss: "e.g., background-color: yellow;",
    previewText: "Preview Text",
    buttonCancel: "Cancel",
    buttonSave: "Save",
    buttonDelete: "Delete",
    
    // 编辑模式切换
    modeNormal: "Normal Mode",
    modeDeveloper: "Developer Mode",
    modeToggleHint: "Switch to developer mode for direct CSS editing",
    
    // 可视化样式编辑器 - 分组标题
    groupText: "Text",
    groupBackground: "Background",
    groupBorder: "Border",
    groupBox: "Box",
    
    // 可视化样式编辑器 - 字段标签
    labelBackgroundColor: "Background Color",
    labelBackgroundOpacity: "Opacity",
    labelTextColor: "Text Color",
    labelFontSize: "Font Size",
    labelFontBold: "Bold",
    labelFontItalic: "Italic",
    labelTextDecoration: "Text Decoration",
    labelPadding: "Padding",
    labelPaddingTop: "Top",
    labelPaddingRight: "Right",
    labelPaddingBottom: "Bottom",
    labelPaddingLeft: "Left",
    labelBorderRadius: "Border Radius",
    labelBorderRadiusTopLeft: "Top Left",
    labelBorderRadiusTopRight: "Top Right",
    labelBorderRadiusBottomRight: "Bottom Right",
    labelBorderRadiusBottomLeft: "Bottom Left",
    labelBorderStyle: "Border Style",
    labelBorderSize: "Border Width",
    labelBorderColor: "Border Color",
    placeholderPixel: "pixels",
    hintBackgroundColor: "Set text background color",
    hintTextColor: "Set text color",
    hintFontSize: "Set font size (pixels)",
    hintPadding: "Set padding (pixels)",
    hintBorderRadius: "Set border radius (pixels)",
    
    // 删除确认
    confirmDeleteTitle: "Confirm Delete",
    confirmDeleteMessage: (name: string) => `Are you sure you want to delete "${name}"?`,
    
    // 右键菜单
    menuApplyStyle: "Apply style",
    menuRemoveStyle: "Remove style",
    menuAddStyleHint: "Apply style (click to add)",
    
    // 通知消息
    noticeApplied: (name: string) => `Style applied: ${name}`,
    noticeRemoved: "Text style removed",
    noticeNoStyleApplied: "No style applied to target text",
    noticeCannotDetermineTarget: "Cannot determine target text",
    noticeNoStyles: "No style classes, please add in settings first",
    noticeEnterName: "Please enter a name",
    noticeEnterCss: "Please enter CSS style",
    noticeEnterStyle: "Please set at least one style property",
    
    // 命令
    commandApplyStyle: "Apply text style",
    commandRemoveStyle: "Remove text style",
    
    // 提示
    tooltipEdit: "Edit",
    tooltipDelete: "Delete",
    
    // 开发者模式设置
    settingDeveloperMode: "Developer Mode",
    settingDeveloperModeDesc: "⚠️ Warning: Only users with frontend development experience should enable this option. When enabled, you can directly write CSS code in the style editor.",
    
    // Notification settings
    settingShowNotifications: "Show Notifications",
    settingShowNotificationsDesc: "Show notification messages when applying or removing styles.",
    
    // About
    aboutFeedback: "Feedback & Suggestions",
    aboutFeedbackDesc: "If you find any issues or have suggestions, please submit them on GitHub Issues.",
};

const ja: Translations = {
    // 設定ページ
    settingsTitle: "スタイルクラス管理",
    settingsDesc: "選択したテキストに適用するCSSスタイルクラスを管理",
    addStyle: "スタイルを追加",
    noStyles: "スタイルクラスがありません",
    columnName: "名前",
    columnPreview: "プレビュー",
    columnEnabled: "有効",
    columnActions: "操作",
    
    // 編集モーダル
    editModalTitle: "スタイルクラスを編集",
    labelName: "名前",
    labelCssStyle: "CSSスタイル",
    placeholderName: "例: 黄色ハイライト",
    placeholderCss: "例: background-color: yellow;",
    previewText: "プレビューテキスト",
    buttonCancel: "キャンセル",
    buttonSave: "保存",
    buttonDelete: "削除",
    
    // 編集モード切替
    modeNormal: "通常モード",
    modeDeveloper: "開発者モード",
    modeToggleHint: "開発者モードでCSSを直接編集",
    
    // ビジュアルスタイルエディタ - グループタイトル
    groupText: "テキスト",
    groupBackground: "背景",
    groupBorder: "ボーダー",
    groupBox: "ボックス",
    
    // ビジュアルスタイルエディタ - フィールドラベル
    labelBackgroundColor: "背景色",
    labelBackgroundOpacity: "透明度",
    labelTextColor: "文字色",
    labelFontSize: "フォントサイズ",
    labelFontBold: "太字",
    labelFontItalic: "斜体",
    labelTextDecoration: "テキスト装飾",
    labelPadding: "内側余白",
    labelPaddingTop: "上",
    labelPaddingRight: "右",
    labelPaddingBottom: "下",
    labelPaddingLeft: "左",
    labelBorderRadius: "角丸",
    labelBorderRadiusTopLeft: "左上",
    labelBorderRadiusTopRight: "右上",
    labelBorderRadiusBottomRight: "右下",
    labelBorderRadiusBottomLeft: "左下",
    labelBorderStyle: "ボーダースタイル",
    labelBorderSize: "ボーダー幅",
    labelBorderColor: "ボーダー色",
    placeholderPixel: "ピクセル",
    hintBackgroundColor: "テキストの背景色を設定",
    hintTextColor: "テキストの色を設定",
    hintFontSize: "フォントサイズを設定（ピクセル）",
    hintPadding: "内側余白を設定（ピクセル）",
    hintBorderRadius: "角丸を設定（ピクセル）",
    
    // 削除確認
    confirmDeleteTitle: "削除の確認",
    confirmDeleteMessage: (name: string) => `「${name}」を削除してもよろしいですか？`,
    
    // 右クリックメニュー
    menuApplyStyle: "スタイルを適用",
    menuRemoveStyle: "スタイルを削除",
    menuAddStyleHint: "スタイルを適用 (クリックして追加)",
    
    // 通知メッセージ
    noticeApplied: (name: string) => `スタイルを適用しました: ${name}`,
    noticeRemoved: "テキストスタイルを削除しました",
    noticeNoStyleApplied: "対象テキストにスタイルが適用されていません",
    noticeCannotDetermineTarget: "対象テキストを特定できません",
    noticeNoStyles: "スタイルクラスがありません。設定で追加してください",
    noticeEnterName: "名前を入力してください",
    noticeEnterCss: "CSSスタイルを入力してください",
    noticeEnterStyle: "少なくとも1つのスタイル属性を設定してください",
    
    // コマンド
    commandApplyStyle: "テキストスタイルを適用",
    commandRemoveStyle: "テキストスタイルを削除",
    
    // ツールチップ
    tooltipEdit: "編集",
    tooltipDelete: "削除",
    
    // 開発者モード設定
    settingDeveloperMode: "開発者モード",
    settingDeveloperModeDesc: "⚠️ 警告：フロントエンド開発の経験があるユーザーのみがこのオプションを有効にしてください。有効にすると、スタイルエディターでCSSコードを直接編集できます。",
    
    // 通知設定
    settingShowNotifications: "通知を表示",
    settingShowNotificationsDesc: "スタイルの適用または削除時に通知メッセージを表示します。",
    
    // について
    aboutFeedback: "フィードバック・提案",
    aboutFeedbackDesc: "問題を発見した場合や提案がある場合は、GitHub Issues に投稿してください。",
};

const zhTW: Translations = {
    // 設定頁面
    settingsTitle: "樣式類別管理",
    settingsDesc: "管理可套用到選取文字的 CSS 樣式類別",
    addStyle: "新增樣式",
    noStyles: "暫無樣式類別",
    columnName: "名稱",
    columnPreview: "預覽",
    columnEnabled: "啟用",
    columnActions: "操作",
    
    // 編輯對話框
    editModalTitle: "編輯樣式類別",
    labelName: "名稱",
    labelCssStyle: "CSS樣式",
    placeholderName: "例如: 黃色螢光筆",
    placeholderCss: "例如: background-color: yellow;",
    previewText: "預覽文字",
    buttonCancel: "取消",
    buttonSave: "儲存",
    buttonDelete: "刪除",
    
    // 編輯模式切換
    modeNormal: "一般模式",
    modeDeveloper: "開發者模式",
    modeToggleHint: "切換到開發者模式可直接編輯 CSS",
    
    // 視覺化樣式編輯器 - 分組標題
    groupText: "文字",
    groupBackground: "背景",
    groupBorder: "邊框",
    groupBox: "盒模型",
    
    // 視覺化樣式編輯器 - 欄位標籤
    labelBackgroundColor: "背景顏色",
    labelBackgroundOpacity: "透明度",
    labelTextColor: "字型顏色",
    labelFontSize: "字型大小",
    labelFontBold: "粗體",
    labelFontItalic: "斜體",
    labelTextDecoration: "文字裝飾",
    labelPadding: "內邊距",
    labelPaddingTop: "上",
    labelPaddingRight: "右",
    labelPaddingBottom: "下",
    labelPaddingLeft: "左",
    labelBorderRadius: "圓角",
    labelBorderRadiusTopLeft: "左上",
    labelBorderRadiusTopRight: "右上",
    labelBorderRadiusBottomRight: "右下",
    labelBorderRadiusBottomLeft: "左下",
    labelBorderStyle: "邊框樣式",
    labelBorderSize: "邊框寬度",
    labelBorderColor: "邊框顏色",
    placeholderPixel: "像素值",
    hintBackgroundColor: "設定文字背景顏色",
    hintTextColor: "設定文字顏色",
    hintFontSize: "設定字型大小（像素）",
    hintPadding: "設定內邊距（像素）",
    hintBorderRadius: "設定圓角（像素）",
    
    // 刪除確認
    confirmDeleteTitle: "確認刪除",
    confirmDeleteMessage: (name: string) => `確定要刪除「${name}」嗎？`,
    
    // 右鍵選單
    menuApplyStyle: "套用樣式",
    menuRemoveStyle: "移除樣式",
    menuAddStyleHint: "套用樣式 (點擊新增)",
    
    // 通知訊息
    noticeApplied: (name: string) => `已套用樣式: ${name}`,
    noticeRemoved: "已移除文字樣式",
    noticeNoStyleApplied: "目標文字沒有套用樣式",
    noticeCannotDetermineTarget: "無法確定目標文字",
    noticeNoStyles: "暫無樣式類別，請先在設定中新增",
    noticeEnterName: "請輸入名稱",
    noticeEnterCss: "請輸入CSS樣式",
    noticeEnterStyle: "請至少設定一個樣式屬性",
    
    // 命令
    commandApplyStyle: "套用文字樣式",
    commandRemoveStyle: "移除文字樣式",
    
    // 提示
    tooltipEdit: "編輯",
    tooltipDelete: "刪除",
    
    // 開發者模式設定
    settingDeveloperMode: "開發者模式",
    settingDeveloperModeDesc: "⚠️ 警告：只有擁有前端開發基礎的使用者才應該開啟此選項。開啟後可在樣式編輯頁面直接撰寫 CSS 程式碼。",
    
    // 通知設定
    settingShowNotifications: "顯示操作通知",
    settingShowNotificationsDesc: "在套用或移除樣式時顯示通知訊息。",
    
    // 關於
    aboutFeedback: "意見回饋與建議",
    aboutFeedbackDesc: "如果您發現問題或有任何建議，請在 GitHub Issues 中提交。",
};

const translations: Record<string, Translations> = {
    zh,
    "zh-cn": zh,
    "zh-tw": zhTW,
    en,
    ja,
};

let currentLocale: string = "en";
let currentTranslations: Translations = en;

/**
 * 初始化语言设置
 */
export function initI18n(locale: string): void {
    currentLocale = locale.toLowerCase();
    
    // 尝试精确匹配
    const exactMatch = translations[currentLocale];
    if (exactMatch) {
        currentTranslations = exactMatch;
        return;
    }
    
    // 尝试匹配语言前缀
    const langPrefix = currentLocale.split("-")[0];
    if (langPrefix) {
        const prefixMatch = translations[langPrefix];
        if (prefixMatch) {
            currentTranslations = prefixMatch;
            return;
        }
    }
    
    // 默认英文
    currentTranslations = en;
}

/**
 * 获取当前翻译
 */
export function t(): Translations {
    return currentTranslations;
}

/**
 * 获取当前语言
 */
export function getCurrentLocale(): string {
    return currentLocale;
}
