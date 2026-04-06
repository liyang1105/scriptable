let api = await tzuchiAPI();
let widget = await createWidget(api);

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

async function createWidget(api) {
  let appIcon = await loadAppIcon(
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGMVSX6UATucDht3OcWpex4yHvhraqI9vkew&usqp=CAU.jpg"
  );
  let widget = new ListWidget();
  widget.url = "http://app.tzuchi.com.tw/tchw/QueryTzuchi/AdmFreeBed.aspx";
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("141414"), new Color("13233F")];
  widget.backgroundGradient = gradient;
  // Show app icon and title
  let topStack = widget.addStack();
  topStack.centerAlignContent();

  let appIconElement = topStack.addImage(appIcon);
  appIconElement.imageSize = new Size(25, 25);
  appIconElement.cornerRadius = 4;
  topStack.addSpacer(5);
  let titleStack = topStack.addStack();
  titleStack.layoutVertically();

  let titleElement = titleStack.addText(api.title);
  titleElement.lineLimit = 1;
  titleElement.textColor = Color.white();
  titleElement.font = Font.boldSystemFont(15);

  // 設定台灣時區
  const options = {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  let updateTimelEement = titleStack.addText(
    new Date().toLocaleString("zh-TW", options)
  );
  updateTimelEement.textColor = Color.white();
  updateTimelEement.font = Font.boldRoundedSystemFont(9);
  updateTimelEement.lineLimit = 1;
  updateTimelEement.minimumScaleFactor = 0.1;
  titleStack.addSpacer(1);

  widget.addSpacer();

  // Show API
  let descriptionElement = widget.addText(api.description);
  descriptionElement.textColor = Color.white();
  descriptionElement.font = Font.boldRoundedSystemFont(12);

  widget.addSpacer();

  let bottom = widget.addStack();
  let barElement = bottom.addImage(
    creatProgress(api["總床數"], api["在院人數"])
  );
  barElement.imageSize = new Size(125, 5);

  return widget;
}

async function tzuchiAPI() {
  let docs = await loadDocs();
  let searchString =
    args.widgetParameter == null ? "8B" : args.widgetParameter.toUpperCase();
  let index = docs.rooms.findIndex((room) =>
    room["護理站"].includes(searchString)
  );

  return {
    title: docs["rooms"][index]["護理站"],
    總床數: docs["rooms"][index]["總床數"],
    在院人數: docs["rooms"][index]["在院人數"],
    實際空床數: docs["rooms"][index]["實際空床數"],
    description:
      "總床數: " +
      docs["rooms"][index]["總床數"] +
      "\n在院人數: " +
      docs["rooms"][index]["在院人數"] +
      "\n實際空床數: " +
      docs["rooms"][index]["實際空床數"],
  };
}

async function loadDocs() {
  let url =
    "https://n8n.liyang.dev/webhook/c78a165c-3ad6-4195-b2e7-58d214df05af";
  let req = new Request(url);
  return await req.loadJSON();
}

async function loadAppIcon(url) {
  let req = new Request(url);
  return await req.loadImage();
}

function creatProgress(total, havegone) {
  const context = new DrawContext();
  context.size = new Size(125, 5);
  context.opaque = false;
  context.respectScreenScale = true;
  context.setFillColor(new Color("#48484b"));
  const path = new Path();
  path.addRoundedRect(new Rect(0, 0, 125, 5), 3, 2);
  context.addPath(path);
  context.fillPath();
  havegone / total >= 0.8
    ? context.setFillColor(new Color("#ff0a33"))
    : context.setFillColor(new Color("#ffd60a"));
  const path1 = new Path();
  path1.addRoundedRect(new Rect(0, 0, (125 * havegone) / total, 5), 3, 2);
  context.addPath(path1);
  context.fillPath();
  return context.getImage();
}
