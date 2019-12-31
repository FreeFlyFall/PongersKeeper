function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doGet(e) {
  
  return HtmlService.createTemplateFromFile("index").evaluate();
  
}

//Session.getActiveUser()

var SSURL = "https://docs.google.com/spreadsheets/d/1fatnk5Jkd0zkAGpGZDwxLr2l_cao_oI0WRpU3_5WrOo/edit#gid=0"
var ss = SpreadsheetApp.openByUrl(SSURL);
var ws = ss.getSheetByName("Sheet1");

var dataSet = ws.getRange("A2:E2").getValues()[0,0];
var dataArray = dataSet.toString().split(",");

var p1score = dataArray[0];
var p2score = dataArray[2];
var target = dataArray[1];
var p1active = dataArray[3];
var p2active = dataArray[4];


/// Initial setup for player IDs in different browsers
function initialSetup(state){
  // If isp1 is 0, change it to 1 and return state with isp1 as 1
  if (ws.getRange("D2").getValue() == 0){
    ws.getRange("D2").setValue(1);
    state.isp1 = 1;
  // else if isp2 is 0, change it to 1 and return state with isp2 as 1
  } else if (ws.getRange("E2").getValue() == 0) {
    ws.getRange("E2").setValue(1);
    state.isp2 = 1;
  }
  Logger.log(state);
  return state;
}

function updateState(state){
  // If player 1
  if (state.isp1){
    // Read the target score and opponent score
    var data = ws.getRange("B2:C2").getValues()[0,0].toString().split(",");
    //Add parseInt()
    var target = data[0];
    var p2score = data[1];
    
    // Set the score for player 1 in the db. If the target is marked for update, update it in the db. Otherwise, return the current target value. Also, return the opponents score.
    if (state.updateTarget){
      ws.getRange("A2:B2").setValues([[state.p1score,state.target]]);
    } else {
      ws.getRange("A2").setValue(state.p1score);
      state.target = target;
    }
    state.p2score = p2score;
  }
  else if (state.isp2){
    // Read the target score and opponent score
    var data = ws.getRange("A2:B2").getValues()[0,0].toString().split(",");
    //Add parseInt()
    var target = data[1];
    var p1score = data[0];
    
    // Set the score for player 2 in the db. If the target is marked for update, update it in the db. Otherwise, return the current target value. Also, return the opponents score.
    if (state.updateTarget){
      ws.getRange("B2:C2").setValues([[state.target, state.p2score]]);
    } else {
      ws.getRange("C2").setValue(state.p2score);
      state.target = target;
    }
    state.p1score = p1score;
  }
  // Fix: resetting to 0 in js after the success handler doesn't work because although it's written sequentially after the call, the update returns state with updateTarget as 1 and then state is set to the returned state
  state.updateTarget = 0;
  return state;
}

/// Reset DB
function resetDB(){
  ws.getRange("A2:E2").setValues([[0,21,0,0,0]]);
}
