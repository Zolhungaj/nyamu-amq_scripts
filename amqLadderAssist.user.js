// ==UserScript==
// @name         AMQ Ladder Assist
// @namespace    https://github.com/nyamu-amq
// @version      0.1
// @description  
// @author       nyamu
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @match        https://animemusicquiz.com/*
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js

// ==/UserScript==

if (document.getElementById('startPage')) {
	return
}

let ladderWindow;
let ladderWindowTable;
let ladderWindowOpenButton;
function createLadderWindow() {
	ladderWindow = new AMQWindow({
		title: "Ladder Info",
		position: {
			x: 0,
			y: 34
		},
		width: 400,
		height: 374,
		minWidth: 400,
		minHeight: 300,
		zIndex: 1010,
		resizable: true,
		draggable: true
	});

	ladderWindow.addPanel({
		id: "ladderWindowTableContainer",
		width: 1.0,
		height: "calc(100%)",
		scrollable: {
			x: false,
			y: true
		}
	});

	ladderWindowTable = $(`<table id="ladderWindowTable" class="table floatingContainer"></table>`);
	ladderWindow.panels[0].panel.append(ladderWindowTable);

	clearTable();

	// ladderWindowOpenButton = $(`<div id="qpLadderButton" class="clickAble qpOption"><i aria-hidden="true" class="fa fa-database qpMenuItem"></i></div>`)
	// .click(function () {
	// 	if(ladderWindow.isVisible()) {
	// 		$(".rowSelected").removeClass("rowSelected");
	// 		ladderWindow.close();
	// 	}
	// 	else {
	// 		openLadderWindow();
	// 	}
	// })
	// .popover({
	// 	placement: "bottom",
	// 	content: "Ladder Info",
	// 	trigger: "hover"
	// });

	// let oldWidth = $("#qpOptionContainer").width();
	// $("#qpOptionContainer").width(oldWidth + 35);
	// $("#qpOptionContainer > div").append(ladderWindowOpenButton);
}
function clearTable() {
	ladderWindowTable.children().remove();

	let header = $(`<tr class="header"></tr>`)
	let idCol = $(`<td class="matchId"><b>ID#</b></td>`);
	let typeCol = $(`<td class="matchType"><b>Type<b></td>`);
	let opponentCol = $(`<td class="matchOpponent"><b>Opponent</b></td>`);
	let tierCol = $(`<td class="matchTier"><b>Tier</b></td>`);
	let roomCol = $(`<td class="matchSetting"><b>R</b></td>`);
	let inviteCol = $(`<td class="matchInvite"><b>I</b></td>`);

	header.append(idCol);
	header.append(typeCol);
	header.append(opponentCol);
	header.append(tierCol);
	header.append(roomCol);
	header.append(inviteCol);
	ladderWindowTable.append(header);
}

createLadderWindow();

var lastRequest=0;
function openLadderWindow() {
	if(Date.now()-lastRequest>10000) {
		lastRequest=Date.now();
		clearTable();
		sendRequest();
	}
	ladderWindow.open();
}
function updateLadderWindow() {
	clearTable();
	for(let data of matchData) {
		let matchrow=$(`<tr id="match`+data[0]+`" class="matchRow"></tr>`);
		let idCol = $(`<td class="matchId">`+data[0]+`</td>`);
		let typeCol = $(`<td class="matchType">`+data[1]+`</td>`);
		let opponentCol = $(`<td class="matchOpponent">`+data[3]+`</td>`);
		let tierCol = $(`<td class="matchTier">`+data[4]+`</td>`);
		let roomCol = $(`<td class="matchSetting"></td>`);
		let inviteCol = $(`<td class="matchInvite"></td>`);

		let roomButton = $(`<div class="clickAble"><i aria-hidden="true" class="fa fa-home"></i></div>`)
		.click(function () {
			hostRoom(data[1],data[4]);
		})
		.popover({
			placement: "bottom",
			content: "Host Room or Change Settings",
			trigger: "hover"
		});
		roomCol.append(roomButton);

		let inviteButton = $(`<div class="clickAble"><i aria-hidden="true" class="fa fa-envelope"></i></div>`)
		.click(function () {
			if(isOnline(data[3])) {
				inviteUser(data[3]);
			}
		})
		.popover({
			placement: "bottom",
			content: "Invite "+data[3],
			trigger: "hover"
		});
		inviteCol.append(inviteButton);

		matchrow.append(idCol);
		matchrow.append(typeCol);
		matchrow.append(opponentCol);
		matchrow.append(tierCol);
		matchrow.append(roomCol);
		matchrow.append(inviteCol);

		ladderWindowTable.append(matchrow);
	}
	updateOpponentOnlineState()
}
function updateOpponentOnlineState() {
	$(".matchRow").each((index,elem)=>{
		if(isOnline(matchData[index][3])) {
			$(elem).addClass("onlineOpponent");
			$(elem).removeClass("offlineOpponent");
		}
		else {
			$(elem).removeClass("onlineOpponent");
			$(elem).addClass("offlineOpponent");
		}
	})
}

