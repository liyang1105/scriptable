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

  // 4. 解析 n8n 回傳的 JSON 結構
  const f72 = res.data.town.forecast72hr;
  const town = f72.LocationName;
  const temp = f72.Temperature.Time[0].Temperature;
  const pop = f72.ProbabilityOfPrecipitation.Time[0].ProbabilityOfPrecipitation;
  const comfort = f72.ComfortIndex.Time[0].ComfortIndexDescription;

  // 5. 建立 Widget 與水平排版 (Stack)
  let w = new ListWidget();
  
  // 建立一個水平排列的 Stack，並設定垂直居中對齊
  let row = w.addStack();
  row.layoutHorizontally();
  row.centerAlignContent(); 

  // 定義統一的字體大小與適應深淺色的顏色
  const fontSize = 14;
  const font = Font.systemFont(fontSize);
  const iconColor = Color.dynamic(Color.black(), Color.white());

  // --- 開始組合您的輸出格式 ---
  
  // (1) 文字: 區域與舒適度
  let t1 = row.addText(`${town}${comfort} `);
  t1.font = font;

  // (2) 圖片: 溫度圖示 (SFSymbol)
  let tempSym = SFSymbol.named("thermometer");
  let tempImg = row.addImage(tempSym.image);
  tempImg.imageSize = new Size(fontSize, fontSize);
  tempImg.tintColor = iconColor;

  // (3) 文字: 溫度與分隔線
  let t2 = row.addText(` ${temp}°C | `);
  t2.font = font;

  // (4) 圖片: 降雨機率圖示 (SFSymbol)
  let rainSym = SFSymbol.named("cloud.rain"); // 若想換成雨傘，可改用 "umbrella.fill"
  let rainImg = row.addImage(rainSym.image);
  rainImg.imageSize = new Size(fontSize, fontSize);
  rainImg.tintColor = iconColor;

  // (5) 文字: 降雨機率數值
  let t3 = row.addText(` ${pop}%`);
  t3.font = font;

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