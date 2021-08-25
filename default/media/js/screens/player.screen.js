function PlayerScreen(){var that=this;var DEFAULT_REFRESH_INFOBAR_TIME=5000;var playerTVPanelMenu=new BaseMenu({displayItemsNumber:5,sourceItemsNumber:5,menuId:"player-tv-panel-menu",menuTag:"div",itemIdPrefix:"player-tv-panel",itemTag:"div",useFastRefresh:true,hideItemIfEmptyName:true,getItemNameFunc:function(sourceItemIndex,displayItemIndex){return that.getItemNameFunction(sourceItemIndex)},onItemClick:function(index){that.key_enter();if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}},onItemMouseOver:function(index){playerTVPanelMenu.resetSelection();playerTVPanelMenu.setSelectedItem(index,index);if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}}});var playerVideoPanelMenu=new BaseMenu({displayItemsNumber:5,sourceItemsNumber:5,menuId:"player-video-panel-menu",menuTag:"div",itemIdPrefix:"player-video-panel",itemTag:"div",useFastRefresh:true,hideItemIfEmptyName:true,getItemNameFunc:function(sourceItemIndex,displayItemIndex){return that.getItemNameFunction(sourceItemIndex)},onItemClick:function(index){that.key_enter()},onItemMouseOver:function(index){playerVideoPanelMenu.resetSelection();playerVideoPanelMenu.setSelectedItem(index,index);if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}}});var panelMenu=null;var panelMenuId="";var tvInfoBarId="tv-infobar";var playerPanelMenuId="";var playerPanelMenuItemId="";var tvInfoBarTimeout=null;var videoInfoBarId="video-infobar";var videoInfoBarTimeout=null;var pauseIconId="pause-fullscreen-icon";var seekIconId="seek-fullscreen-icon";var volumeBarTimeout=null;var volumeBarId="volume-bar";var loadingBarId="loading-bar";var parentScreen="";var muteMode=0;var ignoreKeyPress=false;var channel=null;var program=null;var video=null;var videoFile=null;var refreshInfoInterval=null;var refreshInfoCallbackFunc=null;var refreshInfoTimeInterval=DEFAULT_REFRESH_INFOBAR_TIME;var panelMenuItems=[];var audioTracks=null;var favouritesChanges=false;var timerForStickRewind=null;var selectedActionOfPanelMenu="default-key-enter";this.setIgnoreKeyPress=function(flag){ignoreKeyPress=flag};this.resetAudioTracks=function(){audioTracks=null};this.getItemNameFunction=function(index){var s="";var element=panelMenuItems[index];if(element.icon){s+='<img src="'+Helper.getResourceUrl(element.icon)+'">'}s+="<span>"+element.label+"</span>";return s};this.resetPanelMenuFocus=function(){selectedActionOfPanelMenu="default-key-enter"};this.init=function(){_PlayerScreen.init();var pauseScreenIcon=Helper.byId("pause-fullscreen-icon");var pauseImg=document.createElement("img");pauseImg.setAttribute("src",App.settings.getStyleName()==="impuls_x"?Helper.getResourceUrl("media/img/impuls-x/pause-fullscreen-icon.png"):Helper.getResourceUrl("media/img/main/pause-fullscreen-icon.png"));pauseScreenIcon.appendChild(pauseImg);if(App.device.getDeviceKind()==="amino"){this.key_green=this.key_aspect}};this.show=function(){_PlayerScreen.show();ignoreKeyPress=false;favouritesChanges=false;App.hbbTv.focus();this.setOnHideCallback(function(){App.popupListScreen.hide();App.playerScreen.resetPanelMenuFocus();App.hbbTv.blur()})};this.refresh=function(){this.refreshInfo()};this.setRefreshInfoCallback=function(callbackFunc,interval){refreshInfoTimeInterval=interval;refreshInfoCallbackFunc=callbackFunc;if(refreshInfoInterval){clearInterval(refreshInfoInterval)}if(callbackFunc instanceof Function){refreshInfoInterval=setInterval(callbackFunc,interval)}};this.restartRefreshInfoTimer=function(){that.setRefreshInfoCallback(refreshInfoCallbackFunc,refreshInfoTimeInterval)};this.refreshInfo=function(currentTime){if(refreshInfoCallbackFunc instanceof Function){return refreshInfoCallbackFunc(currentTime)}};this.initPanelMenu=function(type){panelMenu=null;panelMenuId=type+"-infobar";playerPanelMenuId="player-"+type+"-panel-menu";playerPanelMenuItemId="player-"+type+"-panel";if(type==="tv"){panelMenu=playerTVPanelMenu}else{panelMenu=playerVideoPanelMenu}this.setFocusedMenu(playerPanelMenuId)};this.refreshPanelMenu=function(){panelMenu.clear();panelMenu.setNumberOfDisplayItems(panelMenuItems.length);panelMenu.setNumberOfSourceItems(panelMenuItems.length);var index=this.getIndexOfActionInPanelMenu(selectedActionOfPanelMenu);if(index!==-1){panelMenu.setSelectedItem(index,index)}else{this.resetPanelMenuFocus();panelMenu.setSelectedItem(0,0)}panelMenu.redrawMenuItems();if(panelMenuItems.length>0){Helper.showById(playerPanelMenuId)}};this.showPanelMenu=function(){panelMenuItems=[];panelMenuItems.push({label:(panelMenu===playerVideoPanelMenu)?App.lang.get("label-videocatalog"):App.lang.get("label-channel-list"),action:"default-key-enter"});var mode=App.player.getMode();if(mode===App.player.MODE_TVARCHIVE||mode===App.player.MODE_VIDEO||mode===App.player.MODE_PAUSE_LIVETV){panelMenuItems.push({label:App.lang.get("label-fwd"),icon:Helper.getResourceUrl("media/img/main/remote-button-fwd.png"),action:"fwd"});panelMenuItems.push({label:App.lang.get("label-rew"),icon:Helper.getResourceUrl("media/img/main/remote-button-rew.png"),action:"rew"})}if((panelMenu!==playerVideoPanelMenu&&channel.has_record)||panelMenu===playerVideoPanelMenu){panelMenuItems.push({label:App.lang.get("label-pause"),icon:Helper.getResourceUrl("media/img/main/remote-button-pause.png"),action:"pause"});if(panelMenu!==playerVideoPanelMenu){panelMenuItems.push({label:App.lang.get("label-to-begin"),action:"to-begin"})}}if(audioTracks){this.setAudioTracksInfo(audioTracks)}this.refreshPanelMenu()};this.getIndexOfActionInPanelMenu=function(action){for(var i=0;i<panelMenuItems.length;i++){if(panelMenuItems[i]["action"]===action){return i}}return -1};this.setFocusedMenu=function(focused){Helper.addClass(focused,"selected")};this.unsetFocusedMenu=function(unfocused){Helper.removeClass(unfocused,"selected")};this.clearRefreshInfoCallback=function(){if(refreshInfoInterval){clearInterval(refreshInfoInterval)}refreshInfoCallbackFunc=null;refreshInfoTimeInterval=DEFAULT_REFRESH_INFOBAR_TIME};this.showTvInfoBar=function(force){if(App.player.getMode()===App.player.MODE_TVARCHIVE||App.player.getMode()===App.player.MODE_PAUSE_LIVETV){Helper.addClass("tv-infobar","tvarchive")}else{Helper.removeClass("tv-infobar","tvarchive")}this.initPanelMenu("tv");this.showPanelMenu();Helper.showById(tvInfoBarId);if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}if(!force){tvInfoBarTimeout=setTimeout(function(){if(!Helper.isVisible("popup-list-screen")){App.playerScreen.hideTvInfoBar()}},7000)}};this.hideTvInfoBar=function(){if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}Helper.hideById(tvInfoBarId);Helper.hideById(playerPanelMenuId);Helper.refreshScreen()};this.showVideoInfoBar=function(force){this.initPanelMenu("video");Helper.showById(videoInfoBarId);this.showPanelMenu();if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}if(!force){videoInfoBarTimeout=setTimeout(function(){App.playerScreen.hideVideoInfoBar()},7000)}};this.hideVideoInfoBar=function(){if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}Helper.hideById(videoInfoBarId);Helper.hideById(playerPanelMenuId);Helper.refreshScreen()};this.showPauseIcon=function(){Helper.showById(pauseIconId)};this.hidePauseIcon=function(){Helper.hideById(pauseIconId);Helper.refreshScreen()};this.showVolumeBar=function(value){Helper.showById(volumeBarId);var s="";value=parseInt(value);if(value>0){for(var i=0;i<value;i+=5){s+="I"}}else{s="X"}Helper.setHtml(volumeBarId,s);if(volumeBarTimeout){clearTimeout(volumeBarTimeout)}volumeBarTimeout=setTimeout(function(){Helper.hideById(volumeBarId);Helper.refreshScreen()},3000)};this.showLoadingBar=function(){if(App.device.getDeviceKind()==="android_stb"){return}if(Helper.isVisible("player-screen")){Helper.showById(loadingBarId)}else{Helper.addClass("player-mode-icon","loader");Helper.showById("player-mode-icon")}};this.hideLoadingBar=function(){if(Helper.isVisible("player-screen")){Helper.hideById(loadingBarId);Helper.refreshScreen()}else{Helper.hideById("player-mode-icon")}};this.setChannel=function(value){channel=value;if(!channel){return}Helper.hideById("tv-infobar-footer-tvarchive");Helper.showById("tv-infobar-footer-livetv");Helper.byId("tv-infobar-channel-icon").src=Helper.getResourceUrl(channel.icon);if(parentScreen==="categorizedtv"){Helper.setHtml("tv-infobar-channel-name",channel.name)}else{Helper.setHtml("tv-infobar-channel-name",channel.number+". "+channel.name+((channel.timeshift_offset>0)?" +"+channel.timeshift_offset:""))}if(channel.program_name&&channel.program_begin_time!==-1){Helper.setHtml("tv-infobar-program-name",Helper.cropString(channel.program_name,53,"..."));Helper.setHtml("tv-infobar-program-description",Helper.cropString(channel.program_description,410,"..."));Helper.setHtml("tv-infobar-program-start",Helper.formatTime(Helper.withTimezone(channel.program_begin_time)));Helper.setHtml("tv-infobar-program-end",Helper.formatTime(Helper.withTimezone(channel.program_end_time)));if(App.player.getPlayingItemId()!==channel.id){Helper.byId("tv-infobar-program-progress-bar").style.width=Helper.getProgressWidth(channel.program_begin_time,channel.program_end_time,App.data.getUtcTime())+"%"}}else{Helper.setHtml("tv-infobar-program-name",App.lang.get("epg-is-empty"));Helper.setHtml("tv-infobar-program-description","");Helper.setHtml("tv-infobar-program-start","00:00");Helper.setHtml("tv-infobar-program-end","00:00");if(App.player.getPlayingItemId()!==channel.id){Helper.byId("tv-infobar-program-progress-bar").style.width="0%"}}Helper.setHtml("tv-infobar-current-time",Helper.formatTime(Helper.withTimezone(App.data.getUtcTime())))};this.getChannel=function(){return channel};this.setProgram=function(valueProgram,valueChannel){channel=valueChannel;program=valueProgram;if(!channel){return}if(!program){return}Helper.hideById("tv-infobar-footer-livetv");Helper.showById("tv-infobar-footer-tvarchive");Helper.byId("tv-infobar-channel-icon").src=Helper.getResourceUrl(channel.icon);var number="";if(parentScreen==="tvchannels"){number=channel.number+". "}Helper.setHtml("tv-infobar-channel-name",number+channel.name);Helper.setHtml("tv-infobar-program-name",App.lang.get("archive-name-prefix")+program.name);var programBeginTime=parseInt(program.begin_time)+channel.timeshift_offset*3600;var programEndTime=parseInt(program.end_time)+channel.timeshift_offset*3600;var duration=programEndTime-programBeginTime;if(App.clientSettings.infobar_time_display_mode==="by_duration"){Helper.setHtml("tv-infobar-program-start",Helper.formatSeconds(App.player.getCurrentTime()));Helper.setHtml("tv-infobar-program-end",Helper.formatSeconds(duration))}else{Helper.setHtml("tv-infobar-program-start",Helper.formatTime(Helper.withTimezone(programBeginTime+App.player.getCurrentTime())));Helper.setHtml("tv-infobar-program-end",Helper.formatTime(Helper.withTimezone(programEndTime)))}Helper.byId("tv-infobar-program-progress-bar").style.width=Helper.getProgressWidth(0,duration,App.player.getCurrentTime())+"%";Helper.setHtml("tv-infobar-current-time",Helper.formatTime(Helper.withTimezone(App.data.getUtcTime())));Helper.setHtml("tv-infobar-program-description",Helper.cropString(program.description,410,"..."))};this.getProgram=function(){return program};this.setVideo=function(value){video=value;if(!video){return}var name=video.name;if(video.series_name&&video.series_name!==name){name+=". "+video.series_name}Helper.setHtml("video-infobar-name",name);Helper.setHtml("video-infobar-thumbnail",'<img src="'+Helper.getResourceUrl(video.thumbnail_small)+'" />');Helper.setHtml("video-infobar-current","00:00");Helper.byId("video-infobar-progress-bar").style.width="0%";Helper.setHtml("video-infobar-description",Helper.cropString(video.description,500,"..."))};this.getVideo=function(){return video};this.setVideoFile=function(value){videoFile=value;if(!videoFile){return}Helper.setHtml("video-infobar-duration",Helper.formatSeconds(videoFile.duration))};this.getVideoFile=function(){return videoFile};this.setParentScreen=function(parent){parentScreen=parent};this.getParentScreen=function(){return parentScreen};this.defaultKeyEnterHandler=function(){switch(App.player.getMode()){default:case App.player.MODE_LIVETV:App.display.showScreen(parentScreen);break;case App.player.MODE_TVARCHIVE:case App.player.MODE_PAUSE_LIVETV:App.display.showScreen("tvchannels");break;case App.player.MODE_VIDEO:App.display.showScreen("videocatalog");break}};this.panelMenuButtonHandler=function(){var selectedIndex=panelMenu.getSelectedDisplayItem();selectedActionOfPanelMenu=panelMenuItems[selectedIndex]["action"];var elemCoords=Helper.byId(playerPanelMenuItemId+selectedIndex).getBoundingClientRect();var offset=1280/App.device.getDisplayWidth();var left=elemCoords.left*offset;var bottom=720-elemCoords.top*offset;switch(selectedActionOfPanelMenu){case"pause":this.key_pause();break;case"choice-language":App.popupListScreen.setCoordinates(left,bottom);App.popupListScreen.setOnHideCallback(function(){panelMenu.setSelectedItem(selectedIndex);App.playerScreen.setFocusedMenu(playerPanelMenuId)});App.display.showPopupScreen("popup-list");this.unsetFocusedMenu(playerPanelMenuId);break;case"to-begin":this.playFromBegin();break;case"hide-infobar":this.key_info();break;case"fwd":this.key_fwd();break;case"rew":this.key_rew();break;case"default-key-enter":this.defaultKeyEnterHandler();break}};this.setAudioTracksInfo=function(tracks){audioTracks=tracks;var elem={label:App.lang.get("label-choice-language"),icon:Helper.getResourceUrl("media/img/main/remote-button-soundtrack.png"),action:"choice-language"};if(audioTracks.length===0){audioTracks.push({index:0,language:""})}App.popupListScreen.setMenuItems(audioTracks);App.popupListScreen.setSelectedItem(App.device.getIndexOfSelectedAudioTrack());var refresh=false;if(audioTracks.length>1&&this.getIndexOfActionInPanelMenu("choice-language")===-1){panelMenuItems.push(elem);refresh=true}if(Helper.isVisible("popup-list-screen")){panelMenu.setSelectedItem()}if(refresh){this.refreshPanelMenu()}};this.playFromBegin=function(){if(this.getIndexOfActionInPanelMenu("to-begin")!==-1){panelMenu.setSelectedItem(0,0);ignoreKeyPress=true;this.hideTvInfoBar();var timestamp=0;switch(App.player.getMode()){case App.player.MODE_PAUSE_LIVETV:App.player.setMode(App.player.MODE_TVARCHIVE);case App.player.MODE_TVARCHIVE:timestamp=program.begin_time;break;default:App.epgScreen.setChannel(channel);App.player.setMode(App.player.MODE_PAUSE_LIVETV);App.playerScreen.createProgramFromCurrentChannel();timestamp=channel.program_begin_time;break}this.clearRefreshInfoCallback();App.player.setCurrentTime(0);timestamp-=channel.timeshift_offset*3600;App.data.requestProgramUrl({cid:channel.id,time:timestamp},function(error,uri){program.url=uri;program.is_paused=false;App.player.playProgram(channel,program)})}};this.createProgramFromCurrentChannel=function(){program={name:channel.program_name,begin_time:channel.program_begin_time,end_time:channel.program_end_time,id:channel.program_id,description:channel.program_description,has_record:channel.has_record}};this.key_back=function(){if(Helper.isVisible(tvInfoBarId)){this.key_info()}else{this.key_back_mouse()}};this.key_back_mouse=function(){if(favouritesChanges){App.tvChannelsScreen.refreshChannelList(0,true);favouritesChanges=false}switch(App.player.getMode()){case App.player.MODE_TVARCHIVE:case App.player.MODE_PAUSE_LIVETV:if(parentScreen===""){App.display.showScreen("epg")}else{App.display.showScreen(parentScreen)}break;case App.player.MODE_VIDEO:App.display.showScreen("video");break;case App.player.MODE_LIVETV:if(parentScreen===""){App.display.showScreen("mainmenu")}else{App.display.showScreen(parentScreen)}break}};this.key_enter=function(){if(!ignoreKeyPress){if(Helper.isVisible(playerPanelMenuId)){if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}this.panelMenuButtonHandler()}else{if(App.clientSettings.open_infobar_on_ok_key){this.key_info()}else{this.defaultKeyEnterHandler()}}}};this.key_info=function(){switch(App.player.getMode()){default:case App.player.MODE_LIVETV:case App.player.MODE_TVARCHIVE:case App.player.MODE_PAUSE_LIVETV:if(!Helper.isVisible(tvInfoBarId)){this.showTvInfoBar(true)}else{this.hideTvInfoBar()}break;case App.player.MODE_VIDEO:if(!Helper.isVisible(videoInfoBarId)){this.showVideoInfoBar(true)}else{this.hideVideoInfoBar()}break}};this.key_red=function(){var mode=App.player.getMode();if(mode===App.player.MODE_LIVETV||mode===App.player.MODE_TVARCHIVE||mode===App.player.MODE_PAUSE_LIVETV){if(channel){App.epgScreen.setChannel(channel);App.epgScreen.setParentScreen(parentScreen);App.display.showScreen("epg")}}};this.key_blue=function(){if(App.player.getMode()===App.player.MODE_LIVETV){var messageText=(channel.is_favorited)?App.lang.get("channel-unfavorited-msg"):App.lang.get("channel-favorited-msg");if(channel){if(channel.is_favorited){App.data.requestSettingsSaveUnfavoriteChannel({cid:channel.id},function(error){if(error===0){if(parentScreen==="categorizedtv"){App.categorizedTVScreen.refreshPrograms()}else{var category=App.tvChannelsScreen.getSelectedCategory();if(category.kind!=="favorites"){App.tvChannelsScreen.refreshChannelList(error,true)}else{favouritesChanges=true}}var message=App.lang.get("label-channel")+" "+channel.name+messageText;App.popupMessageScreen.setMessageText(message);App.display.showPopupScreen("popup-message")}})}else{App.data.requestSettingsSaveFavoriteChannel({cid:channel.id},function(error){if(error===0){if(parentScreen==="categorizedtv"){App.categorizedTVScreen.refreshPrograms()}else{App.tvChannelsScreen.refreshChannelList(error,true)}var message=App.lang.get("label-channel")+" "+channel.name+messageText;App.popupMessageScreen.setMessageText(message);App.display.showPopupScreen("popup-message")}})}}}};this.key_pause=function(){switch(App.player.getMode()){case App.player.MODE_VIDEO:case App.player.MODE_TVARCHIVE:case App.player.MODE_PAUSE_LIVETV:if(App.player.getState()===App.player.STATE_PAUSED){App.player.resume();Helper.removeClass(loadingBarId,"hide-mode")}else{App.player.pause()}break;case App.player.MODE_LIVETV:if(this.getIndexOfActionInPanelMenu("pause")===-1){App.popupMessageScreen.setMessageText(App.lang.get("not-archive-channel-msg"));App.display.showPopupScreen("popup-message")}else{panelMenu.setSelectedItem(0,0);ignoreKeyPress=true;this.hideTvInfoBar();App.epgScreen.setChannel(channel);App.epgScreen.setParentScreen(parentScreen);App.player.setMode(App.player.MODE_PAUSE_LIVETV);this.clearRefreshInfoCallback();App.player.setCurrentTime(App.data.getUtcTime()-parseInt(channel.program_begin_time));var timeToRewind=parseInt(channel.program_begin_time)+App.player.getCurrentTime();var timeshiftOffset=channel.timeshift_offset*3600;timeToRewind-=timeshiftOffset;setTimeout(function(){App.player.pause();Helper.addClass(loadingBarId,"hide-mode");App.data.requestProgramUrl({cid:channel.id,time:timeToRewind,tv_pause:1},function(error,uri){App.playerScreen.createProgramFromCurrentChannel();program.url=uri;program.is_paused=true;App.player.playProgram(channel,program)})},1000)}break}};this.key_play=function(){if(App.player.getState()===App.player.STATE_PAUSED){App.player.resume();Helper.removeClass(loadingBarId,"hide-mode")}else{if(App.player.getState()!==App.player.STATE_PLAYING){App.player.play()}}};this.key_stop=function(){var mode=App.player.getMode();if(mode===App.player.MODE_VIDEO||mode===App.player.MODE_TVARCHIVE||mode===App.player.MODE_PAUSE_LIVETV){App.player.stopByUser();App.player.stop()}else{if(App.player.getMode()===App.player.MODE_LIVETV&&App.device.getDeviceKind()==="tizen_tv"){App.player.stop();if(parentScreen==="categorizedtv"){App.display.showScreen("categorizedtv")}else{App.display.showScreen("tvchannels")}}}};this.key_fwd=function(){var mode=App.player.getMode();if((mode===App.player.MODE_VIDEO||mode===App.player.MODE_TVARCHIVE||mode===App.player.MODE_PAUSE_LIVETV)&&App.player.getState()!==App.player.STATE_PAUSED){App.player.forward();clearInterval(timerForStickRewind);timerForStickRewind=setTimeout(function(){timerForStickRewind=null},3000)}};this.key_rew=function(){var mode=App.player.getMode();if((mode===App.player.MODE_VIDEO||mode===App.player.MODE_TVARCHIVE||mode===App.player.MODE_PAUSE_LIVETV)&&App.player.getState()!==App.player.STATE_PAUSED){App.player.backward();clearInterval(timerForStickRewind);timerForStickRewind=setTimeout(function(){timerForStickRewind=null},3000)}else{if(this.getIndexOfActionInPanelMenu("to-begin")!==-1){this.playFromBegin()}}};this.key_right=function(){if(Helper.isVisible(playerPanelMenuId)&&!timerForStickRewind){if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}panelMenu.setPreviousItem()}else{if(App.device.getDeviceKind()==="dune"||(App.clientSettings.change_volume_on_left_right_arrows_keys&&App.device.getDeviceKind()!=="tizen_tv"&&App.device.getDeviceKind()!=="samsung_smart_tv"&&App.device.getDeviceKind()!=="lg_webos"&&App.device.getDeviceKind()!=="lg_netcast")){return this.key_vol_plus()}else{this.key_fwd()}}};this.key_left=function(){if(Helper.isVisible(playerPanelMenuId)&&!timerForStickRewind){if(videoInfoBarTimeout){clearTimeout(videoInfoBarTimeout)}if(tvInfoBarTimeout){clearTimeout(tvInfoBarTimeout)}panelMenu.setNextItem()}else{if(App.device.getDeviceKind()==="dune"||(App.clientSettings.change_volume_on_left_right_arrows_keys&&App.device.getDeviceKind()!=="tizen_tv"&&App.device.getDeviceKind()!=="samsung_smart_tv"&&App.device.getDeviceKind()!=="lg_webos"&&App.device.getDeviceKind()!=="lg_netcast")){return this.key_vol_minus()}else{var mode=App.player.getMode();if((mode===App.player.MODE_VIDEO||mode===App.player.MODE_TVARCHIVE||mode===App.player.MODE_PAUSE_LIVETV)&&App.player.getState()!==App.player.STATE_PAUSED){App.player.backward();clearInterval(timerForStickRewind);timerForStickRewind=setTimeout(function(){timerForStickRewind=null},3000)}}}};this.key_up=function(){var flag=App.clientSettings.samsung_guidelines_compatibility_mode&&(App.device.getDeviceKind()==="samsung_smart_tv"||App.device.getDeviceKind()==="tizen_tv");if(flag){this.key_ch_minus()}else{this.key_ch_plus()}};this.key_down=function(){var flag=App.clientSettings.samsung_guidelines_compatibility_mode&&(App.device.getDeviceKind()==="samsung_smart_tv"||App.device.getDeviceKind()==="tizen_tv");if(!flag){this.key_ch_minus()}else{this.key_ch_plus()}};this.key_digit=function(digit){var mode=App.player.getMode();if(mode===App.player.MODE_LIVETV||mode===App.player.MODE_TVARCHIVE||mode===App.player.MODE_PAUSE_LIVETV){if(parentScreen==="tvchannels"){App.tvChannelsScreen.showChannelNumberPad(digit)}}};this.key_menu=function(){App.display.showScreen("mainmenu")};this.key_exit=function(){if(App.clientSettings.samsung_guidelines_compatibility_mode&&(App.device.getDeviceKind()==="samsung_smart_tv"||App.device.getDeviceKind()==="tizen_tv")){App.loginScreen.askToExit("app-close-question-msg",function(value){if(value){App.player.stop();App.device.exitToPortal()}})}else{this.key_backspace()}};this.key_backspace=function(){App.display.showScreen("mainmenu")};this.key_vol_plus=function(){var v=App.settings.getVolume();if(v===0&&muteMode!==0){v=muteMode;muteMode=0}else{v+=App.clientSettings.volume_control_step}if(v>=100){v=100}App.settings.setVolume(v);this.showVolumeBar(v)};this.key_vol_minus=function(){var v=App.settings.getVolume();v-=App.clientSettings.volume_control_step;if(v<=0){v=0}App.settings.setVolume(v);this.showVolumeBar(v)};this.key_ch_minus=function(){if(App.player.getMode()===App.player.MODE_LIVETV||App.player.getMode()===App.player.MODE_PAUSE_LIVETV){this.resetAudioTracks();panelMenu.setSelectedItem(0,0);if(parentScreen==="categorizedtv"){App.categorizedTVScreen.switchToNextChannel(true)}else{App.tvChannelsScreen.switchToNextChannel(true)}}};this.key_ch_plus=function(){if(App.player.getMode()===App.player.MODE_LIVETV||App.player.getMode()===App.player.MODE_PAUSE_LIVETV){this.resetAudioTracks();panelMenu.setSelectedItem(0,0);if(parentScreen==="categorizedtv"){App.categorizedTVScreen.switchToNextChannel()}else{App.tvChannelsScreen.switchToNextChannel()}}};this.key_power=function(){App.switchStandBy()};this.key_aspect=function(){if(App.player.getState()===App.player.STATE_PLAYING){App.device.switchAspectRatio();var s=App.device.getAspectRatioName();App.tvChannelsScreen.showTextBar(s)}};this.key_mute=function(){var v;if(muteMode!==0){v=muteMode;muteMode=0}else{v=0;muteMode=App.settings.getVolume()}App.settings.setVolume(v);this.showVolumeBar(v)};this.key_play_pause=function(){this.key_pause()};this.key_long_enter=function(){if(App.showHelpButtonPanelFlag){var action=panelMenuItems[panelMenu.getSelectedDisplayItem()]["action"];if(Helper.isVisible(playerPanelMenuId)&&(action==="fwd"||action==="rew")){this.panelMenuButtonHandler()}else{var keys=[{action:"menu",label:"label-menu"},{action:"info",label:"label-hide-show"},{action:"red",label:"label-program"},{action:"aspect",label:"label-aspect"},{action:"back",label:"label-back"}];App.popupKeyPanelScreen.setKeysForPanel(keys);App.popupKeyPanelScreen.setParentScreen("player");App.display.showPopupScreen("popup-key-panel")}}else{that.key_enter()}};this.wheel=function(delta){if(delta>0){this.key_vol_minus()}else{this.key_vol_plus()}}}_PlayerScreen=new BaseScreen();PlayerScreen.prototype=_PlayerScreen;