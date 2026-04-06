const width = 125;
const height = 5;
const spacer = 5;

if (config.runsInWidget) {
  // create and show widget
  let api = await loadAPI();
  let widget = await createWidget(api);
  Script.setWidget(widget);
} else {
  // 顯示說明文字.
  let message = "請記得於腳本開始之前先手動修改 instagramUrl。";
  let options = ["預覽（大）", "腳本更新", "離開"];
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
        "https://file.liyang.dev/script/scriptable/dashboard.js"
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
  let widget = new ListWidget();

  // Add background
  widget.backgroundImage = await loadImg(
    "https://dummyimage.com/100x100/ffffff/ffffff.png&text=+"
  );

  const icon_S = await loadImg(
    api.ds1821plus.ds1821plus_dsm_update.attributes.entity_picture
  );
  const icon_Q = await loadImg(
    "https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons@master/png/qnap.png"
  );

  // ICON 與標題 Stack
  let titleStack_S = widget.addStack();
  let appIconElement_S = titleStack_S.addImage(icon_S);
  appIconElement_S.imageSize = new Size(16, 16);
  appIconElement_S.cornerRadius = 4;
  titleStack_S.addSpacer(4);
  let titleElement_S = titleStack_S.addText("DS1821+, 2230SKRSA4PEE");
  titleElement_S.font = Font.mediumRoundedSystemFont(14);
  titleStack_S.addSpacer();
  let titletemperatureElement_S = titleStack_S.addText(
    api.ds1821plus.ds1821plus_temperature.state +
      api.ds1821plus.ds1821plus_temperature.attributes.unit_of_measurement
  );
  titletemperatureElement_S.font = Font.mediumRoundedSystemFont(14);

  widget.addSpacer(spacer);

  // 系統資訊 Stack
  let systemStack_S = widget.addStack();

  // 系統資訊 - CPU Stack
  let cpuStack_S = systemStack_S.addStack();
  let cpuTitle_S = cpuStack_S.addText("CPU 使用率");
  cpuTitle_S.font = Font.regularRoundedSystemFont(12);

  // 系統資訊 - CPU Progress Bar
  let cpuBar_S = cpuStack_S.addImage(
    creatProgress(100, api.ds1821plus.ds1821plus_cpu_utilization_total.state)
  );
  cpuBar_S.imageSize = new Size(width, height);

  // 系統資訊 - CPU Value
  let cpuValue_S = cpuStack_S.addText(
    api.ds1821plus.ds1821plus_cpu_utilization_total.state +
      api.ds1821plus.ds1821plus_cpu_utilization_total.attributes
        .unit_of_measurement
  );
  cpuValue_S.font = Font.regularRoundedSystemFont(12);
  cpuStack_S.layoutVertically();
  systemStack_S.addSpacer();

  // 系統資訊 - Memory Stack
  let memoryStack_S = systemStack_S.addStack();
  let memoryTitle_S = memoryStack_S.addText("記憶體使用率");
  memoryTitle_S.font = Font.regularRoundedSystemFont(12);

  // 系統資訊 - Memory Progress Bar
  let memoryBar_S = memoryStack_S.addImage(
    creatProgress(100, api.ds1821plus.ds1821plus_memory_usage_real.state)
  );
  memoryBar_S.imageSize = new Size(width, height);

  // 系統資訊 - Memory Value
  let memoryValue_S = memoryStack_S.addText(
    api.ds1821plus.ds1821plus_memory_usage_real.state +
      api.ds1821plus.ds1821plus_memory_usage_real.attributes.unit_of_measurement
  );
  memoryValue_S.font = Font.regularRoundedSystemFont(12);
  memoryStack_S.layoutVertically();
  systemStack_S.addSpacer();

  widget.addSpacer(spacer);

  // 儲存空間 Stack One
  let storageStackOne_S = widget.addStack();

  // 儲存空間 1 - Title Stack
  let volOneStack_S = storageStackOne_S.addStack();
  let volOneTtitle_S = volOneStack_S.addText("儲存空間 1");
  volOneTtitle_S.font = Font.regularRoundedSystemFont(12);

  // 儲存空間 1 - Progress Bar
  let volOneBar_S = volOneStack_S.addImage(
    creatProgress(100, api.ds1821plus.ds1821plus_volume_1_volume_used.state)
  );
  volOneBar_S.imageSize = new Size(width, height);

  // 儲存空間 1 - Value
  let volOneValue_S = volOneStack_S.addText(
    api.ds1821plus.ds1821plus_volume_1_used_space.state +
      api.ds1821plus.ds1821plus_volume_1_used_space.attributes
        .unit_of_measurement +
      " / " +
      (
        (api.ds1821plus.ds1821plus_volume_1_used_space.state /
          api.ds1821plus.ds1821plus_volume_1_volume_used.state) *
        100
      ).toFixed(2) +
      api.ds1821plus.ds1821plus_volume_1_used_space.attributes
        .unit_of_measurement
  );
  volOneValue_S.font = Font.regularRoundedSystemFont(12);
  volOneStack_S.layoutVertically();
  storageStackOne_S.addSpacer();

  // 儲存空間 2 - Title Stack
  let volTwoStack_S = storageStackOne_S.addStack();
  let volTwoTtitle_S = volTwoStack_S.addText("儲存空間 2");
  volTwoTtitle_S.font = Font.regularRoundedSystemFont(12);

  // 儲存空間 2 - Progress Bar
  let storageTwoBarElement_S = volTwoStack_S.addImage(
    creatProgress(100, api.ds1821plus.ds1821plus_volume_2_volume_used.state)
  );
  storageTwoBarElement_S.imageSize = new Size(width, height);

  // 儲存空間 2 - Value
  let volTwoValue_S = volTwoStack_S.addText(
    api.ds1821plus.ds1821plus_volume_2_used_space.state +
      api.ds1821plus.ds1821plus_volume_2_used_space.attributes
        .unit_of_measurement +
      " / " +
      (
        (api.ds1821plus.ds1821plus_volume_2_used_space.state /
          api.ds1821plus.ds1821plus_volume_2_volume_used.state) *
        100
      ).toFixed(2) +
      api.ds1821plus.ds1821plus_volume_2_used_space.attributes
        .unit_of_measurement
  );
  volTwoValue_S.font = Font.regularRoundedSystemFont(12);
  volTwoStack_S.layoutVertically();
  storageStackOne_S.addSpacer();

  widget.addSpacer(spacer);

  // 儲存空間 Stack 2
  let storageStackTwo_S = widget.addStack();

  // 儲存空間 3 - Title Stack
  let volThreeStack_S = storageStackTwo_S.addStack();
  let volThreeTtitle_S = volThreeStack_S.addText("儲存空間 3");
  volThreeTtitle_S.font = Font.regularRoundedSystemFont(12);

  // 儲存空間 3 - Progress Bar
  let volThreeBar_S = volThreeStack_S.addImage(
    creatProgress(100, api.ds1821plus.ds1821plus_volume_3_volume_used.state)
  );
  volThreeBar_S.imageSize = new Size(width, height);

  // 儲存空間 3 - Value
  let volThreeValue_S = volThreeStack_S.addText(
    api.ds1821plus.ds1821plus_volume_3_used_space.state +
      api.ds1821plus.ds1821plus_volume_3_used_space.attributes
        .unit_of_measurement +
      " / " +
      (
        (api.ds1821plus.ds1821plus_volume_3_used_space.state /
          api.ds1821plus.ds1821plus_volume_3_volume_used.state) *
        100
      ).toFixed(2) +
      api.ds1821plus.ds1821plus_volume_3_used_space.attributes
        .unit_of_measurement
  );
  volThreeValue_S.font = Font.regularRoundedSystemFont(12);
  volThreeStack_S.layoutVertically();
  storageStackTwo_S.addSpacer();

  // 儲存空間 4 - Title Stack
  let volFourStack_S = storageStackTwo_S.addStack();
  let volFourTtitle_S = volFourStack_S.addText("儲存空間 4");
  volFourTtitle_S.font = Font.regularRoundedSystemFont(12);

  // 儲存空間 4 - Progress Bar
  let volFourBar_S = volFourStack_S.addImage(
    creatProgress(100, api.ds1821plus.ds1821plus_volume_4_volume_used.state)
  );
  volFourBar_S.imageSize = new Size(width, height);

  // 儲存空間 4 - Value
  let volFourValue_S = volFourStack_S.addText(
    api.ds1821plus.ds1821plus_volume_4_used_space.state +
      api.ds1821plus.ds1821plus_volume_4_used_space.attributes
        .unit_of_measurement +
      " / " +
      (
        (api.ds1821plus.ds1821plus_volume_4_used_space.state /
          api.ds1821plus.ds1821plus_volume_4_volume_used.state) *
        100
      ).toFixed(2) +
      api.ds1821plus.ds1821plus_volume_4_used_space.attributes
        .unit_of_measurement
  );
  volFourValue_S.font = Font.regularRoundedSystemFont(12);
  volFourStack_S.layoutVertically();
  storageStackTwo_S.addSpacer();

  widget.addSpacer(spacer);

  // 底部 Stack
  let bottomStack_S = widget.addStack();

  // 網路資訊 Stack
  let networkStack_S = bottomStack_S.addStack();
  networkStack_S.layoutVertically();
  networkStack_S.size = new Size(width, 0);

  // 網路資訊 - TX Stack
  let txStack_S = networkStack_S.addStack();
  let txTitle_S = txStack_S.addText("TX");
  txTitle_S.font = Font.regularRoundedSystemFont(12);
  txStack_S.addSpacer();

  let txValue_S = txStack_S.addText(
    api.ds1821plus.ds1821plus_upload_throughput.state +
      api.ds1821plus.ds1821plus_upload_throughput.attributes.unit_of_measurement
  );
  txValue_S.font = Font.regularRoundedSystemFont(12);

  // 網路資訊 - RX Stack
  let rxStack_S = networkStack_S.addStack();
  let rxTitle_S = rxStack_S.addText("RX");
  rxTitle_S.font = Font.regularRoundedSystemFont(12);
  rxStack_S.addSpacer();

  let rxValue_S = rxStack_S.addText(
    api.ds1821plus.ds1821plus_download_throughput.state +
      api.ds1821plus.ds1821plus_download_throughput.attributes
        .unit_of_measurement
  );
  rxValue_S.font = Font.regularRoundedSystemFont(12);
  bottomStack_S.addSpacer();

  // 更新時間
  let infoStack_S = bottomStack_S.addStack();
  infoStack_S.layoutVertically();
  infoStack_S.size = new Size(width, 0);
  let infoTitle_S = infoStack_S.addText(" ");
  infoTitle_S.font = Font.regularRoundedSystemFont(12);

  let infoValue_S = infoStack_S.addText(
    new Date(
      api.ds1821plus.ds1821plus_cpu_utilization_total.last_updated
    ).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })
  );
  infoValue_S.font = Font.regularRoundedSystemFont(12);
  bottomStack_S.addSpacer();

  widget.addSpacer(spacer * 3);
  // -------------------------------------------------------------------------------------------

  // ICON 與標題 Stack
  let titleStack_Q = widget.addStack();
  let appIconElement_Q = titleStack_Q.addImage(icon_Q);
  appIconElement_Q.imageSize = new Size(16, 16);
  appIconElement_Q.cornerRadius = 4;
  titleStack_Q.addSpacer(4);
  let titleElement_Q = titleStack_Q.addText(
    api.ts_873a.ts_873a_status.attributes.name +
      ", " +
      api.ts_873a.ts_873a_status.attributes["Serial #"]
  );
  titleElement_Q.font = Font.mediumRoundedSystemFont(14);
  titleStack_Q.addSpacer();
  let temperatureElement_Q = titleStack_Q.addText(
    api.ts_873a.ts_873a_cpu_temperature.state +
      api.ts_873a.ts_873a_cpu_temperature.attributes.unit_of_measurement
  );
  temperatureElement_Q.font = Font.mediumRoundedSystemFont(14);
  widget.addSpacer(spacer);

  // 系統資訊 Stack
  let systemStack_Q = widget.addStack();

  // 系統資訊 - CPU Stack
  let cpuStack_Q = systemStack_Q.addStack();
  let cpuTitle_Q = cpuStack_Q.addText("CPU 使用率");
  cpuTitle_Q.font = Font.regularRoundedSystemFont(12);

  // 系統資訊 - CPU Progress Bar
  let cpuBar_Q = cpuStack_Q.addImage(
    creatProgress(100, api.ts_873a.ts_873a_cpu_usage.state)
  );
  cpuBar_Q.imageSize = new Size(width, height);

  // 系統資訊 - CPU Value
  let cpuValue_Q = cpuStack_Q.addText(
    api.ts_873a.ts_873a_cpu_usage.state +
      api.ts_873a.ts_873a_cpu_usage.attributes.unit_of_measurement
  );
  cpuValue_Q.font = Font.regularRoundedSystemFont(12);
  cpuStack_Q.layoutVertically();
  systemStack_Q.addSpacer();

  // 系統資訊 - Memory Stack
  let memoryStack_Q = systemStack_Q.addStack();
  let memoryTitle_Q = memoryStack_Q.addText("記憶體使用率");
  memoryTitle_Q.font = Font.regularRoundedSystemFont(12);

  // 系統資訊 - Memory Progress Bar
  let memoryBar_Q = memoryStack_Q.addImage(
    creatProgress(100, api.ts_873a.ts_873a_memory_usage.state)
  );
  memoryBar_Q.imageSize = new Size(width, height);

  // 系統資訊 - Memory Value
  let memoryValue_Q = memoryStack_Q.addText(
    api.ts_873a.ts_873a_memory_usage.state +
      api.ts_873a.ts_873a_memory_usage.attributes.unit_of_measurement
  );
  memoryValue_Q.font = Font.regularRoundedSystemFont(12);
  memoryStack_Q.layoutVertically();
  systemStack_Q.addSpacer();

  widget.addSpacer(spacer);

  // 儲存空間 Stack One
  let storageStackOne_Q = widget.addStack();

  // Container - Stack
  let sharedOneStack = storageStackOne_Q.addStack();
  let sharedOneTitle = sharedOneStack.addText("Container");
  sharedOneStack.addSpacer();
  let sharedOneValue = sharedOneStack.addText(
    api.ts_873a.ts_873a_used_space_container.state +
      api.ts_873a.ts_873a_used_space_container.attributes.unit_of_measurement
  );
  sharedOneStack.size = new Size(width, 0);
  sharedOneTitle.font = Font.regularRoundedSystemFont(12);
  sharedOneValue.font = Font.regularRoundedSystemFont(12);
  storageStackOne_Q.addSpacer();

  // Media - Stack
  let sharedTwoStack = storageStackOne_Q.addStack();
  let SharedTwoTitle = sharedTwoStack.addText("Media");
  sharedTwoStack.addSpacer();
  let SharedTwoValue = sharedTwoStack.addText(
    api.ts_873a.ts_873a_used_space_media.state +
      api.ts_873a.ts_873a_used_space_media.attributes.unit_of_measurement
  );
  sharedTwoStack.size = new Size(width, 0);
  SharedTwoTitle.font = Font.regularRoundedSystemFont(12);
  SharedTwoValue.font = Font.regularRoundedSystemFont(12);
  storageStackOne_Q.addSpacer();

  // 儲存空間 Stack Two
  let storageStackTwo_Q = widget.addStack();

  // Backup - Stack
  let sharedThreeStack = storageStackTwo_Q.addStack();
  let sharedThreeTitle = sharedThreeStack.addText("Backup");
  sharedThreeStack.addSpacer();
  let sharedThreeValue = sharedThreeStack.addText(
    api.ts_873a.ts_873a_used_space_backup.state +
      api.ts_873a.ts_873a_used_space_backup.attributes.unit_of_measurement
  );
  sharedThreeStack.size = new Size(width, 0);
  sharedThreeTitle.font = Font.regularRoundedSystemFont(12);
  sharedThreeValue.font = Font.regularRoundedSystemFont(12);
  storageStackTwo_Q.addSpacer();

  // Ggininder - Stack
  let sharedFourStack = storageStackTwo_Q.addStack();
  let SharedFourTitle = sharedFourStack.addText("Ggininder");
  sharedFourStack.addSpacer();
  let SharedFourValue = sharedFourStack.addText(
    api.ts_873a.ts_873a_used_space_ggininder.state +
      api.ts_873a.ts_873a_used_space_ggininder.attributes.unit_of_measurement
  );
  sharedFourStack.size = new Size(width, 0);
  SharedFourTitle.font = Font.regularRoundedSystemFont(12);
  SharedFourValue.font = Font.regularRoundedSystemFont(12);
  storageStackTwo_Q.addSpacer();

  widget.addSpacer(spacer);

  // 底部 Stack
  let bottomStack_Q = widget.addStack();

  // 網路資訊 Stack
  let networkStack_Q = bottomStack_Q.addStack();
  networkStack_Q.layoutVertically();
  networkStack_Q.size = new Size(width, 0);

  // 網路資訊 - TX Stack
  let txStack_Q = networkStack_Q.addStack();
  let txTitle_Q = txStack_Q.addText("TX");
  txTitle_Q.font = Font.regularRoundedSystemFont(12);
  txStack_Q.addSpacer();

  let txValue_Q = txStack_Q.addText(
    api.ts_873a.ts_873a_network_up_eth0.state +
      api.ts_873a.ts_873a_network_up_eth0.attributes.unit_of_measurement
  );
  txValue_Q.font = Font.regularRoundedSystemFont(12);

  // 網路資訊 - RX Stack
  let rxStack_Q = networkStack_Q.addStack();
  let rxTitle_Q = rxStack_Q.addText("RX");
  rxTitle_Q.font = Font.regularRoundedSystemFont(12);
  rxStack_Q.addSpacer();

  let rxValue_Q = rxStack_Q.addText(
    api.ts_873a.ts_873a_network_down_eth1.state +
      api.ts_873a.ts_873a_network_down_eth1.attributes.unit_of_measurement
  );
  rxValue_Q.font = Font.regularRoundedSystemFont(12);
  bottomStack_Q.addSpacer();

  // 更新時間
  let infoStack_Q = bottomStack_Q.addStack();
  infoStack_Q.layoutVertically();
  infoStack_Q.size = new Size(width, 0);
  let infoTitle_Q = infoStack_Q.addText(" ");
  infoTitle_Q.font = Font.regularRoundedSystemFont(12);

  let infoValue_Q = infoStack_Q.addText(
    new Date(api.ts_873a.ts_873a_cpu_usage.last_updated).toLocaleString(
      "zh-TW",
      { timeZone: "Asia/Taipei", hour12: false }
    )
  );
  infoValue_Q.font = Font.regularRoundedSystemFont(12);
  bottomStack_Q.addSpacer();

  return widget;
}

async function loadAPI() {
  const url = "https://n8n.liyang.dev/webhook/get_status?device=";
  let api = {};

  let req = new Request(url + "ds1821plus");
  api.ds1821plus = await req.loadJSON();
  req = new Request(url + "ts_873a");
  api.ts_873a = await req.loadJSON();

  return api;
}

async function loadImg(url) {
  let req = new Request(url);
  return await req.loadImage();
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

function creatProgress(total, havegone) {
  const context = new DrawContext();
  context.size = new Size(width, height);
  context.opaque = false;
  context.respectScreenScale = true;
  context.setFillColor(new Color("#48484b"));
  const path = new Path();
  path.addRoundedRect(new Rect(0, 0, width, height), 3, 2);
  context.addPath(path);
  context.fillPath();
  havegone / total >= 0.8
    ? context.setFillColor(new Color("#ff0a33"))
    : context.setFillColor(new Color("#ffd60a"));
  const path1 = new Path();
  path1.addRoundedRect(
    new Rect(0, 0, (width * havegone) / total, height),
    3,
    2
  );
  context.addPath(path1);
  context.fillPath();
  return context.getImage();
}
