function PopupParentCodeScreen(){var callbackFunc=null;var parentControlCodeInputId="parent-code-number";this.show=function(){Helper.setValue(parentControlCodeInputId,"");_PopupParentCodeScreen.show()};this.init=function(){_PopupParentCodeScreen.init()};this.setCallback=function(f){if(f instanceof Function){callbackFunc=f}};this.key_enter=function(){this.hide();var code=Helper.getValue(parentControlCodeInputId);if(callbackFunc instanceof Function){callbackFunc(code+""===App.data.getParentCode()+"")}};this.key_digit=function(digit){Helper.setValue(parentControlCodeInputId,Helper.getValue(parentControlCodeInputId)+digit)};this.key_backspace=function(){var value=Helper.getValue(parentControlCodeInputId);if(value.length>0){value=value.substr(0,value.length-1);Helper.setValue(parentControlCodeInputId,value)}};this.key_left=function(){this.key_backspace()};this.key_right=function(){var id=parentControlCodeInputId;App.keyboardScreen.setMaxInputLength(18);App.keyboardScreen.setCallback(function(str){Helper.setValue(id,str);App.popupParentCodeScreen.key_enter()});App.display.showPopupScreen("keyboard",parentControlCodeInputId)};this.key_back=function(){this.hide()};this.key_menu=function(){this.hide();App.display.showScreen("mainmenu")};this.key_red=function(){this.hide();var screen=App.display.getCurrentScreen();if(screen){screen.key_red()}};this.key_green=function(){this.hide();var screen=App.display.getCurrentScreen();if(screen){screen.key_green()}};this.key_yellow=function(){this.hide();var screen=App.display.getCurrentScreen();if(screen){screen.key_yellow()}};this.key_blue=function(){this.hide();var screen=App.display.getCurrentScreen();if(screen){screen.key_blue()}};this.key_exit=function(){this.hide()};this.mouseEnter=function(param){Helper.addClassForObject(this.getSelfObject(),"mouse-over")};this.mouseLeave=function(param){Helper.removeClassForObject(this.getSelfObject(),"mouse-over")}}_PopupParentCodeScreen=new BaseScreen();PopupParentCodeScreen.prototype=_PopupParentCodeScreen;