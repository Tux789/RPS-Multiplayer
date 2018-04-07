var playerName;
var playerPosition;
var playerChoice;
var playerScore;
var gameID = 0;
var messages = [];
var ties = 0;
var wins = 0;
var losses =0;


var config = {
    apiKey: "AIzaSyBAGz5oxAJ4DrVMs-2E9pTVOTrN7MhEQNU",
    authDomain: "rps-multiplayer-1586e.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-1586e.firebaseio.com",
    projectId: "rps-multiplayer-1586e",
    storageBucket: "",
    messagingSenderId: "195659551315"
  };

  firebase.initializeApp(config);
  var database = firebase.database();

  // function DESTROYEVERYTHING(){
  // 	database.ref("AppInfo").set({
  // 		gameID: 0,
  // 		numPlayersJoined: 0,
  // 	});
  // 	//database.child("GameData").remove();
  // 	sessionStorage.clear();
  // };

  database.ref("AppInfo").once('value').then(function(snapshot){
  //read local gameID from SessionStorage
  	if(JSON.parse(sessionStorage.getItem("RPSGameID")) !== null){
  	gameID = JSON.parse(sessionStorage.getItem("RPSGameID"));
  	playerPosition = JSON.parse(sessionStorage.getItem("RPSplayerPosition"));
  	playerName = JSON.parse(sessionStorage.getItem("RPSplayerName"));
  }else{
  	playerName = prompt("User Name?");
  	var numPlayersJoined = snapshot.val().numPlayersJoined;
  	gameID = snapshot.val().gameID;
  	console.log(numPlayersJoined + " " + gameID);
  	if(numPlayersJoined < 2){  		
  		numPlayersJoined++;
  		playerPosition = numPlayersJoined;
  		if(playerPosition < 2){
  			updates = {};
  			updates["playerOneName"] = JSON.stringify(playerName);
  			database.ref("GameData/" + gameID).update(updates);
  		}else{
  			updates = {};
  			updates["playerTwoName"] = JSON.stringify(playerName);
  			database.ref("GameData/" + gameID).update(updates);
  		}
  		sessionStorage.setItem("RPSGameID",JSON.stringify(gameID));
  		sessionStorage.setItem("RPSplayerPosition",JSON.stringify(playerPosition));
  		sessionStorage.setItem("RPSplayerName",JSON.stringify(playerName));

  		database.ref("AppInfo").set({
  			gameID: gameID,
  			numPlayersJoined: numPlayersJoined,
  		});

  	}else{
  		playerName = prompt("User Name?");
  		numPlayersJoined = 1;
  		playerPosition = numPlayersJoined;
  		gameID++;
  		sessionStorage.setItem("RPSGameID",JSON.stringify(gameID));
  		sessionStorage.setItem("RPSplayerPosition",JSON.stringify(playerPosition));
  		sessionStorage.setItem("RPSplayerName",JSON.stringify(playerName));
  	database.ref("AppInfo").set({
  		gameID: gameID,
  		numPlayersJoined: numPlayersJoined,
  	});
  	updates = {};
  			updates["playerOneName"] = JSON.stringify(playerName);
  			database.ref("GameData/" + gameID).update(updates);
  	}
  }
  	
  });
function initializeGame(){
  console.log(sessionStorage.getItem("RPSWins"));
  if(sessionStorage.getItem("RPSWins") !== null){
wins = parseInt(sessionStorage.getItem("RPSWins"));
losses = parseInt(sessionStorage.getItem("RPSLosses"));
ties = parseInt(sessionStorage.getItem("RPSTies"));
    }

}
function updateChatWindow(){
	$("#chatWindow").empty();
	var messageStr = "";
	for(i=0;i<messages.length;i++){
		messageStr = messageStr + messages[i]+"\r\n";
	}
	$("#chatWindow").text(messageStr);
}


