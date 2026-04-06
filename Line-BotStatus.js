let widget = await createWidget();

if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget);
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentSmall();
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete();

async function createWidget() {
  let widget = new ListWidget();

  if (args.widgetParameter == null) {
    widget.addText("請填入 Bot Channel Access Token.").font =
      Font.boldRoundedSystemFont(14);
    return widget;
  }

  //Get bot info
  let url = "https://api.line.me/v2/bot/info";
  let info = await makeRequest(url, args.widgetParameter);

  //Get the target limit for sending messages this month
  url = "https://api.line.me/v2/bot/message/quota";
  quota = await makeRequest(url, args.widgetParameter);
  let limit = quota.value;

  //Get number of messages sent this month
  url = "https://api.line.me/v2/bot/message/quota/consumption";
  consumption = await makeRequest(url, args.widgetParameter);
  let usage = consumption.totalUsage;

  let pushCount = await getMessageCount("push");
  let replyCount = await getMessageCount("reply");

  let appIcon = await loadAppIcon();
  let top = widget.addStack();

  // Show app icon and title
  top.centerAlignContent();

  let appIconElement = top.addImage(appIcon);
  appIconElement.imageSize = new Size(25, 25);
  appIconElement.cornerRadius = 4;
  top.addSpacer(5);

  let titleStack = top.addStack();
  titleStack.layoutVertically();

  titleStack.addText(info.displayName).font = Font.boldRoundedSystemFont(14);

  // 設定台灣時區
  const options = {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formattedDate = new Intl.DateTimeFormat("zh-TW", options).format(
    new Date()
  );
  titleStack.addText(formattedDate).font = Font.boldRoundedSystemFont(9);

  widget.addSpacer();

  let center = widget.addStack();
  center.layoutVertically();

  let pushStack = center.addStack();
  pushStack.addText("Push API: " + usage + "/" + limit).font =
    Font.boldRoundedSystemFont(12);

  let replyStack = center.addStack();
  replyStack.addText("Reply API: " + replyCount + "/♾️").font =
    Font.boldRoundedSystemFont(12);

  widget.addSpacer();

  return widget;
}

async function loadAppIcon() {
  let url = "https://file.liyang.dev/icon/LINE%20Pay_PNG/LINE_APP_iOS.png";
  let req = new Request(url);
  return req.loadImage();
}

async function makeRequest(url, token) {
  let req = new Request(url);
  req.method = "GET";
  req.headers = {
    Authorization: `Bearer ${token}`,
  };
  return await req.loadJSON();
}

async function getMessageCount(messageType) {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1; // getMonth 返回的月份是从 0 开始的
  // 将月份格式化为两位数
  month = month < 10 ? "0" + month : month;

  let url, totalCount;

  switch (messageType) {
    case "push":
      url = "https://api.line.me/v2/bot/message/delivery/push";
      totalCount = 0;
      break;

    case "reply":
      url = "https://api.line.me/v2/bot/message/delivery/reply";
      totalCount = 0;
      break;

    default:
  }

  for (let index = 1; index < new Date().getDate(); index++) {
    const result = await makeRequest(
      url + "?date=" + year + month + (index < 10 ? "0" + index : index),
      args.widgetParameter
    );
    if (result.status == "ready") {
      totalCount = totalCount + result.success;
    }
  }
  return totalCount;
}
