function Player() {
    var that = this;
    var channel = null;
    var previousChannel = null;
    var program = null;
    var video = null;
    var rewindTimeout = null;
    try {
        var playerHelper = Object.create(Helper)
    } catch (e) {
        var playerHelper = Helper
    }
    var isBufferingComplete = true;
    var timerLoadingBar;
    var pushStatInterval = null;
    var timerForLoadStreamInfo = null;
    var onStreamInfoReadyCallback = null;
    var programsBeforeRewind = [];
    var currentPlayerTime = 0;
    var isStoppedByUser = false;
    var contentPositionSetInterval = null;
    this.getChannel = function () {
        return channel
    };
    this.setChannel = function (value) {
        if (!previousChannel || (value && channel && value.id != channel.id)) {
            previousChannel = channel
        }
        channel = value
    };
    this.getProgram = function () {
        return program
    };
    this.setProgram = function (value) {
        program = value
    };
    this.getVideo = function () {
        return video
    };
    this.setVideo = function (value) {
        video = value
    };
    this.setOnStreamInfoReadyCallback = function (callbackFunc) {
        onStreamInfoReadyCallback = callbackFunc
    };
    this.setProgramInfo = function (p) {
        this.setProgram(p);
        this.setPlayingItemId(p.id);
        this.setPlayingItemName(p.name);
        this.setEndTime(parseInt(p.end_time) - parseInt(p.begin_time));
        this.setBeginTime(0)
    };
    this.stopByUser = function () {
        isStoppedByUser = true
    };
    this.play = function (restore) {
        _Player.play();
        if (this.getMode() !== this.MODE_RADIO) {
            Helper.addBodyClass("play")
        }
        var streamUrl = this.getStreamUrl();
        if (!streamUrl) {
            alert("no stream url to play");
            return
        } else {
            alert("stream url: " + streamUrl)
        }
        switch (this.getMode()) {
            case this.MODE_LIVETV:
            case this.MODE_TVARCHIVE:
            case this.MODE_PAUSE_LIVETV:
                App.playerScreen.showTvInfoBar();
                break;
            case this.MODE_VIDEO:
                App.playerScreen.showVideoInfoBar();
                break
        }
        if (App.settings.getBufferSizeValue() >= 0) {
            var maxSize = parseInt(App.settings.getBufferSizeValue());
            App.device.setBufferSize(parseInt(App.settings.getBufferSizeValue()) * 1000, 0, maxSize)
        }
        var liveMode = (this.getMode() === this.MODE_LIVETV || this.getMode() === this.MODE_RADIO) ? true : false;
        restore = (restore == true);
        if (App.device.getDeviceKind() === "tvip" && (this.getMode() === this.MODE_TVARCHIVE || this.getMode() === this.MODE_PAUSE_LIVETV)) {
            liveMode = true
        }
        timerLoadingBar = setTimeout(function () {
            if (!isBufferingComplete) {
                App.playerScreen.showLoadingBar()
            }
        }, 3000);
        if (streamUrl.indexOf("api/channel/url/", 0) >= 0) {
            App.data.requestChannelUrl({
                cid: this.getPlayingItemId()
            }, function (error, uri) {
                if (error == 0) {
                    if (App.data.getNumberOfAdMovieList() > 0) {
                        var playlist = [].concat(App.data.getAdMovieList());
                        playlist[playlist.length] = uri;
                        App.device.playSeveral(playlist, liveMode, restore)
                    } else {
                        App.device.play(uri, liveMode, restore)
                    }
                }
            })
        } else {
            if (streamUrl.indexOf("api/video/url/", 0) >= 0) {
                App.data.requestVideoUrl({
                    vfid: this.getPlayingItemId() >= 0 ? this.getPlayingItemId() : 0,
                    vid: video.id
                }, function (error, uri, extId, extPartnerId) {
                    if (error == 0) {
                        App.player.setStreamUrl(uri);
                        App.device.play(uri, false, restore, App.player.getCurrentTime());
                        if (App.data.getTVZavrStatEnabled()) {
                            App.tvzavrStat.stopCounter();
                            if (video && video.provider == "tvzavr") {
                                App.tvzavrStat.startCounter(extPartnerId, uri)
                            }
                        }
                    }
                })
            } else {
                if (streamUrl.indexOf("api/program/url", 0) >= 0) {
                    App.data.requestProgramUrl({
                        cid: channel.id,
                        pid: program.id,
                        time: parseInt(program.begin_time) + that.getCurrentTime() + that.getRewindDisplayOffsetTime()
                    }, function (error, uri) {
                        if (!Number(error)) {
                            if (App.data.getNumberOfAdMovieList() > 0) {
                                var playlist = [].concat(App.data.getAdMovieList());
                                playlist[playlist.length] = uri;
                                App.device.playSeveral(playlist, liveMode, restore)
                            } else {
                                App.device.play(uri, liveMode, restore, restore ? App.player.getCurrentTime() : null)
                            }
                        }
                    })
                } else {
                    if (App.data.getNumberOfAdMovieList() > 0 && (this.getMode() === this.MODE_LIVETV || this.getMode() === this.MODE_TVARCHIVE || this.getMode() === this.MODE_PAUSE_LIVETV)) {
                        var playlist = [].concat(App.data.getAdMovieList());
                        playlist[playlist.length] = streamUrl;
                        App.device.playSeveral(playlist, liveMode, restore)
                    } else {
                        App.device.play(streamUrl, liveMode, restore, restore ? App.player.getCurrentTime() : null)
                    }
                }
            }
        }
        var contentPositionSetOptions = null;
        switch (this.getMode()) {
            case this.MODE_TVARCHIVE:
            case this.MODE_PAUSE_LIVETV:
                if (program) {
                    contentPositionSetOptions = {
                        content_type: "program",
                        content_id: program.id
                    }
                }
                break;
            case this.MODE_VIDEO:
                if (video) {
                    contentPositionSetOptions = {
                        content_type: "video",
                        content_id: video.id,
                        asset_id: this.getPlayingItemId() >= 0 ? this.getPlayingItemId() : 0
                    }
                }
                break
        }
        if (contentPositionSetOptions) {
            if (contentPositionSetInterval) {
                clearInterval(contentPositionSetInterval)
            }
            contentPositionSetInterval = setInterval(function () {
                if (App.player.getState() === App.player.STATE_PLAYING) {
                    contentPositionSetOptions.position = App.player.getCurrentTime();
                    alert("save content position... type = " + contentPositionSetOptions.content_type + ", id = " + contentPositionSetOptions.content_id + ", position = " + contentPositionSetOptions.position + ", asset_id = " + contentPositionSetOptions.asset_id);
                    App.data.requestContentPositionSet(contentPositionSetOptions, null)
                }
            }, App.clientSettings.content_position_set_interval)
        }
        switch (this.getMode()) {
            case this.MODE_LIVETV:
            case this.MODE_TVARCHIVE:
            case this.MODE_PAUSE_LIVETV:
                if (channel) {
                    if (pushStatInterval) {
                        clearInterval(pushStatInterval)
                    }
                    App.data.setPushStatChannelSessionId();
                    pushStatInterval = setInterval(function () {
                        App.data.requestPushStat({}, null, channel.id, channel.timeshift_offset)
                    }, App.clientSettings.push_stat_interval ? Helper.toInt(App.clientSettings.push_stat_interval) : 300000)
                }
                break
        }
        if (App.data.getMediascopeEnabled()) {
            App.mediascope.stopCounter();
            if (channel && channel.telemeter == "mediascope") {
                App.mediascope.startCounter(channel.telemeter_account_name, channel.telemeter_tmsec_name, channel.telemeter_cat_id, channel.telemeter_vc_id, channel.telemeter_vc_version, this.getModeStr())
            }
        }
    };
    this.pause = function () {
        _Player.pause();
        App.device.pause();
        App.playerScreen.showPauseIcon()
    };
    this.stop = function () {
        Helper.removeBodyClass("play");
        App.device.stop();
        App.device.playlist = [];
        App.playerScreen.hidePauseIcon();
        App.playerScreen.hideLoadingBar();
        App.hbbTv.reset();
        _Player.stop();
        onStreamInfoReadyCallback = null;
        if (contentPositionSetInterval) {
            clearInterval(contentPositionSetInterval)
        }
        if (pushStatInterval) {
            clearInterval(pushStatInterval)
        }
        if (App.data.getMediascopeEnabled()) {
            App.mediascope.stopCounter()
        }
        if (App.data.getTVZavrStatEnabled()) {
            App.tvzavrStat.stopCounter()
        }
        if (App.data.getMVisionStatEnabled()) {
            App.monitoring.stopSendMetrics()
        }
        App.data.resetPushStatChannelSessionId()
    };
    this.resume = function () {
        _Player.resume();
        App.device.resume();
        App.playerScreen.hidePauseIcon()
    };
    this.forward = function (rewindStep) {
        var defaultRewindStep = App.clientSettings.player_rewind_step ? App.clientSettings.player_rewind_step : 30;
        this.rewind(rewindStep ? rewindStep : defaultRewindStep, rewindStep ? true : false)
    };
    this.backward = function (rewindStep) {
        var defaultRewindStep = App.clientSettings.player_rewind_step ? App.clientSettings.player_rewind_step : 30;
        this.rewind(rewindStep ? rewindStep : -defaultRewindStep, rewindStep ? true : false)
    };
    this.rewind = function (rewindStep, force) {
        _Player.rewind(rewindStep, force);
        App.playerScreen.hidePauseIcon();
        Helper.addClass("tv-infobar-program-progress-bar", "static");
        var rewindOffsetTime = this.getRewindOffsetTime();
        var prevProgram = null;
        var s = "";
        if (this.getMode() === this.MODE_TVARCHIVE || this.getMode() === this.MODE_PAUSE_LIVETV) {
            programsBeforeRewind.push(program);
            if (programsBeforeRewind.length === 1) {
                currentPlayerTime = App.player.getCurrentTime()
            }
            prevProgram = programsBeforeRewind[0];
            var prevProgramBeginTime = prevProgram.begin_time;
            var timeshiftOffset = channel.timeshift_offset * 3600;
            prevProgramBeginTime += timeshiftOffset;
            s = Helper.formatTime(Helper.withTimezone(prevProgramBeginTime + currentPlayerTime + rewindOffsetTime)) + " (";
            if (rewindOffsetTime > 0) {
                s += "+"
            } else {
                s += "-"
            }
            s += Helper.formatSeconds(Math.abs(rewindOffsetTime), true) + ")"
        }
        if (this.getMode() === this.MODE_VIDEO) {
            if (this.getCurrentTime() + rewindOffsetTime < 0 || (this.getCurrentTime() + rewindOffsetTime >= this.getEndTime() && this.getEndTime() > 0)) {
                rewindOffsetTime -= rewindStep;
                this.setRewindOffsetTime(rewindOffsetTime);
                this.setRewindDisplayOffsetTime(rewindOffsetTime)
            }
            s = Helper.formatSeconds(Math.abs(App.player.getCurrentTime() + rewindOffsetTime), true)
        }
        if (rewindOffsetTime > 0) {
            if (this.getMode() !== this.MODE_VIDEO) {
                App.device.pause()
            }
        } else {
            if (rewindOffsetTime < 0) {
                if (this.getMode() !== this.MODE_VIDEO) {
                    App.device.pause()
                }
            } else {
                s = "";
                Helper.removeClass("tv-infobar-program-progress-bar", "static");
                if (this.getMode() !== this.MODE_VIDEO) {
                    App.device.resume()
                }
            }
        }
        if (s && !force) {
            App.tvChannelsScreen.showTextBar(s)
        } else {
            App.tvChannelsScreen.hideTextBar()
        }
        switch (this.getMode()) {
            case this.MODE_LIVETV:
            case this.MODE_TVARCHIVE:
            case this.MODE_PAUSE_LIVETV:
                App.playerScreen.showTvInfoBar();
                break;
            case this.MODE_VIDEO:
                App.playerScreen.showVideoInfoBar();
                break
        }
        var t = 2000;
        if (force) {
            t = 0
        }
        if (rewindTimeout) {
            clearTimeout(rewindTimeout)
        }
        rewindTimeout = setTimeout(function () {
            if (!force) {
                App.tvChannelsScreen.hideTextBar()
            } else {
                setTimeout(function () {
                    App.tvChannelsScreen.hideTextBar()
                }, 500)
            }
            if (that.getRewindOffsetTime() != 0) {
                that.onBufferingStart();
                try {
                    switch (App.player.getMode()) {
                        case App.player.MODE_VIDEO:
                            App.player.refreshTime();
                            App.device.rewind(that.getCurrentTime(), that.getRewindOffsetTime());
                            break;
                        case App.player.MODE_TVARCHIVE:
                        case App.player.MODE_PAUSE_LIVETV:
                            if (channel && program) {
                                App.player.refreshTime();
                                var timeToRewind = parseInt(program.begin_time) + that.getCurrentTime() + that.getRewindDisplayOffsetTime();
                                if (timeToRewind >= App.data.getUtcTime()) {
                                    App.player.stop();
                                    that.setCurrentTime(0);
                                    that.setRewindOffsetTime(0);
                                    that.setRewindDisplayOffsetTime(0);
                                    App.player.playChannel(channel, true, false);
                                    App.tvChannelsScreen.showTextBar(App.lang.get("live-mode-msg"))
                                } else {
                                    var realPlayingTime = App.device.getPlayingTime();
                                    var newPlayerPos = realPlayingTime + that.getRewindOffsetTime();
                                    if (App.clientSettings.server_rewind_mode === false && prevProgram.id === program.id && newPlayerPos + 5 < App.device.getVideoDuration() && newPlayerPos > 0 && realPlayingTime != -1) {
                                        App.player.refreshTime();
                                        App.device.rewind(realPlayingTime, that.getRewindOffsetTime());
                                        App.device.resume()
                                    } else {
                                        App.data.requestProgramUrl({
                                            cid: channel.id,
                                            pid: program.id,
                                            time: timeToRewind
                                        }, function (error, uri) {
                                            if (error == 0) {
                                                alert(uri);
                                                that.setStreamUrl(uri);
                                                that.play()
                                            }
                                        })
                                    }
                                }
                            }
                            break
                    }
                } catch (e) {
                    alert(e)
                }
            }
            programsBeforeRewind = [];
            that.setCurrentTime(that.getCurrentTime() + that.getRewindDisplayOffsetTime());
            that.setRewindOffsetTime(0);
            that.setRewindDisplayOffsetTime(0);
            Helper.removeClass("tv-infobar-program-progress-bar", "static")
        }, t)
    };
    this.refreshTime = function () {
        _Player.refreshTime();
        var current = this.getCurrentTime();
        var rewindDisplayOffsetTime = this.getRewindDisplayOffsetTime();
        var endTime = this.getEndTime();
        if (current + rewindDisplayOffsetTime > endTime) {
            if (App.playerScreen.refreshInfo(current + rewindDisplayOffsetTime)) {
                this.setRewindDisplayOffsetTime(0);
                return this.refreshTime()
            }
        }
        if (current + rewindDisplayOffsetTime < 0) {
            if (App.playerScreen.refreshInfo(current + rewindDisplayOffsetTime)) {
                this.setRewindDisplayOffsetTime(this.getEndTime() - 60);
                return this.refreshTime()
            }
        }
        var w = 0;
        if (this.getEndTime()) {
            w = Helper.getProgressWidth(this.getBeginTime(), this.getEndTime(), this.getCurrentTime() + rewindDisplayOffsetTime)
        }
        var time = 0;
        switch (this.getMode()) {
            case this.MODE_LIVETV:
                Helper.byId("tv-infobar-program-progress-bar").style.width = w + "%";
                break;
            case this.MODE_TVARCHIVE:
            case this.MODE_PAUSE_LIVETV:
                Helper.byId("tv-infobar-program-progress-bar").style.width = w + "%";
                if (App.clientSettings.infobar_time_display_mode === "by_epg") {
                    time = Helper.withTimezone(program.begin_time + App.player.getCurrentTime() + rewindDisplayOffsetTime);
                    var timeshiftOffset = channel.timeshift_offset * 3600;
                    time += timeshiftOffset;
                    time = Helper.formatTime(time)
                } else {
                    time = Helper.formatSeconds(this.getCurrentTime() + rewindDisplayOffsetTime)
                }
                Helper.setHtml("tv-infobar-program-start", time);
                break;
            case this.MODE_VIDEO:
                Helper.byId("video-infobar-progress-bar").style.width = w + "%";
                var timeInt = this.getCurrentTime() + rewindDisplayOffsetTime;
                if (timeInt < 0) {
                    timeInt = 0
                }
                time = Helper.formatSeconds(timeInt);
                Helper.setHtml("video-infobar-current", time);
                break
        }
        return current
    };
    this.requestActualStreamUrl = function (isChangePlayerMode) {
        switch (this.getMode()) {
            case this.MODE_PAUSE_LIVETV:
                this.setMode(this.MODE_TVARCHIVE);
            case this.MODE_TVARCHIVE:
                if (channel && program) {
                    var timeToRewind = parseInt(program.begin_time) + this.getCurrentTime();
                    var streamUrl = App.data.getProgramUrl({}, channel.id, timeToRewind);
                    this.setStreamUrl(streamUrl);
                    this.play()
                }
                break;
            case this.MODE_LIVETV:
                var curChannel = null;
                if (program && !channel) {
                    var number = App.data.getProgramCategoryChannelNumberById(program.id);
                    if (number >= 0) {
                        var index = App.data.getProgramCategoryChannelIndexByNumber(number);
                        if (index >= 0) {
                            curChannel = App.data.getProgramCategoryChannel("all", index)
                        }
                    } else {
                        curChannel = App.data.getChannelById(program.id, true)
                    }
                    if (curChannel) {
                        if (isChangePlayerMode) {
                            this.playChannel(curChannel)
                        } else {
                            this.setStreamUrl(curChannel.url);
                            this.play()
                        }
                    } else {
                        App.data.requestChannelList({}, function (error, interval) {
                            curChannel = App.data.getChannelById(program.id, true);
                            if (isChangePlayerMode) {
                                App.player.playChannel(curChannel)
                            } else {
                                App.player.setStreamUrl(curChannel.url);
                                App.player.play()
                            }
                        })
                    }
                } else {
                    if (channel) {
                        if (isChangePlayerMode) {
                            this.playChannel(channel)
                        } else {
                            this.setStreamUrl(channel.url);
                            this.play()
                        }
                    }
                }
                break;
            default:
                this.play();
                break
        }
    };
    this.showPopupForLockChannel = function (actions) {
        var str = "";
        var tariffs = [];
        var tariffsStr = "";
        for (var i = 0; i < actions.length; i++) {
            if (actions[i].action === "subscribe") {
                tariffs.push(actions[i]);
                tariffsStr += "<center>" + App.data.getTariffById(actions[i].tariff_id).name + "</center><br>"
            }
        }
        if (tariffs.length > 0) {
            str = App.lang.get("locked-channel-msg") + "<br>" + tariffsStr
        } else {
            str = App.lang.get("locked-channel-fallback-msg") + " "
        }
        str += App.lang.get("go-to-profile-screen-msg");
        App.popupMessageScreen.setMessageText(str, App.popupMessageScreen.MODE_CHOICE);
        App.popupMessageScreen.setCallback(function (yes) {
            if (yes) {
                if (tariffs.length > 0) {
                    App.balanceScreen.setFocusedTariff(tariffs[0].tariff_id)
                }
                App.display.showScreen("balance")
            }
        });
        App.display.showPopupScreen("popup-message")
    };
    this.playChannel = function (channel, skipParentalCodeCheck, isScaledPlayer) {
        if (!channel) {
            return
        }
        if (!channel.has_subscription) {
            App.data.requestChannelDetail({
                cid: channel.id
            }, function (error, channelDetail) {
                if (error == 0 && channelDetail.actions.length > 0) {
                    if (App.data.getTariffPriceList().length > 0) {
                        that.showPopupForLockChannel(channelDetail.actions)
                    } else {
                        App.data.requestCustomerTariffList({}, function (error) {
                            if (error == 0) {
                                that.showPopupForLockChannel(channelDetail.actions)
                            }
                        })
                    }
                } else {
                    that.showPopupForLockChannel([])
                }
            });
            return
        }
        var flag = true;
        if (App.data.getPreviousChannel()["is_parent_control"]) {
            flag = false
        }
        if (channel.is_parent_control && !skipParentalCodeCheck && flag) {
            App.popupParentCodeScreen.setCallback(function (success) {
                if (success) {
                    if (isScaledPlayer) {
                        App.tvChannelsScreen.playSelectedChannel(true)
                    } else {
                        App.player.playChannel(channel, true)
                    }
                    App.data.setPreviousChannel(channel)
                } else {
                    App.popupMessageScreen.setMessageText(App.lang.get("invalid-parent-code"));
                    App.display.showPopupScreen("popup-message")
                }
            });
            App.display.showPopupScreen("popup-parent-code-screen");
            return
        } else {
            App.data.setPreviousChannel(channel)
        }
        if (channel.id === App.player.getPlayingItemId() && App.player.getMode() === App.player.MODE_LIVETV && App.player.getState() === App.player.STATE_PLAYING && !isScaledPlayer) {
            App.display.showScreen("player")
        } else {
            App.playerScreen.setChannel(channel);
            this.setOnStopCallback(null);
            this.stop();
            this.setMode(App.player.MODE_LIVETV);
            this.setPlayingItemId(channel.id);
            this.setPlayingItemName(channel.name);
            this.setChannel(channel);
            this.setStreamUrl(channel.url);
            this.setBeginTime(parseInt(channel.program_begin_time));
            this.setEndTime(parseInt(channel.program_end_time));
            this.setCurrentTime(App.data.getUtcTime());
            App.playerScreen.setRefreshInfoCallback(function () {
                var c = App.data.getChannelById(channel.id);
                if (c) {
                    App.playerScreen.setChannel(c);
                    App.player.setBeginTime(parseInt(c.program_begin_time));
                    App.player.setEndTime(parseInt(c.program_end_time));
                    App.player.setCurrentTime(App.data.getUtcTime())
                }
            }, 5000);
            App.hbbTv.addHbbActivity("activity", "change channel");
            if (channel.hbb.length > 0) {
                App.hbbTv.init(channel.hbb[0]["type"], {
                    container: "hbb-iframe-container",
                    blur_mode: isScaledPlayer,
                    cid: channel.id,
                    hbb_id: channel.hbb[0]["id"] ? channel.hbb[0]["id"] : ""
                })
            }
            App.data.requestAdList({
                channel_id: channel.id,
                device_uid: App.device.getDeviceUID()
            }, function (error) {
                App.player.play();
                if (!isScaledPlayer) {
                    App.display.showScreen("player")
                }
            })
        }
    };
    this.playProgram = function (channel, program, skipParentalCodeCheck) {
        if (!program) {
            return
        }
        if (!program.has_record) {
            return
        }
        if (!channel) {
            return
        }
        if (!channel.has_subscription) {
            App.data.requestChannelDetail({
                cid: channel.id
            }, function (error, channelDetail) {
                if (error == 0 && channelDetail.actions.length > 0) {
                    if (App.data.getTariffPriceList().length > 0) {
                        that.showPopupForLockChannel(channelDetail.actions)
                    } else {
                        App.data.requestCustomerTariffList({}, function (error) {
                            if (error == 0) {
                                that.showPopupForLockChannel(channelDetail.actions)
                            }
                        })
                    }
                } else {
                    that.showPopupForLockChannel([])
                }
            });
            return
        }
        if (channel.is_parent_control && !skipParentalCodeCheck && !App.player.getChannel()["is_parent_control"]) {
            App.popupParentCodeScreen.setCallback(function (success) {
                if (success) {
                    App.player.playProgram(channel, program, true)
                } else {
                    App.popupMessageScreen.setMessageText(App.lang.get("invalid-parent-code"));
                    App.display.showPopupScreen("popup-message")
                }
            });
            App.display.showPopupScreen("popup-parent-code-screen");
            return
        }
        var programList = App.data.getProgramList();
        App.playerScreen.setProgram(program, channel);
        this.setChannel(channel);
        this.setProgramInfo(program);
        this.setOnStopCallback(null);
        this.stop();
        this.setStreamUrl(program.url);
        if (App.player.getMode() === App.player.MODE_PAUSE_LIVETV) {
            programList = [program];
            if (program.is_paused) {
                App.player.setOnStreamInfoReadyCallback(function () {
                    if (App.device.getDeviceKind() === "tvip" || App.device.getDeviceKind() === "samsung_smart_tv" || App.device.getDeviceKind() === "android_stb") {
                        setTimeout(function () {
                            App.playerScreen.key_pause()
                        }, 1000)
                    } else {
                        App.playerScreen.key_pause()
                    }
                })
            }
        } else {
            this.setCurrentTime(0)
        }
        this.setOnStopCallback(function () {
            if (isStoppedByUser) {
                App.epgScreen.setParentScreen(App.playerScreen.getParentScreen());
                App.display.showScreen("epg")
            } else {
                App.player.requestActualStreamUrl()
            }
            isStoppedByUser = false
        });
        App.playerScreen.setRefreshInfoCallback(function (currentTime) {
            var currentProgram = App.playerScreen.getProgram();
            if (!currentProgram) {
                return false
            }
            if (currentTime == undefined) {
                currentTime = App.player.getCurrentTime()
            }
            currentTime += parseInt(currentProgram.begin_time);
            var p = false;
            var currentProgramFound = false;
            for (var i = 0; i < programList.length; i++) {
                p = programList[i];
                if (parseInt(p.begin_time) <= currentTime && parseInt(p.end_time) > currentTime) {
                    currentProgramFound = true;
                    break
                }
            }
            if (!currentProgramFound) {
                programList = App.data.requestProgramListSync({
                    cid: channel.id,
                    time_from: parseInt(program.begin_time) - 24 * 60 * 60,
                    time_to: parseInt(program.end_time) + 24 * 60 * 60
                });
                for (var i = 0; i < programList.length - 1; i++) {
                    p = programList[i];
                    if (parseInt(p.begin_time) <= currentTime && parseInt(p.end_time) > currentTime) {
                        currentProgramFound = true;
                        break
                    }
                }
            }
            if (p) {
                App.playerScreen.setProgram(p, channel)
            }
            if (p && p.id != currentProgram.id) {
                App.player.setProgramInfo(p);
                App.player.setCurrentTime(0);
                return true
            }
            return false
        }, 5000);
        App.data.requestAdList({
            channel_id: channel.id
        }, function (error) {
            App.player.play();
            App.handleStandByPVRTimeout();
            if (App.player.getState() !== App.player.MODE_PAUSE_LIVETV) {
                App.display.showScreen("player")
            } else {
                if (program.is_paused) {
                    App.playerScreen.showPauseIcon()
                }
                App.playerScreen.setIgnoreKeyPress(false)
            }
        })
    };
    this.onBufferingStart = function () {
        _Player.onBufferingStart();
        isBufferingComplete = false
    };
    this.onBufferingComplete = function () {
        _Player.onBufferingComplete();
        isBufferingComplete = true;
        clearInterval(timerLoadingBar);
        App.playerScreen.hideLoadingBar();
        switch (this.getMode()) {
            case this.MODE_LIVETV:
            case this.MODE_TVARCHIVE:
                App.playerScreen.showTvInfoBar();
                break;
            case this.MODE_VIDEO:
                App.playerScreen.showVideoInfoBar();
                break;
            case this.MODE_RADIO:
                Helper.showById("radio-player");
                break
        }
    };
    this.refreshAudioTracksInfo = function () {
        App.playerScreen.resetAudioTracks();
        if (timerForLoadStreamInfo) {
            clearInterval(timerForLoadStreamInfo)
        }
        var tracks = Device.getAudioTracksInfo();
        if (tracks.length === 0) {
            var attemptCount = 1;
            timerForLoadStreamInfo = setInterval(function () {
                attemptCount++;
                tracks = Device.getAudioTracksInfo();
                if (tracks.length > 0 || attemptCount === 5) {
                    clearInterval(timerForLoadStreamInfo);
                    App.playerScreen.setAudioTracksInfo(tracks)
                }
            }, 500 * attemptCount)
        } else {
            App.playerScreen.setAudioTracksInfo(tracks)
        }
    };
    this.onStreamInfoReady = function () {
        alert("onStreamInfoReady");
        _Player.onStreamInfoReady();
        if (this.getState() === this.STATE_PAUSED) {
            this.pause()
        }
        if (this.getMode() === this.MODE_VIDEO) {
            App.player.setOnStopCallback(function () {
                App.videoScreen.videoOnStopCallback()
            });
            if (App.clientSettings.set_default_aspect_ratio_for_vod) {
                App.device.setDefaultAspectRatioForVOD()
            }
            if (this.getEndTime() <= 0) {
                var duration = App.device.getVideoDuration();
                this.setEndTime(duration);
                Helper.setHtml("video-infobar-duration", Helper.formatSeconds(duration))
            }
        } else {
            if (App.clientSettings.set_default_aspect_ratio_for_vod) {
                App.device.setAspectRatioMode()
            }
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
        if (onStreamInfoReadyCallback instanceof Function) {
            onStreamInfoReadyCallback();
            onStreamInfoReadyCallback = null
        }
        this.refreshTime();
        if (App.data.getMVisionStatEnabled()) {
            try {
                App.monitoring.startSendMetrics()
            } catch (e) {
                alert(e)
            }
        }
        this.refreshAudioTracksInfo()
    };
    this.onPlayerTimeUpdate = function () {
        if (this.getEndTime() <= 0) {
            var duration = App.device.getVideoDuration();
            this.setEndTime(duration);
            Helper.setHtml("video-infobar-duration", Helper.formatSeconds(duration))
        }
    }
}
var _Player = new BasePlayer();
Player.prototype = _Player;