function BattleCityScreen(){var prefix="media/js/games/battle_city/";var prefix_maps=prefix+"maps/map";var script_list=[prefix+"globalVariables.js",prefix+"ClassBot.js",prefix+"ClassBonus.js",prefix+"ClassBullet.js",prefix+"BotsMode.js",prefix+"image.js",prefix+"maps/map1.js",prefix+"mainGameFile.js"];var countOfMaps=20;var isInited=false;this.show=function(){_BattleCityScreen.show();if(isInited){this.openGame()}else{var maps=[];for(var i=1;i<countOfMaps+1;i++){maps[i-1]=prefix_maps+(i)+".js"}var src=maps.concat(script_list);Helper.addJSScriptListTag(src,function(){App.battleCityScreen.openGame()})}};this.openGame=function(){try{if(paused){switch(windCount){case 0:initMenu();break;case 1:initAfterFolding();break;case 3:ctx.drawImage(g_o,0,0);break;case 2:BotsModeAfterFolding();break;case 4:ctx.fillStyle="#808080";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(stage,240,238);ctx.drawImage(nums[numberOfStage+1],385,238);break;default:}}else{initMenu()}_BattleCityScreen.show()}catch(e){alert(e)}};this.init=function(){_BattleCityScreen.init();isInited=true};this.switchExitActions=function(){switch(windCount){case 0:break;case 1:if(timer!=null){clearInterval(timer)}for(var q=0;q<arrayOfCanvases.length;q++){arrayOfCanvases[q].clearRect(0,0,canvas.width,canvas.height)}numberOfStage=0;points=0;enemies.length=0;bullets.length=0;map.length=0;mapForBonus.length=0;windCount=0;break;case 3:ctx.clearRect(0,0,canvas.width,canvas.height);break;case 4:numberOfStage=0;App.data.requestGameScoreSave({game:"battle_city",score:pointsForRecord},function(error){ctx.clearRect(0,0,canvas.width,canvas.height);App.display.showScreen("games")});break;case 2:for(q=0;q<arrayOfCanvases.length;q++){arrayOfCanvases[q].clearRect(0,0,canvas.width,canvas.height)}clearInterval(timer);numberOfStage=0;points=0;enemies.length=0;bullets.length=0;map.length=0;mapForBonus.length=0;windCount=0;break;default:}if(windCount!=4){App.display.showScreen("games")}};this.key_left=function(){if(game_over!=55&&game_over!=100&&windCount==1&&!paused&&win!=1){enemies[0].hmove(0)}};this.key_right=function(){if(game_over!=55&&game_over!=100&&windCount==1&&!paused&&win!=1){enemies[0].hmove(2)}};this.key_down=function(){switch(windCount){case 0:ctx.fillStyle="#000000";ctx.fillRect(curX,curY,tankWid,tankWid);curY=cursor[(++curI)%3];ctx.drawImage(tanks[1],curX,curY);break;case 1:if(game_over!=55&&game_over!=100&&!paused&&win!=1){enemies[0].hmove(3)}break;default:}};this.key_up=function(){switch(windCount){case 0:ctx.fillStyle="#000000";ctx.fillRect(curX,curY,tankWid,tankWid);curI--;curI+=3;curY=cursor[curI%3];ctx.drawImage(tanks[1],curX,curY);break;case 1:if(game_over!=55&&game_over!=100&&!paused&&win!=1){enemies[0].hmove(1)}break;default:}};this.key_pause=function(){switch(windCount){case 1:if(paused){paused=false;ctx4.clearRect(200,238,107,24);timerLaunch()}else{paused=true;ctx4.drawImage(pause,200,238);timerStop()}break;case 2:if(paused){paused=false;ctx4.clearRect(200,238,107,24);timerBotsLaunch()}else{paused=true;ctx4.drawImage(pause,200,238);timerBotsStop()}break;default:}};this.key_play_pause=function(){this.key_pause()};this.key_menu=function(){if(windCount==1||windCount==2){timerStop()}for(var q=0;q<arrayOfCanvases.length;q++){arrayOfCanvases[q].clearRect(0,0,canvas.width,canvas.height)}if(windCount==4){App.data.requestGameScoreSave({game:"battle_city",score:pointsForRecord},function(error){windCount=0;initMenu()})}else{windCount=0;initMenu()}};this.key_back=function(){if(!paused){this.key_pause()}App.loginScreen.askToExit("game-hide-question-msg",function(value){if(value){App.display.showScreen("games")}else{App.battleCityScreen.key_pause()}})};this.key_enter=function(){switch(windCount){case 0:if(curI%3==0){windCount=1;initBattleCity()}else{if(curI%3==2){for(q=0;q<arrayOfCanvases.length;q++){arrayOfCanvases[q].clearRect(0,0,canvas.width,canvas.height)}this.key_exit()}else{windCount=2;BotsMode()}}break;case 1:var tempor;if(enemies[0].typeB=="improve2"){tempor=250}else{tempor=intervalForBullet}if(!paused&&game_over<=55){if(enemies[0].getTickForBirth()<0&&(timeCount-enemies[0].gettimeOfLastBullet())>tempor){birthBull(0);enemies[0].settimeOfLastBullet(timeCount)}}break;case 3:ctx.clearRect(0,0,canvas.width,canvas.height);initMenu();windCount=0;break;case 4:ctx.clearRect(0,0,canvas.width,canvas.height);initBattleCity();windCount=1;break;case 2:clearInterval(timerBots);for(var q=0;q<arrayOfCanvases.length;q++){arrayOfCanvases[q].clearRect(0,0,canvas.width,canvas.height)}numberOfStage=0;points=0;enemies.length=0;bullets.length=0;map.length=0;mapForBonus.length=0;windCount=0;initMenu();break;default:}};this.key_exit=function(){if(!paused){this.key_pause()}App.loginScreen.askToExit("game-close-question-msg",function(value){App.battleCityScreen.key_pause();if(value){App.battleCityScreen.switchExitActions()}else{if(windCount==0){choiceMode()}}})};this.key_backspace=function(){this.key_exit()}}_BattleCityScreen=new BaseScreen();BattleCityScreen.prototype=_BattleCityScreen;