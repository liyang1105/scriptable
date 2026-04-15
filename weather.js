// 1. 取得目前位置
let loc;
try {
  loc = await Location.current();
} catch (e) {
  console.error("無法取得定位: " + e);
  Script.complete();
}

const lat = loc.latitude;
const lon = loc.longitude;

// 2. 設定 n8n Webhook API
const url = `https://n8n.liyang.dev/webhook/5a37431d-9efa-4ae1-a46b-9de4092405c8?latitude=${lat}&longitude=${lon}`;

const req = new Request(url);
req.method = "GET";

try {
  const res = await req.loadJSON();

  // 3. 解析 JSON 結構
  const f72 = res.data.town.forecast72hr;
  const town = f72.LocationName;
  const temp = f72.Temperature.Time[0].Temperature;
  const pop = f72.ProbabilityOfPrecipitation.Time[0].ProbabilityOfPrecipitation;
  const comfort = f72.ComfortIndex.Time[0].ComfortIndexDescription;

  // 4. 使用純文字字元組合
  // 您可以將 🌡 與 🌧 替換為您從 SF Symbols 複製來的特定字元 (如 􀇬 與 􀇋)
  const result = `${town}${comfort}${temp}°C｜🌧 ${pop}%`;

  // 5. 建立小工具
  let w = new ListWidget();
  let t = w.addText(result);
  
  // 必須使用系統字體，iOS 才能正確識別並渲染這些符號
  t.font = Font.systemFont(14);
  t.lineLimit = 1;
  t.minimumScaleFactor = 0.5;

  // 6. 設定與預覽
  if (config.runsInWidget) {
    Script.setWidget(w);
  } else {
    // 若在 Scriptable App 內測試，使用鎖定畫面(矩形)的模式預覽
    w.presentAccessoryRectangular(); 
  }
  Script.complete();

} catch (e) {
  console.error("處理失敗: " + e);
  let w = new ListWidget();
  w.addText("載入失敗");
  Script.setWidget(w);
  Script.complete();
}