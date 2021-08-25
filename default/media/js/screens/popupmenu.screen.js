function PopupMenuScreen(){var that=this;var listItems=[];var listMenuSelectedItem=0;var listMenu=new BaseMenu({sourceItemsNumber:1,displayItemsNumber:1,menuId:"popup-menu-screen-menu",menuTag:"ul",itemIdPrefix:"popup-menu-screen-menu-item",itemTag:"li",useFastRefresh:true,useItemIdWithoutIndex:false,useFadedScrollEffect:true,getItemNameFunc:function(sourceItemIndex,displayItemIndex){if(sourceItemIndex<listItems.length){return listItems[sourceItemIndex]["title"]}else{return""}},onItemClick:function(index){that.key_enter()},onItemMouseOver:function(index){listMenu.setSelectedItem(index,index)}});this.clearListMenuItems=function(){listItems=[]};this.addListMenuItem=function(title,onKeyEnterCallback){listItems[listItems.length]={title:title,onKeyEnterCallback:onKeyEnterCallback};listMenu.setNumberOfSourceItems(listItems.length);var n=5;if(listItems.length<n){n=listItems.length}listMenu.setNumberOfDisplayItems(n);listMenu.redrawMenuItems()};this.setListMenuSelectedItem=function(itemIndex){if(itemIndex<listItems.length){listMenuSelectedItem=itemIndex}else{listMenuSelectedItem=0}};this.show=function(){_PopupMenuScreen.show();listMenu.setSelectedItem(listMenuSelectedItem%listMenu.getNumberOfDisplayItems(),listMenuSelectedItem)};this.hide=function(){_PopupMenuScreen.hide();this.clearListMenuItems();this.setListMenuSelectedItem(0)};this.key_enter=function(){var onKeyEnterCallback=listItems[listMenu.getSelectedSourceItem()]["onKeyEnterCallback"];if(onKeyEnterCallback instanceof Function){onKeyEnterCallback(listMenu.getSelectedSourceItem())}else{this.hide()}};this.key_left=function(){listMenu.setPreviousPage()};this.key_right=function(){listMenu.setNextPage()};this.key_up=function(){listMenu.setPreviousItem()};this.key_down=function(){listMenu.setNextItem()};this.key_back=function(){this.hide()};this.key_exit=this.key_back;this.mouseEnter=function(param){Helper.addClassForObject(this.getSelfObject(),"mouse-over")};this.mouseLeave=function(param){Helper.removeClassForObject(this.getSelfObject(),"mouse-over")};this.wheel=function(delta){if(delta>0){this.key_down()}else{this.key_up()}}}var _PopupMenuScreen=new BaseScreen();PopupMenuScreen.prototype=_PopupMenuScreen;