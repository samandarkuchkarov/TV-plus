function EPGScreen(){var that=this;var EPG_DAYS_COUNT=10;var parentScreen="";var navigationMode="normal";var epgMenuConfig={impuls:{numberOfDisplayItems:13},impuls_x:{numberOfDisplayItems:10}};try{var epgHelper=Object.create(Helper)}catch(e){var epgHelper=Helper}var epgMenu=new BaseMenu({menuId:"epg-menu",menuTag:"ul",itemIdPrefix:"epg",itemTag:"li",useFastRefresh:true,hideItemIfEmptyName:true,useFadedScrollEffect:true,loopMenuFromBeginToEnd:true,loopMenuFromEndToBegin:true,relatedItemIdPrefix:"epg-selector",getItemNameFunc:function(realItemIndex,itemIndex,node){var channel=App.epgScreen.getChannel();var timeshiftOffset=channel.timeshift_offset*3600;var program=App.data.getProgram(realItemIndex);if(program){if(!node){return true}else{var epgAirTimeElement=document.createElement("span");epgAirTimeElement.setAttribute("class","epg-air-time");epgAirTimeElement.innerHTML='<span class="time">'+Helper.formatTime(Helper.withTimezone(program.begin_time+timeshiftOffset))+"</span>";if(program.has_record){var epgHasRecordElement=document.createElement("span");epgHasRecordElement.setAttribute("class","epg-has-record");epgAirTimeElement.appendChild(epgHasRecordElement)}if(that.isProgramHasNotification(program.id)){Helper.addClassForObject(epgAirTimeElement,"has-notification");var epgHasNotificationElement=document.createElement("span");Helper.addClassForObject(epgHasNotificationElement,"notification");epgAirTimeElement.appendChild(epgHasNotificationElement)}node.appendChild(epgAirTimeElement);node.innerHTML+=program.name}}else{return""}},onItemClick:function(index){that.key_enter()},onItemMouseOver:function(index){var sourceItems=epgMenu.getCurrentPage()*epgMenu.getNumberOfDisplayItems()+index;epgMenu.setSelectedItem(index,sourceItems);that.refreshScreenFooter();App.epgScreen.refreshProgramInfo()}});var selectorMenu=new BaseMenu({displayItemsNumber:5,sourceItemsNumber:5,menuId:"epg-selector",menuTag:"div",itemIdPrefix:"epg-selector",itemTag:"div",useFastRefresh:false});var epgDaysMenu=new BaseMenu({menuId:"epg-day-menu",menuTag:"ul",itemIdPrefix:"epg-day-menu-today",useItemIdWithoutIndex:true,itemTag:"span",displayItemsNumber:1,useFastRefresh:false,getItemNameFunc:function(realItemIndex,itemIndex){try{var d=new Date(epgDaysData[realItemIndex]*1000);var gmt=-d.getTimezoneOffset()/60;d=new Date((epgDaysData[realItemIndex]-gmt*3600)*1000);var weekDay=App.lang.get("weekday-"+d.getDay());var date="";date=("0"+d.getDate()).substr(-2,2)+" "+App.lang.get("month-"+d.getMonth())+" "+d.getFullYear();return weekDay+", "+date}catch(e){return""}}});var channel=null;var selectLastProgramFlag=false,selectFirstProgramFlag=false;var epgDaysData=[];var programList=[];this.init=function(){_EPGScreen.init();navigationMode=App.clientSettings.navigation_mode;if(navigationMode==="horizontal"){Helper.setHtml("epg-parent-screen",App.lang.get("label-mainmenu-"+parentScreen))}};this.setParentScreen=function(value){parentScreen=value};this.getChannel=function(){return channel};this.setChannel=function(value){channel=value;if(!channel){return}var channelIconHtml='<img id="epg-channel-info-icon" src="'+Helper.getResourceUrl(channel.icon)+'" />';if(!channel.has_subscription){channelIconHtml+='<img src="'+Helper.getResourceUrl("media/img/main/locked-channel-icon.png")+'" class="locked">'}Helper.setHtml("epg-current-channel",channelIconHtml+" "+Helper.cropString(channel.name,18,"..."))};this.resize=function(displayWidth,displayHeight){var n=epgMenuConfig[App.settings.getStyleName()]["numberOfDisplayItems"];epgMenu.resetSelection();epgMenu.clear();if(App.data.getNumberOfPrograms()>0&&App.data.getNumberOfPrograms()<n){n=App.data.getNumberOfPrograms()}if(Helper.hasBodyClass("scale")){n--}epgMenu.setNumberOfDisplayItems(n);var s="";for(var i=0;i<n;i++){s+='<div id="epg-selector'+i+'"></div>'}Helper.setHtml("epg-selector",s);epgMenu.setNumberOfRows(n);epgMenu.setNumberOfColumns(1);epgMenu.setNumberOfSourceItems(App.data.getNumberOfPrograms());epgMenu.setSelectedItem(0,0);epgMenu.redrawMenuItems()};this.refresh=function(){epgMenu.redrawMenuItems();if(Helper.hasClass("epg-menu","record")){Helper.removeClass("epg-menu","record")}};this.resetDayTimestamps=function(){var d=new Date();var gmt=-d.getTimezoneOffset()/60;var now=Helper.withTimezone(App.data.getUtcTime())+gmt*3600;now-=now%86400;var d1=now,d2=now;epgDaysData=[];for(var i=0;i<EPG_DAYS_COUNT;i++){d1-=86400;d2+=86400;epgDaysData[EPG_DAYS_COUNT-1-i]=d1;epgDaysData[i+EPG_DAYS_COUNT+1]=d2}epgDaysData[EPG_DAYS_COUNT]=now};this.show=function(){App.playerScreen.hideTvInfoBar();App.playerScreen.hideVideoInfoBar();_EPGScreen.show();Helper.hideById("epg-remind-button");Helper.setHtml(epgMenu.getMenuId(),'<li id="epg0"></li>');this.clearProgramInfo();this.resetDayTimestamps();epgDaysMenu.clear();epgDaysMenu.setNumberOfDisplayItems(1);epgDaysMenu.setNumberOfSourceItems(epgDaysData.length);epgDaysMenu.setSelectedItem(0,0);epgDaysMenu.redrawMenuItems();for(var i=0;i<EPG_DAYS_COUNT;i++){epgDaysMenu.setNextItem()}this.loadData(true);if(navigationMode==="horizontal"){Helper.setHtml("epg-parent-screen",App.lang.get("label-mainmenu-"+parentScreen))}};this.clearProgramInfo=function(){Helper.setHtml("epg-channel-program","");Helper.setHtml("epg-channel-program-description","")};this.loadData=function(setCurrentProgram){if(!channel){return}var timeshiftOffset=channel.timeshift_offset*3600;var ths=this;var selectedDay=epgDaysMenu.getSelectedSourceItem();var d=new Date();var gmt=-d.getTimezoneOffset()/60+parseInt(App.settings.getTimezoneValue());var timeFrom=epgDaysData[selectedDay]-gmt*60*60-timeshiftOffset;var timeTo=epgDaysData[selectedDay]-gmt*60*60-timeshiftOffset+86400;Helper.addClass("epg-screen-container","loader");App.data.requestProgramList({cid:channel.id,time_from:timeFrom,time_to:timeTo},function(error){Helper.removeClass("epg-screen-container","loader");if(error==0){epgMenu.resetSelection();var n=epgMenu.getNumberOfRows();epgMenu.unsetMenuFocus();epgMenu.clear();if(App.data.getNumberOfPrograms()<n){n=App.data.getNumberOfPrograms()}if(n===0){Helper.showById("empty-epg");Helper.hideById("epg-channel-program-description")}else{Helper.hideById("empty-epg");Helper.showById("epg-channel-program-description");epgMenu.setNumberOfDisplayItems(n);epgMenu.setNumberOfColumns(1);epgMenu.setNumberOfSourceItems(App.data.getNumberOfPrograms());epgMenu.setSelectedItem(0,0);that.refreshScreenFooter();if(App.data.getProgram(0)["has_record"]){Helper.addClass("epg-menu","record")}else{Helper.removeClass("epg-menu","record")}epgMenu.redrawMenuItems();if(selectLastProgramFlag){selectLastProgramFlag=false;epgMenu.setLastItem()}else{if(selectFirstProgramFlag){selectFirstProgramFlag=false;epgMenu.setSelectedItem(0,0);that.refreshScreenFooter()}else{if(setCurrentProgram){var nowTime=App.data.getUtcTime();for(var i=0;i<App.data.getNumberOfPrograms();i++){var p=App.data.getProgram(i);if(parseInt(p.begin_time)+timeshiftOffset<=nowTime&&parseInt(p.end_time)+timeshiftOffset>nowTime){break}if(parseInt(p.begin_time)+timeshiftOffset>=nowTime){break}epgMenu.setNextItem()}}}}if(App.data.getNumberOfPrograms()<=0){Helper.setHtml("epg-menu","<li>"+App.lang.get("epg-is-empty-msg")+"</li>")}ths.refreshProgramInfo()}}},true)};this.refreshProgramInfo=function(){var program=App.data.getProgram(epgMenu.getSelectedSourceItem());if(!program){Helper.setHtml("epg-channel-program","");Helper.setHtml("epg-channel-program-description","");return}var desc=Helper.byId("epg-channel-program-description");desc.innerHTML="";desc.appendChild(this.createRatingsHtml(program));if(program.preview!==""){var imgElement=document.createElement("img");imgElement.setAttribute("id","epg-channel-program-preview");imgElement.setAttribute("src",program.preview);desc.appendChild(imgElement)}desc.innerHTML+='<span class="epg-name">'+program.short_name+"<span><br/>";var extraName=App.data.getProgramMetaValue(program,"extra_name");if(extraName){desc.innerHTML+=extraName+"<br />"}var tableElement=document.createElement("table");tableElement.setAttribute("id","epg-info-table");if(App.data.getProgramMetaValue(program,"countries").length!==0){var trElement=document.createElement("tr");var tdElement=document.createElement("td");var strongElement=document.createElement("strong");strongElement.innerHTML=App.lang.get("label-production");tdElement.appendChild(strongElement);var tdElement2=document.createElement("td");tdElement2.setAttribute("class","epg-table-value");var countries=App.data.getProgramMetaValue(program,"countries");for(var i=0;i<countries.length-1;i++){tdElement2.innerHTML+=countries[i]+", "}if(App.data.getProgramMetaValue(program,"year")!==""){tdElement2.innerHTML+=countries[countries.length-1]+", "+App.data.getProgramMetaValue(program,"year");trElement.appendChild(tdElement);trElement.appendChild(tdElement2)}else{tdElement2.innerHTML+=countries[countries.length-1];trElement.appendChild(tdElement);trElement.appendChild(tdElement2)}tableElement.appendChild(trElement)}if(App.data.getProgramMetaValue(program,"participants")["director"]){var trElement=document.createElement("tr");var tdElement=document.createElement("td");var strongElement=document.createElement("strong");strongElement.innerHTML=App.lang.get("label-director");tdElement.appendChild(strongElement);var tdElement2=document.createElement("td");tdElement2.setAttribute("class","epg-table-value");tdElement2.innerHTML=App.data.getProgramMetaValue(program,"participants")["director"];trElement.appendChild(tdElement);trElement.appendChild(tdElement2);tableElement.appendChild(trElement)}var styleCrop=100;if(App.data.getProgramMetaValue(program,"participants")["actor"]){var trElement=document.createElement("tr");var tdElement=document.createElement("td");var strongElement=document.createElement("strong");strongElement.innerHTML=App.lang.get("label-actors");tdElement.appendChild(strongElement);var tdElement2=document.createElement("td");tdElement2.setAttribute("class","epg-table-value");var actors=App.data.getProgramMetaValue(program,"participants")["actor"];var actstr="";for(i=0;i<actors.length-1;i++){actstr+=actors[i]+", "}actstr+=actors[actors.length-1];tdElement2.innerHTML+=Helper.cropString(actstr,styleCrop,"...");trElement.appendChild(tdElement);trElement.appendChild(tdElement2);tableElement.appendChild(trElement)}if(App.data.getProgramMetaValue(program,"participants")["presenter"]){var trElement=document.createElement("tr");var tdElement=document.createElement("td");var strongElement=document.createElement("strong");strongElement.innerHTML=App.lang.get("label-presenters");tdElement.appendChild(strongElement);var tdElement2=document.createElement("td");tdElement2.setAttribute("class","epg-table-value");var presenters=App.data.getProgramMetaValue(program,"participants")["presenter"];var presstr="";for(i=0;i<presenters.length-1;i++){presstr+=presenters[i]+", "}presstr+=presenters[presenters.length-1];tdElement2.innerHTML+=Helper.cropString(presstr,styleCrop,"...");trElement.appendChild(tdElement);trElement.appendChild(tdElement2);tableElement.appendChild(trElement)}desc.appendChild(tableElement);if(program.description){var divElement=document.createElement("div");divElement.setAttribute("id","epg-program-desc-text");divElement.innerHTML=program.description;desc.appendChild(divElement)}var descText=Helper.byId("epg-program-desc-text");if(descText){var paramsTable=Helper.byId("epg-info-table");var commonDesc=Helper.byId("epg-channel-program-description");var heightDesc=commonDesc.offsetHeight-(paramsTable.offsetTop-commonDesc.offsetTop+paramsTable.offsetHeight+Helper.totalIndentVertical("epg-program-desc-text"));heightDesc=heightDesc-heightDesc%Helper.lineHeight("epg-program-desc-text");Helper.byId("epg-program-desc-text").style.height=heightDesc+"px"}};this.createRatingsHtml=function(program){var ratingImgUrl=Helper.getResourceUrl("media/img/main/epg-rating-icon.png");var ratingsClass=program.preview?"":"not-preview";var epgChannelProgramRatingElement=document.createElement("div");epgChannelProgramRatingElement.setAttribute("id","epg-channel-program-rating");epgChannelProgramRatingElement.setAttribute("class",ratingsClass);if(program.rating>0){var ratingElement=document.createElement("span");ratingElement.setAttribute("class","rating age-rating");ratingElement.innerHTML=App.settings.getStyleName()==="impuls_x"?program.rating+"+":program.rating;var epgAgeRatingElement=document.createElement("img");epgAgeRatingElement.setAttribute("id","epg-age-rating");epgAgeRatingElement.setAttribute("src",Helper.getResourceUrl("media/img/main/epg-age-limit-icon.png"));ratingElement.appendChild(epgAgeRatingElement);epgChannelProgramRatingElement.appendChild(ratingElement)}var kinopoisk=App.data.getProgramMetaValue(program,"kinopoisk");if(kinopoisk){kinopoisk=Math.round(parseFloat(kinopoisk.replace(",","."))*10)/10;var ratingElement2=document.createElement("span");ratingElement2.setAttribute("class","rating kinopoisk-rating");var epgRatingLabelElement=document.createElement("span");epgRatingLabelElement.setAttribute("class","epg-rating-label");epgRatingLabelElement.innerHTML=App.lang.get("label-kinopoisk");var epgKinopoiskRatingElement=document.createElement("img");epgKinopoiskRatingElement.setAttribute("id","epg-kinopoisk-rating");epgKinopoiskRatingElement.setAttribute("src",ratingImgUrl);ratingElement2.appendChild(epgRatingLabelElement);ratingElement2.innerHTML+=kinopoisk;ratingElement2.appendChild(epgKinopoiskRatingElement);epgChannelProgramRatingElement.appendChild(ratingElement2)}var imdb=App.data.getProgramMetaValue(program,"imdb");if(imdb){imdb=Math.round(parseFloat(imdb.replace(",","."))*10)/10;var ratingElement3=document.createElement("span");ratingElement3.setAttribute("class","rating imdb-rating");var spanElement=document.createElement("span");spanElement.innerHTML="IMDb";var epgIMDbRatingElement=document.createElement("img");epgIMDbRatingElement.setAttribute("id","epg-imdb-rating");epgIMDbRatingElement.setAttribute("src",ratingImgUrl);ratingElement3.appendChild(spanElement);ratingElement3.innerHTML+=imdb;ratingElement3.appendChild(epgIMDbRatingElement);epgChannelProgramRatingElement.appendChild(ratingElement3)}return epgChannelProgramRatingElement};this.isProgramHasNotification=function(pid){var notifications=App.data.getNotificationList();for(var i=0;i<notifications.length;i++){if(notifications[i]["program_id"]==pid&&notifications[i]["program_begin_time"]+channel.timeshift_offset*3600>App.data.getUtcTime()){return true}}return false};this.refreshScreenFooter=function(){var program=App.data.getProgram(epgMenu.getSelectedSourceItem());if(program.begin_time+channel.timeshift_offset*3600<=App.data.getUtcTime()){Helper.hideById("epg-remind-button")}else{Helper.showById("epg-remind-button");if(that.isProgramHasNotification(program.id)){Helper.hideById("epg-label-remind");Helper.showById("epg-label-no-remind")}else{Helper.hideById("epg-label-no-remind");Helper.showById("epg-label-remind")}}};this.setNextDate=function(){epgDaysMenu.setNextItem();this.loadData()};this.setPrevDate=function(){epgDaysMenu.setPreviousItem();this.loadData()};this.key_back=function(){if(parentScreen.length>0){App.display.showScreen(parentScreen)}else{App.display.showScreen("mainmenu")}};this.key_down=Helper.stickyKeyPrevent(function(){if(!App.clientSettings.loop_epg_screen_menu_on_up_down_keys&&epgMenu.getSelectedSourceItem()===App.data.getNumberOfPrograms()-1){if(!selectFirstProgramFlag){selectFirstProgramFlag=true;App.epgScreen.setNextDate()}}else{epgMenu.setNextItem();that.refreshScreenFooter();epgHelper.delayedCall(function(){App.epgScreen.refreshProgramInfo()},400)}},40);this.key_up=Helper.stickyKeyPrevent(function(){if(!App.clientSettings.loop_epg_screen_menu_on_up_down_keys&&epgMenu.getSelectedSourceItem()===0){if(!selectLastProgramFlag){selectLastProgramFlag=true;App.epgScreen.setPrevDate()}}else{epgMenu.setPreviousItem();that.refreshScreenFooter();epgHelper.delayedCall(function(){App.epgScreen.refreshProgramInfo()},400)}},40);this.key_right=function(){if(navigationMode==="normal"){this.setNextDate()}};this.key_left=function(){if(navigationMode==="horizontal"){App.display.showScreen(parentScreen)}else{this.setPrevDate()}};this.key_enter=function(){var selectedProgram=epgMenu.getSelectedSourceItem();var program=App.data.getProgram(selectedProgram);App.playerScreen.setParentScreen(parentScreen);App.player.setMode(App.player.MODE_TVARCHIVE);App.player.playProgram(channel,program)};this.key_menu=function(){App.display.showScreen("mainmenu")};this.key_exit=function(){if(App.player.isActive()){App.display.showScreen("player")}else{App.display.showScreen("mainmenu")}};this.key_backspace=function(){this.key_exit()};this.key_fwd=function(){Helper.byId("epg-program-desc-text").scrollTop+=24};this.key_rew=function(){Helper.byId("epg-program-desc-text").scrollTop-=24};this.key_green=function(){var program=App.data.getProgram(epgMenu.getSelectedSourceItem());if(program){App.popupMessageScreen.setMessageText(program.description)}else{App.popupMessageScreen.setMessageText(App.lang.get("no-program-description-msg"))}App.display.showPopupScreen("popup-message")};this.key_ch_minus=function(){this.setPrevDate()};this.key_ch_plus=function(){this.setNextDate()};this.key_yellow=function(){var program=App.data.getProgram(epgMenu.getSelectedSourceItem());if(program.begin_time+channel.timeshift_offset*3600<App.data.getUtcTime()){App.popupMessageScreen.setMessageText(App.lang.get("program-expired-msg"));App.display.showPopupScreen("popup-message")}else{if(this.isProgramHasNotification(program.id)){App.data.requestNotificationDelete({pid:program.id},function(error){if(error==0){App.refreshNotifications(function(){epgMenu.redrawMenuItems();App.popupMessageScreen.setMessageText(App.lang.get("success-delete-notification-msg"));App.display.showPopupScreen("popup-message");that.refreshScreenFooter()})}})}else{App.data.requestNotificationCreate({pid:program.id,cid:channel.id,timeshift_offset:channel.timeshift_offset},function(error){if(error==0){App.refreshNotifications(function(){epgMenu.redrawMenuItems();App.popupMessageScreen.setMessageText(App.lang.get("success-create-notification-msg"));App.display.showPopupScreen("popup-message");that.refreshScreenFooter()})}})}}};this.key_power=function(){App.switchStandBy()};this.wheel=function(delta){if(delta>0){this.key_down()}else{this.key_up()}};this.key_long_enter=function(){if(App.showHelpButtonPanelFlag){var keys=[{action:"green",label:"label-scroll-description"},{action:"back",label:"label-back"}];App.popupKeyPanelScreen.setKeysForPanel(keys);App.popupKeyPanelScreen.setParentScreen("epg");App.display.showPopupScreen("popup-key-panel")}else{this.key_enter()}}}_EPGScreen=new BaseScreen();EPGScreen.prototype=_EPGScreen;