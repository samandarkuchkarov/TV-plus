function alert(s) {
    Logger.log(s)
}
window.onload = function () {
    App.fireEvent(App.EVENT_ON_APP_INIT_BEGIN);
    if (App.clientSettings.system_debug) {
        Logger.enable();
        Logger.show()
    }
    alert("load UI");
    Device.initDevice("../../../", function (deviceKind) {
        App.fireEvent(App.EVENT_ON_DEVICE_INIT_BEGIN);
        try {
            App.device = Device;
            if (App.device.getDeviceKind() === "samsung_smart_tv") {
                samsungOnShow()
            }
            alert("device type = " + App.device.getDeviceType());
            alert("model = " + App.device.getDeviceModel());
            alert("firmware = " + App.device.getFirmwareVersion());
            alert("mac addr = " + App.device.getMacAddress());
            alert("s/n = " + App.device.getSerialNumber() + ", release year = " + App.device.getDeviceReleaseYear());
            App.windyCast.onRequestRemoteAccess = function (id, initiator) {
                App.popupMessageScreen.setMessageText('Устройство  "' + initiator + '" запрашивает удаленный доступ.<br>Вы разрешаете создание пары для управления?', App.popupMessageScreen.MODE_CHOICE);
                App.popupMessageScreen.setCallback(function (confirm) {
                    if (confirm) {
                        App.windyCast.allowRemoteAccess(id, initiator)
                    } else {
                        App.windyCast.disallowRemoteAccess(id, initiator)
                    }
                });
                App.display.showPopupScreen("popup-message")
            };
            App.windyCast.onPlayShifting = function (id, initiator, contentType, contentId, streamUrl, position) {
                switch (contentType) {
                    case "tv":
                        var channel = App.data.getChannelById(contentId);
                        if (channel) {
                            App.player.playChannel(channel)
                        } else {
                            App.data.requestChannelList({}, function (error, interval) {
                                channel = App.data.getChannelById(contentId, true);
                                App.player.playChannel(channel)
                            })
                        }
                        break
                }
            };
            App.device.onStreamEnd = function () {
                if (App.player.getMode() === App.player.MODE_VIDEO) {
                    App.videoScreen.isVideoEnd();
                    App.player.stop()
                } else {
                    if (this.playTimeout) {
                        clearTimeout(this.playTimeout)
                    }
                    this.playTimeout = setTimeout(function () {
                        App.player.requestActualStreamUrl()
                    }, 1000)
                }
            };
            App.device.onStreamEndOfPlaylistItem = function () {
                if (App.data.getNumberOfAdMovieList() > 0 && App.device.playlist.length > 1) {
                    App.checkOnAdStreamMovieEvents("end")
                }
            };
            App.device.onStreamInfoReady = function () {
                if (App.popupMessageScreen.isVisible()) {
                    App.popupMessageScreen.hide()
                }
                if (App.data.getNumberOfAdMovieList() > 0 && App.device.playlist.length > 1) {
                    App.checkOnAdStreamMovieEvents("start")
                }
                App.player.onStreamInfoReady()
            };
            App.device.onPlayerTimeUpdate = function () {
                App.player.onPlayerTimeUpdate()
            };
            App.device.onStreamPlayingBegin = function () {
                this.playRetryCount = 0;
                if (this.playTimeout) {
                    clearTimeout(this.playTimeout)
                }
                App.player.onBufferingComplete()
            };
            App.device.onStreamError = function (errorMessage) {
                if (!this.getNetworkLinkStatus()) {
                    if (App.device.getDeviceKind() !== "samsung_smart_tv") {
                        App.playerScreen.hideLoadingBar();
                        App.popupMessageScreen.setMessageText(App.lang.get("network-disconnection-msg"));
                        App.display.showPopupScreen("popup-message")
                    }
                } else {
                    this.playRetryCount = 0
                }
                if (!this.playRetryCount) {
                    this.playRetryCount = 0
                }
                this.playRetryCount++;
                var timeoutTime = 5000 * this.playRetryCount;
                if ((App.player.getMode() === App.player.MODE_TVARCHIVE || App.player.getMode() === App.player.MODE_PAUSE_LIVETV) && this.playRetryCount < 3) {
                    timeoutTime = 3000 * this.playRetryCount
                }
                if (this.playRetryCount > 4) {
                    timeoutTime = 30000
                }
                if (this.playTimeout) {
                    clearTimeout(this.playTimeout)
                }
                this.playTimeout = setTimeout(function () {
                    if ((App.player.getMode() === App.player.MODE_TVARCHIVE || App.player.getMode() === App.player.MODE_PAUSE_LIVETV) && App.device.playRetryCount >= 3) {
                        App.player.setMode(App.player.MODE_LIVETV);
                        App.player.setChannel(null);
                        App.player.requestActualStreamUrl(true)
                    } else {
                        App.player.requestActualStreamUrl()
                    }
                }, timeoutTime);
                if (errorMessage) {
                    Device.onEvent(errorMessage)
                }
            };
            App.device.onCurrentPlayTime = function () {
                App.player.refreshTime()
            };
            App.device.onBufferingStart = function () {
                App.player.onBufferingStart()
            };
            App.device.onBufferingComplete = App.device.onStreamPlayingBegin;
            App.device.onConnectionFailed = function () {
                App.popupMessageScreen.setMessageText(App.lang.get("connection-failed-msg"));
                App.display.showPopupScreen("popup-message");
                App.device.onStreamError()
            };
            App.device.onAuthenticationFailed = function () {
                App.player.stop();
                App.popupMessageScreen.setMessageText(App.lang.get("authentication-failed-msg"));
                App.popupMessageScreen.setOnHideCallback(function () {
                    switch (App.player.getMode()) {
                        default:
                            App.display.showScreen("mainmenu");
                            break;
                        case App.player.MODE_LIVETV:
                        case App.player.MODE_PAUSE_LIVETV:
                            App.display.showScreen("tvchannels");
                            break;
                        case App.player.MODE_TVARCHIVE:
                            App.display.showScreen("epg");
                            break;
                        case App.player.MODE_VIDEO:
                            App.display.showScreen("video");
                            break;
                        case App.player.MODE_RADIO:
                            App.display.showScreen("radio");
                            break
                    }
                });
                App.display.showPopupScreen("popup-message")
            };
            App.device.onStreamNotFound = function () {
                App.player.stop();
                App.popupMessageScreen.setMessageText(App.lang.get("stream-not-found-msg"));
                App.popupMessageScreen.setOnHideCallback(function () {
                    switch (App.player.getMode()) {
                        default:
                            App.display.showScreen("mainmenu");
                            break;
                        case App.player.MODE_LIVETV:
                        case App.player.MODE_PAUSE_LIVETV:
                            App.display.showScreen("tvchannels");
                            break;
                        case App.player.MODE_TVARCHIVE:
                            App.display.showScreen("epg");
                            break;
                        case App.player.MODE_VIDEO:
                            App.display.showScreen("video");
                            break;
                        case App.player.MODE_RADIO:
                            App.display.showScreen("radio");
                            break
                    }
                });
                App.display.showPopupScreen("popup-message")
            };
            App.device.onNetworkDisconnected = function (noTryReconnect) {
                App.popupMessageScreen.setMessageText(App.lang.get("network-disconnection-msg"));
                App.display.showPopupScreen("popup-message");
                App.popupListScreen.hide();
                if (App.player.getState() === App.player.STATE_PAUSED) {
                    App.player.setOnStreamInfoReadyCallback(function () {
                        App.player.pause()
                    })
                }
                if (!noTryReconnect) {
                    App.device.onStreamError()
                } else {
                    App.player.stopLocalCurrentTimeInterval()
                }
            };
            App.device.onNetworkConnected = function () {
                App.popupMessageScreen.hide();
                if (App.player.isActive()) {
                    App.player.restore()
                }
            };
            App.device.onFoldApp = function () {
                App.popupMessageScreen.hide();
                App.player.suspend();
                App.hbbTv.fold()
            };
            App.device.onUnfoldApp = function () {
                App.popupMessageScreen.hide();
                App.data.refreshUtcTime();
                if (App.player.isActive()) {
                    App.player.restore();
                    App.hbbTv.unfold();
                    App.playerScreen.restartRefreshInfoTimer();
                    if (App.tvChannelsScreen.getInited()) {
                        App.tvChannelsScreen.init()
                    }
                    if (App.categorizedTVScreen.getInited()) {
                        App.categorizedTVScreen.clearTimers();
                        App.categorizedTVScreen.init()
                    }
                }
            };
            App.device.onChangePlayerSize = function () {
                App.tvChannelsScreen.key_info()
            };
            App.device.onEvent = function (eventCode) {
                alert("event = " + eventCode)
            };
            App.device.onRenderError = function (code) {
                var errorStr = "";
                switch (parseInt(code)) {
                    case 1:
                        errorStr = "Unsupported container";
                        break;
                    case 2:
                        errorStr = "Unsupported video codec";
                        break;
                    case 3:
                        errorStr = "Unsupported audio codec";
                        break;
                    case 4:
                        errorStr = "Unsupported video resolution";
                        break;
                    case 5:
                        errorStr = "Unsupported net protocol";
                        break;
                    default:
                        errorStr = "Unknown render error";
                        break
                }
                if (App.device.getDeviceKind() !== "samsung_smart_tv") {
                    App.player.stop();
                    App.popupMessageScreen.setMessageText(App.lang.get("render-error-msg") + "<br /><br /><center>" + errorStr + "</center>");
                    App.popupMessageScreen.setOnHideCallback(function () {
                        switch (App.player.getMode()) {
                            default:
                                App.display.showScreen("mainmenu");
                                break;
                            case App.player.MODE_LIVETV:
                            case App.player.MODE_PAUSE_LIVETV:
                                App.display.showScreen("tvchannels");
                                break;
                            case App.player.MODE_TVARCHIVE:
                                App.display.showScreen("epg");
                                break;
                            case App.player.MODE_VIDEO:
                                App.display.showScreen("video");
                                break;
                            case App.player.MODE_RADIO:
                                App.display.showScreen("radio");
                                break
                        }
                    });
                    App.display.showPopupScreen("popup-message")
                }
            };
            App.hbbTv.onHbbError = function (error) {
                switch (error) {
                    case 1:
                        App.popupMessageScreen.setMessageText(App.lang.get("hbb-load-error-msg"));
                        break;
                    case 2:
                    default:
                        App.popupMessageScreen.setMessageText(App.lang.get("hbb-error-msg"))
                }
                App.display.showPopupScreen("popup-message")
            };
            App.device.onEvent = function (eventCode) {
                alert("event = " + eventCode)
            };
            App.display.setAutoSize();
            App.display.addScreen(App.firstLoadingScreen, "firstloading");
            App.firstLoadingScreen.setId("firstloading-screen");
            App.display.showScreen("firstloading");
            App.device.init();
            App.device.initPlayer();
            App.device.initDisplay();
            App.settings.loadSettings();
            if (App.clientSettings.site_url) {
                var clientSiteList = Helper.byClass("client-site");
                for (var i = 0; i < clientSiteList.length; i++) {
                    Helper.setHtmlForObject(clientSiteList[i], App.clientSettings.site_url)
                }
            }
            if (App.clientSettings.support_info) {
                var clientSupportList = Helper.byClass("client-support");
                for (var i = 0; i < clientSupportList.length; i++) {
                    Helper.setHtmlForObject(clientSupportList[i], App.clientSettings.support_info)
                }
            }
            App.showHelpButtonPanelFlag = App.clientSettings.show_help_button_panel && App.device.getDeviceKind() === "android_stb";
            App.setInfoScreenValues();
            App.device.setOnDeviceInfoLoadedCallback(function () {
                if (App.clientSettings.windy_url) {
                    App.windyCast.connect()
                }
                App.setInfoScreenValues();
                var model = Device.getDeviceModel().toLowerCase();
                if (!Helper.hasBodyClass(model)) {
                    Helper.addBodyClass(model)
                }
            });
            App.device.setWindowTransparencyLevel(200);
            App.device.setPlayerZIndexForResizeSupport(false);
            document.body.focus();
            App.display.setWidth(window.innerWidth);
            App.display.setHeight(window.innerHeight);
            if (App.clientSettings.navigation_mode !== "normal") {
                Helper.addBodyClass(App.clientSettings.navigation_mode)
            }
            App.playerScreen.setId("player-screen");
            App.loginScreen.setId("login-screen");
            App.mainmenuScreen.setId("mainmenu-screen");
            App.tvChannelsScreen.setId("tvchannels-screen");
            App.categorizedTVScreen.setId("categorizedtv-screen");
            App.notificationsScreen.setId("notifications-screen");
            App.epgScreen.setId("epg-screen");
            App.settingsScreen.setId("settings-screen");
            App.sortScreen.setId("sort-screen");
            App.accountScreen.setId("account-screen");
            App.gamesScreen.setId("games-screen");
            App.gamesRecordsScreen.setId("games-records-screen");
            App.balanceScreen.setId("balance-screen");
            App.paymentScreen.setId("payment-screen");
            App.infoScreen.setId("info-screen");
            App.serviceInfoScreen.setId("service-info-screen");
            App.legalDocumentScreen.setId("legal-document-screen");
            App.videoCatalogScreen.setId("videocatalog-screen");
            App.videoScreen.setId("video-screen");
            App.popupMessageScreen.setId("popup-message-screen");
            App.popupListScreen.setId("popup-list-screen");
            App.popupKeyPanelScreen.setId("popup-key-panel-screen");
            App.popupInactiveScreen.setId("popup-inactive-screen");
            App.popupInactivePVRScreen.setId("popup-inactive-pvr-screen");
            App.popupMenuScreen.setId("popup-menu-screen");
            App.popupGenresScreen.setId("popup-genres-screen");
            App.popupParentCodeScreen.setId("popup-parent-code-screen");
            App.popupPromoScreen.setId("popup-promo-screen");
            App.keyboardScreen.setId("popup-keyboard-screen");
            App.signupScreen.setId("signup-screen");
            App.appsScreen.setId("apps-screen");
            App.radioScreen.setId("radio-screen");
            App.promoActivationScreen.setId("promo-activation-screen");
            App.display.addPopupScreen(App.popupMessageScreen, "popup-message");
            App.display.addPopupScreen(App.popupGenresScreen, "popup-genres");
            App.display.addPopupScreen(App.popupParentCodeScreen, "popup-parent-code-screen");
            App.display.addPopupScreen(App.popupPromoScreen, "popup-promo-screen");
            App.display.addPopupScreen(App.popupListScreen, "popup-list");
            App.display.addPopupScreen(App.popupInactiveScreen, "popup-inactive");
            App.display.addPopupScreen(App.popupInactivePVRScreen, "popup-inactive-pvr");
            App.display.addPopupScreen(App.popupMenuScreen, "popup-menu");
            App.display.addPopupScreen(App.popupKeyPanelScreen, "popup-key-panel");
            App.display.addPopupScreen(App.keyboardScreen, "keyboard");

            function loadPortalEnvironmentAndLogin() {
                App.data.requestPortalSettingsList({}, function (error, settings) {
                    if (settings.has_child_clients > 0) {
                        if (App.settings.getClientId() > 0) {
                            App.data.setClientId(App.settings.getClientId());
                            App.data.setApiKey(App.settings.getApiKey());
                            App.data.setApiUrl(App.settings.getApiUrl());
                            loadPortalEnvironmentAndLogin()
                        } else {
                            App.data.requestPortalClientList({}, function (error) {
                                App.firstLoadingScreen.hide();
                                App.popupMenuScreen.setOnHideCallback(function () {
                                    loadPortalEnvironmentAndLogin()
                                });
                                var nl = App.data.getNumberOfClients();
                                for (var i = 0; i < nl; i++) {
                                    var client = App.data.getClient(i);
                                    App.popupMenuScreen.addListMenuItem(client.name, function (sourceItemIndex) {
                                        var c = App.data.getClient(sourceItemIndex);
                                        if (c.redirect_to_portal_url && c.redirect_to_portal_url.indexOf("http") >= 0 && App.device.getDeviceKind() !== "tizen_tv") {
                                            location.href = c.redirect_to_portal_url;
                                            return
                                        }
                                        App.data.setClientId(c.id);
                                        App.data.setApiKey(c.api_key);
                                        App.data.setApiUrl(c.api_url);
                                        loadPortalEnvironmentAndLogin();
                                        App.popupMenuScreen.setOnHideCallback(null);
                                        App.popupMenuScreen.hide()
                                    })
                                }
                                App.display.showPopupScreen("popup-menu")
                            })
                        }
                        return
                    }
                    if (error == 0) {
                        App.settings.refreshStylesArray();
                        if (settings.standby_timer > 0) {
                            App.standByTimeOut = settings.standby_timer * 1000 * 60;
                            alert("stand by timeout " + App.standByTimeOut);
                            if (App.standByTimeOut >= App.standByInactiveTime * 1000) {
                                App.standByTimeOut -= App.standByInactiveTime * 1000;
                                App.handleStandByTimeout()
                            }
                        }
                        if (settings.pvr_standby_timer > 0) {
                            App.standByPVRTimer = Helper.toInt(settings.pvr_standby_timer) * 1000 * 60
                        }
                        if (settings.template) {
                            if (App.clientSettings.client_id !== App.data.getClientId()) {
                                App.settings.setClientId(App.data.getClientId());
                                App.settings.setApiKey(App.data.getApiKey());
                                App.settings.setApiUrl(App.data.getApiUrl());
                                App.settings.saveSettings()
                            }
                            if (App.detectAndReloadTemplate(settings.template)) {
                                return
                            }
                        }
                        Helper.preloadImg(["media/img/main/appsmenu-android-icon.png", "media/img/main/appsmenu-default-icon.png", "media/img/main/appsmenu-youtube-icon.png", "media/img/main/archive-clock-icon.png", "media/img/main/blue-bg-opacity-90.png", "media/img/main/epg-age-limit-icon.png", "media/img/main/epg-rating-icon.png", "media/img/main/epg-record-icon.png", "media/img/main/games-battlecity-icon.png", "media/img/main/genre-check-icon.png", "media/img/main/has-notification-icon.png", "media/img/main/keyboard-button-left.png", "media/img/main/keyboard-button-right.png", "media/img/main/key-panel-reference.png", "media/img/main/loader.gif", "media/img/main/mainmenu-apps-icon.png", "media/img/main/mainmenu-balance-icon.png", "media/img/main/mainmenu-categorizedtv-icon.png", "media/img/main/mainmenu-exit-icon.png", "media/img/main/mainmenu-games-icon.png", "media/img/main/mainmenu-info-icon.png", "media/img/main/mainmenu-notification-icon.png", "media/img/main/mainmenu-payment-icon.png", "media/img/main/mainmenu-radio-icon.png", "media/img/main/mainmenu-right-bg.png", "media/img/main/mainmenu-settings-icon.png", "media/img/main/mainmenu-tvchannels-icon.png", "media/img/main/mainmenu-videocatalog-icon.png", "media/img/main/navigation-left.png", "media/img/main/navigation-right.png", "media/img/main/operator-logo-big.png", "media/img/main/panel-key-icon.png", "media/img/main/pause-fullscreen-icon.png", "media/img/main/player-mode-icon.png", "media/img/main/remote-button-back.png", "media/img/main/remote-button-ch-plus-minus.png", "media/img/main/remote-button-down.png", "media/img/main/remote-button-enter.png", "media/img/main/remote-button-fwd.png", "media/img/main/remote-button-info.png", "media/img/main/remote-button-left.png", "media/img/main/remote-button-menu.png", "media/img/main/remote-button-pause.png", "media/img/main/remote-button-rew.png", "media/img/main/remote-button-right.png", "media/img/main/remote-button-soundtrack.png", "media/img/main/remote-button-stop.png", "media/img/main/remote-button-tools.png", "media/img/main/remote-button-up.png", "media/img/main/screen-bg.png", "media/img/main/screen-bg-empty.png", "media/img/main/screen-bg-scaled-player.png", "media/img/main/sort-channels-menu-down-icon.png", "media/img/main/sort-channels-menu-hide-icon.png", "media/img/main/sort-channels-menu-hide-icon-enabled.png", "media/img/main/sort-channels-menu-parent-icon.png", "media/img/main/sort-channels-menu-parent-icon-enabled.png", "media/img/main/sort-channels-menu-up-icon.png", "media/img/main/tariffs-nav-down-arrow.png", "media/img/main/tariffs-nav-right-arrow.png", "media/img/main/video-clock-icon.png", "media/img/main/visa-mastercard-icon.png", "media/img/main/volume-fullscreen-icon.png", "media/img/main/white-bg-opacity-15.png", "media/img/main/white-bg-opacity-40.png", "media/img/main/white-bg-opacity-50.png", "media/img/black-bg-opacity-70.png", "media/img/black-bg-opacity-85.png", "media/img/blank.png", "media/img/gray-bg-opacity-60.png", "media/img/impuls-x/card-form-bg.png", "media/img/impuls-x/clock-icon.png", "media/img/impuls-x/epg-record-icon.png", "media/img/impuls-x/keyboard-button-left.png", "media/img/impuls-x/keyboard-button-right.png", "media/img/impuls-x/list-arrow-left.png", "media/img/impuls-x/list-arrow-right.png", "media/img/impuls-x/mainmenu-apps-icon.png", "media/img/impuls-x/mainmenu-categorizedtv-icon.png", "media/img/impuls-x/mainmenu-exit-icon.png", "media/img/impuls-x/mainmenu-games-icon.png", "media/img/impuls-x/mainmenu-info-icon.png", "media/img/impuls-x/mainmenu-settings-icon.png", "media/img/impuls-x/mainmenu-speedtest-icon.png", "media/img/impuls-x/mainmenu-tvchannels-icon.png", "media/img/impuls-x/mainmenu-videocatalog-icon.png", "media/img/impuls-x/navigation-left.png", "media/img/impuls-x/navigation-right.png", "media/img/impuls-x/panel-key-icon.png", "media/img/impuls-x/pause-fullscreen-icon.png", "media/img/impuls-x/player-mode-icon.png", "media/img/impuls-x/remote-button-back.png", "media/img/impuls-x/remote-button-down.png", "media/img/impuls-x/remote-button-enter.png", "media/img/impuls-x/remote-button-fwd.png", "media/img/impuls-x/remote-button-info.png", "media/img/impuls-x/remote-button-left.png", "media/img/impuls-x/remote-button-menu.png", "media/img/impuls-x/remote-button-pause.png", "media/img/impuls-x/remote-button-rew.png", "media/img/impuls-x/remote-button-right.png", "media/img/impuls-x/remote-button-stop.png", "media/img/impuls-x/remote-button-up.png", "media/img/impuls-x/screen-bg-scaled-player.png", "media/img/impuls-x/screen-bg.png", "media/img/impuls-x/scroll-arrow-down.png", "media/img/impuls-x/scroll-arrow-up.png", "media/img/impuls-x/sort-down-icon.png", "media/img/impuls-x/sort-hide-icon.png", "media/img/impuls-x/sort-parent-icon.png", "media/img/impuls-x/sort-up-icon.png", "media/img/impuls-x/transparent-popup-bg.png", "media/img/impuls-x/tvarchive-clock-icon.png", "media/img/impuls-x/video-clock-icon.png", "media/img/impuls-x/volume-fullscreen-icon.png"]);
                        App.data.requestChannelIconList({}, function (error) {
                            for (var i = 0; i < App.data.getNumberOfChannelIcons(); i++) {
                                Helper.preloadImg([App.data.getChannelIcon(i)["icon"]])
                            }
                        });
                        if (settings.client_logo_url) {
                            App.clientLogo = settings.client_logo_url;
                            var elements = Helper.byClass("client-logo");
                            for (var i = 0; i < elements.length; i++) {
                                elements[i].src = settings.client_logo_url
                            }
                        }
                        if (settings.custom_css_url) {
                            Helper.addCSSTag(settings.custom_css_url, function () {})
                        }
                        if (settings.login_text) {
                            Helper.setHtml("custom-login-text", settings.login_text);
                            Helper.addClass("login-screen", "with-text")
                        }
                        App.display.addScreen(App.playerScreen, "player");
                        App.display.addScreen(App.loginScreen, "login");
                        App.display.addScreen(App.mainmenuScreen, "mainmenu");
                        App.display.addScreen(App.signupScreen, "signup");
                        App.display.addScreen(App.appsScreen, "apps");
                        App.display.addScreen(App.legalDocumentScreen, "legal-document");
                        App.display.setGlobalKeyCodeHandler("vol_plus", App.playerScreen.key_vol_plus, App.playerScreen);
                        App.display.setGlobalKeyCodeHandler("vol_minus", App.playerScreen.key_vol_minus, App.playerScreen);
                        App.display.setGlobalMouseMoveHandler(function (posX, posY, x, y) {
                            if (posY === "bottom") {
                                var currentPopupScreen = App.display.getCurrentPopupScreen();
                                if (currentPopupScreen && Helper.isVisible(currentPopupScreen.getId())) {
                                    return
                                }
                                if (App.display.getCurrentScreen() == App.battleCityScreen) {
                                    return
                                }
                                Helper.addBodyClass("mouse-over");
                                if (this.mouseOverTimeout) {
                                    clearTimeout(this.mouseOverTimeout)
                                }
                                this.mouseOverTimeout = setTimeout(function () {
                                    Helper.removeBodyClass("mouse-over")
                                }, 3000)
                            }
                            return true
                        }, this);
                        App.display.setGlobalMouseLeaveHandler("footer", function (param) {
                            Helper.removeBodyClass("mouse-over")
                        }, this);
                        if (settings.show_categorizedtv) {
                            App.mainmenuScreen.addMenuItem(App.lang.get("label-mainmenu-categorizedtv"), "categorizedtv");
                            App.display.addScreen(App.categorizedTVScreen, "categorizedtv");
                            App.display.addScreen(App.epgScreen, "epg")
                        }
                        if (settings.show_tvchannels) {
                            App.mainmenuScreen.addMenuItem(App.lang.get("label-mainmenu-tvchannels"), "tvchannels");
                            App.display.addScreen(App.tvChannelsScreen, "tvchannels");
                            App.display.addScreen(App.epgScreen, "epg")
                        }
                        if (settings.show_videocatalog) {
                            var model = App.device.getDeviceModel();
                            if (model === "WR200" || model === "UZPS101" || model === "IPTV101" || model === "QTV500") {
                                alert("This device (" + App.device.getDeviceKind() + " " + model + ") do not support playback of VOD")
                            } else {
                                App.mainmenuScreen.addMenuItem(App.lang.get("label-mainmenu-videocatalog"), "videocatalog");
                                App.display.addScreen(App.videoCatalogScreen, "videocatalog");
                                App.display.addScreen(App.videoScreen, "video")
                            }
                        }
                        if (settings.show_info || settings.show_balance) {
                            App.mainmenuScreen.addMenuItem(App.lang.get("label-mainmenu-account"), "account");
                            App.display.addScreen(App.accountScreen, "account")
                        }
                        if (settings.show_info) {
                            App.accountScreen.addCustomAccountMenuItem("info");
                            App.display.addScreen(App.infoScreen, "info")
                        }
                        if (settings.show_balance) {
                            App.accountScreen.addCustomAccountMenuItem("balance");
                            App.display.addScreen(App.balanceScreen, "balance");
                            if (settings.show_payment) {
                                App.display.addScreen(App.paymentScreen, "payment")
                            }
                        }
                        if ((settings.show_tvchannels || settings.show_categorizedtv)) {
                            App.accountScreen.addCustomAccountMenuItem("notifications");
                            App.display.addScreen(App.notificationsScreen, "notifications")
                        }
                        if (settings.show_settings) {
                            App.mainmenuScreen.addMenuItem(App.lang.get("label-mainmenu-settings"), "settings");
                            App.display.addScreen(App.settingsScreen, "settings");
                            App.display.addScreen(App.sortScreen, "sort")
                        }
                        if (settings.show_exit) {
                            App.mainmenuScreen.addMenuItem(App.lang.get("label-mainmenu-exit"), "exit", 999)
                        }
                        if (settings.show_games && App.device.getDeviceKind() !== "tizen_tv") {
                            App.display.addScreen(App.gamesScreen, "games");
                            App.appsScreen.addMenuItem(App.lang.get("label-mainmenu-games"), "games")
                        }
                        if (settings.show_radio && App.device.getDeviceKind() !== "tizen_tv") {
                            App.appsScreen.addMenuItem(App.lang.get("label-mainmenu-radio"), "radio");
                            App.display.addScreen(App.radioScreen, "radio")
                        }
                        if (App.clientSettings.enable_promo_activation) {
                            App.display.addScreen(App.promoActivationScreen, "promo")
                        }
                        if (App.appsScreen.getMenuItems().length > 0) {
                            App.mainmenuScreen.addMenuItem(App.lang.get("label-mainmenu-apps"), "apps", 4)
                        }
                        App.appsScreen.generateAppsMenu();
                        App.mainmenuScreen.generateMainMenu();
                        App.lang.reload();
                        App.hbbTv.addHbbActivity("device", "device info");
                        App.hbbTv.addHbbActivity("activity", "open app");
                        setTimeout(function () {
                            if (App.clientSettings.allow_autoregistration && App.settings.getAbonement() === "") {
                                App.firstLoadingScreen.setCustomMessage(App.lang.get("autoregistration-loader-message"));
                                App.signupScreen.accountAutoregister()
                            } else {
                                App.display.showScreen("login")
                            }
                        }, 3000)
                    } else {
                        App.settings.setClientId("");
                        App.settings.setApiKey("");
                        App.settings.setApiUrl("");
                        App.settings.saveSettings();
                        var msg = "";
                        if (error == 1 || error == 2) {
                            msg = App.lang.get("device-not-supported-by-provider-msg")
                        } else {
                            msg = App.lang.get("init-request-error-msg")
                        }
                        App.display.addPopupScreen(App.popupMessageScreen, "popup-message");
                        App.popupMessageScreen.setMessageText(msg);
                        App.popupMessageScreen.setOnHideCallback(function () {
                            App.device.reload()
                        });
                        App.firstLoadingScreen.hide();
                        App.display.showPopupScreen("popup-message")
                    }
                })
            }
            setTimeout(function () {
                loadPortalEnvironmentAndLogin()
            }, App.clientSettings.loading_timeout)
        } catch (e) {
            alert(e)
        }
        App.fireEvent(App.EVENT_ON_DEVICE_INIT_END)
    });
    App.fireEvent(App.EVENT_ON_APP_INIT_END)
};
window.onunload = function () {
    alert("unload UI");
    App.hbbTv.addHbbActivity("activity", "close app");
    try {
        App.player.stop()
    } catch (e) {}
    App.device.deinit()
};
window.onmousemove = function (e) {
    App.display.mouseMove(e)
};
Helper.addWheelListener(window, function (e) {
    App.display.wheel(e)
});
OnDeviceKeyEvent = function (keyCode) {
    if (App.standByTimeOut > 0) {
        App.handleStandByTimeout()
    }
    if (App.standByPVRTimer > 0) {
        App.handleStandByPVRTimeout(keyCode)
    }
};