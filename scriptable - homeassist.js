if (config.runsInWidget) {
  // create and show widget
  let api = await loadAPI();
  let widget = await createWidget(api);
  Script.setWidget(widget);
} else {
  // 顯示說明文字.
  var message = "請記得於腳本開始之前先手動修改 instagramUrl。";
  let options = ["預覽", "腳本更新", "離開"];
  let response = await generateAlert(message, options);

  if (response == 0) {
    let api = await loadAPI();
    let widget = await createWidget(api);
    widget.presentLarge();
  }

  // Update the code.
  if (response == 1) {
    // Determine if the user is using iCloud.
    let files = FileManager.local();
    const iCloudInUse = files.isFileStoredIniCloud(module.filename);

    // If so, use an iCloud file manager.
    files = iCloudInUse ? FileManager.iCloud() : files;

    // Try to download the file.
    try {
      const req = new Request(
        "https://file.liyang.dev/script/scriptable%20-%20homeassist.js"
      );
      const codeString = await req.loadString();
      files.writeString(module.filename, codeString);
      message = "腳本更新完成!\n若腳本已開啟，請關閉後再重新執行。";
    } catch {
      message = "更新失敗，請再試一遍。";
    }
    options = ["OK"];
    // await generateAlert(message, options);
    return;
  }

  // Return if we need to exit.
  if (response == 2) return;
}

Script.complete();

async function createWidget(api) {
  let appIcon = await loadAppIcon("https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons@master/png/home-assistant.png");
  let title = api.friendly_name;
  let widget = new ListWidget();
  widget.url =
    "https://n8n.liyang.dev/webhook/get_status?device=switch.qmi_2a1c1_f2b1_switch";
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("141414"), new Color("13233F")];
  widget.backgroundGradient = gradient;
  // Show app icon and title
  let titleStack = widget.addStack();
  let appIconElement = titleStack.addImage(appIcon);
  appIconElement.imageSize = new Size(15, 15);
  appIconElement.imageSize = new Size(15, 15);
  appIconElement.cornerRadius = 4;
  titleStack.addSpacer(4);
  let titleElement = titleStack.addText(title);
  titleElement.lineLimit = 1;
  titleElement.textColor = Color.white();
  titleElement.textOpacity = 0.7;
  titleElement.font = Font.mediumSystemFont(13);
  widget.addSpacer(12);
  // Show API
  let contentElement = widget.addText(
    api.content
  );
  contentElement.minimumScaleFactor = 0.5;
  contentElement.textColor = Color.white();
  contentElement.font = Font.systemFont(13);
  return widget;
}

async function loadAPI() {
  let url =
    "https://n8n.liyang.dev/webhook/get_status?device=switch.qmi_2a1c1_f2b1_switch";
  let req = new Request(url);
  let api = await req.loadJSON();

  let room = api["switch.qmi_2a1c1_f2b1_switch"].attributes.home_room;
  let power_consumption =
    (
      api["switch.qmi_2a1c1_f2b1_switch"].attributes[
        "power_consumption.voltage"
      ] / 1000
    ).toFixed(1) + " V";
  let electric_power =
    api["switch.qmi_2a1c1_f2b1_switch"].attributes[
      "electric_power-3-2"
    ].toFixed(1) + " W";
  let temperature =
    api["switch.qmi_2a1c1_f2b1_switch"].attributes[
      "switch.temperature"
    ].toFixed(1) + " °C";
  let electric_current =
    (
      api["switch.qmi_2a1c1_f2b1_switch"].attributes["electric_current-3-4"] /
      1000
    ).toFixed(1) + " A";
  return {
    title: api["switch.qmi_2a1c1_f2b1_switch"].title,
    friendly_name: api["switch.qmi_2a1c1_f2b1_switch"].attributes.friendly_name,
    content:
      "輸入電壓：" +
      power_consumption +
      "\n輸出電流：" +
      electric_current +
      "\n消耗功率：" +
      electric_power +
      "\n插座溫度：" +
      temperature +
      "\n房間：" +
      room,
    icon: "https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons@master/png/home-assistant.png",
  };
}

async function loadAppIcon(url) {
  let req = new Request(url);
  return req.loadImage();
}

// Generate an alert with the provided array of options.
async function generateAlert(message, options) {
  let alert = new Alert();
  alert.message = message;

  for (const option of options) {
    alert.addAction(option);
  }

  let response = await alert.presentAlert();
  return response;
}