function AppsScreen() {
    var that = this;
    var firstLoad = true;
    var appsMenu = new BaseMenu({
        displayItemsNumber: 10,
        menuId: "appsmenu",
        menuTag: "div",
        itemIdPrefix: "appsmenu",
        relatedItemIdPrefix: "appsmenu-selector",
        itemTag: "div",
        useFastRefresh: true,
        useMovableSelectionEffect: true,
        getRelatedDisplayItemIndexFunc: function (itemIndex) {
            var ind;
            if (itemIndex % 2 === 0) {
                ind = itemIndex / 2;
                if (itemIndex === 0) {
                    ind = 0
                }
            } else {
                ind = (itemIndex - 1) / 2;
                if (itemIndex === 1) {
                    ind = 0
                }
            }
            return ind
        },
        getItemNameFunc: function (sourceItemIndex, displayItemIndex, node) {
            var menuItems = App.appsScreen.getMenuItems();
            try {
                var item = menuItems[sourceItemIndex];
                if (!node) {
                    return true
                } else {
                    var style = "";
                    if (item.application) {
                        style = item.application["css_style"]
                    }
                    var cls = "appsmenu-item-label label-appsmenu-" + item.action;
                    var title = App.lang.get(cls);
                    if (!title) {
                        title = item.title
                    }
                    var spanElement1 = document.createElement("span");
                    spanElement1.setAttribute("class", "icon");
                    spanElement1.setAttribute("id", "app-icon-" + item.action);
                    spanElement1.setAttribute("style", style);
                    if (item.icon) {
                        spanElement1.style.backgroundImage = 'url("' + item.icon + '")'
                    }
                    var spanElement2 = document.createElement("span");
                    spanElement2.setAttribute("class", cls);
                    spanElement2.innerHTML = Helper.cropString(title, 15, "...");
                    node.appendChild(spanElement1);
                    node.appendChild(spanElement2)
                }
            } catch (e) {
                return ""
            }
        },
        onItemSelect: function (sourceIndex, displayIndex) {
            if (!firstLoad) {
                that.restoreIcon()
            }
        },
        onAfterItemSelect: function (sourceIndex, displayIndex) {
            if (!firstLoad) {
                var menuItems = App.appsScreen.getMenuItems();
                var application = menuItems[sourceIndex];
                var iconElement = Helper.byId(appsMenu.getItemIdPrefix() + displayIndex).children[0];
                if (application.iconFocus) {
                    iconElement.style.backgroundImage = 'url("' + application.iconFocus + '")'
                } else {
                    iconElement.style.backgroundImage = 'url("media/img/main/appsmenu-default-icon.png")'
                }
            }
        },
        onItemClick: function (index) {
            that.key_enter()
        },
        onItemMouseOver: function (index) {
            appsMenu.resetSelection();
            appsMenu.setSelectedItem(index, index)
        }
    });
    var selectorMenu = new BaseMenu({
        displayItemsNumber: 5,
        sourceItemsNumber: 5,
        menuId: "appsmenu-selector",
        menuTag: "div",
        itemIdPrefix: "appsmenu-selector",
        itemTag: "div",
        useFastRefresh: false,
        useMovableSelectionEffect: true
    });
    var menuItems = [];
    var menuActions = {};
    this.getMenuItems = function () {
        return menuItems
    };
    this.init = function () {
        _AppsScreen.init()
    };
    this.show = function () {
        _AppsScreen.show();
        appsMenu.redrawMenuItems();
        this.setFocusedIcon();
        firstLoad = false
    };
    this.reset = function () {
        _AppsScreen.setInited(false)
    };
    this.addMenuItem = function (title, action, application, icon, iconFocus) {
        var item = {
            title: title,
            action: action,
            application: application,
            icon: icon,
            iconFocus: iconFocus
        };
        if (action in menuActions) {
            return
        }
        menuActions[action] = true;
        menuItems[menuItems.length] = item
    };
    this.generateAppsMenu = function () {
        var n = menuItems.length;
        if (n > 10) {
            n = 10
        }
        appsMenu.setNumberOfDisplayItems(n);
        appsMenu.setNumberOfSourceItems(menuItems.length);
        if (n > 1) {
            appsMenu.setNumberOfColumns(2);
            appsMenu.setNumberOfRows(n / 2)
        }
        appsMenu.setSelectedItem(0, 0);
        appsMenu.redrawMenuItems()
    };
    this.restoreIcon = function () {
        var application = menuItems[appsMenu.getSavedSelectedSourceItem()];
        var iconElement = Helper.byId(appsMenu.getItemIdPrefix() + appsMenu.getSavedSelectedDisplayItem()).children[0];
        if (application.icon) {
            iconElement.style.backgroundImage = 'url("' + application.icon + '")'
        } else {
            iconElement.style.backgroundImage = 'url("media/img/main/appsmenu-default-icon.png")'
        }
    };
    this.setFocusedIcon = function () {
        var application = menuItems[appsMenu.getSelectedSourceItem()];
        var iconElement = Helper.byId(appsMenu.getItemIdPrefix() + appsMenu.getSavedSelectedDisplayItem()).children[0];
        if (application.iconFocus) {
            iconElement.style.backgroundImage = 'url("' + application.iconFocus + '")'
        } else {
            iconElement.style.backgroundImage = 'url("media/img/main/appsmenu-default-icon.png")'
        }
    };
    this.key_back = function () {
        this.key_menu()
    };
    this.key_menu = function () {
        App.display.showScreen("mainmenu")
    };
    this.key_down = function () {
        appsMenu.setDownItem();
        appsMenu.saveSelection()
    };
    this.key_right = function () {
        appsMenu.setNextItem();
        appsMenu.saveSelection()
    };
    this.key_left = function () {
        appsMenu.setPreviousItem();
        appsMenu.saveSelection()
    };
    this.key_up = function () {
        appsMenu.setUpItem();
        appsMenu.saveSelection()
    };
    this.key_enter = function () {
        var action = menuItems[appsMenu.getSelectedSourceItem()]["action"];
        switch (action) {
            default:
                try {
                    App.display.runApplication(action)
                } catch (e) {
                    alert(e)
                }
                break;
            case "games":
                App.display.showScreen("games");
                break;
            case "radio":
                App.player.stop();
                App.display.showScreen("radio");
                break
        }
    };
    this.key_exit = function () {
        if (App.player.isActive()) {
            App.display.showScreen("player")
        } else {
            this.key_back()
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
            App.popupKeyPanelScreen.setParentScreen("apps");
            App.display.showPopupScreen("popup-key-panel")
        } else {
            this.key_enter()
        }
    }
}
var _AppsScreen = new BaseScreen();
AppsScreen.prototype = _AppsScreen;