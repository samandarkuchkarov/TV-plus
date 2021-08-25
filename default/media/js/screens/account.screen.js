function AccountScreen() {
    var that = this;
    var accountMenu = new BaseMenu({
        menuId: "account-menu",
        menuTag: "ul",
        itemIdPrefix: "account-menu-item",
        itemTag: "li",
        displayItemsNumber: 8,
        sourceItemsNumber: 8,
        useFastRefresh: true,
        getItemNameFunc: function (sourceItemIndex, displayItemIndex, node) {
            if (accountMenuItems.length > sourceItemIndex) {
                var key = accountMenuItems[sourceItemIndex];
                if (!node) {
                    return true
                } else {
                    var divElement = document.createElement("div");
                    divElement.setAttribute("class", "label-account-" + key);
                    divElement.innerHTML = App.lang.get("label-account-" + key);
                    node.appendChild(divElement)
                }
            } else {
                return ""
            }
        },
        onItemClick: function (index) {
            that.key_enter()
        },
        onItemMouseOver: function (index) {
            accountMenu.setSelectedItem(index, index)
        }
    });
    var accountMenuItems = [];
    this.show = function () {
        App.playerScreen.hideTvInfoBar();
        App.playerScreen.hideVideoInfoBar();
        _AccountScreen.show()
    };
    this.refresh = function () {
        accountMenu.redrawMenuItems();
        _AccountScreen.init()
    };
    this.addCustomAccountMenuItem = function (action) {
        if (action in accountMenuItems) {
            return
        } else {
            accountMenuItems.push(action)
        }
    };
    this.init = function () {
        if (App.clientSettings.service_description) {
            App.display.addScreen(App.serviceInfoScreen, "service-info");
            accountMenuItems.push("service-info")
        }
        if (App.clientSettings.enable_promo_activation) {
            accountMenuItems.push("promo-activation")
        }
        accountMenuItems.push("logout");
        accountMenu.setNumberOfDisplayItems(accountMenuItems.length);
        accountMenu.setNumberOfSourceItems(accountMenuItems.length);
        accountMenu.redrawMenuItems();
        accountMenu.resetSelection();
        accountMenu.setSelectedItem(0, 0);
        _AccountScreen.init()
    };
    this.key_back = function () {
        this.key_menu()
    };
    this.key_down = function () {
        accountMenu.setNextItem()
    };
    this.key_up = function () {
        accountMenu.setPreviousItem()
    };
    this.key_enter = function () {
        var key = accountMenu.getSelectedDisplayItem();
        if (accountMenuItems.length > key) {
            key = accountMenuItems[key]
        }
        switch (key) {
            case "service-info":
                App.display.showScreen("service-info");
                break;
            case "info":
                App.display.showScreen("info");
                break;
            case "balance":
                App.display.showScreen("balance");
                break;
            case "notifications":
                App.display.showScreen("notifications");
                break;
            case "promo-activation":
                App.display.showScreen("promo");
                break;
            case "logout":
                App.loginScreen.askToExit("logout-question-msg", function (value) {
                    if (value) {
                        App.data.requestLogout();
                        App.logout()
                    }
                });
                break
        }
    };
    this.key_menu = function () {
        App.display.showScreen("mainmenu")
    };
    this.key_exit = function () {
        if (App.player.isActive()) {
            App.display.showScreen("player")
        } else {
            App.display.showScreen("mainmenu")
        }
    };
    this.key_backspace = function () {
        this.key_exit()
    };
    this.key_power = function () {
        App.switchStandBy()
    };
    this.wheel = function (delta) {
        if (delta > 0) {
            this.key_down()
        } else {
            this.key_up()
        }
    };
    this.key_long_enter = function () {
        if (App.showHelpButtonPanelFlag) {
            var keys = [{
                action: "back",
                label: "label-back"
            }];
            App.popupKeyPanelScreen.setKeysForPanel(keys);
            App.popupKeyPanelScreen.setParentScreen("account");
            App.display.showPopupScreen("popup-key-panel")
        } else {
            this.key_enter()
        }
    }
}
_AccountScreen = new BaseScreen();
AccountScreen.prototype = _AccountScreen;