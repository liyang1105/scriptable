// 請手動填入一個 instagram url.
// 例如：https://instagram.com/threesmallfriends?igshid=YmMyMTA2M2Y=
// https://www.instagram.com/threesmallfriends/?igshid=YmMyMTA2M2Y%3D

const instagram_url = "https://instagram.com/threesmallfriends?igshid=YmMyMTA2M2Y=";
const regexp = /.*instagram.com\/([a-z0-9.]*)[?/]*/g;
const matched = regexp.exec(instagram_url);
const ins_id = matched[1];
const api_url = `https://rssbridge.liyang.dev/?action=display&bridge=InstagramBridge&context=Username&u=${ins_id}&media_type=picture&direct_links=on&format=Json`;
let api,
  widget,
  time = 0;

// create and show widget.
if (config.runsInApp) {
  // 在應用內執行
  let message = "請記得於腳本開始之前先手動修改 instagram_url。";
  const options = ["預覽（大）", "預覽（小）", "腳本更新", "離開"];
  const response = await generateAlert(message, options);

  // Update the code.
  if (response == 2) {
    // Determine if the user is using iCloud.
    let files = FileManager.local();
    const iCloudInUse = files.isFileStoredIniCloud(module.filename);

    // If so, use an iCloud file manager.
    files = iCloudInUse ? FileManager.iCloud() : files;

    // Try to download the file.
    try {
      const req = new Request(
        "https://file.liyang.dev/script/scriptable/rss-bridge.js"
      );
      const codeString = await req.loadString();
      files.writeString(module.filename, codeString);
      message = "腳本更新完成!\n若腳本已開啟，請關閉後再重新執行。";
    } catch {
      message = "更新失敗，請再試一遍。";
    }
    options = ["OK"];
    await generateAlert(message, options);
    return;
  }

  api = await loadAPI(api_url);
  widget = await createWidget(api);

  if (response == 0) {
    widget.presentLarge();
  }
  if (response == 1) {
    widget.presentSmall();
  } else {
    // Return if we need to exit.
    return;
  }
} else {
  // 在 Widget 執行
  api = await loadAPI(api_url);
  widget = await createWidget(api);

  Script.setWidget(widget);
}

Script.complete();

async function loadAPI(url) {
  let req = new Request(url);
  return await req.loadJSON();
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

async function createWidget(api) {
  let widget = new ListWidget();
  let item = Math.floor(Math.random() * Object.keys(api.items).length);

  // Add background
  widget.backgroundImage = await loadImg(
    "https://dummyimage.com/100x100/ffffff/ffffff.png&text=+"
  );

  const icon = await loadImg(
    "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/instagram.png"
  );

  let widgetStack = widget.addStack();

  // Show title
  let titleStack = widgetStack.addStack();
  titleStack.addText(api.items[item].title);
  titleStack.size = new Size(24, 0);
  // titleStack.borderWidth = 1;
  // titleStack.borderColor = new Color("#FF0000");

  widgetStack.addSpacer();

  // Show image
  let imageStack = widgetStack.addStack();
  let image = await loadImg(api.items[item].attachments[0].url);
  imageStack.addImage(image);
  // imageStack.borderWidth = 1;
  // imageStack.borderColor = new Color("#0000FF");

  if (image.size.width - image.size.height >= 15) {
    titleStack.size = new Size(0, 20);
    widgetStack.layoutVertically();
  }

  widget.url = api.items[item].url;

  log(ins_id + ", 第" + item + "張圖");

  return widget;
}
