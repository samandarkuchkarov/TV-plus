App.device = Device;
App.display = new BaseDisplay();
App.display.addScreen(new BaseScreen(), "blank");
App.settings = new Settings();
App.lang = new Lang();
App.data = new BaseData();
App.player = new Player();
App.windyCast = new BaseWindyCast();
App.monitoring = new Monitoring();
App.mediascope = new Mediascope();
App.tvzavrStat = new TVZavrStat();
App.adStreamStat = new AdStreamStat();
App.hbbTv = new BaseHbbTv();
App.firstLoadingScreen = new FirstLoadingScreen();
App.playerScreen = new PlayerScreen();
App.loginScreen = new LoginScreen();
App.mainmenuScreen = new MainMenuScreen();
App.tvChannelsScreen = new TVChannelsScreen();
App.categorizedTVScreen = new CategorizedTVScreen();
App.notificationsScreen = new NotificationsScreen();
App.epgScreen = new EPGScreen();
App.settingsScreen = new SettingsScreen();
App.accountScreen = new AccountScreen();
App.balanceScreen = new BalanceScreen();
App.paymentScreen = new PaymentScreen();
App.historyOfPaymentsScreen = new HistoryOfPaymentsScreen();
App.infoScreen = new InfoScreen();
App.serviceInfoScreen = new ServiceInfoScreen();
App.legalDocumentScreen = new LegalDocumentScreen();
App.videoCatalogScreen = new VideoCatalogScreen();
App.videoScreen = new VideoScreen();
App.radioScreen = new RadioScreen();
App.popupMessageScreen = new PopupMessageScreen();
App.popupGenresScreen = new PopupGenresScreen();
App.popupParentCodeScreen = new PopupParentCodeScreen();
App.popupPromoScreen = new PopupPromoScreen();
App.popupListScreen = new PopupListScreen();
App.popupKeyPanelScreen = new PopupKeyPanelScreen();
App.popupInactiveScreen = new PopupInactiveScreen();
App.popupInactivePVRScreen = new PopupInactivePVRScreen();
App.popupMenuScreen = new PopupMenuScreen();
App.keyboardScreen = new KeyboardScreen();
App.gamesScreen = new GamesScreen();
App.gamesRecordsScreen = new GamesRecordsScreen();
App.battleCityScreen = new BattleCityScreen();
App.signupScreen = new SignupScreen();
App.appsScreen = new AppsScreen();
App.sortScreen = new SortScreen();
App.promoActivationScreen = new PromoActivationScreen();
App.resizeTimeout = null;
App.notificationTimer = null;
App.notificationsQueue = [];
App.notificationsQueue.shown = [];
App.sortScreenUpDownStickyKeyPreventDelay = 100;
App.standByTimer = null;
App.standByTimeOut = 0;
App.standByInactiveTime = 60;
App.standByPVRTimer = 0;
App.standByPVRTimeout = null;
App.standByPVRInactiveTime = 120;
App.clientLogo = "";
App.showHelpButtonPanelFlag = false;
App.switchStandBy = function (timer) {
    if (timer) {
        this.device.setStandByMode(function () {
            App.clearStandByPVRTimeout();
            App.popupInactivePVRScreen.hide();
            App.player.setOnStopCallback(null);
            App.player.stop();
            App.display.showScreen("mainmenu")
        })
    } else {
        this.device.switchStandBy(function () {
            App.clearStandByPVRTimeout();
            App.popupInactivePVRScreen.hide();
            App.player.stop()
        }, function () {
            App.display.showScreen("mainmenu");
            App.mainmenuScreen.resetMenuSelection()
        })
    }
};
App.handleStandByTimeout = function () {
    clearTimeout(this.standByTimer);
    this.popupInactiveScreen.hide();
    this.standByTimer = setTimeout(function () {
        App.popupInactiveScreen.setCallback(function () {
            App.switchStandBy(true)
        });
        App.popupInactiveScreen.setMessageText(App.lang.get("inactive-warning-message"), App.lang.get("inactive-message"));
        App.popupInactiveScreen.setInactiveTime(App.standByInactiveTime);
        App.display.showPopupScreen("popup-inactive")
    }, this.standByTimeOut)
};
App.handleStandByPVRTimeout = function (keyCode) {
    switch (App.player.getMode()) {
        case App.player.MODE_TVARCHIVE:
        case App.player.MODE_PAUSE_LIVETV:
            if (App.standByPVRTimer > 0) {
                if (App.popupInactivePVRScreen.isVisible() && keyCode && keyCode !== "enter") {
                    return
                }
                clearTimeout(App.standByPVRTimeout);
                App.standByPVRTimeout = setTimeout(function () {
                    App.popupInactivePVRScreen.setCallback(function () {
                        var channel = App.player.getChannel();
                        App.player.setOnStopCallback(null);
                        App.player.stop();
                        App.player.playChannel(channel, true, false);
                        App.tvChannelsScreen.showTextBar(App.lang.get("live-mode-msg"))
                    });
                    App.popupInactivePVRScreen.setMessageText(App.lang.get("inactive-pvr-warning-message"), App.lang.get("inactive-pvr-message"));
                    App.popupInactivePVRScreen.setInactiveTime(App.standByPVRInactiveTime);
                    App.display.showPopupScreen("popup-inactive-pvr")
                }, App.standByPVRTimer)
            }
            break;
        default:
            App.clearStandByPVRTimeout();
            break
    }
};
App.clearStandByPVRTimeout = function () {
    if (App.standByPVRTimeout) {
        clearTimeout(App.standByPVRTimeout)
    }
};
App.setInfoScreenValues = function () {
    App.infoScreen.setDeviceSerial(App.device.getSerialNumber());
    App.infoScreen.setDeviceModel(App.device.getDeviceModel());
    App.infoScreen.setFirmware(App.device.getFirmwareVersion());
    App.infoScreen.setMacAddress(App.device.getMacAddress())
};
App.logout = function () {
    App.resetAccountTemplate();
    App.settings.setClientId(-1);
    App.settings.setPassword("");
    App.settings.saveSettings();
    App.data.reset();
    App.display.reset();
    App.player.stop();
    App.clientSettings.auth_mode = "password";
    App.display.cleanHistory();
    App.display.showScreen("login")
};
App.checkNotifications = function () {
    var timeBeforeNotification = App.settings.getNotificationTimeValue();
    var count = App.data.getNumberOfNotifications();
    var shown = false;
    var nearestNotificationTime = 0;
    var nextNearestNotificationTime = 0;
    this.notificationsQueue.queue = [];
    for (var i = 0; i < count; i++) {
        var notification = App.data.getNotification(i);
        var beginTime = notification.program_begin_time + notification.timeshift_offset * 3600;
        if (beginTime > App.data.getUtcTime() && (beginTime < nearestNotificationTime || nearestNotificationTime === 0)) {
            nearestNotificationTime = beginTime
        }
        var diff = beginTime - App.data.getUtcTime();
        if (diff > 0 && diff <= timeBeforeNotification) {
            if (this.notificationsQueue.shown.indexOf(notification) === -1) {
                this.notificationsQueue.queue.push(notification)
            }
            if (!shown && this.notificationsQueue.shown.indexOf(notification) === -1) {
                var channel = App.searchChannelInfo(notification);
                App.setNotificationPopupInfo(notification, diff, channel);
                shown = true
            }
        } else {
            if (diff > timeBeforeNotification && nextNearestNotificationTime === 0) {
                nextNearestNotificationTime = beginTime
            }
        }
    }
    var timeout = 0;
    if (nextNearestNotificationTime > 0) {
        var qCount = App.notificationsQueue.queue.length;
        var lastShownNotification = App.data.getUtcTime();
        if (qCount > 0) {
            var n = App.notificationsQueue.queue[qCount - 1];
            lastShownNotification = n.program_begin_time + n.timeshift_offset * 3600
        }
        timeout = nextNearestNotificationTime - lastShownNotification;
        if (timeout > timeBeforeNotification) {
            timeout = timeout - timeBeforeNotification
        } else {
            if (timeout < timeBeforeNotification) {
                timeout = nextNearestNotificationTime - App.data.getUtcTime() - timeBeforeNotification
            }
        }
    } else {
        timeout = 300
    }
    this.notificationTimer = setTimeout(function () {
        App.checkNotifications()
    }, timeout * 1000)
};
App.searchChannelInfo = function (notification) {
    var channel = null;
    var number = App.data.getProgramCategoryChannelNumberById(notification.id);
    if (number >= 0) {
        var index = App.data.getProgramCategoryChannelIndexByNumber(number);
        if (index >= 0) {
            channel = App.data.getProgramCategoryChannel("all", index)
        }
    } else {
        channel = App.data.getChannelById(notification.id, true)
    }
    return channel
};
App.setNotificationPopupInfo = function (notification, diff, channel) {
    if (App.player.getMode() === App.player.MODE_LIVETV && App.player.getState() === App.player.STATE_PLAYING && App.player.getPlayingItemId() === channel.id) {
        return
    }
    var s = "";
    if (Math.round(diff / 60) > 4) {
        s = App.lang.get("notification-message-part-per") + Math.round(diff / 60) + App.lang.get("label-minutes")
    } else {
        s = App.lang.get("label-now")
    }
    App.notificationsQueue.shown.push(notification.program_id);
    App.notificationsQueue.current = {
        channel: channel,
        notification: notification
    };
    App.popupMessageScreen.setMessageText(s + App.lang.get("notification-message-part-program") + '"' + notification.program_name + '"' + App.lang.get("notification-message-part-channel") + notification.name + App.lang.get("notification-message-part-ok"), App.popupMessageScreen.MODE_CHOICE);
    App.popupMessageScreen.setCallback(function (value) {
        var c = App.notificationsQueue.current["channel"];
        var n = App.notificationsQueue.current["notification"];
        if (value) {
            if (c) {
                App.player.playChannel(c)
            } else {
                App.data.requestChannelList({}, function (error, interval) {
                    App.player.playChannel(App.data.getChannelById(n.id, true))
                })
            }
        }
        App.notificationsQueue.current = {};
        App.popupMessageScreen.hide();
        App.notificationsQueue.queue.shift();
        if (App.notificationsQueue.queue.length > 0) {
            var notification = App.notificationsQueue.queue[0];
            var diff = notification.program_begin_time + notification.timeshift_offset * 3600 - App.data.getUtcTime();
            var channel = App.searchChannelInfo(notification);
            App.setNotificationPopupInfo(notification, diff, channel)
        }
    });
    App.display.showPopupScreen("popup-message")
};
App.refreshNotifications = function (callback) {
    App.data.requestNotificationList({}, function (error) {
        if (error == 0) {
            if (callback instanceof Function) {
                callback()
            }
        } else {}
    })
};
App.checkOnAdStreamMovieEvents = function (eventType) {
    var adMovieIndex = Math.abs(App.device.playlist.length - App.data.getNumberOfAdMovieList() - 1);
    var adBlock = App.data.getAd(App.data.getAdIndexByAdMovieListIndex(adMovieIndex));
    if (adBlock && adBlock.provider === 1) {
        switch (eventType) {
            case "start":
                App.adStreamStat.sendStartEvent(adBlock, adMovieIndex);
                break;
            case "end":
                App.adStreamStat.sendEndEvent(adBlock, adMovieIndex);
                break
        }
    }
};