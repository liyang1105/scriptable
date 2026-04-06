let widget = await createWidget();
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget);
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentLarge();
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete();

async function createWidget() {
  let result = await makeRequest("qmi_2a1c1");
  let appIcon = await loadAppIcon(
    "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/home-assistant.png"
  );
  let widget = new ListWidget();

  // Show app icon and title, topStack
  let topStack = widget.addStack();

  let appIconElement = topStack.addImage(appIcon);
  appIconElement.imageSize = new Size(25, 25);
  appIconElement.cornerRadius = 4;
  topStack.addSpacer(5);

  let titleStack = topStack.addStack();

  titleStack.layoutVertically();
  let titleElement = titleStack.addText("小米智慧延長線");
  titleElement.font = Font.boldRoundedSystemFont(14);
  titleElement.lineLimit = 1;
  titleElement.minimumScaleFactor = 0.1;

  // 解析日期字串
  const date = new Date(result["switch.qmi_2a1c1_f2b1_switch"].last_updated);
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

  // 使用 Intl.DateTimeFormat 來格式化日期
  const formattedDate = new Intl.DateTimeFormat("zh-TW", options).format(date);
  let updateElement = titleStack.addText(formattedDate);
  updateElement.font = Font.boldRoundedSystemFont(9);
  updateElement.lineLimit = 1;
  updateElement.minimumScaleFactor = 0.1;
  titleStack.addSpacer(1);

  widget.addSpacer();

  // Show homeassistant devices, centerStack
  let centerStack = widget.addStack();

  // Xiaomi Smart Power Strip 20W Fast Charge (2A1C)
  let item_1 = centerStack.addStack();
  item_1.layoutVertically();

  itemContent(
    item_1.addStack(),
    "電流: " +
      parseInt(result["sensor.qmi_2a1c1_f2b1_electric_current"].state).toFixed(
        1
      ) +
      result["sensor.qmi_2a1c1_f2b1_electric_current"].attributes
        .unit_of_measurement,
    Font.boldRoundedSystemFont(12)
  );

  itemContent(
    item_1.addStack(),
    "電壓: " +
      parseInt(result["sensor.qmi_2a1c1_f2b1_voltage"].state).toFixed(1) +
      result["sensor.qmi_2a1c1_f2b1_voltage"].attributes.unit_of_measurement,
    Font.boldRoundedSystemFont(12)
  );

  itemContent(
    item_1.addStack(),
    "功率: " +
      parseInt(result["sensor.qmi_2a1c1_f2b1_electric_power"].state).toFixed(
        1
      ) +
      result["sensor.qmi_2a1c1_f2b1_electric_power"].attributes
        .unit_of_measurement,
    Font.boldRoundedSystemFont(12)
  );

  itemContent(
    item_1.addStack(),
    "當月耗電量: " +
      parseInt(result["sensor.qmi_2a1c1_f2b1_power_cost_month"].state).toFixed(
        1
      ) +
      result["sensor.qmi_2a1c1_f2b1_power_cost_month"].attributes
        .unit_of_measurement,
    Font.boldRoundedSystemFont(12)
  );

  itemContent(
    item_1.addStack(),
    "已產生電費: " +
      parseInt(result["sensor.qmi_2a1c1_f2b1_power_cost_month"].state).toFixed(
        1
      ) *
        3 +
      " 元",
    Font.boldRoundedSystemFont(12)
  );

  widget.addSpacer();

  return widget;
}

async function loadAppIcon(url) {
  let req = new Request(url);
  return req.loadImage();
}

async function makeRequest(device) {
  let req = new Request(
    "https://n8n.liyang.dev/webhook/f56eba2c-b67e-4826-9cf2-2b0baa714b74?device=" +
      device
  );
  req.method = "GET";
  return await req.loadJSON();
}
function itemContent(stack, text, font) {
  let textElement = stack.addText(text);
  textElement.font = font;
  return textElement;
}
