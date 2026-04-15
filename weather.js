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
  // 3. 發送請求並取得資料
  const res = await req.loadJSON();

  // 4. 解析 JSON 結構
  const f72 = res.data.town.forecast72hr;
  const town = f72.LocationName;
  const temp = f72.Temperature.Time[0].Temperature;
  const pop = f72.ProbabilityOfPrecipitation.Time[0].ProbabilityOfPrecipitation;
  const comfort = f72.ComfortIndex.Time[0].ComfortIndexDescription;

  // 5. 建立 Widget 與 Stack 排版
  let w = new ListWidget();
  
  let row = w.addStack();
  row.layoutHorizontally();
  row.centerAlignContent(); 
  row.spacing = 0; // 強制移除元素之間的所有預設空格

  const fontSize = 14;
  const font = Font.systemFont(fontSize);
  const iconColor = Color.dynamic(Color.black(), Color.white());

  // 建立輔助函數：加入文字並防止換行
  function addText(text) {
    let t = row.addText(text);
    t.font = font;
    t.lineLimit = 1;              // 限制只能單行
    t.minimumScaleFactor = 0.5;   // 若空間不足則自動縮小字體，而非換行
  }

  // 建立輔助函數：加入圖示
  function addIcon(symbolName) {
    let sym = SFSymbol.named(symbolName);
    let img = row.addImage(sym.image);
    img.imageSize = new Size(fontSize, fontSize);
    img.tintColor = iconColor;
  }

  // --- 依序組合您的格式 (無任何空格) ---
  
  // `${town}${comfort}`
  addText(`${town}${comfort}`);
  
  // `{溫度圖示}`
  addIcon("thermometer");
  
  // `${temp}°C`
  addText(`${temp}°C`);
  
  // `{降雨機率圖示}`
  addIcon("cloud.rain");
  
  // `${pop}%`
  addText(`${pop}%`);

  // -----------------------------

  if (config.runsInWidget) {
    Script.setWidget(w);
  } else {
    w.presentSmall();
  }
  Script.complete();

} catch (e) {
  console.error("API 請求或資料處理失敗: " + e);
  let errorWidget = new ListWidget();
  errorWidget.addText("載入失敗");
  Script.setWidget(errorWidget);
  Script.complete();
}