//Chat Button Clicked
$("#submitMessage").on("click",function(){
	//event.preventDefault();
	messages.push(playerName + ": " + $("#chatMessage").val().trim());
	
	$("#chatMessage").val("");
	var updates = {};
	updates["messages"] = JSON.stringify(messages);
	database.ref("GameData/" + gameID +"/messages").update(updates);
	updateChatWindow();	
});

//Message posted to DB
database.ref("GameData/" + gameID +"/messages").on("value",function(snapshot){
	if(snapshot.child("messages").exists()){
	messages = JSON.parse(snapshot.val().messages);
}
	updateChatWindow();
});

//Update to player name(s)
database.ref("GameData/" + gameID).on("value",function(snapshot){
	if(snapshot.child("playerOneName").exists()){
		$("#player1Name").text(JSON.parse(snapshot.val().playerOneName));
	}
	if(snapshot.child("playerTwoName").exists()){
		$("#player2Name").text(JSON.parse(snapshot.val().playerTwoName));
	}
	
});

//Get player's choice and update database
$(document).on("click",".choiceButton",function(){
  playerChoice = $(this).attr("data-choice");
  if(playerPosition === 1){
    var updates = {};
    updates["playerOneChoice"] = playerChoice;
    database.ref("GameData/" + gameID + "/choices").update(updates);
  }else{
    var updates = {};
    updates["playerTwoChoice"] = playerChoice;
    database.ref("GameData/" + gameID + "/choices").update(updates);
  }
});

//Update player choices
database.ref("GameData/"+gameID+"/choices").on("value",function(snapshot){
		if(snapshot.child("playerOneChoice").exists() && snapshot.child("playerTwoChoice").exists()){
				var p1Choice = snapshot.val().playerOneChoice;
				var p2Choice = snapshot.val().playerTwoChoice;
			if(p1Choice !== "null" && p2Choice !== "null"){
				evaluate(p1Choice, p2Choice);
			}
		}
});
function updateScore(){
  sessionStorage.setItem("RPSWins",wins);
  sessionStorage.setItem("RPSLosses",losses);
  sessionStorage.setItem("RPSTies",ties);
  $("#wins").text(wins);
  $("#losses").text(losses);
  $("#ties").text(ties);
}


function evaluate(p1Choice, p2Choice){
	database.ref("GameData/"+gameID+"/choices").set({
		playerOneChoice: "null",
		playerTwoChoice: "null",
	});
	if(p1Choice === p2Choice){
		ties++;
    updateScore();
    console.log(ties);
		
	}
  //if p1 = r
	if(p1Choice === 'R'){
    //if r/p
		if(p2Choice === 'P'){
      //if r/p p1
			if(playerPosition === 1){
				losses++;
        updateScore();
      //if r/p p2
			}else{
        wins++;
        updateScore();
      }
		}
    // if r/s 
    if(p2Choice === 'S'){
      if(playerPosition === 1){
      //if r/s p1
        wins++;
        updateScore();
      //if r/s p2
      }else{
        losses++;
        updateScore();
      }
    }
	}// end p1 = r

  //p1 = P
  if(p1Choice === "P"){
    //if p/r
    if(p2Choice === "R"){
      //if p/r p1
      if(playerPosition === 1){
        wins++;
        updateScore();
      //if p/r p2
      }else{
        losses++;
        updateScore();
      }
    }
    //if p/s
    if(p2Choice === "S"){
      //if p/s p1
      if(playerPosition === 1){
        losses++;
        updateScore();
      //if p/s p2
      }else{
        wins++;
        updateScore();
      }
    }
  } //end p1 = p

  //p1 = s
  if(p1Choice === "S"){
    //if s/r
    if(p2Choice === "R"){
      // if s/r p1
      if(playerPosition === 1){
        losses++;
        updateScore();
      //if s/r p2
      }else{
        wins++;
        updateScore();
      }
    }
    //if s/p
    if(p2Choice === "P"){
      if(playerPosition === 1){
        wins++;
        updateScore();
      }else{
        losses++;
        updateScore();
      }

    }// end p1 = s
  }
}// end evaluate
initializeGame();
updateScore();

//DESTROYEVERYTHING();
