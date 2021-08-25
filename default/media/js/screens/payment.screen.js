function PaymentScreen(){var inputFields=["amount-value","card-number","card-holder","card-input3","card-input4","card-cvc"];var monthList=[],yearList=[];var monthIndex,yearIndex;var that=this;var amount=0;var parentScreen="";var currencyStr="";var paymentFormMenu=new BaseMenu({menuId:"payment-form-container",menuTag:"div",itemIdPrefix:"card-input",itemTag:"li",displayItemsNumber:7,sourceItemsNumber:7,onItemClick:function(index){that.key_enter()},onItemMouseOver:function(index){paymentFormMenu.setSelectedItem(index,index);that.refreshHelpbar()}});this.show=function(){App.playerScreen.hideTvInfoBar();App.playerScreen.hideVideoInfoBar();if(parentScreen!=="balance"){Helper.addClass("payment-screen-container","loader");App.data.requestCustomerInfo({},function(error){Helper.removeClass("payment-screen-container","loader");App.paymentScreen.setAmount()})}if(App.clientSettings.site_url){Helper.setHtml("payment-screen-site",App.clientSettings.site_url)}if(!currencyStr){var currency=App.data.getCurrency();currencyStr=currency==="RUB"?App.lang.get("RUB"):currency;Helper.setHtml("payment-form-currency",currencyStr)}_PaymentScreen.show();parentScreen="";this.setPaymentForm()};this.setAmount=function(value){if(value){amount=value}else{if(App.data.getCurrentDebtAmount()>0){amount=App.data.getCurrentDebtAmount()}else{amount=App.data.getMonthlyPayment()}}Helper.byId("amount-value").value=amount};this.setParentScreen=function(value){parentScreen=value};this.resetCardData=function(){Helper.byId("card-number").value="";Helper.byId("card-holder").value="";Helper.byId("card-cvc").value=""};this.init=function(){_PaymentScreen.init()};this.setPaymentForm=function(){this.resetCardData();for(var i=1;i<13;i++){if(i<10){monthList[i-1]="0"+i.toString()}else{monthList[i-1]=i.toString()}}var d=new Date(Helper.withTimezone(App.data.getUtcTime())*1000);var m=d.getMonth();var y=d.getFullYear();for(i=0;i<10;i++){yearList[i]=(parseFloat(y)+i).toString()}yearIndex=0;if(m===12){yearIndex=1}monthIndex=m%12;Helper.setHtml("card-input3",monthList[monthIndex]);Helper.setHtml("card-input4",yearList[yearIndex]);paymentFormMenu.resetSelection();paymentFormMenu.setSelectedItem(0,0);this.refreshHelpbar()};this.refreshHelpbar=function(){var inputIndex=paymentFormMenu.getSelectedDisplayItem();var selectedInput=inputFields[inputIndex];switch(selectedInput){case"amount-value":case"card-number":case"card-cvc":Helper.removeClass("payment-footer","expiration");Helper.removeClass("payment-footer","pay");Helper.removeClass("payment-footer","left-right");if(Helper.getValue(selectedInput).length===0){Helper.addClass("payment-footer","left-right")}break;case"card-holder":Helper.removeClass("payment-footer","pay");Helper.removeClass("payment-footer","expiration");Helper.addClass("payment-footer","left-right");break;case"card-input3":case"card-input4":Helper.removeClass("payment-footer","pay");Helper.addClass("payment-footer","expiration");Helper.addClass("payment-footer","left-right");break;default:Helper.removeClass("payment-footer","expiration");Helper.removeClass("payment-footer","left-right");Helper.addClass("payment-footer","pay");break}};this.callKeyboard=function(selectedInput){var maxInputLength=0;switch(selectedInput){case"amount-value":App.keyboardScreen.setMaxValue(5000);maxInputLength=4;break;case"card-number":maxInputLength=19;break;case"card-cvc":maxInputLength=3;break;default:App.keyboardScreen.setMaxInputLength();break}if(maxInputLength>0){App.keyboardScreen.setMaxInputLength(maxInputLength)}App.keyboardScreen.setCallback(function(str){Helper.setValue(selectedInput,str);that.refreshHelpbar()});App.display.showPopupScreen("keyboard",selectedInput)};this.key_back=function(){if(!Helper.hasClass("payment-screen-container","loader")){App.display.showScreen("balance")}};this.key_backspace=function(){this.key_back()};this.key_menu=function(){if(!Helper.hasClass("payment-screen-container","loader")){App.display.showScreen("mainmenu")}};this.key_digit=function(digit){if(!Helper.hasClass("payment-screen-container","loader")){var selectedInput=inputFields[paymentFormMenu.getSelectedDisplayItem()];var valueOfSelectedInput=Helper.getValue(selectedInput);var lenOfSelectedInput=valueOfSelectedInput.length;var newStr=valueOfSelectedInput;var flag=true;switch(selectedInput){case"amount-value":if(parseInt(valueOfSelectedInput+digit)<=5000){newStr+=digit}break;case"card-number":if(lenOfSelectedInput<19){if(lenOfSelectedInput!==0&&(lenOfSelectedInput===4||lenOfSelectedInput===9||lenOfSelectedInput===14)){newStr+=" "}newStr+=digit}break;case"card-cvc":if(lenOfSelectedInput<3){newStr+=digit}break;default:flag=false;break}if(flag){Helper.setValue(selectedInput,newStr);this.refreshHelpbar()}}};this.key_up=function(){if(!Helper.hasClass("payment-screen-container","loader")){paymentFormMenu.setPreviousItem();this.refreshHelpbar()}};this.key_down=function(){if(!Helper.hasClass("payment-screen-container","loader")){paymentFormMenu.setNextItem();this.refreshHelpbar()}};this.key_right=function(){this.key_down()};this.key_left=function(){var selectedInput=inputFields[paymentFormMenu.getSelectedDisplayItem()];var newStr="";switch(selectedInput){case"amount-value":case"card-number":case"card-holder":case"card-cvc":if(!Helper.hasClass("payment-screen-container","loader")){var valueOfSelectedInput=Helper.getValue(selectedInput);var lenOfSelectedInput=valueOfSelectedInput.length;if(lenOfSelectedInput>0){newStr=valueOfSelectedInput.substr(0,lenOfSelectedInput-1);Helper.setValue(selectedInput,newStr);if(lenOfSelectedInput===1){this.refreshHelpbar()}}else{this.key_up()}}break;default:this.key_up();break}};this.key_enter=function(){if(!Helper.hasClass("payment-screen-container","loader")){var selectedInput=inputFields[paymentFormMenu.getSelectedDisplayItem()];switch(selectedInput){case"amount-value":case"card-number":case"card-holder":case"card-cvc":this.callKeyboard(selectedInput);break;case"card-input3":for(var i=0;i<monthList.length;i++){App.popupMenuScreen.addListMenuItem(monthList[i],function(index){Helper.setHtml(selectedInput,monthList[index]);App.popupMenuScreen.hide()})}App.display.showPopupScreen("popup-menu");break;case"card-input4":for(var i=0;i<yearList.length;i++){App.popupMenuScreen.addListMenuItem(yearList[i],function(index){Helper.setHtml(selectedInput,yearList[index]);App.popupMenuScreen.hide()})}App.display.showPopupScreen("popup-menu");break;default:var date=Helper.getHtml("card-input3")+"."+Helper.getHtml("card-input4");var cardNum=Helper.getValue("card-number").split(" ").join("");var cardHol=Helper.getValue("card-holder");var cvcNum=Helper.getValue("card-cvc");amount=parseInt(Helper.getValue("amount-value"));if(cardNum.length===16&&cardHol.length>0&&cvcNum.length===3&&amount>0){Helper.addClass("payment-screen-container","loader");App.data.requestCreatePayment({amount:amount,merchant_type:App.clientSettings.merchant_type},function(error,payment_id){if(error==0){App.data.requestProcessPayment({payment_id:payment_id,card_number:cardNum,card_holder:cardHol,card_expire:date,card_cvv:cvcNum,merchant_type:App.clientSettings.merchant_type},function(error,action,params){Helper.removeClass("payment-screen-container","loader");var s="";if(error==0){if(action!=-1){var payment3dSecureElement=Helper.byId("payment-3D-secure");payment3dSecureElement.innerHTML="";var paymentIframeElement=document.createElement("iframe");paymentIframeElement.setAttribute("name","iframe-callback");paymentIframeElement.setAttribute("id","payment-iframe");paymentIframeElement.setAttribute("width",App.display.getWidth());paymentIframeElement.setAttribute("height",App.display.getHeight());action+="?";for(var param in params){action+=param+"="+params[param]+"&"}paymentIframeElement.setAttribute("src",action);payment3dSecureElement.appendChild(paymentIframeElement);Helper.showObject(payment3dSecureElement);paymentIframeElement.focus();function listener(event){payment3dSecureElement.innerHTML="";Helper.hideObject(payment3dSecureElement);App.display.showScreen("balance")}if(window.addEventListener){window.addEventListener("message",listener)}else{window.attachEvent("onmessage",listener)}}else{s=App.lang.get("success-payment-msg");App.display.showScreen("balance");App.popupMessageScreen.setMessageText(s);App.display.showPopupScreen("popup-message")}}else{if(App.lang.get(error)){s=App.lang.get(error)}else{s=App.lang.get("unknown-payment-error")}App.popupMessageScreen.setMessageText(s);App.display.showPopupScreen("popup-message")}})}else{App.popupMessageScreen.setMessageText("unknown-create-payment-error");App.display.showPopupScreen("popup-message")}})}else{App.popupMessageScreen.setMessageText(App.lang.get("incorrect-card-data"));App.display.showPopupScreen("popup-message")}}}};this.key_exit=function(){if(!Helper.hasClass("payment-screen-container","loader")){if(App.player.isActive()){App.display.showScreen("player")}else{App.display.showScreen("balance")}}};this.key_long_enter=function(){if(App.showHelpButtonPanelFlag){var keys=[{action:"back",label:"label-back"}];App.popupKeyPanelScreen.setKeysForPanel(keys);App.popupKeyPanelScreen.setParentScreen("payment");App.display.showPopupScreen("popup-key-panel")}else{this.key_enter()}}}_PaymentScreen=new BaseScreen();PaymentScreen.prototype=_PaymentScreen;