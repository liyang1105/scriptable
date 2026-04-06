// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
//script by supermamon
//presents two equally sized / spaced stacks

let clanTag =
  args.widgetParameter == null ? "#2QGLLJLLG" : args.widgetParameter;

const w = new ListWidget();
const api = await makeRequest(
  "https://n8n.liyang.dev/webhook/6c70a3fc-be86-4e1c-a5c1-f91d2edc9797/clans/" +
    encodeURIComponent(clanTag) +
    "/currentwar"
);

// create main stack
const mainStack = w.addStack();
if (api.state == "未開戰") {
  mainStack.addText("當前未開戰");
  // await w.presentSmall();
  await w.presentMedium();
  Script.complete();
}
mainStack.layoutVertically();

// badge stack
const badgeStack = mainStack.addStack();
badgeStack.addSpacer();
badgeStack.addImage(await loadAppIcon(api.clan.badgeUrls.small)).imageSize =
  new Size(28, 28);
badgeStack.addSpacer();
badgeStack.addImage(await loadAppIcon(api.opponent.badgeUrls.small)).imageSize =
  new Size(28, 28);
badgeStack.addSpacer();

// title stack
const titleStack = mainStack.addStack();
titleStack.addSpacer();
itemContent(titleStack, api.clan.name, Font.boldRoundedSystemFont(14));
titleStack.addSpacer();
itemTitle(titleStack, "Vs", Font.boldRoundedSystemFont(13)).textColor =
  new Color("#DE5C49");
titleStack.addSpacer();
itemContent(titleStack, api.opponent.name, Font.boldRoundedSystemFont(14));
titleStack.addSpacer();

mainStack.addSpacer();

// information
const informationStack = mainStack.addStack();
informationStack.addSpacer();
const textMapping = {
  inWar:
    "戰鬥日, " +
    timeDifference(
      new Date().toISOString(),
      new Date(convertToISOString(api.endTime)).toISOString()
    ),
  notInWar: "未開戰",
  preparation:
    "準備日, " +
    timeDifference(
      new Date().toISOString(),
      new Date(convertToISOString(api.startTime)).toISOString()
    ),
  warEnded: "結算日, " + api.clan.stars > api.opponent.stars ? "勝利" : "失敗",
};
const text = textMapping[api.state];
let informationElement = itemContent(
  informationStack,
  text,
  Font.boldRoundedSystemFont(14)
);
informationElement.textColor = new Color("#DE5C49");
informationStack.addSpacer();

mainStack.addSpacer();

// 下方顯示對戰資訊
const bottomStack = mainStack.addStack();
bottomStack.layoutVertically();

// stars count
const startStack = bottomStack.addStack();
startStack.centerAlignContent();

const starClan = startStack.addStack();
starClan.addSpacer();
itemContent(
  starClan,
  api.clan.stars.toString(),
  Font.boldRoundedSystemFont(14)
);
starClan.addSpacer();

const starLabel = startStack.addStack();
itemContent(starLabel, "取得星數", Font.boldRoundedSystemFont(12));

const starOpponent = startStack.addStack();
starOpponent.addSpacer();
itemContent(
  starOpponent,
  api.opponent.stars.toString(),
  Font.boldRoundedSystemFont(14)
);
starOpponent.addSpacer();

// attack times
const attackTimes = bottomStack.addStack();
attackTimes.centerAlignContent();

const attackClan = attackTimes.addStack();
attackClan.addSpacer();
itemContent(
  attackClan,
  (api.teamSize * api.attacksPerMember - api.clan.attacks).toString(),
  Font.boldRoundedSystemFont(14)
);
attackClan.addSpacer();

const attackLabel = attackTimes.addStack();
itemContent(attackLabel, "剩餘次數", Font.boldRoundedSystemFont(12));

const attackOpponent = attackTimes.addStack();
attackOpponent.addSpacer();
itemContent(
  attackOpponent,
  (api.teamSize * api.attacksPerMember - api.opponent.attacks).toString(),
  Font.boldRoundedSystemFont(14)
);
attackOpponent.addSpacer();

// destroy stack
const destroyStack = bottomStack.addStack();
destroyStack.centerAlignContent();

const destroyClan = destroyStack.addStack();
destroyClan.addSpacer();
itemContent(
  destroyClan,
  api.clan.destructionPercentage.toFixed(2) + "%",
  Font.boldRoundedSystemFont(14)
);
destroyClan.addSpacer();

const destroyLabel = destroyStack.addStack();
itemContent(destroyLabel, "總摧毀率", Font.boldRoundedSystemFont(12));

const destroyOpponent = destroyStack.addStack();
destroyOpponent.addSpacer();
itemContent(
  destroyOpponent,
  api.opponent.destructionPercentage.toFixed(2) + "%",
  Font.boldRoundedSystemFont(14)
);
destroyOpponent.addSpacer();

await w.presentSmall();
Script.complete();

async function loadAppIcon(url) {
  let req = new Request(url);
  return req.loadImage();
}

async function makeRequest(url) {
  let req = new Request(url);
  req.method = "GET";
  return await req.loadJSON();
}

function itemTitle(stack, text, font) {
  let textElement = stack.addText(text.toString());
  textElement.font = font;
  textElement.lineLimit = 1;
  textElement.minimumScaleFactor = 0.5;
  return textElement;
}

function itemContent(stack, text, font) {
  let textElement = stack.addText(text.toString());
  textElement.font = font;
  textElement.lineLimit = 1;
  textElement.minimumScaleFactor = 0.5;
  return textElement;
}

async function createIcon(stack, url, size, radius) {
  let iconElement = stack.addImage(await loadAppIcon(url));
  iconElement.imageSize = new Size(size, size);
  iconElement.cornerRadius = radius;
  return iconElement;
}

function timeDifference(now, end) {
  let nowDate = new Date(now);
  let endDate = new Date(end);

  // 計算時間差，結果為毫秒數
  let diff = endDate - nowDate;

  // 轉換成小時和分鐘
  let hours = Math.floor(diff / 1000 / 60 / 60);
  let minutes = Math.floor((diff / 1000 / 60) % 60);

  return `${hours}小時 ${minutes}分鐘`;
}

function convertToISOString(s) {
  // 使用正則表達式匹配並插入所需的符號
  const regex = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3}Z)$/;
  const result = s.replace(regex, "$1-$2-$3T$4:$5:$6.$7");

  return result;
}
