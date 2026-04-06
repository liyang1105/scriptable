try {
  let api = await loadAPI();
  let widget = await createLargeWidget(api);

  if (config.runsInWidget) {
    // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
    Script.setWidget(widget);
  } else {
    widget.presentLarge();
  }
} catch (error) {
  // Error occurred, execute updateCode().
  console.error("腳本異常，請前往更新.\n" + error.message);
}

// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete();

async function createLargeWidget(api) {
  let image, badge;
  let badge_size = new Size(35, 35);

  let widget = new ListWidget();

  // 戰鬥狀態
  let statusStack = widget.addStack();
  statusStack.addSpacer();
  let warText;

  const calculateTimeRemaining = (date) => {
    const milliseconds = date.getTime() - new Date().getTime();
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return { hours, minutes, remainingSeconds };
  };

  switch (api.state) {
    case "preparation":
      const startTime = new Date(api.startTime);
      const {
        hours: prepHours,
        minutes: prepMinutes,
        remainingSeconds: prepSeconds,
      } = calculateTimeRemaining(startTime);
      warText = statusStack.addText(
        `準備日, 剩餘${prepHours}小時${prepMinutes}分${prepSeconds}秒`
      );
      break;

    case "inWar":
      const endTime = new Date(api.endTime);
      const {
        hours: warHours,
        minutes: warMinutes,
        remainingSeconds: warSeconds,
      } = calculateTimeRemaining(endTime);
      warText = statusStack.addText(
        `戰鬥日, 剩餘${warHours}小時${warMinutes}分${warSeconds}秒`
      );
      break;

    case "warEnded":
      warText = statusStack.addText("結算日");
      break;

    case "notInWar":
      warText = statusStack.addText("當前並未開戰");
      warText.font = Font.boldRoundedSystemFont(18);
      warText.textColor = new Color("#DE5C49");
      statusStack.addSpacer();
      return widget;
  }

  warText.font = Font.boldRoundedSystemFont(12.5);
  warText.textColor = new Color("#DE5C49");
  statusStack.addSpacer();

  widget.addSpacer(3);

  // 我方部落名稱，圖示
  let headerStack = widget.addStack();

  let clanStack = headerStack.addStack();
  clanStack.layoutVertically();

  let clanInfoStack = clanStack.addStack();
  clanInfoStack.addSpacer();
  clanInfoStack.url =
    "clashofclans://action=OpenClanProfile&tag=" +
    String(api.clan.tag).replace(/#/, "");
  let clanBadgeStack = clanInfoStack.addStack();
  image = await loadImage(api.clan.badgeUrls.small);
  badge = clanBadgeStack.addImage(image);
  badge.imageSize = badge_size;

  let clanNameStack = clanInfoStack.addStack();
  clanNameStack.layoutVertically();
  clanNameStack.addSpacer();
  clanNameStack.addText(api.clan.name).font = Font.boldRoundedSystemFont(13);
  clanNameStack.addSpacer();
  clanStack.addSpacer(3);

  clanInfoStack.addSpacer();

  // 將 members 按照地圖順序排序
  api.clan.members.sort(function (a, b) {
    return a.mapPosition - b.mapPosition;
  });
  api.opponent.members.sort(function (a, b) {
    return a.mapPosition - b.mapPosition;
  });

  let count = 0;
  for (const member of api.clan.members) {
    if (count >= 5) {
      break;
    }

    const playerName = clanStack.addStack();
    playerName.addText(member.name).font = Font.boldRoundedSystemFont(12);

    for (let index = 0; index < 2; index++) {
      addMemberInfo(clanStack, member, api.opponent, index);
    }

    clanStack.addSpacer(3);
    count++;
  }

  let vsStack = headerStack.addStack();
  vsStack.addText("Vs.").font = Font.boldRoundedSystemFont(12);
  vsStack.setPadding(23, 0, 0, 0);

  // 敵方部落名稱，圖示
  let opponentStack = headerStack.addStack();
  opponentStack.layoutVertically();
  let opponentInfoStack = opponentStack.addStack();
  opponentInfoStack.addSpacer();
  opponentInfoStack.url =
    "clashofclans://action=OpenClanProfile&tag=" +
    String(api.opponent.tag).replace(/#/, "");
  let opponentBadgeStack = opponentInfoStack.addStack();
  image = await loadImage(api.opponent.badgeUrls.small);
  badge = opponentBadgeStack.addImage(image);
  badge.imageSize = badge_size;

  let opponentNameStack = opponentInfoStack.addStack();
  opponentNameStack.layoutVertically();
  opponentNameStack.addSpacer();
  opponentNameStack.addText(api.opponent.name).font =
    Font.boldRoundedSystemFont(13);
  opponentNameStack.addSpacer();
  opponentStack.addSpacer(3);

  opponentInfoStack.addSpacer();

  count = 0;
  for (const member of api.opponent.members) {
    if (count >= 5) {
      break;
    }

    const playerName = opponentStack.addStack();
    playerName.addText(member.name).font = Font.boldRoundedSystemFont(12);

    for (let index = 0; index < 2; index++) {
      addMemberInfo(opponentStack, member, api.clan, index);
    }

    opponentStack.addSpacer(3);
    count++;
  }
  widget.addSpacer(3);

  // 建立底部（總摧毀率、進攻次數、對戰星數）
  const bottomStack = widget.addStack();
  bottomStack.layoutVertically();

  // 對戰星數
  createDataStack(
    api.clan.stars + "/" + api.teamSize * 3,
    "對戰星數",
    api.opponent.stars + "/" + api.teamSize * 3
  );

  // 進攻次數
  createDataStack(
    api.clan.attacks + "/" + api.teamSize * api.attacksPerMember,
    "進攻次數",
    api.opponent.attacks + "/" + api.teamSize * api.attacksPerMember
  );

  // 總摧毀率
  createDataStack(
    api.clan.destructionPercentage + "%",
    "總摧毀率",
    api.opponent.destructionPercentage + "%"
  );

  function createDataStack(value, label, value2) {
    const stack = bottomStack.addStack();

    const valueStack = stack.addStack();
    valueStack.addSpacer();
    valueStack.addText(String(value)).font = Font.regularRoundedSystemFont(12);
    valueStack.addSpacer();
    const labelStack = stack.addStack();
    labelStack.addText(label).font = Font.boldRoundedSystemFont(12);
    const value2Stack = stack.addStack();
    value2Stack.addSpacer();
    value2Stack.addText(String(value2)).font =
      Font.regularRoundedSystemFont(12);
    value2Stack.addSpacer();
  }

  return widget;
}

// get coc api data
async function loadAPI() {
  let url =
    "https://n8n.liyang.dev/webhook/api/clash-of-clans?clans=%232QGLLJLLG&get=currentwar";
  let req = new Request(url);
  let api = await req.loadJSON();

  return api;
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

async function loadImage(url) {
  let req = new Request(url);
  return req.loadImage();
}

function getStarsText(stars) {
  switch (stars) {
    case 0:
      return "☆☆☆";
    case 1:
      return "★☆☆";
    case 2:
      return "★★☆";
    case 3:
      return "★★★";
    default:
      return "";
  }
}

function addMemberInfo(stack, member, target, index) {
  const fightStack = stack.addStack();
  const fightTitle = fightStack.addStack();

  if (member.hasOwnProperty("attacks") && member.attacks.length > index) {
    const targetObject = target.members.find(
      (opponent) => opponent.tag === member.attacks[index].defenderTag
    );
    fightTitle.addText(
      `${targetObject.mapPosition}. ${targetObject.name}`
    ).font = Font.regularRoundedSystemFont(12);
    fightTitle.addSpacer();
    const fightResult = fightStack.addStack();
    const stars = member.attacks[index].stars;
    fightResult.addText(getStarsText(stars)).font =
      Font.regularRoundedSystemFont(12);
  } else {
    fightTitle.addText(`第 ${index + 1} 次攻擊`).font =
      Font.regularRoundedSystemFont(12);
    fightTitle.addSpacer();
    const fightResult = fightStack.addStack();
    fightResult.addText("未使用").font = Font.regularRoundedSystemFont(12);
  }
}
