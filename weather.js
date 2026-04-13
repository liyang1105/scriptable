// 1. 取得目前位置
let loc;
try {
  loc = await Location.current();
} catch (e) {
  console.error("無法取得定位");
  Script.complete();
}

const lat = loc.latitude;
const lon = loc.longitude;
const apiKey = Keychain.contains("CWA_API_KEY")
  ? Keychain.get("CWA_API_KEY")
  : null;

if (!apiKey) {
  console.error("請檢查 Keychain 是否已存入 CWA_API_KEY");
  Script.complete();
}

// 2. 設定 API
const url = "https://opendata.cwa.gov.tw/linked/graphql";
const query = {
  query: `query town($lat: Float!, $lon: Float!) {
    town(Longitude: $lon, Latitude: $lat) {
      townName
      forecast72hr {
        Temperature { Time { DataTime, Temperature } }
        ProbabilityOfPrecipitation { Time { DataTime, ProbabilityOfPrecipitation } }
        ComfortIndex { Time { DataTime, ComfortIndexDescription } }
      }
    }
  }`,
  variables: { lat: lat, lon: lon },
};

const req = new Request(url);
req.method = "POST";
req.headers = {
  "Content-Type": "application/json",
  Authorization: apiKey, // 將 Key 移至 Header
};
req.body = JSON.stringify(query);

try {
  const res = await req.loadJSON();

  if (res.errors) {
    console.error("API 錯誤: " + JSON.stringify(res.errors));
    return;
  }

  const townData = res.data.town;
  const f72 = townData.forecast72hr;

  // 提取資料 (確保結構存在)
  const town = townData.townName;
  const temp = f72.Temperature.Time[0].Temperature;
  const pop = f72.ProbabilityOfPrecipitation.Time[0].ProbabilityOfPrecipitation;
  const comfort = f72.ComfortIndex.Time[0].ComfortIndexDescription;

  const result = `${town} ${temp}°C | 降雨機率 ${pop}% | ${comfort}`;
  console.log(result);

  // Widget 顯示
  let w = new ListWidget();
  w.addText(result);

  if (config.runsInWidget) {
    Script.setWidget(w);
  } else {
    w.presentSmall();
  }
  Script.complete();
} catch (e) {
  console.error("處理資料失敗: " + e);
}
console.log(JSON.stringify(res));
