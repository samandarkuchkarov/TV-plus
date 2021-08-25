SpeedTestWidget=function(){var that=this;var speedTestScreen=new BaseScreen();var speedTestScreenId="speedtest-screen";var selfScreenContainerObject=null;var status=0;var refreshInterval=null;var workerObject=null;var speedTestMenu=new BaseMenu({menuId:"speedtest-info-menu",menuTag:"ul",itemIdPrefix:"speedtest-info",itemTag:"li",useFastRefresh:true,hideItemIfEmptyName:false,getItemNameFunc:function(realItemIndex,itemIndex,node){var speedTestItemName=speedTestInfoMenuItems[realItemIndex];if(!node){return true}else{if(!speedTestInfo[speedTestItemName]){speedTestInfo[speedTestItemName]="..."}var keyElement=document.createElement("div");keyElement.setAttribute("class","key label-"+speedTestItemName);keyElement.innerHTML=App.lang.get("label-"+speedTestItemName);var valueElement=document.createElement("div");valueElement.setAttribute("class","value");valueElement.innerHTML=Helper.cropString(speedTestInfo[speedTestItemName],30,"...");node.appendChild(keyElement);node.appendChild(valueElement)}}});var speedTestInfo={"ip-address":"...","download-speed":"...","upload-speed":"...",ping:"...",jitter:"..."};var speedTestInfoMenuItems=["ip-address","download-speed","upload-speed","ping","jitter"];var attrs=null;this.setIpAddress=function(value){speedTestInfo["ip-address"]=value};this.setDownloadSpeed=function(value){speedTestInfo["download-speed"]=value};this.setUploadSpeed=function(value){speedTestInfo["upload-speed"]=value};this.setPing=function(value){speedTestInfo.ping=value};this.setJitter=function(value){speedTestInfo.jitter=value};this.getSpeedTestScreen=function(){var screenElement=document.createElement("div");screenElement.setAttribute("class","screen");screenElement.setAttribute("id",speedTestScreenId);screenElement.style.cssText="display:none;";var screenContainerElement=document.createElement("div");screenContainerElement.setAttribute("class","screen-container");screenContainerElement.setAttribute("id","speedtest-screen-container");var logoContainerElement=document.createElement("div");logoContainerElement.setAttribute("class","logo");var logoElement=document.createElement("img");logoElement.setAttribute("class","client-logo");logoElement.setAttribute("src",Helper.getResourceUrl("media/img/main/operator-logo-big.png"));logoContainerElement.appendChild(logoElement);var screenHeaderElement=document.createElement("div");screenHeaderElement.setAttribute("class","screen-header label-speedtest-info");screenHeaderElement.setAttribute("id","speedtest-screen-header");screenHeaderElement.innerHTML=App.lang.get("label-speedtest-info");var speedTestMenuElement=document.createElement("ul");speedTestMenuElement.setAttribute("id","speedtest-info-menu");var speedTestSiteElement=document.createElement("div");speedTestSiteElement.setAttribute("class","client-site");Helper.setHtmlForObject(speedTestSiteElement,App.clientSettings.site_url);var speedTestSupportElement=document.createElement("div");speedTestSupportElement.setAttribute("class","client-support");Helper.setHtmlForObject(speedTestSupportElement,App.clientSettings.support_info);screenContainerElement.appendChild(logoContainerElement);screenContainerElement.appendChild(screenHeaderElement);screenContainerElement.appendChild(speedTestMenuElement);screenContainerElement.appendChild(speedTestSiteElement);screenContainerElement.appendChild(speedTestSupportElement);var screenFooterElement=document.createElement("div");screenFooterElement.setAttribute("class","screen-footer mouse-leave-handler");screenFooterElement.setAttribute("x-mouse-leave-param","footer");var footerButtonContainerElement=document.createElement("div");footerButtonContainerElement.setAttribute("class","footer-button");var okButtonElement=document.createElement("div");okButtonElement.setAttribute("class","remote-button enter key-handler");okButtonElement.setAttribute("x-key-handler","enter");var okLabelElement=document.createElement("span");okLabelElement.setAttribute("class","label-ok");okLabelElement.innerHTML="Перезапустить";footerButtonContainerElement.appendChild(okButtonElement);footerButtonContainerElement.appendChild(okLabelElement);var footerButtonContainerElement2=document.createElement("div");footerButtonContainerElement2.setAttribute("class","footer-button");var backButtonElement=document.createElement("div");backButtonElement.setAttribute("class","remote-button back key-handler");backButtonElement.setAttribute("x-key-handler","back");var backLabelElement=document.createElement("span");backLabelElement.setAttribute("class","label-back");backLabelElement.innerHTML="Назад";footerButtonContainerElement2.appendChild(backButtonElement);footerButtonContainerElement2.appendChild(backLabelElement);screenFooterElement.appendChild(footerButtonContainerElement);screenFooterElement.appendChild(footerButtonContainerElement2);screenElement.appendChild(screenContainerElement);screenElement.appendChild(screenFooterElement);return screenElement};this.render=function(){App.display.addScreen(speedTestScreen,speedTestScreenId);speedTestScreen.key_back=function(){App.display.showScreen("apps")};speedTestScreen.show=function(){if(Helper.byId(speedTestScreenId)){Helper.showById(speedTestScreen.getId())}else{App.lang.set("ru","speedtest-device-not-support","К сожалению, тест скорости на этом устройстве недоступен.");App.lang.set("en","speedtest-device-not-support","Unfortunately, the speed test on this device is not available.");var screenElement=that.getSpeedTestScreen();Helper.byId("page-container").appendChild(screenElement);Helper.showObject(screenElement);speedTestScreen.setId(speedTestScreenId);if(!selfScreenContainerObject){selfScreenContainerObject=Helper.byId("speedtest-screen-container")}attrs=that.getAttrs()}speedTestMenu.setNumberOfRows(speedTestInfoMenuItems.length);speedTestScreen.refreshSpeedTest()};var parentInit=speedTestScreen.init;speedTestScreen.init=function(){parentInit.call(speedTestScreen)};speedTestScreen.hide=function(){that.stop();Helper.hideById(speedTestScreen.getId())};speedTestScreen.key_down=function(){speedTestMenu.setNextItem()};speedTestScreen.key_up=function(){speedTestMenu.setPreviousItem()};speedTestScreen.key_enter=function(){this.refreshSpeedTest()};speedTestScreen.key_yellow=function(){};speedTestScreen.refreshSpeedTest=function(){Helper.addClassForObject(selfScreenContainerObject,"loader");if(status>=3||status===0){try{workerObject=new Worker(Helper.getResourceUrl("apps/speedtest-widget/speedtest_worker.js"));refreshInterval=setInterval(function(){workerObject.postMessage("status")},100);workerObject.onmessage=function(event){var data=event.data.split(";");status=Number(data[0]);if(status>=4){that.stop()}that.setDownloadSpeed((status===1&&data[1]===0)?"Starting":(data[1]+" Mbit/s"));that.setUploadSpeed((status===3&&data[2]===0)?"Starting":(data[2]+" Mbit/s"));that.setPing(data[3]+" ms");that.setJitter(data[5]+" ms");that.setIpAddress(data[4]);speedTestMenu.redrawMenuItems()};var settings={url_dl:attrs.speedtest_server_url+"/garbage.php",url_ul:attrs.speedtest_server_url+"/empty.php",url_ping:attrs.speedtest_server_url+"/empty.php",url_getIp:attrs.speedtest_server_url+"/getIP.php"};workerObject.postMessage("device "+App.device.getDeviceKind());workerObject.postMessage("start "+JSON.stringify(settings));speedTestMenu.clear();var n=speedTestMenu.getNumberOfRows();speedTestMenu.setNumberOfDisplayItems(n);speedTestMenu.setNumberOfSourceItems(n);speedTestMenu.setSelectedItem(0,0);speedTestMenu.redrawMenuItems()}catch(e){App.popupMessageScreen.setMessageText(App.lang.get("speedtest-device-not-support"));App.display.showPopupScreen("popup-message");App.display.showScreen("apps")}}}};this.run=function(){App.display.showScreen(speedTestScreenId,true)};this.stop=function(){clearInterval(refreshInterval);if(workerObject){workerObject.postMessage("abort");workerObject=null}status=0;Helper.removeClassForObject(selfScreenContainerObject,"loader")}};_SpeedTestWidget=new BaseWidget();SpeedTestWidget.prototype=_SpeedTestWidget;