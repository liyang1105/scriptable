// Scriptable Large Widget to display an image and open a URL on tap
let url = "https://file.liyang.dev/files/20230214_zh.png";
let req = new Request(url);
let img = await req.loadImage();

let widget = new ListWidget();
widget.setPadding(0, 0, 0, 0);
widget.addSpacer();
widget.addImage(img);
widget.addSpacer();

// Set the URL to be opened when tapping the widget
widget.url = url;

if (!config.runsInWidget) {
  await widget.presentLarge();
}

Script.setWidget(widget);
Script.complete();
