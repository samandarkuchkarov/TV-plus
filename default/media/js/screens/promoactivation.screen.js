function PromoActivationScreen(){var maxNumberLength=20;var menuItems=[];var that=this;var focusedMenu="";var promoActivationMenu=new BaseMenu({menuId:"promo-activation-menu",menuTag:"ul",itemIdPrefix:"promomenu",itemTag:"li",displayItemsNumber:2,sourceItemsNumber:2,onItemClick:function(index){if(promoActivationMenu.getSelectedDisplayItem()===1){that.key_enter()}else{that.key_right()}},onItemMouseOver:function(index){promoActivationMenu.setSelectedItem(index,index)}});var historyMenu=new BaseMenu({menuId:"history-of-promo-codes-menu",menuTag:"ul",itemIdPrefix:"history-promo",itemTag:"li",useFastRefresh:true,hideItemIfEmptyName:false,getItemNameFunc:function(realItemIndex,itemIndex,node){if(menuItems[realItemIndex]){if(!node){return true}else{var date=menuItems[realItemIndex]["date"];date=date.slice(8)+"."+date.slice(5,7)+"."+date.slice(0,4);var promoCodeElement=document.createElement("div");promoCodeElement.setAttribute("class","history-promo-code");promoCodeElement.innerHTML=menuItems[realItemIndex]["code"];var dateElement=document.createElement("div");dateElement.setAttribute("class","history-promo-date");dateElement.innerHTML="Активирован <br/>"+date;var currency=App.data.getCurrency();var currencyStr=currency==="RUB"?App.lang.get("RUB"):currency;var commentElement=document.createElement("div");commentElement.setAttribute("class","history-promo-comment");commentElement.innerHTML=+menuItems[realItemIndex]["type"]===0?"Пополнение баланса на "+menuItems[realItemIndex]["amount"]+" "+currencyStr:"Скидка на оплату "+menuItems[realItemIndex]["discount"]+"%";node.appendChild(promoCodeElement);node.appendChild(dateElement);node.appendChild(commentElement)}}else{return""}},onItemClick:function(index){var sourceItems=historyMenu.getCurrentPage()*historyMenu.getNumberOfDisplayItems()+index;historyMenu.setSelectedItem(index,sourceItems)},onItemMouseOver:function(index){var sourceItems=historyMenu.getCurrentPage()*historyMenu.getNumberOfDisplayItems()+index;historyMenu.setSelectedItem(index,sourceItems)}});this.refresh=function(){App.data.requestPromoList({},function(error){menuItems=App.data.getPromoList();if(menuItems.length===0){Helper.showById("history-of-promo-codes-empty-screen")}else{var n=4;if(n>menuItems.length){n=menuItems.length}historyMenu.setNumberOfDisplayItems(n);historyMenu.setNumberOfSourceItems(menuItems.length);historyMenu.redrawMenuItems()}})};this.init=function(){_PromoActivationScreen.init();promoActivationMenu.setMenuFocus();promoActivationMenu.setSelectedItem(0,0);focusedMenu="promoActivation"};this.show=function(){Helper.hideById("history-of-promo-codes-empty-screen");menuItems=[];historyMenu.clear();Helper.setValue("promo-activation-code","");_PromoActivationScreen.show();this.refresh()};this.key_digit=function(digit){var id="promo-activation-code";if(Helper.getValue(id).length<maxNumberLength){Helper.setValue(id,Helper.getValue(id)+digit)}};this.key_backspace=function(){var id="promo-activation-code";var value=Helper.getValue(id);if(value.length>0){value=value.substr(0,value.length-1);Helper.setValue(id,value)}};this.key_left=function(){if(focusedMenu==="promoActivation"){if(promoActivationMenu.getSelectedSourceItem()===0){this.key_backspace()}else{promoActivationMenu.setPreviousItem()}}};this.key_right=function(){if(focusedMenu==="promoActivation"){promoActivationMenu.setNextItem()}};this.key_down=function(){if(focusedMenu==="promoActivation"){promoActivationMenu.unsetMenuFocus();historyMenu.setMenuFocus();focusedMenu="history"}else{if(focusedMenu==="history"){historyMenu.setNextItem()}}};this.key_up=function(){if(focusedMenu==="history"){if(historyMenu.getSelectedSourceItem()===0){historyMenu.unsetMenuFocus();promoActivationMenu.setMenuFocus();focusedMenu="promoActivation"}else{historyMenu.setPreviousItem()}}};this.key_enter=function(){if(focusedMenu==="promoActivation"){var promoCode=Helper.getValue("promo-activation-code");if(promoActivationMenu.getSelectedSourceItem()===0||promoCode.length===0){App.keyboardScreen.setMaxInputLength(maxNumberLength);App.keyboardScreen.setCallback(function(str){Helper.setValue("promo-activation-code",str)});App.display.showPopupScreen("keyboard","promo-activation-code")}else{Helper.addClass("promo-activation-screen-container","loader");App.data.requestPromoActivate({code:promoCode},function(error){Helper.removeClass("promo-activation-screen-container","loader");switch(error){case 0:App.popupMessageScreen.setMessageText(App.lang.get("promo-success-activation"));break;case 1:case 2:App.popupMessageScreen.setMessageText(App.lang.get("promo-not-found"));break;case 3:App.popupMessageScreen.setMessageText(App.lang.get("promo-already-activated"));break;case 4:App.popupMessageScreen.setMessageText(App.lang.get("promo-expired"));break;default:App.popupMessageScreen.setMessageText(App.lang.get("promo-unknown-error"));break}App.display.showPopupScreen("popup-message");Helper.setValue("promo-activation-code","");that.refresh()})}}};this.key_back=function(){App.display.showScreen("account")};this.wheel=function(){return true}}_PromoActivationScreen=new BaseScreen();PromoActivationScreen.prototype=_PromoActivationScreen;