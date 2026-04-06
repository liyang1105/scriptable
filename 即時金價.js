// This script shows a random Scriptable API in a widget. The script is meant to be used with a widget configured on the Home Screen.
// You can run the script in the app to preview the widget or you can go to the Home Screen, add a new Scriptable widget and configure the widget to run this script.
// You can also try creating a shortcut that runs this script. Running the shortcut will show widget.
let api = await loadDocs()
let widget = await createWidget(api)
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget)
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentMedium()
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete()

async function createWidget(api) {
  let appIcon = await loadAppIcon()
  let title = "貴金屬牌價"
  let widget = new ListWidget()

  // Add background gradient
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("141414"),
    new Color("13233F")
  ]
  widget.backgroundGradient = gradient

  // Show app icon and title
  let iconStack = widget.addStack()
  let appIconElement = iconStack.addImage(appIcon)
  appIconElement.imageSize = new Size(20, 20)
  appIconElement.cornerRadius = 4
  iconStack.addSpacer(4)
  let titleElement = iconStack.addText(title)
  titleElement.textColor = Color.white()
  titleElement.textOpacity = 0.7
  titleElement.font = Font.mediumSystemFont(15)
  widget.addSpacer(15)

  // 標題
  
  let titleStack = widget.addStack()
  titleStack.layoutHorizontally();
  let dateElement = titleStack.addText("日期")
  let goldElement = titleStack.addText("黃金")
  let platinumElement = titleStack.addText("白金")

  let goldStack = apiStack.addStack()
  // goldStack.layoutVertically()
  
  nameElement.textColor = Color.white()
  nameElement.font = Font.boldSystemFont(15)
  goldStack.addSpacer(2)
  let descriptionElement = goldStack.addText(api[2].date)
  descriptionElement.minimumScaleFactor = 0.5
  descriptionElement.textColor = Color.white()
  descriptionElement.font = Font.systemFont(14)

  apiStack.addSpacer()

  let platinumStack = apiStack.addStack()
  // platinumStack.layoutVertically()
  let nameElement2 = platinumStack.addText("白金")
  nameElement2.textColor = Color.white()
  nameElement2.font = Font.boldSystemFont(15)
  platinumStack.addSpacer(2)
  let descriptionElement2 = platinumStack.addText(api[2].date)
  descriptionElement2.minimumScaleFactor = 0.5
  descriptionElement2.textColor = Color.white()
  descriptionElement2.font = Font.systemFont(14)

  // UI presented in Siri ans Shortcuta is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8)
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward")
    let footerStack = widget.addStack()
    let linkStack = footerStack.addStack()
    linkStack.centerAlignContent()
    linkStack.url = api.url
    let linkElement = linkStack.addText("Read more")
    linkElement.font = Font.mediumSystemFont(13)
    linkElement.textColor = Color.blue()
    linkElement.url = "https://www.gck99.com.tw/gold1.php?yy=2024&mm=11"
    linkStack.addSpacer(3)
    let linkSymbolElement = linkStack.addImage(linkSymbol.image)
    linkSymbolElement.imageSize = new Size(11, 11)
    linkSymbolElement.tintColor = Color.blue()
    footerStack.addSpacer()
    // Add link to documentation
    let docsSymbol = SFSymbol.named("book")
    let docsElement = footerStack.addImage(docsSymbol.image)
    docsElement.imageSize = new Size(20, 20)
    docsElement.tintColor = Color.white()
    docsElement.imageOpacity = 0.5
    docsElement.url = "https://www.gck99.com.tw/gold1.php?yy=2024&mm=11"
  }
  return widget
}

async function loadDocs() {
  let url = "https://n8n.liyang.dev/webhook/adf3e801-7207-4986-a512-a463b36805f0"
  let req = new Request(url)
  return await req.loadJSON()
}

async function loadAppIcon() {
  let url = "https://cdn-icons-png.flaticon.com/256/2497/2497823.png"
  let req = new Request(url)
  return req.loadImage()
}