function getDifficulty(type, tier) {
	let settings={};
	if(type.includes('random')) {
		settings={
			"diamond":[0,100],
			"platimun":[0,100],
			"gold":[10,100],
			"silver":[20,100],
			"bronze":[30,100],
		};
	}
	else if(type.includes('list')) {
		settings={
			"diamond":[0,40],
			"platimun":[0,40],
			"gold":[0,40],
			"silver":[0,60],
			"bronze":[0,100],
		};
	}
	else if(type.includes('1000')) {
		settings={
			"diamond":[0,40],
			"platimun":[0,40],
			"gold":[0,60],
			"silver":[0,100],
			"bronze":[20,100],
		};
	}
	return settings[tier];
}
function hostRoom(type, tier) {
	if(viewChanger.currentView!=="roomBrowser" && !(lobby.inLobby && lobby.isHost) ) return;
	type=type.toLowerCase();
	tier=tier.toLowerCase();
	hostModal.selectStandard();
	let settingObject = hostModal._settingStorage._serilizer.decode("2020k11111030k000001110000000k00k051o00k012r02i0a46311002s0111111111002s0111002s01a111111111102a1111111111i61k403-11111--");
	hostModal.changeSettings(settingObject);
	setTimeout(()=>{
		hostModal.$roomName.val("IHI");
		hostModal.$privateCheckbox.prop("checked",true);
		hostModal.$passwordInput.val("ladder");

		hostModal.songDiffRangeSliderCombo.setValue(getDifficulty(type,tier));
		if(type.includes('random')) hostModal.$songPool.slider('setValue',1);
		if(type.includes('opening')) {
			hostModal.$songTypeEnding.prop("checked",false);
			hostModal.$songTypeInsert.prop("checked",false);
		}
		else if(type.includes('ending')) {
			hostModal.$songTypeOpening.prop("checked",false);
			hostModal.$songTypeInsert.prop("checked",false);
		}
		else if(type.includes('insert')) {
			hostModal.$songTypeOpening.prop("checked",false);
			hostModal.$songTypeEnding.prop("checked",false);
		}

		if(viewChanger.currentView==="roomBrowser") roomBrowser.host();
		else lobby.changeGameSettings();
	},1);
}

function isOnline(username) {
	return socialTab.allPlayerList._playerEntries.hasOwnProperty(username);
}

var matchData=[];
function sendRequest() {
	GM_xmlhttpRequest({
		method: "POST",
		url: "https://script.google.com/macros/s/AKfycbyoBo5WyPqYYGTYMBWfOpFlSJp9g3X9E6SXZghko0LGrfnj2G9T/exec",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		data: "cm=user&user="+selfName,
		onload: function (response) {
			var res=JSON.parse(response.responseText);
			matchData=res.data;
			matchData.sort(function(a,b){return a[0]*1-b[0]*1;});
			updateLadderWindow();
		},
		onerror: function (response) {
			console.log(response.responseText);
		}
	});
}

function inviteUser(playerName) {
	if (!(lobby.inLobby || quiz.inQuiz)) return;
	socket.sendCommand({
		type: "social",
		command: "invite to game",
		data: {
			target: playerName
		}
	});
}

new Listener("online user change", function (change) {
	setTimeout(() => {updateOpponentOnlineState();},1);
}).bindListener();

function dockeyup(event) {
	if(event.altKey && event.keyCode==76) {
		if (ladderWindow.isVisible()) {
			ladderWindow.close();
		}
		else {
			openLadderWindow()
		}
	}
}
document.addEventListener('keyup', dockeyup, false);

AMQ_addScriptData({
    name: "Ladder Assist",
    author: "nyamu",
    description: `
        <p>Ladder Assist</p>
    `
});
AMQ_addStyle(`
    #ladderWindowTableContainer {
        padding: 10px;
    }
    .matchRow {
        height: 30px;
    }
    .matchRow > td {
        vertical-align: middle;
        border: 1px solid black;
        text-align: center;
    }
    .matchId {
        min-width: 40px;
    }
    .matchType {
        min-width: 80px;
    }
    .matchOpponent {
        min-width: 80px;
    }
    .matchTier {
        min-width: 40px;
    }
    .matchSetting {
        min-width: 20px;
    }
    .matchInvite {
        min-width: 20px;
    }
    .onlineOpponent {
        background-color: rgba(0, 200, 0, 0.07);
    }
    .offlineOpponent {
        background-color: rgba(255, 0, 0, 0.07);
    }
    #qpLadderButton {
        width: 30px;
        height: 100%;
        margin-right: 5px;
    }
`);