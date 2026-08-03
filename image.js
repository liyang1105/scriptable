const url =
  "https://home.liyang.dev/api/camera_proxy/camera.desktop_uhvo86j_screenshot";
const token = "MY_HOMEASSISTANT_TOKEN";

let req = new Request(url);
req.headers = { Authorization: "Bearer " + token };
let img = await req.loadImage();

let widget = new ListWidget();
widget.backgroundColor = new Color("#1c1c1e"); // 深色背景

// 1. 移除邊距：讓圖片可以頂到最邊邊
widget.setPadding(0, 0, 0, 0);

// 2. 直接加入圖片 (不需要 addStack 或 addSpacer)
let wImg = widget.addImage(img);

// 3. 關鍵設定：置中與縮放
wImg.resizable = true;
wImg.centerAlignImage(); // 強制圖片置中

// --- 請在此選擇模式 ---

// 模式 A：【完整顯示】(推薦用於截圖)
// 圖片會保持比例縮放至最大，確保整張圖都看得到，不足的地方會顯示背景色。
wImg.applyFittingContentMode();

// 模式 B：【填滿裁切】(若您不想看到任何黑邊)
// 圖片會放大直到填滿整個組件，但上下或左右的內容會被切掉。
// wImg.applyFillingContentMode();

// -------------------

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // 測試預覽
  widget.presentSmall();
  // widget.presentMedium()
  // widget.presentLarge()
}

Script.complete();
