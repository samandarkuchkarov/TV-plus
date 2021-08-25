function TVChannelsScreen(){var categoriesMenu=new BaseMenu({menuId:"categories-menu",menuTag:"ul",itemIdPrefix:"category",itemTag:"li",useFastRefresh:true,hideItemIfEmptyName:true,getItemNameFunc:function(realItemIndex,itemIndex,node){var category=App.data.getCategory(realItemIndex);if(category){if(!node){return true}else{categoriesArray[category.id]=category.color;var ringElement=document.createElement("div");ringElement.setAttribute("class","ring");ringElement.setAttribute("style","background-color:"+category.color);node.appendChild(ringElement);node.innerHTML+=Helper.cropString(category.name,13,"..")}}else{return""}}});categoriesMenu.colorize=function(){for(var i=0;i<this.getNumberOfDisplayItems();i++){Helper.removeClass("category"+i,"gray")}};categoriesMenu.uncolorize=function(){for(var i=0;i<this.getNumberOfDisplayItems();i++){if(i===this.getSelectedDisplayItem()){Helper.removeClass("category"+i,"gray")}else{Helper.addClass("category"+i,"gray")}}};var that=this;var channelsMenu=new BaseMenu({menuId:"channels-menu",menuTag:"ul",itemIdPrefix:"channel",itemTag:"li",useFastRefresh:true,hideItemIfEmptyName:true,relatedItemIdPrefix:"tvchannels-selector",getItemNameFunc:function(realItemIndex,itemIndex,node){var channel=App.data.getChannel(realItemIndex);if(channel){if(!node){return true}else{var infoSuffix="";var w="";var tvEpgItemElement=Helper.byId("tvepg"+itemIndex);tvEpgItemElement.innerHTML="";if(channel.program_name){if(Device.getDeviceKind()==="amino"){var programInfoElement=document.createElement("span");programInfoElement.setAttribute("class","program-info");programInfoElement.innerHTML=Helper.formatTime(Helper.withTimezone(channel.program_begin_time))+" "+channel.program_name;tvEpgItemElement.appendChild(programInfoElement)}else{w=Helper.getProgressWidth(channel.program_begin_time,channel.program_end_time,App.data.getUtcTime());var programInfoElement=document.createElement("span");programInfoElement.setAttribute("class","program-info");var beginTimeElement=document.createElement("span");beginTimeElement.setAttribute("class","begin-time");beginTimeElement.innerHTML=Helper.formatTime(Helper.withTimezone(channel.program_begin_time))+" ";var programNameElement=document.createElement("span");programNameElement.setAttribute("class","program-name");programNameElement.innerHTML=channel.program_name;var endTimeElement=document.createElement("span");endTimeElement.setAttribute("class","end-time");endTimeElement.innerHTML=App.lang.get("before")+" "+Helper.formatTime(Helper.withTimezone(channel.program_end_time));programInfoElement.appendChild(beginTimeElement);programInfoElement.appendChild(programNameElement);programInfoElement.appendChild(endTimeElement);tvEpgItemElement.appendChild(programInfoElement);infoSuffix=document.createElement("span");infoSuffix.setAttribute("class","info-suffix");var programCategoryElement=document.createElement("div");programCategoryElement.setAttribute("class","program-category");if(channel.program_category){var programCategoryGenre=document.createElement("span");programCategoryGenre.setAttribute("class","program-category-genre");programCategoryGenre.innerHTML=channel.program_category+(App.settings.getStyleName()==="impuls_x"?" ":": ");programCategoryElement.appendChild(programCategoryGenre)}var beginTimeElement=document.createElement("span");beginTimeElement.setAttribute("class","begin-time");beginTimeElement.innerHTML=Helper.formatTime(Helper.withTimezone(channel.program_begin_time))+" ";programCategoryElement.appendChild(beginTimeElement);programCategoryElement.innerHTML+=channel.program_name;var endTimeElement=document.createElement("span");endTimeElement.setAttribute("class","end-time");endTimeElement.innerHTML=App.lang.get("before")+" "+Helper.formatTime(Helper.withTimezone(channel.program_end_time));var timelineElement=document.createElement("div");timelineElement.setAttribute("class","timeline");var timelineGoneElement=document.createElement("div");timelineGoneElement.setAttribute("class","timeline-gone");timelineGoneElement.setAttribute("style","width:"+w+"%;");infoSuffix.appendChild(programCategoryElement);infoSuffix.appendChild(endTimeElement);infoSuffix.appendChild(timelineElement);infoSuffix.appendChild(timelineGoneElement)}var timelineElement=document.createElement("div");timelineElement.setAttribute("class","timeline");var timelineGoneElement=document.createElement("div");timelineGoneElement.setAttribute("class","timeline-gone");timelineGoneElement.setAttribute("style","width:"+w+"%;");tvEpgItemElement.appendChild(timelineElement);tvEpgItemElement.appendChild(timelineGoneElement)}else{infoSuffix=document.createTextNode(App.lang.get("epg-is-empty"));Helper.setHtml("tvepg"+itemIndex,App.lang.get("epg-is-empty")+'<div style="width:0%;"></div>')}var channelName=channel.name;if(Device.getDeviceKind()==="amino"||Device.getDeviceKind()==="dune"){channelName=Helper.cropString(channelName,14)}var numberElement=document.createElement("span");numberElement.setAttribute("class","number");numberElement.setAttribute("style","color:"+categoriesArray[channel.category_id]);numberElement.innerHTML=channel.number;var iconElement=document.createElement("img");iconElement.setAttribute("src",channel.icon);var nameElement=document.createElement("span");nameElement.setAttribute("class","name");nameElement.innerHTML=channelName;node.appendChild(numberElement);node.appendChild(iconElement);if(!channel.has_subscription){var lockedChannelIconElement=document.createElement("img");lockedChannelIconElement.setAttribute("src",Helper.getResourceUrl("media/img/main/locked-channel-icon.png"));lockedChannelIconElement.setAttribute("class","locked");node.appendChild(lockedChannelIconElement)}node.appendChild(nameElement);if(Helper.hasClass("tvchannels-screen","show-info")){node.appendChild(infoSuffix)}}}else{Helper.setHtml("tvepg"+itemIndex,"");return""}},onItemClick:function(index){that.key_enter()},onItemMouseOver:function(index){var sourceItems=channelsMenu.getCurrentPage()*channelsMenu.getNumberOfDisplayItems()+index;channelsMenu.setSelectedItem(index,sourceItems);if(isChosenPreviewMode){if(App.clientSettings.switch_channels_in_preview_mode&&App.player.getState()===App.player.STATE_PLAYING){that.playSelectedChannel()}else{that.refreshPlayerModeInfo()}}}});var selectorMenu=new BaseMenu({displayItemsNumber:1,sourceItemsNumber:1,menuId:"tvchannels-selector",menuTag:"div",itemIdPrefix:"tvchannels-selector",itemTag:"div",useFastRefresh:false,useMovableSelectionEffect:true});var focusedMenu="";var channelNumberStr="";var channelNumberPadTimeout=null;var categoriesArray=[];var checkLastChannel=false;var textBarTimeout=null;var textBarId="text-bar";try{var tvChannelsScreenHelper=Object.create(Helper)}catch(e){var tvChannelsScreenHelper=Helper}var scaledPlayerCoords=null;var navigationMode="normal";var initialCategoryIndex=null;var isChosenPreviewMode=null;this.setCheckLastChannel=function(value){checkLastChannel=value};this.getSelectedCategory=function(){return App.data.getCategory(categoriesMenu.getSelectedSourceItem())};this.resize=function(displayWidth,displayHeight){var n=10;if(App.data.getNumberOfChannels()>0&&App.data.getNumberOfChannels()<n){n=App.data.getNumberOfChannels()}channelsMenu.clear();channelsMenu.setNumberOfRows(n);channelsMenu.setNumberOfDisplayItems(n);channelsMenu.setNumberOfSourceItems(App.data.getNumberOfChannels());channelsMenu.setSelectedItem(0,0);channelsMenu.redrawMenuItems();var s="";for(var i=0;i<10;i++){s+='<li id="tvepg'+i+'"></li>'}Helper.setHtml("tvepg-menu",s)};this.refresh=function(){categoriesMenu.redrawMenuItems();channelsMenu.redrawMenuItems();App.tvChannelsScreen.refreshDisplayTime()};this.reset=function(){_TVChannelsScreen.setInited(false);channelsMenu.clear();Helper.setHtml("tvepg-menu",'<li id="tvepg0"></li>');isChosenPreviewMode=null};var timeInterval=null;this.show=function(){App.playerScreen.hideTvInfoBar();App.playerScreen.hideVideoInfoBar();_TVChannelsScreen.show();if(!timeInterval){this.refreshDisplayTime();timeInterval=setInterval(that.refreshDisplayTime,15000)}categoriesMenu.restoreSelection();categoriesMenu.uncolorize();categoriesMenu.unsetMenuFocus();focusedMenu="channels";if(App.showHelpButtonPanelFlag&&App.device.getAPIVersion()>=109&&!App.settings.getReferenceShownFlag()){App.popupMessageScreen.setMessageText(App.lang.get("key-panel-reference"));App.popupMessageScreen.setOnHideCallback(function(){if(!App.clientSettings.auto_launch_last_viewed_channel){App.settings.setReferenceShownFlag(true);App.settings.saveSettings()}that.showPreviewPlayer();App.popupMessageScreen.setOnHideCallback(null)});this.hidePreviewPlayer();App.display.showPopupScreen("popup-message")}this.showPreviewPlayer();this.setOnHideCallback(function(){that.hidePreviewPlayer()})};this.refreshDisplayTime=function(){var now=Helper.withTimezone(App.data.getUtcTime());var d=new Date(now*1000);var date=("0"+d.getDate()).substr(-2,2)+" "+App.lang.get("month-"+d.getMonth())+" "+d.getFullYear();var timeStr=("0"+d.getHours()).substr(-2,2)+":"+("0"+d.getMinutes()).substr(-2,2);Helper.setHtml("tvchannels-clock",date+" "+timeStr)};this.init=function(){_TVChannelsScreen.init();categoriesMenu.setSelectedItem(0,0);navigationMode=App.clientSettings.navigation_mode;Helper.addClass("tvchannels-screen-container","loader");App.data.requestCategoryList({},function(error){if(error==0){categoriesMenu.clear();var n=App.data.getNumberOfCategories();if(n>8){n=8}categoriesMenu.setNumberOfDisplayItems(n);categoriesMenu.setNumberOfSourceItems(App.data.getNumberOfCategories());categoriesMenu.setSelectedItem(0,0);categoriesMenu.redrawMenuItems();categoriesMenu.uncolorize();App.data.requestChannelList({icon_width:40,icon_height:40},function(error,interval){App.tvChannelsScreen.refreshChannelList(error,interval);if(App.device.isDeviceSupportSetPlayerSize()&&isChosenPreviewMode===null&&App.settings.getShowPreviewPlayer()){that.setPlayerMode()}else{that.refreshPlayerModeInfo()}if(checkLastChannel&&App.settings.getAutoLaunchPlayer()==1){checkLastChannel=false;if(App.data.getLastChannel()>=0){App.playerScreen.setParentScreen("tvchannels");that.switchToChannelId(App.data.getLastChannel())}}},60000)}})};this.refreshChannelList=function(error,interval){Helper.removeClass("tvchannels-screen-container","loader");var category=App.data.getCategory(categoriesMenu.getSelectedDisplayItem());Helper.showById("tvchannels-clock");Helper.setHtml("current-category",category.name);Helper.addClass("current-category","category"+category.id);if(error==0){var s="";for(var i=0;i<channelsMenu.getNumberOfRows();i++){s+='<div id="tvchannels-selector'+i+'"></div>'}s+='<div class="menu-selection" style="display:none;" id="tvchannels-selector-selection"></div>';Helper.setHtml("tvchannels-selector",s);if(!interval){var n=App.data.getNumberOfChannels();if(n>channelsMenu.getNumberOfRows()){n=channelsMenu.getNumberOfRows()}channelsMenu.clear();channelsMenu.setNumberOfDisplayItems(n);channelsMenu.setNumberOfSourceItems(App.data.getNumberOfChannels());channelsMenu.setSelectedItem(0,0);channelsMenu.redrawMenuItems()}else{App.tvChannelsScreen.filterChannelListByCategory(true)}if(initialCategoryIndex){this.setCategory(initialCategoryIndex);initialCategoryIndex=null}}};this.setCategory=function(index){var category=App.data.getCategory(index);Helper.removeClass("current-category","category"+category.id);categoriesMenu.setSelectedItem(index,index);Helper.setHtml("current-category",category.name);Helper.addClass("current-category","category"+category.id);categoriesMenu.uncolorize();categoriesMenu.saveSelection();categoriesMenu.unsetMenuFocus();focusedMenu="channels";that.filterChannelListByCategory()};this.setInitialSectionId=function(sectionId){if(!this.getInited()){initialCategoryIndex=sectionId;this.init()}else{this.setCategory(sectionId)}};this.playSelectedChannel=function(skipParentalCodeCheck){App.playerScreen.setParentScreen("tvchannels");var selectedChannel=channelsMenu.getSelectedSourceItem();var channel=App.data.getChannel(selectedChannel);var isScaledPlayer=isChosenPreviewMode&&App.display.getCurrentScreenName()==="tvchannels"&&(App.player.getState()!==App.player.STATE_PLAYING||channel.id!==App.player.getPlayingItemId());if(isScaledPlayer){this.refreshPlayerModeInfo()}App.player.playChannel(channel,skipParentalCodeCheck,isScaledPlayer)};this.switchToChannelId=function(id){id=parseInt(id);for(var i=0;i<App.data.getNumberOfChannels();i++){var channel=App.data.getChannel(channelsMenu.getSelectedSourceItem());if(parseInt(channel.id)===id){this.playSelectedChannel();break}channelsMenu.setNextItem()}};this.switchToChannel=function(number){number=parseInt(number);var channel=App.data.getChannel(number-1,true);if(channel){var index=App.data.getChannelIndex(channel,true);if(categoriesMenu.getSelectedSourceItem()!==0){this.setCategory(0)}channelsMenu.setSelectedItem(index%channelsMenu.getNumberOfDisplayItems(),index);if(App.player.getState()===App.player.STATE_PLAYING&&(App.player.getMode()===App.player.MODE_LIVETV||App.player.getMode()===App.player.MODE_TVARCHIVE||App.player.getMode()===App.player.MODE_PAUSE_LIVETV)){this.playSelectedChannel()}}else{App.popupMessageScreen.setMessageText(App.lang.get("channel-not-found"));App.display.showPopupScreen("popup-message")}};this.switchToNextChannel=function(previous){if(App.playerScreen.getChannel()["id"]!==App.data.getChannel(channelsMenu.getSelectedSourceItem())){var sourceIndex=App.data.getChannelIndexByChannelId(App.playerScreen.getChannel()["id"]);var displayIndex=sourceIndex%channelsMenu.getNumberOfDisplayItems();channelsMenu.setSelectedItem(displayIndex,sourceIndex)}if(!previous){channelsMenu.setNextItem()}else{channelsMenu.setPreviousItem()}if(App.player.getState()===App.player.STATE_PLAYING&&(App.player.getMode()===App.player.MODE_LIVETV||App.player.getMode()===App.player.MODE_PAUSE_LIVETV)){this.playSelectedChannel()}};this.showTextBar=function(value){Helper.setHtml(textBarId,value);Helper.showById(textBarId);if(textBarTimeout){clearTimeout(textBarTimeout)}textBarTimeout=setTimeout(function(){Helper.hideById(textBarId)},3000)};this.hideTextBar=function(){if(textBarTimeout){clearTimeout(textBarTimeout)}Helper.hideById(textBarId);Helper.refreshScreen()};this.showChannelNumberPad=function(digit,invisible){if(!channelNumberStr){channelNumberStr=""}channelNumberStr+=digit;if(channelNumberPadTimeout){clearTimeout(channelNumberPadTimeout)}if(channelNumberStr.length>3){channelNumberStr="";this.hideTextBar()}else{if(!invisible){this.showTextBar(channelNumberStr)}}if(channelNumberStr.length>3){this.hideTextBar();this.switchToChannel(parseInt(channelNumberStr));channelNumberStr=""}else{channelNumberPadTimeout=setTimeout(function(){App.tvChannelsScreen.hideTextBar();App.tvChannelsScreen.switchToChannel(parseInt(channelNumberStr));channelNumberStr=""},1500)}};this.filterChannelListByCategory=function(saveCurrentSelection){Helper.hideById("tvchannels-empty-screen");if(App.data.getOriginalChannelsDataLength()===0){Helper.setHtml("tvchannels-empty-screen",App.lang.get("empty-tvchannels-screen"));Helper.showById("tvchannels-empty-screen");selectorMenu.resetSelection();this.hidePreviewPlayer()}else{var category=App.data.getCategory(categoriesMenu.getSelectedSourceItem());App.data.filterChannelListByCategory(category.id);var n=App.data.getNumberOfChannels();if(n>channelsMenu.getNumberOfRows()){n=channelsMenu.getNumberOfRows()}var s="";for(var i=0;i<n;i++){s+='<li id="tvepg'+i+'"></li>'}Helper.setHtml("tvepg-menu",s);channelsMenu.clear();channelsMenu.setNumberOfDisplayItems(n);channelsMenu.setNumberOfSourceItems(App.data.getNumberOfChannels());if(!saveCurrentSelection){channelsMenu.setSelectedItem(0,0)}if(channelsMenu.getSelectedDisplayItem()>=channelsMenu.getNumberOfDisplayItems()){channelsMenu.setPreviousItem()}channelsMenu.redrawMenuItems();if(n===0){Helper.setHtml("tvchannels-empty-screen",App.lang.get("empty-category"));Helper.showById("tvchannels-empty-screen");selectorMenu.resetSelection();this.hidePreviewPlayer()}if(isChosenPreviewMode){this.refreshPlayerModeInfo()}}};this.getSelectedChannel=function(){return App.data.getChannel(channelsMenu.getSelectedSourceItem())};this.setPlayerMode=function(forcePlay,skipParentalCheck){if(App.device.isDeviceSupportSetPlayerSize()&&!isChosenPreviewMode){isChosenPreviewMode=true;this.refreshPlayerModeInfo();this.showPreviewPlayer();if(App.clientSettings.switch_channels_in_preview_mode||forcePlay){this.playSelectedChannel(skipParentalCheck)}}};this.showPreviewPlayer=function(){if(App.display.getCurrentScreenName()==="tvchannels"){if(isChosenPreviewMode&&App.device.isDeviceSupportSetPlayerSize()&&channelsMenu.getNumberOfSourceItems()>0){Helper.addBodyClass("player-scale");Helper.removeClass("tvchannels-screen","list");Helper.addClass("tvchannels-screen","preview");if(!scaledPlayerCoords&&Helper.byId("scaled-player")){scaledPlayerCoords=Helper.byId("scaled-player").getBoundingClientRect()}App.device.setPlayerSize(scaledPlayerCoords.left,scaledPlayerCoords.top,0,0,App.settings.getStyleName()==="impuls_x"?0.595:0.625)}}};this.resetPlayerMode=function(){this.hidePreviewPlayer();isChosenPreviewMode=false};this.hidePreviewPlayer=function(){if(isChosenPreviewMode){Helper.removeBodyClass("player-scale");Helper.removeClass("tvchannels-screen","preview");Helper.addClass("tvchannels-screen","list");App.device.setPlayerSizeFullscreen()}};this.refreshPlayerModeInfo=function(){var channel=App.data.getChannel(channelsMenu.getSelectedSourceItem());if(channel){Helper.setHtml("player-mode-channel-name",channel.name+'<span id="player-mode-program-name">'+channel.program_name+"</span>");Helper.setHtml("player-mode-program-start",Helper.formatTime(Helper.withTimezone(channel.program_begin_time)));Helper.setHtml("player-mode-program-end",Helper.formatTime(Helper.withTimezone(channel.program_end_time)));if(channel.program_name){Helper.setHtml("player-mode-program-name",channel.program_name)}else{Helper.setHtml("player-mode-program-name","-")}Helper.byId("player-mode-program-progress-bar").style.width=Helper.getProgressWidth(channel.program_begin_time,channel.program_end_time,App.data.getUtcTime())+"%";if(channel.program_description){if(Helper.hasBodyClass("overscan")){Helper.setHtml("player-mode-description",Helper.cropString(channel.program_description,140,"..."))}else{Helper.setHtml("player-mode-description",Helper.cropString(channel.program_description,240,"..."))}}else{Helper.setHtml("player-mode-description","")}}};this.openEpgScreen=function(){if(focusedMenu==="channels"){if(channelsMenu.getNumberOfSourceItems()>0){App.epgScreen.setChannel(App.data.getChannel(channelsMenu.getSelectedSourceItem()));App.epgScreen.setParentScreen("tvchannels");this.hidePreviewPlayer();App.display.showScreen("epg")}}};this.changePlayerMode=function(){if(channelsMenu.getNumberOfSourceItems()>0){isChosenPreviewMode?this.resetPlayerMode():this.setPlayerMode()}};this.key_back=function(){this.hidePreviewPlayer();App.display.showScreen("mainmenu")};this.key_down=Helper.stickyKeyPrevent(function(){if(focusedMenu==="categories"){categoriesMenu.setNextItem()}else{channelsMenu.setNextItem();if(isChosenPreviewMode){if(App.clientSettings.switch_channels_in_preview_mode&&App.player.getState()===App.player.STATE_PLAYING){that.playSelectedChannel()}else{that.refreshPlayerModeInfo()}}}},40);this.key_up=Helper.stickyKeyPrevent(function(){if(focusedMenu==="categories"){categoriesMenu.setPreviousItem()}else{channelsMenu.setPreviousItem();if(isChosenPreviewMode){if(App.clientSettings.switch_channels_in_preview_mode&&App.player.getState()===App.player.STATE_PLAYING){that.playSelectedChannel()}else{that.refreshPlayerModeInfo()}}}},40);this.key_left=function(){if(navigationMode==="horizontal"){this.key_menu()}else{if(focusedMenu==="channels"){channelsMenu.setPreviousPage();if(isChosenPreviewMode){if(App.clientSettings.switch_channels_in_preview_mode&&App.player.getState()===App.player.STATE_PLAYING){that.playSelectedChannel()}else{that.refreshPlayerModeInfo()}}}}};this.key_right=function(){if(focusedMenu==="categories"){categoriesMenu.resetSelection();categoriesMenu.restoreSelection();categoriesMenu.uncolorize();categoriesMenu.unsetMenuFocus();focusedMenu="channels"}else{if(navigationMode==="horizontal"){this.openEpgScreen()}else{channelsMenu.setNextPage();if(isChosenPreviewMode){if(App.clientSettings.switch_channels_in_preview_mode&&App.player.getState()===App.player.STATE_PLAYING){that.playSelectedChannel()}else{that.refreshPlayerModeInfo()}}}}};this.key_enter=function(){if(focusedMenu==="categories"){categoriesMenu.uncolorize();categoriesMenu.saveSelection();categoriesMenu.unsetMenuFocus();focusedMenu="channels";this.filterChannelListByCategory()}else{this.playSelectedChannel()}};this.key_red=function(){if(navigationMode==="horizontal"){this.changePlayerMode()}else{this.openEpgScreen()}};this.key_green=function(){var nc=App.data.getNumberOfCategories();var that=this;for(var i=0;i<nc;i++){var c=App.data.getCategory(i);App.popupMenuScreen.addListMenuItem(c.name,function(index){that.setCategory(index);App.popupMenuScreen.hide()})}App.popupMenuScreen.setListMenuSelectedItem(categoriesMenu.getSelectedSourceItem());App.display.showPopupScreen("popup-menu")};this.key_blue=function(){var currentChannel=this.getSelectedChannel();var messageText=(currentChannel.is_favorited)?App.lang.get("channel-unfavorited-msg"):App.lang.get("channel-favorited-msg");if(currentChannel){if(currentChannel.is_favorited){App.data.requestSettingsSaveUnfavoriteChannel({cid:currentChannel.id},function(error){if(error==0){App.tvChannelsScreen.refreshChannelList(error,true);var message=App.lang.get("label-channel")+" "+currentChannel.name+messageText;App.popupMessageScreen.setMessageText(message);App.display.showPopupScreen("popup-message")}})}else{App.data.requestSettingsSaveFavoriteChannel({cid:currentChannel.id},function(error){if(error==0){App.tvChannelsScreen.refreshChannelList(error,true);var message=App.lang.get("label-channel")+" "+currentChannel.name+messageText;App.popupMessageScreen.setMessageText(message);App.display.showPopupScreen("popup-message")}})}}};this.key_digit=function(digit){this.showChannelNumberPad(digit,true)};this.key_menu=function(){App.display.showScreen("mainmenu")};this.key_exit=function(){if(App.player.isActive()){App.display.showScreen("player")}else{App.display.showScreen("mainmenu")}};this.key_backspace=function(){this.key_exit()};this.key_power=function(){App.switchStandBy()};this.key_info=function(){if(!App.device.isDeviceSupportSetPlayerSize()){if(!Helper.hasClass("tvchannels-screen","show-info")){Helper.addClass("tvchannels-screen","show-info")}else{Helper.removeClass("tvchannels-screen","show-info")}this.refresh();categoriesMenu.uncolorize()}else{if(navigationMode!=="horizontal"){this.changePlayerMode()}}};this.wheel=function(delta){if(delta>0){this.key_down()}else{this.key_up()}};this.key_long_enter=function(){if(App.showHelpButtonPanelFlag){var keys=[{action:"menu",label:"label-menu"}];if(navigationMode==="normal"){keys.push({action:"red",label:"label-program"})}else{if(App.device.isDeviceSupportSetPlayerSize()){keys.push({action:"red",label:isChosenPreviewMode?"label-list":"label-player"})}}keys.push({action:"green",label:"label-categories"});keys.push({action:"blue",label:"label-add-to-favorite"});if(navigationMode==="normal"){if(App.device.isDeviceSupportSetPlayerSize()){keys.push({action:"info",label:isChosenPreviewMode?"label-list":"label-player"})}else{keys.push({action:"info",label:"label-more"})}}keys.push({action:"back",label:"label-back"});App.popupKeyPanelScreen.setKeysForPanel(keys);App.popupKeyPanelScreen.setParentScreen("tvchannels");App.display.showPopupScreen("popup-key-panel")}else{that.key_enter()}}}_TVChannelsScreen=new BaseScreen();TVChannelsScreen.prototype=_TVChannelsScreen;