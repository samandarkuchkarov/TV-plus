function BalanceScreen() {
    var BASIC_TARIFFS_MENU_ID = "basic-tariffs";
    var TARIFFS_MENU_ID = "tariffs";
    var tariffMenuConfig = {
        impuls: {
            "basic-tariffs": {
                numberOfColumns: 3,
                numberOfRows: 1
            },
            tariffs: {
                numberOfColumns: 3,
                numberOfRows: 2
            }
        },
        impuls_x: {
            "basic-tariffs": {
                numberOfColumns: 1,
                numberOfRows: 6
            },
            tariffs: {
                numberOfColumns: 1,
                numberOfRows: 6
            }
        }
    };
    var tariffsMenu = new BaseMenu({
        menuId: TARIFFS_MENU_ID,
        menuTag: "div",
        itemIdPrefix: "tariff",
        itemTag: "div",
        useFastRefresh: true,
        hideItemIfEmptyName: true,
        loopMenuFromBeginToEnd: false,
        loopMenuFromEndToBegin: false,
        getItemNameFunc: function (realItemIndex, itemIndex, node) {
            var tariff = tariffs[realItemIndex];
            if (tariff) {
                if (!node) {
                    return true
                } else {
                    var checkbox = document.createElement("span");
                    checkbox.setAttribute("class", "checkbox");
                    var spanElement1 = document.createElement("span");
                    spanElement1.innerHTML = Helper.cropString(tariff.name, 24, "...");
                    var spanElement2 = document.createElement("span");
                    spanElement2.setAttribute("class", "tariff-price");
                    spanElement2.innerHTML = Helper.toInt(tariff.price) + " " + currencyStr + App.lang.get("per-month");
                    node.appendChild(checkbox);
                    node.appendChild(spanElement1);
                    node.appendChild(spanElement2)
                }
            }
        },
        onItemClick: function (index) {
            that.key_enter()
        },
        onItemMouseOver: function (index) {
            var sourcePosition = tariffsMenu.getCurrentPage() * tariffsMenu.getNumberOfDisplayItems() + index;
            basicTariffsMenu.resetSelection();
            tariffsMenu.setSelectedItem(index, sourcePosition);
            App.balanceScreen.setTariffDescription(index)
        },
        getItemClassNameFunc: function (sourceItemIndex, displayItemIndex) {
            var tariff = tariffs[sourceItemIndex];
            if (tariff.is_assigned) {
                return "tariff"
            } else {
                return "tariff not-assigned"
            }
        }
    });
    var basicTariffsMenu = new BaseMenu({
        menuId: BASIC_TARIFFS_MENU_ID,
        menuTag: "div",
        itemIdPrefix: "basic-tariff",
        itemTag: "div",
        useFastRefresh: true,
        hideItemIfEmptyName: true,
        loopMenuFromBeginToEnd: false,
        loopMenuFromEndToBegin: false,
        getItemNameFunc: function (realItemIndex, itemIndex, node) {
            var tariff = basicTariffs[realItemIndex];
            if (tariff) {
                if (!node) {
                    return true
                } else {
                    var radioButton = document.createElement("span");
                    radioButton.setAttribute("class", "radio-button");
                    var spanElement1 = document.createElement("span");
                    spanElement1.innerHTML = Helper.cropString(tariff.name, 22, "...");
                    var spanElement2 = document.createElement("span");
                    spanElement2.setAttribute("class", "tariff-price");
                    spanElement2.innerHTML = Helper.toInt(tariff.price) + " " + currencyStr + App.lang.get("per-month");
                    node.appendChild(radioButton);
                    node.appendChild(spanElement1);
                    node.appendChild(spanElement2)
                }
            }
        },
        onItemClick: function (index) {
            that.key_enter()
        },
        onItemMouseOver: function (index) {
            var sourcePosition = basicTariffsMenu.getCurrentPage() * basicTariffsMenu.getNumberOfDisplayItems() + index;
            tariffsMenu.resetSelection();
            basicTariffsMenu.setSelectedItem(index, sourcePosition);
            App.balanceScreen.setTariffDescription(index)
        },
        getItemClassNameFunc: function (sourceItemIndex, displayItemIndex) {
            var tariff = basicTariffs[sourceItemIndex];
            if (tariff.is_assigned) {
                return "tariff"
            } else {
                return "tariff not-assigned"
            }
        }
    });
    var that = this;
    var tariffs = [];
    var basicTariffs = [];
    var purchaseAmount = 0;
    var isShowOffer = false;
    var connectLabelObj = null;
    var offerButtonObj = null;
    var currentBasicTariff = null;
    var currencyStr = "";
    var focusedTariffId = -1;
    var focusedMenu = BASIC_TARIFFS_MENU_ID;
    this.setPurchaseAmount = function (value) {
        purchaseAmount = value
    };
    this.setFocusedTariff = function (id) {
        focusedTariffId = id
    };
    this.setFocusedTariffForMenu = function () {
        var t = App.data.getTariffById(focusedTariffId);
        var menu, list;
        if (t.basic_tariff_priority > 0) {
            that.setFocusedMenu(BASIC_TARIFFS_MENU_ID);
            menu = basicTariffsMenu;
            list = basicTariffs
        } else {
            that.setFocusedMenu(TARIFFS_MENU_ID);
            menu = tariffsMenu;
            list = tariffs
        }
        for (var i = 0; i < list.length; i++) {
            if (focusedTariffId === list[i]["id"]) {
                menu.setSelectedItem(i % menu.getNumberOfDisplayItems(), i)
            }
        }
    };
    this.setFocusedMenu = function (menuId, columnIndex) {
        var menu = menuId === BASIC_TARIFFS_MENU_ID ? basicTariffsMenu : tariffsMenu;
        var oldMenu = menuId === BASIC_TARIFFS_MENU_ID ? tariffsMenu : basicTariffsMenu;
        oldMenu.resetSelection();
        if (!columnIndex && menu.getCurrentPage() === 0) {
            menu.setSelectedItem(0, 0)
        } else {
            columnIndex = columnIndex ? columnIndex : 0;
            menu.setSelectedItem(columnIndex, menu.getCurrentPage() * menu.getNumberOfDisplayItems() + columnIndex)
        }
        focusedMenu = menuId
    };
    this.init = function () {
        connectLabelObj = Helper.byId("balance-connect-footer-label");
        offerButtonObj = Helper.byId("balance-offer-footer-button");
        App.data.requestLegalDocumentList({}, function (error) {
            if (error == 0) {
                if (App.data.getNumberOfLegalDocuments() > 0 && App.data.getLegalDocument(0)["need_acceptance"] && App.clientSettings.show_offer_accept) {
                    isShowOffer = true;
                    Helper.showObject(offerButtonObj)
                } else {
                    isShowOffer = false;
                    Helper.hideObject(offerButtonObj)
                }
            }
        });
        _BalanceScreen.init()
    };
    this.show = function () {
        App.playerScreen.hideTvInfoBar();
        App.playerScreen.hideVideoInfoBar();
        this.refreshCustomerInfo();
        if (App.display.isScreenExist("payment")) {
            Helper.showById("balance-pay-footer-button")
        }
        if (!currencyStr) {
            var currency = App.data.getCurrency();
            currencyStr = currency === "RUB" ? App.lang.get("RUB") : currency
        }
        _BalanceScreen.show()
    };
    this.refreshTariffsMenu = function (data, menuType) {
        var menu = menuType === BASIC_TARIFFS_MENU_ID ? basicTariffsMenu : tariffsMenu;
        menu.clear();
        var style = App.settings.getStyleName();
        var nrows = tariffMenuConfig[style][menuType]["numberOfRows"];
        var ncolumns = tariffMenuConfig[style][menuType]["numberOfColumns"];
        var n = ncolumns * nrows;
        var nt = data.length;
        if (nt < n) {
            if (nt <= ncolumns) {
                ncolumns = nt;
                nrows = 1;
                n = ncolumns
            } else {
                n = nt
            }
        }
        menu.setNumberOfDisplayItems(n);
        menu.setNumberOfColumns(ncolumns);
        menu.setNumberOfRows(nrows);
        menu.setNumberOfSourceItems(nt);
        menu.setSelectedItem(0, 0)
    };
    this.refreshCustomerInfo = function () {
        App.data.requestCustomerInfo({}, function (error) {
            Helper.removeClass("balance-screen-container", "loader");
            if (error == 0) {
                Helper.setHtml("balance-chit", App.data.getBalance() + " " + currencyStr);
                Helper.setHtml("balance-debt", App.data.getCurrentDebtAmount() + " " + currencyStr);
                var paymentStr = App.data.getMonthlyPayment() + " " + currencyStr;
                if (App.data.getPaymentSumBeforeDiscount() && App.data.getPaymentSumBeforeDiscount() !== App.data.getPaymentSum()) {
                    paymentStr = "<strike>" + App.data.getPaymentSumBeforeDiscount() + " " + currencyStr + "</strike> " + paymentStr
                }
                Helper.setHtml("balance-payment", paymentStr);
                var tariffsData = App.data.getTariffPriceList();
                tariffs = [];
                basicTariffs = [];
                for (var j = 0; j < tariffsData.length; j++) {
                    if (tariffsData[j].basic_tariff_priority === 0) {
                        tariffs.push(tariffsData[j])
                    } else {
                        basicTariffs.push(tariffsData[j])
                    }
                }
                that.refreshTariffsMenu(tariffs, TARIFFS_MENU_ID);
                that.refreshTariffsMenu(basicTariffs, BASIC_TARIFFS_MENU_ID);
                if (focusedTariffId !== -1) {
                    that.setFocusedTariffForMenu()
                } else {
                    that.setFocusedMenu(BASIC_TARIFFS_MENU_ID)
                }
                for (var i = 0; i < tariffs.length; i++) {
                    if (tariffs[i]["is_assigned"] && tariffs[i]["basic_tariff_priority"] > 0) {
                        currentBasicTariff = tariffs[i]
                    }
                }
                App.balanceScreen.setTariffDescription()
            } else {}
        })
    };
    this.setTariffDescription = function (index) {
        var tariff;
        if (!index) {
            tariff = focusedMenu === BASIC_TARIFFS_MENU_ID ? basicTariffs[basicTariffsMenu.getSelectedSourceItem()] : tariffs[tariffsMenu.getSelectedSourceItem()]
        } else {
            tariff = focusedMenu === BASIC_TARIFFS_MENU_ID ? basicTariffs[index] : tariffs[index]
        }
        var s = '<span id="tariff-description-header">' + App.lang.get("label-tariff") + ' "' + tariff.name + '" </span>';
        if (tariff.channels_count > 0) {
            s += " " + tariff.channels_count + " ";
            switch (tariff.channels_count) {
                case 1:
                    s += App.lang.get("label-channel").toLowerCase();
                    break;
                case 2:
                case 3:
                case 4:
                    s += App.lang.get("label-tariff-channels-less-four");
                    break;
                default:
                    s += App.lang.get("label-tariff-channels");
                    break
            }
        }
        if (tariff.is_assigned > 0) {
            Helper.setHtmlForObject(connectLabelObj, App.lang.get("label-disconnect"));
            s += " (" + App.lang.get("label-connected") + ")"
        } else {
            Helper.setHtmlForObject(connectLabelObj, App.lang.get("label-connect"));
            s += " (" + App.lang.get("label-not-connected") + ")"
        }
        Helper.setHtml("tariff-description", s);
        if (tariff.description) {
            var divElement = document.createElement("div");
            Helper.setHtmlForObject(divElement, tariff.description);
            Helper.byId("tariff-description").appendChild(divElement)
        }
    };
    this.payByMerchantUrl = function (amount, merchantType, url) {
        Helper.addClass("balance-screen-container", "loader");
        App.data.requestCreatePayment({
            amount: amount,
            merchant_type: merchantType,
            template: App.clientSettings.template_of_payment_page
        }, function (error, payment_id, transaction_id, session_id) {
            if (error == 0) {
                var appUrl = location.protocol + "//" + location.host;
                var merchantUrl = url.replace("%success_url%", appUrl).replace("%fail_url%", appUrl);
                merchantUrl = merchantUrl.replace(/%transaction_id%/g, transaction_id);
                merchantUrl = merchantUrl.replace("%session_id%", session_id);
                var containerElement = Helper.byId("merchant-iframe-container");
                var iframeElement = document.createElement("iframe");
                iframeElement.setAttribute("name", "iframe-callback");
                iframeElement.setAttribute("id", "merchant-iframe");
                iframeElement.setAttribute("width", "1280px");
                iframeElement.setAttribute("height", "720px");
                var formElement = document.createElement("form");
                formElement.setAttribute("id", "iframe-data-form");
                formElement.setAttribute("method", "post");
                formElement.setAttribute("action", merchantUrl);
                formElement.setAttribute("target", "iframe-callback");
                var inputElement = document.createElement("input");
                inputElement.setAttribute("type", "submit");
                formElement.appendChild(inputElement);
                containerElement.appendChild(iframeElement);
                containerElement.appendChild(formElement);
                Helper.showById("merchant-iframe-container");
                var securePage = Helper.byId("merchant-iframe");
                var secureForm = Helper.byId("iframe-data-form");
                secureForm.submit();
                securePage.focus();
                App.device.onAppKeyEvent = function (event) {
                    securePage.contentWindow.onAppKeyEvent(event.keyCode)
                };

                function listener(event) {
                    switch (event.data) {
                        case "success":
                        case "close":
                            Helper.hideById("merchant-iframe-container");
                            Helper.removeClass("balance-screen-container", "loader");
                            window.focus();
                            App.device.onAppKeyEvent = function () {
                                return true
                            };
                            Helper.setHtmlForObject(containerElement, "");
                            break
                    }
                }
                if (window.addEventListener) {
                    window.addEventListener("message", listener)
                } else {
                    window.attachEvent("onmessage", listener)
                }
            } else {
                Helper.removeClass("balance-screen-container", "loader");
                App.popupMessageScreen.setMessageText("unknown-create-payment-error");
                App.display.showPopupScreen("popup-message")
            }
            purchaseAmount = 0
        })
    };
    this.pay = function () {
        Helper.addClass("balance-screen-container", "loader");
        var amount = App.data.getMonthlyPayment();
        if (purchaseAmount > 0) {
            amount = purchaseAmount
        } else {
            if (App.data.getCurrentDebtAmount() > 0) {
                amount = App.data.getCurrentDebtAmount()
            }
        }
        var merchantType = App.clientSettings.merchant_type;
        App.data.requestPaymentMerchantUrl({
            amount: amount,
            merchant_type: merchantType
        }, function (error, url) {
            if (error == 0 && url !== -1) {
                App.data.requestSavedCardList({
                    merchant_type: merchantType
                }, function (error) {
                    var cards = App.data.getSavedCardList();
                    if (error == 0 && cards.length > 0) {
                        var cl = cards.length;
                        for (var i = 0; i < cl; i++) {
                            App.popupMenuScreen.addListMenuItem(cards[i]["number"], function (index) {
                                Helper.addClass("balance-screen-container", "loader");
                                App.data.requestPaySavedCard({
                                    merchant_type: merchantType,
                                    amount: amount,
                                    card_id: cards[index]["id"]
                                }, function (error, errorMessage) {
                                    Helper.removeClass("balance-screen-container", "loader");
                                    var s = App.lang.get("unknown-payment-error");
                                    switch (parseInt(error)) {
                                        case 0:
                                            s = App.lang.get("success-payment-msg");
                                            break;
                                        case 2:
                                            s = App.lang.get("INTERNAL_SERVER_ERROR");
                                            break;
                                        case 6:
                                            s = App.lang.get("SUSPECTED_FRAUD");
                                            break;
                                        case 7:
                                            s = App.lang.get("INSUFFICIENT_BALANCE_ERROR");
                                            break;
                                        case 8:
                                            s = App.lang.get("OPERATION_LIMIT_EXCEED");
                                            break;
                                        default:
                                    }
                                    App.popupMessageScreen.setMessageText(s);
                                    App.display.showPopupScreen("popup-message")
                                });
                                App.popupMenuScreen.hide()
                            })
                        }
                        App.popupMenuScreen.addListMenuItem(App.lang.get("label-pay-another-card"), function (index) {
                            App.balanceScreen.payByMerchantUrl(amount, merchantType, url);
                            App.popupMenuScreen.hide()
                        });
                        Helper.removeClass("balance-screen-container", "loader");
                        App.display.showPopupScreen("popup-menu")
                    } else {
                        App.balanceScreen.payByMerchantUrl(amount, merchantType, url)
                    }
                })
            } else {
                Helper.removeClass("balance-screen-container", "loader");
                App.paymentScreen.setAmount(amount);
                App.paymentScreen.setParentScreen("balance");
                App.display.showScreen("payment");
                purchaseAmount = 0
            }
        })
    };
    this.key_red = function () {
        if (Helper.isObjectVisible(offerButtonObj)) {
            var doc = App.data.getLegalDocument(0);
            App.legalDocumentScreen.setParentScreen("balance");
            App.legalDocumentScreen.setDocument(doc);
            App.display.showScreen("legal-document")
        }
    };
    this.key_green = function () {
        if (!Helper.hasClass("balance-screen-container", "loader")) {
            if (isShowOffer) {
                var doc = App.data.getLegalDocument(0);
                if (doc.need_acceptance && !doc.is_accepted) {
                    App.popupMessageScreen.setMessageText(App.lang.get("offer-accept-pay-message"), App.popupMessageScreen.MODE_CHOICE);
                    App.popupMessageScreen.setCallback(function (flag) {
                        if (flag) {
                            App.legalDocumentScreen.acceptDocument(doc.id, function (error, message) {
                                if (error == 0 || error == 2) {
                                    isShowOffer = false;
                                    App.balanceScreen.pay()
                                } else {
                                    App.popupMessageScreen.setMessageText(message);
                                    App.display.showPopupScreen("popup-message")
                                }
                            })
                        }
                    });
                    App.display.showPopupScreen("popup-message")
                } else {
                    App.balanceScreen.pay()
                }
            } else {
                this.pay()
            }
        }
    };
    this.key_yellow = function () {
        if (!Helper.hasClass("balance-screen-container", "loader")) {
            App.historyOfPaymentsScreen.setId("history-of-payments-screen");
            App.display.addScreen(App.historyOfPaymentsScreen, "history-of-payments");
            App.display.showScreen("history-of-payments")
        }
    };
    this.key_back = function () {
        App.display.showScreen("account")
    };
    this.key_enter = function () {
        var tariff = focusedMenu === BASIC_TARIFFS_MENU_ID ? basicTariffs[basicTariffsMenu.getSelectedSourceItem()] : tariffs[tariffsMenu.getSelectedSourceItem()];
        if (tariff.is_assigned) {
            App.popupMessageScreen.setMessageText(App.lang.get("tariff-unsubscribe-question").replace("{{tariff_name}}", tariff.name).replace("{{days}}", App.data.getActivationDaysLeft()), App.popupMessageScreen.MODE_CHOICE);
            App.popupMessageScreen.setCallback(function (yes) {
                if (yes) {
                    App.data.requestCustomerTariffUnsubscribe({
                        tariff_id: tariff.id
                    }, function (error) {
                        if (error == 0) {
                            that.refreshCustomerInfo();
                            App.popupMessageScreen.setMessageText(App.lang.get("tariff-unsubscribe-success").replace("{{tariff_name}}", tariff.name));
                            App.display.showPopupScreen("popup-message")
                        } else {
                            if (error == 2) {
                                App.popupMessageScreen.setMessageText(App.lang.get("tariff-unsubscribe-basic-error"));
                                App.display.showPopupScreen("popup-message")
                            }
                        }
                    })
                }
            });
            App.display.showPopupScreen("popup-message")
        } else {
            App.data.requestCustomerTariffSubscriptionCost({
                tariff_id: tariff.id
            }, function (error, price) {
                if (error == 0) {
                    if (price <= App.data.getBalance()) {
                        var s = "";
                        if (tariff.basic_tariff_priority > 0 && currentBasicTariff) {
                            s = App.lang.get("tariff-basic-subscribe-question").replace("{{tariff_name}}", tariff.name).replace("{{price}}", price).replace("{{basic_tariff_name}}", currentBasicTariff.name).replace("{{currency}}", currencyStr)
                        } else {
                            s = App.lang.get("tariff-subscribe-question").replace("{{tariff_name}}", tariff.name).replace("{{price}}", price).replace("{{currency}}", currencyStr)
                        }
                        App.popupMessageScreen.setMessageText(s, App.popupMessageScreen.MODE_CHOICE);
                        App.popupMessageScreen.setCallback(function (yes) {
                            if (yes) {
                                App.data.requestCustomerTariffSubscribe({
                                    tariff_id: tariff.id
                                }, function (error) {
                                    if (error == 0) {
                                        that.refreshCustomerInfo();
                                        App.popupMessageScreen.setMessageText(App.lang.get("tariff-subscribe-success").replace("{{tariff_name}}", tariff.name));
                                        App.display.showPopupScreen("popup-message")
                                    } else {
                                        App.popupMessageScreen.setMessageText(App.lang.get("tariff-subscription-error") + error);
                                        App.display.showPopupScreen("popup-message")
                                    }
                                })
                            }
                        });
                        App.display.showPopupScreen("popup-message")
                    } else {
                        var amount = price - App.data.getBalance() + 1;
                        var str = App.lang.get("tariff-subscribe-money-deficit").replace("{{amount}}", Math.round(amount)).replace("{{currency}}", currencyStr);
                        var mode = App.popupMessageScreen.MODE_CLOSE;
                        if (App.display.isScreenExist("payment")) {
                            str += App.lang.get("tariff-balance-increase-offer");
                            mode = App.popupMessageScreen.MODE_CHOICE;
                            App.popupMessageScreen.setCallback(function (yes) {
                                if (yes) {
                                    that.setPurchaseAmount(amount);
                                    App.balanceScreen.pay()
                                }
                            })
                        }
                        App.popupMessageScreen.setMessageText(str, mode);
                        App.display.showPopupScreen("popup-message")
                    }
                } else {
                    alert("CustomerTariffSubscriptionCost failed with error " + error)
                }
            })
        }
    };
    this.key_down = function () {
        if (focusedMenu === BASIC_TARIFFS_MENU_ID) {
            if (App.settings.getStyleName() === "impuls_x") {
                basicTariffsMenu.setNextItem()
            } else {
                this.setFocusedMenu(TARIFFS_MENU_ID, basicTariffsMenu.getSelectedColumn())
            }
        } else {
            tariffsMenu.setDownItem()
        }
        this.setTariffDescription()
    };
    this.key_up = function () {
        if (focusedMenu === BASIC_TARIFFS_MENU_ID) {
            if (App.settings.getStyleName() === "impuls_x") {
                basicTariffsMenu.setPreviousItem()
            }
        } else {
            if (tariffsMenu.getSelectedRow() === 0 && tariffsMenu.getCurrentPage() === 0) {
                if (App.settings.getStyleName() !== "impuls_x") {
                    this.setFocusedMenu(BASIC_TARIFFS_MENU_ID, tariffsMenu.getSelectedColumn())
                }
            } else {
                tariffsMenu.setUpItem()
            }
        }
        this.setTariffDescription()
    };
    this.key_left = function () {
        if (focusedMenu === BASIC_TARIFFS_MENU_ID) {
            if (App.settings.getStyleName() !== "impuls_x") {
                basicTariffsMenu.setPreviousItem()
            }
        } else {
            if (App.settings.getStyleName() === "impuls_x") {
                this.setFocusedMenu(BASIC_TARIFFS_MENU_ID)
            } else {
                tariffsMenu.setPreviousItem()
            }
        }
        this.setTariffDescription()
    };
    this.key_right = function () {
        if (focusedMenu === BASIC_TARIFFS_MENU_ID) {
            if (App.settings.getStyleName() === "impuls_x") {
                this.setFocusedMenu(TARIFFS_MENU_ID)
            } else {
                basicTariffsMenu.setNextItem()
            }
        } else {
            if (App.settings.getStyleName() !== "impuls_x") {
                tariffsMenu.setNextItem()
            }
        }
        this.setTariffDescription()
    };
    this.key_menu = function () {
        App.display.showScreen("mainmenu")
    };
    this.key_exit = function () {
        if (!Helper.hasClass("balance-screen-container", "loader")) {
            if (App.player.isActive()) {
                App.display.showScreen("player")
            } else {
                App.display.showScreen("mainmenu")
            }
        }
    };
    this.key_backspace = function () {
        this.key_exit()
    };
    this.key_power = function () {
        App.switchStandBy()
    };
    this.key_long_enter = function () {
        if (App.showHelpButtonPanelFlag) {
            var keys = [];
            keys.push({
                action: "enter",
                label: "label-connect"
            });
            if (Helper.isObjectVisible(offerButtonObj)) {
                keys.push({
                    action: "red",
                    label: "label-offer"
                })
            }
            keys.push({
                action: "green",
                label: "label-payment"
            });
            keys.push({
                action: "yellow",
                label: "label-history-of-payments"
            });
            keys.push({
                action: "back",
                label: "label-back"
            });
            App.popupKeyPanelScreen.setKeysForPanel(keys);
            App.popupKeyPanelScreen.setParentScreen("balance");
            App.display.showPopupScreen("popup-key-panel")
        } else {
            this.key_enter()
        }
    }
}
_BalanceScreen = new BaseScreen();
BalanceScreen.prototype = _BalanceScreen;