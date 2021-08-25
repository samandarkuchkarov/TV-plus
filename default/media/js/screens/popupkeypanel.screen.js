function PopupKeyPanelScreen(){var keyPanelItems=[];var parentScreen="";var keyPanelMenu=new BaseMenu({menuId:"key-panel-menu",menuTag:"div",itemIdPrefix:"panel-key",itemTag:"div",useFastRefresh:true,hideItemIfEmptyName:true,getItemNameFunc:function(realItemIndex,itemIndex,node){var key=keyPanelItems[realItemIndex];if(!node){return true}else{var keyActionElement=document.createElement("div");keyActionElement.setAttribute("class",key.action+" key-handler key-panel-button");keyActionElement.setAttribute("x-key-handler",key.action);var keyLabelElement=document.createElement("span");keyLabelElement.setAttribute("class",key.label+" key-panel-button-label");keyLabelElement.innerHTML=App.lang.get(key.label);node.appendChild(keyActionElement);node.appendChild(keyLabelElement)}},onItemClick:function(index){},onItemMouseOver:function(index){}});this.setKeysForPanel=function(keys){keyPanelItems=[];keyPanelItems=keyPanelItems.concat(keys)};this.setParentScreen=function(screen){parentScreen=screen};this.refreshPanel=function(){keyPanelMenu.clear();keyPanelMenu.setNumberOfDisplayItems(keyPanelItems.length);keyPanelMenu.setNumberOfSourceItems(keyPanelItems.length);keyPanelMenu.setSelectedItem(0,0);keyPanelMenu.redrawMenuItems()};this.show=function(){_PopupKeyPanelScreen.show();this.refreshPanel()};this.key_back=function(){this.key_exit()};this.key_right=function(){keyPanelMenu.setNextItem()};this.key_left=function(){keyPanelMenu.setPreviousItem()};this.key_enter=function(){if(parentScreen.length>0&&keyPanelItems.length>0){var key=keyPanelItems[keyPanelMenu.getSelectedDisplayItem()];var screen=App.display.getScreenByName(parentScreen);this.hide();Helper.executeFunctionByName("key_"+key.action,screen)}else{this.key_exit()}};this.key_exit=function(){this.hide()}}_PopupKeyPanelScreen=new BaseScreen();PopupKeyPanelScreen.prototype=_PopupKeyPanelScreen;