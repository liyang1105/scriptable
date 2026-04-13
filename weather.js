// 1. 取得目前位置經緯度
const loc = await Location.current();
const lat = loc.latitude;
const lon = loc.longitude;
const apiKey = Keychain.contains("CWA_API_KEY")
  ? Keychain.get("CWA_API_KEY")
  : "請在手機端 Keychain 存入金鑰";
// 2. 設定 API 資訊
const url =
  "https://opendata.cwa.gov.tw/linked/graphql?Authorization=" + apiKey;

// 3. 建立 GraphQL Query (加入降雨機率與舒適度說明)
const query = {
  query: `query town($lat: Float!, $lon: Float!) {
    town(Longitude: $lon, Latitude: $lat) {
      townName
      forecast72hr {
        Temperature { Time { Temperature } }
        ProbabilityOfPrecipitation { Time { ProbabilityOfPrecipitation } }
        ComfortIndex { Time { ComfortIndexDescription } }
      }
    }
  }`,
  variables: { lat: lat, lon: lon },
};

const req = new Request(url);
req.method = "POST";
req.headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
req.body = JSON.stringify(query);

try {
  const res = await req.loadJSON();
  const data = res.data.town;
  const f72 = data.forecast72hr;

  // 4. 提取第一筆預報資料 (未來 3 小時內)
  const town = data.townName;
  const temp = f72.Temperature.Time[0].Temperature;
  const pop = f72.ProbabilityOfPrecipitation.Time[0].ProbabilityOfPrecipitation;
  const comfort = f72.ComfortIndex.Time[0].ComfortIndexDescription;

  // 5. 組合最終字串
  const result = `${town} ${temp}° ${pop}% ${comfort}`;

  console.log(result);

  // 顯示在 Widget
  let w = new ListWidget();
  let t = w.addText(result);
  t.font = Font.systemFont(14);
  Script.setWidget(w);
  Script.complete();
  w.presentSmall();
} catch (e) {
  console.error("API 請求失敗: " + e);
}
