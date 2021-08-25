function CategorizedTVScreen() {
    var updateChannelListDelay = 700;
    try {
        var programCategoryListHelper = Object.create(Helper)
    } catch (e) {
        var programCategoryListHelper = Helper
    }
    var focusedMenu = "";
    var timeIntervalClock = null;
    var timeIntervalPrograms = null;
    var timeIntervalGenres = null;
    var menuItems = [];
    var programList = [];
    var that = this;
    var optionsObj = {};
    var numberOfDisplayRows = 0;
    var navigationMode = "normal";
    var mode = "now";
    var epgcategoriesMenu = new BaseMenu({
        menuId: "epg-categories-menu",
        menuTag: "ul",
        itemIdPrefix: "epg-category",
        itemTag: "li",
        useFastRefresh: true,
        hideItemIfEmptyName: true,
        relatedItemIdPrefix: "categorizedtv-selector",
        getItemNameFunc: function (realItemIndex, itemIndex) {
            var category = menuItems[realItemIndex];
            if (epgcategoriesMenu.getSelectedSourceItem() === realItemIndex) {
                programList = [];
                var data = App.data.getFilteredProgramCategoryChannelList(category.id);
                if (data) {
                    programList = data
                }
            }
            if (category) {
                return category.name
            } else {
                return ""
            }
        },
        onItemClick: function (index) {
            that.onProgramCategoryClickFunction(index)
        },
        onItemMouseOver: function (index) {
            that.onProgramCategoryClickFunction(index)
        }
    });
    var selectorMenu = new BaseMenu({
        displayItemsNumber: 4,
        sourceItemsNumber: 4,
        menuId: "categorizedtv-selector",
        menuTag: "div",
        itemIdPrefix: "categorizedtv-selector",
        itemTag: "div",
        useFastRefresh: false
    });
    var programsMenu = new BaseMenu({
        menuId: "programs-menu",
        menuTag: "ul",
        itemIdPrefix: "program",
        itemTag: "li",
        useFastRefresh: true,
        getItemNameFunc: function (realItemIndex, itemIndex, node) {
            var program = programList[realItemIndex];
            if (program) {
                if (!node) {
                    return true
                } else {
                    var imgElement = document.createElement("img");
                    imgElement.setAttribute("src", Helper.getResourceUrl(program.icon));
                    var programsMenuSpanElement = document.createElement("span");
                    programsMenuSpanElement.setAttribute("class", "programs-menu-span");
                    var nameSpanElement = document.createElement("span");
                    nameSpanElement.setAttribute("class", "name");
                    node.appendChild(imgElement);
                    if (!program.has_subscription) {
                        var lockedChannelIconElement = document.createElement("img");
                        lockedChannelIconElement.setAttribute("src", Helper.getResourceUrl("media/img/main/locked-channel-icon.png"));
                        lockedChannelIconElement.setAttribute("class", "locked");
                        node.appendChild(lockedChannelIconElement)
                    }
                }
                if (!mode || mode === "now") {
                    if (program.program_begin_time !== -1) {
                        var w = Helper.getProgressWidth(program.program_begin_time, program.program_end_time, App.data.getUtcTime());
                        if (program.program_genres) {
                            if (program.program_genres.length > 0 && program.program_genres[0]["name"] !== -1) {
                                var genreElement = document.createElement("span");
                                genreElement.setAttribute("class", "program-genre");
                                genreElement.innerHTML = program.program_genres[0]["name"] + (App.settings.getStyleName() === "impuls_x" ? " " : ": ");
                                nameSpanElement.appendChild(genreElement)
                            }
                        }
                        var beginTimeSpanElement = document.createElement("span");
                        beginTimeSpanElement.setAttribute("class", "begin-time");
                        beginTimeSpanElement.innerHTML = Helper.formatTime(Helper.withTimezone(program.program_begin_time));
                        nameSpanElement.appendChild(beginTimeSpanElement);
                        if (program.program_name) {
                            nameSpanElement.innerHTML += program.program_name
                        } else {
                            nameSpanElement.innerHTML += "---"
                        }
                        programsMenuSpanElement.appendChild(nameSpanElement);
                        var endTimeSpanElement = document.createElement("span");
                        endTimeSpanElement.setAttribute("class", "end-time");
                        endTimeSpanElement.innerHTML = App.lang.get("before") + " " + Helper.formatTime(Helper.withTimezone(program.program_end_time));
                        programsMenuSpanElement.appendChild(endTimeSpanElement);
                        node.appendChild(programsMenuSpanElement);
                        var timelineContainerElement = document.createElement("div");
                        timelineContainerElement.setAttribute("class", "timeline-container");
                        var timelineElement = document.createElement("div");
                        timelineElement.setAttribute("class", "timeline");
                        var divElement = document.createElement("div");
                        divElement.setAttribute("style", "width:" + (w - 8) + "%; float: left;");
                        timelineContainerElement.appendChild(timelineElement);
                        timelineContainerElement.appendChild(divElement);
                        node.appendChild(timelineContainerElement)
                    } else {
                        nameSpanElement.innerHTML += program.program_name;
                        programsMenuSpanElement.appendChild(nameSpanElement);
                        node.appendChild(programsMenuSpanElement)
                    }
                } else {
                    if (mode === "next") {
                        if (program.next_program_begin_time !== -1) {
                            var w = Helper.getProgressWidth(program.program_begin_time, program.program_end_time, App.data.getUtcTime());
                            if (program.next_program_genres) {
                                if (program.next_program_genres.length > 0 && program.next_program_genres[0]["genre_name"] !== -1) {
                                    var genreElement = document.createElement("span");
                                    genreElement.setAttribute("class", "program-genre");
                                    genreElement.innerHTML = program.next_program_genres[0]["genre_name"] + (App.settings.getStyleName() === "impuls_x" ? " " : ": ");
                                    nameSpanElement.appendChild(genreElement)
                                }
                            }
                            var beginTimeSpanElement = document.createElement("span");
                            beginTimeSpanElement.setAttribute("class", "begin-time");
                            beginTimeSpanElement.innerHTML = Helper.formatTime(Helper.withTimezone(program.next_program_begin_time));
                            nameSpanElement.appendChild(beginTimeSpanElement);
                            if (program.next_program_name) {
                                nameSpanElement.innerHTML += program.next_program_name
                            } else {
                                nameSpanElement.innerHTML += "---"
                            }
                            programsMenuSpanElement.appendChild(nameSpanElement);
                            var endTimeSpanElement = document.createElement("span");
                            endTimeSpanElement.setAttribute("class", "end-time");
                            endTimeSpanElement.innerHTML = App.lang.get("across") + " " + Helper.formatSeconds(program.next_program_begin_time - App.data.getUtcTime());
                            programsMenuSpanElement.appendChild(endTimeSpanElement);
                            node.appendChild(programsMenuSpanElement);
                            var timelineContainerElement = document.createElement("div");
                            timelineContainerElement.setAttribute("class", "timeline-container invert");
                            var timelineElement = document.createElement("div");
                            timelineElement.setAttribute("class", "timeline invert");
                            var divElement = document.createElement("div");
                            divElement.setAttribute("class", "invert");
                            divElement.setAttribute("style", "width:" + (w - 8) + "%; float: left;");
                            timelineContainerElement.appendChild(timelineElement);
                            timelineContainerElement.appendChild(divElement);
                            node.appendChild(timelineContainerElement)
                        } else {
                            nameSpanElement.innerHTML += program.next_program_name;
                            programsMenuSpanElement.appendChild(nameSpanElement);
                            node.appendChild(programsMenuSpanElement)
                        }
                    }
                }
            } else {
                return ""
            }
        },
        onItemClick: function (index) {
            that.key_enter()
        },
        onItemMouseOver: function (index) {
            if (focusedMenu === "epg-categories") {
                that.key_right()
            }
            var sourceItems = programsMenu.getCurrentPage() * programsMenu.getNumberOfDisplayItems() + index;
            programsMenu.setSelectedItem(index, sourceItems)
        },
        onItemMouseOut: function (index) {
            that.key_left()
        }
    });
    this.getTimeIntervalPrograms = function () {
        return timeIntervalPrograms
    };
    this.getProgramCategoryId = function () {
        return menuItems[epgcategoriesMenu.getSelectedSourceItem()]["id"]
    };
    this.isAnyLoading = function () {
        return Helper.hasClass("categorizedtv-screen-container", "loader")
    };
    this.hideLoader = function () {
        Helper.removeClass("categorizedtv-screen-container", "loader")
    };
    this.showLoader = function () {
        Helper.addClass("categorizedtv-screen-container", "loader")
    };
    this.onProgramCategoryClickFunction = function (index) {
        var sourceItems = epgcategoriesMenu.getCurrentPage() * epgcategoriesMenu.getNumberOfDisplayItems() + index;
        if (!that.isAnyLoading()) {
            epgcategoriesMenu.setSelectedItem(index, sourceItems);
            Helper.hideById("categorizedtv-empty-category");
            programCategoryListHelper.delayedCall(function () {
                that.switchCategory()
            }, updateChannelListDelay)
        }
    };
    this.refresh = function () {
        epgcategoriesMenu.redrawMenuItems();
        programsMenu.redrawMenuItems();
        this.refreshDisplayTime()
    };
    this.clearTimers = function () {
        clearInterval(timeIntervalPrograms);
        clearInterval(timeIntervalGenres);
        clearInterval(timeIntervalClock);
        timeIntervalClock = null;
        timeIntervalGenres = null;
        timeIntervalPrograms = null
    };
    this.createOptionsObject = function () {
        optionsObj = {};
        var id = this.getProgramCategoryId();
        if (id !== "all") {
            optionsObj = {
                category_id: id
            }
        }
        switch (mode) {
            default:
            case "now":
                Helper.setHtml("categorizedtv-header-title", App.lang.get("label-mainmenu-categorizedtv") + ": " + App.lang.get("categorizedtv-now"));
                Helper.setHtml("remote-categorizedtv-mode", App.lang.get("label-categorizedtv-mode-now"));
                Helper.setClass("remote-categorizedtv-mode", "label-categorizedtv-mode-now");
                optionsObj.next = 0;
                break;
            case "next":
                Helper.setHtml("categorizedtv-header-title", App.lang.get("label-mainmenu-categorizedtv") + ": " + App.lang.get("categorizedtv-next"));
                Helper.setHtml("remote-categorizedtv-mode", App.lang.get("label-categorizedtv-mode-next"));
                Helper.setClass("remote-categorizedtv-mode", "label-categorizedtv-mode-next");
                optionsObj.next = 1;
                break
        }
        optionsObj.icon_width = 40;
        optionsObj.icon_height = 40
    };
    this.show = function () {
        _CategorizedTVScreen.show();
        if (!timeIntervalClock) {
            this.refreshDisplayTime();
            timeIntervalClock = setInterval(that.refreshDisplayTime, 15000)
        }
        if (!timeIntervalPrograms) {
            timeIntervalPrograms = setInterval(function () {
                if (!that.isAnyLoading() && epgcategoriesMenu.getNumberOfSourceItems() > 0) {
                    var categoryId = that.getProgramCategoryId();
                    var programId = programsMenu.getSelectedDisplayItem();
                    var realProgramId = programsMenu.getSelectedSourceItem();
                    that.createOptionsObject();
                    App.data.requestProgramCategoryChannelList(optionsObj, function (error, interval) {
                        if (!that.isAnyLoading() && categoryId === that.getProgramCategoryId()) {
                            that.refreshPrograms();
                            programsMenu.setSelectedItem(programId, realProgramId);
                            App.popupGenresScreen.refreshEpgGenres(true)
                        }
                    })
                }
            }, 180000)
        }
        if (!timeIntervalGenres) {
            timeIntervalGenres = setInterval(function () {
                if (!that.isAnyLoading()) {
                    App.data.clearCheckedProgramGenreList();
                    App.data.clearFilteredProgramCategoryChannelList(that.getProgramCategoryId());
                    that.refreshPrograms()
                }
            }, 600000)
        }
        if (App.showHelpButtonPanelFlag && App.device.getAPIVersion() >= 109 && !App.settings.getReferenceShownFlag()) {
            App.popupMessageScreen.setMessageText(App.lang.get("key-panel-reference"));
            App.popupMessageScreen.setOnHideCallback(function () {
                App.settings.setReferenceShownFlag(true);
                App.settings.saveSettings();
                App.popupMessageScreen.setOnHideCallback(null)
            });
            App.display.showPopupScreen("popup-message")
        }
    };
    this.refreshDisplayTime = function () {
        var now = Helper.withTimezone(App.data.getUtcTime());
        var d = new Date(now * 1000);
        var date = ("0" + d.getDate()).substr(-2, 2) + " " + App.lang.get("month-" + d.getMonth()) + " " + d.getFullYear();
        var timeStr = ("0" + d.getHours()).substr(-2, 2) + ":" + ("0" + d.getMinutes()).substr(-2, 2);
        Helper.setHtml("categorizedtv-clock", date + " " + timeStr)
    };
    this.resize = function (displayWidth, displayHeight) {
        var c = 10;
        numberOfDisplayRows = c;
        var n = c;
        if (menuItems.length > 0 && menuItems.length < n) {
            n = menuItems.length
        }
        epgcategoriesMenu.setNumberOfRows(n);
        epgcategoriesMenu.setNumberOfDisplayItems(n);
        epgcategoriesMenu.setNumberOfSourceItems(menuItems.length);
        epgcategoriesMenu.setSelectedItem(-1, 0);
        epgcategoriesMenu.redrawMenuItems()
    };
    this.init = function () {
        _CategorizedTVScreen.init();
        Helper.hideById("categorizedtv-empty-screen");
        this.refreshGenresHeader();
        programsMenu.clear();
        that.initEpgCategoriesMenu();
        this.showLoader();
        App.data.requestProgramCategoryList({}, function (error) {
            menuItems = menuItems.concat(App.data.getProgramCategoryList());
            Helper.showById("categorizedtv-clock");
            if (menuItems.length === 0) {
                Helper.showById("categorizedtv-empty-screen");
                that.hideLoader()
            } else {
                var n = menuItems.length;
                if (n > numberOfDisplayRows) {
                    n = numberOfDisplayRows
                }
                epgcategoriesMenu.setNumberOfDisplayItems(n);
                epgcategoriesMenu.setSelectedItem(-1, 0);
                epgcategoriesMenu.setNumberOfSourceItems(menuItems.length);
                that.createOptionsObject();
                if (App.data.isCategoryDataExpired("all") || App.data.getProgramCategoryChannelList("all") == null) {
                    App.data.requestProgramCategoryChannelList({
                        icon_width: 40,
                        icon_height: 40
                    }, function (error, interval) {
                        epgcategoriesMenu.setSelectedItem(0, 0);
                        epgcategoriesMenu.redrawMenuItems();
                        that.refreshPrograms();
                        that.hideLoader()
                    })
                } else {
                    that.hideLoader();
                    that.refreshPrograms();
                    epgcategoriesMenu.setSelectedItem(0, 0)
                }
            }
        });
        this.setOnHideCallback(function () {
            App.popupGenresScreen.hide()
        });
        navigationMode = App.clientSettings.navigation_mode;
        if (navigationMode === "horizontal") {
            Helper.hideById("categorizedtv-epg-button")
        }
    };
    this.initEpgCategoriesMenu = function () {
        this.setFocusedMenu("epg-categories");
        epgcategoriesMenu.resetSelection();
        var s = "";
        for (var i = 0; i < numberOfDisplayRows; i++) {
            s += '<div id="categorizedtv-selector' + i + '"></div>'
        }
        Helper.setHtml("categorizedtv-selector", s);
        menuItems = [];
        epgcategoriesMenu.clear();
        menuItems[0] = {
            name: App.lang.get("all-channels"),
            id: "all"
        }
    };
    this.playSelectedChannel = function (skipParentalCodeCheck) {
        App.playerScreen.setParentScreen("categorizedtv");
        var selectedChannel = programsMenu.getSelectedSourceItem();
        var channel = programList[selectedChannel];
        App.player.playChannel(channel, skipParentalCodeCheck)
    };
    this.switchToNextChannel = function (previous) {
        if (!previous) {
            programsMenu.setNextItem()
        } else {
            programsMenu.setPreviousItem()
        }
        if (App.player.getState() === App.player.STATE_PLAYING && (App.player.getMode() === App.player.MODE_LIVETV || App.player.getMode() === App.player.MODE_PAUSE_LIVETV)) {
            this.playSelectedChannel()
        }
    };
    this.refreshPrograms = function () {
        programsMenu.clear();
        Helper.hideById("categorizedtv-empty-category");
        programList = App.data.getFilteredProgramCategoryChannelList(this.getProgramCategoryId());
        var n = programList ? programList.length : 0;
        if (n === 0) {
            Helper.showById("categorizedtv-empty-category");
            this.setFocusedMenu("epg-categories", "programs")
        } else {
            if (n > numberOfDisplayRows) {
                n = numberOfDisplayRows
            }
            programsMenu.setNumberOfDisplayItems(n);
            programsMenu.setNumberOfSourceItems(programList.length);
            programsMenu.setSelectedItem(0, 0);
            programsMenu.redrawMenuItems()
        }
        this.refreshGenresHeader()
    };
    this.setFocusedMenu = function (focused, lastFocused) {
        focusedMenu = focused;
        if (lastFocused) {
            Helper.removeClass(lastFocused + "-menu", "selected")
        }
        Helper.addClass(focused + "-menu", "selected")
    };
    this.refreshGenresHeader = function () {
        var s = "";
        var genres = App.data.getCheckedProgramGenreList();
        for (var i = 0; i < genres.length; i++) {
            if (genres[i]) {
                s += genres[i] + ", "
            }
        }
        if (s === "") {
            s = App.lang.get("genre-all")
        } else {
            s = s.slice(0, -2)
        }
        Helper.setHtml("categorizedtv-genres", Helper.cropString(s, 55, "..."))
    };
    this.switchCategory = function (force) {
        var categoryId = epgcategoriesMenu.getSelectedDisplayItem();
        var sourceCategoryId = epgcategoriesMenu.getSelectedSourceItem();
        var realCategoryId = this.getProgramCategoryId();
        that.createOptionsObject();
        programsMenu.clear();
        Helper.hideById("categorizedtv-empty-category");
        if (!App.data.getProgramCategoryChannelList(realCategoryId) || App.data.isCategoryDataExpired(realCategoryId) || force) {
            this.showLoader();
            App.data.requestProgramCategoryChannelList(optionsObj, function (error, interval) {
                if (error == 0) {
                    epgcategoriesMenu.setSelectedItem(categoryId, sourceCategoryId);
                    epgcategoriesMenu.redrawMenuItems();
                    that.refreshPrograms()
                }
                that.hideLoader();
                if (focusedMenu === "programs") {
                    programsMenu.setSelectedItem(0, 0)
                }
            })
        } else {
            App.data.filterChannelsByProgramGenre(realCategoryId);
            this.refreshPrograms();
            if (focusedMenu === "programs") {
                programsMenu.setSelectedItem(0, 0)
            }
        }
    };
    this.key_right = function () {
        if (focusedMenu === "epg-categories" && programsMenu.getNumberOfDisplayItems() > 0) {
            this.setFocusedMenu("programs", "epg-categories");
            programsMenu.setSelectedItem(0, 0);
            if (navigationMode === "horizontal") {
                Helper.hideById("categorizedtv-footer-left")
            }
        } else {
            if (navigationMode === "horizontal") {
                this.key_red()
            } else {
                programsMenu.setNextPage()
            }
        }
    };
    this.key_left = function () {
        if (focusedMenu === "programs") {
            this.setFocusedMenu("epg-categories", "programs");
            programsMenu.setSelectedItem(-1, 0);
            if (navigationMode === "horizontal") {
                Helper.showById("categorizedtv-footer-left")
            }
        } else {
            if (navigationMode === "horizontal") {
                this.key_menu()
            }
        }
    };
    this.key_down = function () {
        if (focusedMenu === "epg-categories" && !this.isAnyLoading()) {
            epgcategoriesMenu.setNextItem();
            programCategoryListHelper.delayedCall(function () {
                that.switchCategory()
            }, updateChannelListDelay)
        } else {
            programsMenu.setNextItem()
        }
    };
    this.key_up = function () {
        if (focusedMenu === "epg-categories" && !this.isAnyLoading()) {
            epgcategoriesMenu.setPreviousItem();
            programCategoryListHelper.delayedCall(function () {
                that.switchCategory()
            }, updateChannelListDelay)
        } else {
            programsMenu.setPreviousItem()
        }
    };
    this.key_enter = function () {
        var that = this;
        if (focusedMenu === "programs") {
            if (!mode || mode === "now") {
                this.playSelectedChannel()
            } else {
                if (mode === "next") {
                    App.popupMenuScreen.addListMenuItem(App.lang.get("play-channel"), function () {
                        that.playSelectedChannel();
                        App.popupMenuScreen.hide()
                    });
                    App.popupMenuScreen.addListMenuItem(App.lang.get("set-notification"), function () {
                        var selectedChannel = programsMenu.getSelectedSourceItem();
                        var channel = programList[selectedChannel];
                        if (channel) {
                            App.data.requestNotificationCreate({
                                pid: channel.next_program_id,
                                cid: channel.id,
                                timeshift_offset: channel.timeshift_offset
                            }, function (error) {
                                if (error == 0) {
                                    App.refreshNotifications(function () {
                                        App.popupMessageScreen.setMessageText(App.lang.get("success-create-notification-msg"));
                                        App.display.showPopupScreen("popup-message")
                                    })
                                }
                            })
                        }
                        App.popupMenuScreen.hide()
                    });
                    App.display.showPopupScreen("popup-menu")
                }
            }
        } else {
            this.key_right()
        }
    };
    this.key_back = function () {
        this.key_menu()
    };
    this.key_exit = function () {
        this.key_back()
    };
    this.key_menu = function () {
        App.display.showScreen("mainmenu")
    };
    this.key_red = function () {
        if (focusedMenu === "programs") {
            if (programsMenu.getNumberOfSourceItems() > 0) {
                App.epgScreen.setChannel(programList[programsMenu.getSelectedSourceItem()]);
                App.epgScreen.setParentScreen("categorizedtv");
                App.display.showScreen("epg")
            }
        }
    };
    this.key_green = function () {
        if (!this.isAnyLoading()) {
            var genres = [];
            var programs = App.data.getProgramCategoryChannelList(this.getProgramCategoryId());
            for (var i = 0; i < programs.length; i++) {
                for (var j = 0; j < programs[i]["program_genres"].length; j++) {
                    var genre = programs[i]["program_genres"][j];
                    var isContains = false;
                    for (var k = 0; k < genres.length; k++) {
                        if (genres[k]["id"] === genre.id) {
                            isContains = true;
                            break
                        }
                    }
                    if (!isContains) {
                        genres.push(genre)
                    }
                }
            }
            var checkedGenres = App.data.getCheckedProgramGenreList();
            for (i = 0; i < checkedGenres.length; i++) {
                if (checkedGenres[i]) {
                    var flag = false;
                    for (j = 0; j < genres.length; j++) {
                        if (genres[j]["name"] === checkedGenres[i]) {
                            flag = true;
                            break
                        }
                    }
                    if (!flag) {
                        App.data.checkProgramGenre(i)
                    }
                }
            }
            App.popupGenresScreen.setGenres(genres);
            App.display.showPopupScreen("popup-genres")
        }
    };
    this.key_yellow = function () {
        var that = this;
        App.popupMenuScreen.addListMenuItem(App.lang.get("show-now-categorizedtv"), function () {
            mode = "now";
            that.switchCategory(true);
            App.popupMenuScreen.hide()
        });
        App.popupMenuScreen.addListMenuItem(App.lang.get("show-next-categorizedtv"), function () {
            mode = "next";
            that.switchCategory(true);
            App.popupMenuScreen.hide()
        });
        switch (mode) {
            default:
            case "now":
                App.popupMenuScreen.setListMenuSelectedItem(0);
                break;
            case "next":
                App.popupMenuScreen.setListMenuSelectedItem(1);
                break
        }
        App.display.showPopupScreen("popup-menu")
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
                action: "menu",
                label: "label-menu"
            }, {
                action: "green",
                label: "label-choice-genre"
            }, {
                action: "yellow",
                label: "label-categorizedtv-mode-now"
            }, {
                action: "back",
                label: "label-back"
            }];
            if (mode === "next") {
                keys[3]["label"] = "label-categorizedtv-mode-next"
            }
            App.popupKeyPanelScreen.setKeysForPanel(keys);
            App.popupKeyPanelScreen.setParentScreen("categorizedtv");
            App.display.showPopupScreen("popup-key-panel")
        } else {
            this.key_enter()
        }
    }
}
_CategorizedTVScreen = new BaseScreen();
CategorizedTVScreen.prototype = _CategorizedTVScreen;