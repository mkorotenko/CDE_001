define([
  'jquery',
  'dc/backbone'
], function ($, Backbone) {

    "use strict";

    //=====================BASE VIEWS=====================\\
    var NavBarBase = Backbone.View.extend({
        setNodeName: function () {
            this.elNodeHeader.html(this.nodeHeaderTMP(this.model.attributes));
            return this;
        },
        setNodePeriod: function () {
            this.elNodePeriod.html(this.nodePeriodTMP(this.model.attributes));
            return this;
        },
        free: function() {
            return this;
        },
        render: function () {
            if (!this.elNodeHeader) this.elNodeHeader = $(this.options.nodeHeader);
            if (!this.elNodeHeader.length) this.elNodeHeader = undefined;
            else this.setNodeName();

            return this;
        }
    });

    var ViewFieldBase = Backbone.View.extend({
        initialize: function () { return this; },
        updatePeriod: function () { return this; },
        update: function () { return this; },
        free: function () { return this; },
        resize: function () { return this; },
        render: function () { return this; }
    });

    var PageViewBase = Backbone.View.extend({
        initialize: function () {
            this.navBar = new this.navBarClass({
                el: $(this.navBarId),
                nodeHeader: '#nodeHeader',
                nodePeriod: '#nodePeriod',
                model: this.model
            });
            this.pageBody = new this.pageClass({
                el: $(this.pageBodyId),
                model: this.model
            });
            return this;
        },
        setPageHeader: function (name) {
            this.navBar.setNodeName(name);
        },
        changeAnalytics: function () { return this; },
        changeLevel: function () { return this; },
        updatePeriod: function () { return this; },
        updateDisplay: function () { return this; },
        resize: function () { return this; },
        update: function (response) {
            this.pageBody.update(response);
            return this;
        },
        readFunction: function () {
            return 'levelPage';
        },
        readParameters: function (level, node) {
            return {
                level: level,
                node: node,
                period: this.model.get('period'),
                measure: this.model.get('measure')
            };
        },
        clearPage: function () {
            return this;
        },
        free: function () {
            this.navBar.free();
            this.pageBody.free();
            return this;
        },
        render: function () {
            this.navBar.render();
            this.pageBody.render();
        }
    });

    //DESKTOP
    if (!window.dcMobileMode) {
        //=====================PAGE VIEWS=====================\\
        //---------------------nav bars---------------------\\
        var LevelNavbar = NavBarBase.extend({
            initialize: function () {
                this.nodeHeaderTMP = _.template($('#navbar_nodeName_template').html());
                this.nodePeriodTMP = _.template($('#navbar_nodePeriod_template').html());
                return this;
            },
            render: function () {
                this.$el.html($("#level_navbar_template").html());
                LevelNavbar.__super__.render.apply(this, arguments);
                this.elNodePeriod = $(this.options.nodePeriod);
                this.setNodePeriod();
                $('#switch_left').on("click", function () {
                    app.set({ period: ($('#switch_right').prop('checked') === true ? 'Year' : 'Week') });
                });
                $('#switch_right').on("click", function () {
                    app.set({ period: ($('#switch_right').prop('checked') === true ? 'Year' : 'Week') });
                });

                return this;
            }
        });

        var UnitNavbar = NavBarBase.extend({
            initialize: function () {
                this.nodeHeaderTMP = _.template($('#navbar_nodeName_template').html());
                this.nodePeriodTMP = _.template($('#navbar_nodePeriod_template').html());
                return this;
            },
            render: function () {
                this.$el.html($("#level_navbar_template").html());
                UnitNavbar.__super__.render.apply(this, arguments);
                this.elNodePeriod = $(this.options.nodePeriod);
                this.setNodePeriod();
                $('#switch_left').on("click", function () {
                    app.set({ period: ($('#switch_right').prop('checked') === true ? 'Year' : 'Week') });
                });
                $('#switch_right').on("click", function () {
                    app.set({ period: ($('#switch_right').prop('checked') === true ? 'Year' : 'Week') });
                });

                return this;
            }
        });

        //---------------------page body views---------------------\\
        var LevelViewField = ViewFieldBase.extend({
            updateBranchList: function () {
                var success = function (response) {
                    app.busy(false, "#branches-container");
                    app.set('measure', response.measure);
                    if (response.success) {
                        this.branchList = response.branchList;
                        $("#branches-view").html(this.branchTemplate(response));
                    }
                    else if (response.redirectURL) {
                        app.goToPage(response);
                    }
                    else {
                        $("#branches-view").html('');
                    }
                }.bind(this);
                var error = function () {
                    this.busy(false);
                    $("#branches-view").html('');
                    this.showError('500 - Internal server error.');
                }.bind(this);
                var options = {
                    level: app.get('level'),
                    node: app.get('node'),
                    period: app.get('period'),
                    measure: app.get('measure')
                };

                app.busy(true, "#branches-container");
                app.sendQuery('branchList', options).then(success).fail(error);
            },
            updatePeriod: function() {
                $("#branches-view").html(this.branchTemplate({
                    'period': app.get('period'),
                    'branchList': this.branchList
                }));
                $('#node-view').html(this.totalsTemplate({
                    'period': app.get('period'),
                    'totalList': this.totalList
                }));
                this.changeAnalytics();
            },
            changeAnalytics: function () {
                $('.node-total', '#node-view').removeClass('analytics-selected');
                $('[data-analytics="' + app.get('measure') + '"]', '#node-view').addClass('analytics-selected');
                return this;
            },
            update: function (response) {

                this.branchList = response.branchList;
                this.totalList = response.totalList;
                this.updatePeriod();

                return this;
            },
            initialize: function () {
                LevelViewField.__super__.initialize.apply(this, arguments);
                this.totalsTemplate = _.template($('#total_list_template').html());
                this.branchTemplate = _.template($('#branch_list_template').html());
                $('#page-container').off("click", "div.node-total");
                $('#page-container').on("click", "div.node-total", function (event) {
                    app.set({ 'measure': $(event.currentTarget).attr('data-analytics') });
                    this.updateBranchList();
                }.bind(this));
            },
            free: function () {
                $('#page-container').off("click", "div.node-total");
            },
            render: function () {

                this.$el.html('');
                this.$el.append($("#total_container_template").html());
                this.$el.append($("#branch_container_template").html());

            }
        });

        var UnitViewField = ViewFieldBase.extend({
            chartData: [],
            totalList: [],
            selectedAnalytics: {},
            changeChartData: function (data) {
                var chartData = data.chart || [],
                    shift = 0,
                    catName = '';
                $.each(chartData, function (index, node) {
                    catName = this.categoryMap['map_' + node.category];
                    if (!catName) return;
                    shift = node.shift || 0;
                    if (!this.chartData[shift]) this.chartData[shift] = { shift: shift };
                    this.chartData[shift][catName] = node.amount || 0;
                    this.chartData[shift][catName + 'ly'] = node.amountLY || 0;
                    this.chartData[shift][catName + 'lw'] = node.amountLW || 0;
                }.bind(this));
                this.updateChart();
            },
            dxModuleLoaded: false,
            updateChart: function () {
                var selectedAnalytics = this.selectedAnalytics = {};
                var catColors = {
                    cat0: '#f06292',
                    cat1: '#ba68c8',
                    cat2: '#7e57c2',
                    cat3: '#1565c0',
                    cat4: '#039be5',
                    cat5: '#00acc1',
                    cat6: '#43a047',
                    cat7: '#fbc02d',
                    cat8: '#ff8f00',
                    cat9: '#4cd5a7',
                    cat10: '#d3b735'
                };
                var categories = $('input.category-select:checked', '#unit_categories').map(function () {
                    var val = $(this).val();
                    selectedAnalytics[val.replace('cat', '')] = true;
                    return {
                        val: val,
                        color: catColors[val] || 'black'
                    }
                }).get();
                var chartOptions = $.extend(true, {}, this.chartOptions),
                    period = app.get('period') === 'Week' ? 'lw' : 'ly';
                chartOptions.dataSource = this.chartData;
                chartOptions.series = [];
                $.each(categories, function (index, node) {
                    chartOptions.series.push({
                        argumentField: "shift",
                        valueField: node.val,
                        type: "spline",
                        color: node.color
                    });
                    chartOptions.series.push({
                        argumentField: "shift",
                        valueField: node.val + period,
                        type: "spline",
                        dashStyle: 'dash',
                        color: node.color
                    });
                });
                requirejs(['dx/dx.all'],
                    function () {
                        $("#chart").dxChart("instance").option(chartOptions);
                        //$("#chart").dxChart("instance").zoomArgument(300, 500);
                    }.bind(this),
                    function (error) {
                        console.log('REQUIREjs ERROR in module dx.all');
                        console.log(arguments);
                    }
                );
            },
            categoryMap: {},
            chartOptions: {
                dataSource: [],
                size: {
                    height: 580
                },
                legend: {
                    visible: false
                },
                commonPaneSettings: {
                    border: {
                        visible: false
                    }
                },
                tooltip: {
                    enabled: true,
                    customizeTooltip: function (arg) {
                        return {
                            text: '$' + arg.valueText
                        };
                    }
                },
                scrollBar: {
                    visible: false
                },
                scrollingMode: "all",
                zoomingMode: "all",
                valueAxis: {
                    valueType: "numeric",
                    label: {
                        customizeText: function () {
                            return '$' + this.valueText;
                        }
                    }
                },
                argumentAxis: {
                    type: "discrete",
                    grid: {
                        visible: false
                    }
                },
                animation: { enabled: false }
            },
            updatePeriod: function () {
                $("#unit_categories").html(this.totalsTemplate({
                    level: app.get('level'),
                    node: app.get('node'),
                    period: app.get('period'),
                    selected: this.selectedAnalytics,
                    totalList: this.totalList || []
                }));
                this.updateChart();
            },
            update: function (response) {

                this.selectedAnalytics = { '0': true };
                this.totalList = response.totalList;
                //$("#unit_categories").html(this.totalsTemplate(response));
                this.updatePeriod();

                if (!this.dxModuleLoaded) app.busy(true, "#chart");

                var map = this.categoryMap = {},
                    data = this.chartData = [],
                    node = null, rColor = '', catName = '', i = 0;

                $('input.category-select', '#unit_categories').each(function () {
                    node = $(this);
                    catName = node.val();
                    map['map_' + node.attr('data-bind')] = catName;
                    for (i = 0; i < 24; i++) {
                        if (!data[i]) data[i] = { shift: i };
                        data[i][catName] = 0;
                        data[i][catName + 'ly'] = 0;
                        data[i][catName + 'lw'] = 0;
                    };
                });

                if (response.chartData) this.changeChartData(response.chartData);
                else this.changeChartData([]);

                return this;
            },
            initialize: function () {
                this.totalsTemplate = _.template($('#analytics_list_template').html());
                return this;
            },
            render: function () {

                this.$el.html('');
                this.$el.append($("#unit_analytics_template").html());
                this.$el.append($("#unit_chart_template").html());

                if (!this.dxModuleLoaded) app.busy(true, "#chart");
                requirejs(['dx/dx.all'], function () {
                    this.dxModuleLoaded = true;
                    app.busy(false, "#chart");
                    $("#chart").dxChart(this.chartOptions);//.zoomArgument(300, 500);
                }.bind(this), function () {
                    this.dxModuleLoaded = true;
                    app.busy(false, "#chart");
                });
                $('#unit_categories').on("click", "input.category-select", function (event) {
                    this.updateChart();
                }.bind(this));

                return this;
            }
        });

        var ErrorViewField = ViewFieldBase.extend({
            update: function (response) {
                this.$el.html('Erro 404.<br>The requested URL was not found on this server.');
                return this;
            },
            initialize: function () {
                return this;
            },
            render: function () {
                this.$el.html('Erro 404.<br>The requested URL was not found on this server.');
                return this;
            }
        });

        //---------------------pages---------------------\\
        var PageLevelClass = PageViewBase.extend({
            navBarClass: LevelNavbar,
            pageClass: LevelViewField,
            navBarId: '#main-navbar',
            pageBodyId: '#page-container',
            changeAnalytics: function (measure) {
                this.pageBody.changeAnalytics(measure);
                return this;
            },
            clearPage: function () {
                $("#node-view").html('');
                $("#branches-view").html('');
                return this;
            },
            updatePeriod: function () {
                this.pageBody.updatePeriod();
                return this;
            }
        });

        var PageUnitClass = PageViewBase.extend({
            navBarClass: UnitNavbar,
            pageClass: UnitViewField,
            navBarId: '#main-navbar',
            pageBodyId: '#page-container',
            updatePeriod: function () {
                this.pageBody.updatePeriod();
                return this;
            },
            readFunction: function () {
                return 'unitTotals';
            },
            readParameters: function (level, node, measure) {
                var options = {
                    level: level,
                    node: node,
                    period: this.model.get('period')
                };

                if (measure) options['measure'] = measure;

                return options;
            }
        });

        var PageErrorClass = PageViewBase.extend({
            navBarClass: LevelNavbar,
            pageClass: ErrorViewField,
            navBarId: '#main-navbar',
            pageBodyId: '#page-container',
        });
    }
    //MOBILE
    else {
        //=====================PAGE VIEWS=====================\\
        //---------------------nav bars---------------------\\
        var MobileLevelNavbar = NavBarBase.extend({
            initialize: function () {
                this.nodeHeaderTMP = _.template($('#mobile_LEVEL_nodeName_template').html());
                return this;
            },
            setNodePeriod: function() { return this; },
            render: function () {
                this.$el.html($('#mobile_navbar_template').html());
                MobileLevelNavbar.__super__.render.apply(this, arguments);
                return this;
            }
        });

        var MobileUnitNavbar = NavBarBase.extend({
            initialize: function () {
                this.nodeHeaderTMP = _.template($('#mobile_UNIT_nodeName_template').html());
                $('#main-navbar').off("click", "div.switch-field label");
                $('#main-navbar').on("click", "div.switch-field label", function (event) {
                    app.set({ 'display': $('#' + $(event.currentTarget).attr('for'), 'div.switch-field').val() });
                }.bind(this));
                return this;
            },
            free: function () {
                $('#main-navbar').off("click", "div.switch-field label");
            },
            setNodePeriod: function () { return this; },
            render: function () {
                this.$el.html($('#mobile_navbar_template').html());
                MobileUnitNavbar.__super__.render.apply(this, arguments);
                return this;
            }
        });

        //---------------------page body views---------------------\\
        var MobileLevelViewField = ViewFieldBase.extend({
            updateBranchList: function () {
                $('#branches-container').html(this.branchTemplate({
                    period: app.get('period'),
                    level: app.get('level'),
                    node: app.get('node'),
                    branchList: this.branchList,
                    totalList: this.totalList,
                }));
                return this;
            },
            update: function (response) {
                this.branchList = response.branchList;
                this.totalList = [];
                this.updateBranchList();
                var measure = app.get('measure');
                $.each(response.totalList, function () {
                    if (this.Name === measure) {
                        app.set({
                            'contrastView': this.PercentWeekView,
                            'contrastSign': this.PercentWeekSign
                        });
                        return false;
                    }
                });

                return this;
            },
            initialize: function () {
                MobileLevelViewField.__super__.initialize.apply(this, arguments);
                this.branchTemplate = _.template($('#mobile_branch_list_template').html());
            },
            render: function () {
                this.$el.html('');
                this.$el.append($("#mobile_branch_container_template").html());
            }
        });

        var MobileUnitViewField = MobileLevelViewField.extend({
            dxModuleReady: false,
            resize: function () {
               if (this.model.get('display') === 'Chart') this.updateChart();
               return this;
            },
            updateChart: function () {
                if (this.model.get('display') !== 'Chart') return;

                $('#branches-container').html(this.chartTemplate());
                if (this.dxModuleReady) {
                    var chartOptions = {
                        dataSource: [],
                        legend: { visible: false },
                        commonPaneSettings: { border: { visible: false } },
                        tooltip: {
                            enabled: true,
                            customizeTooltip: function (arg) {
                                return { text: '$' + arg.valueText };
                            }
                        },
                        scrollBar: { visible: false },
                        scrollingMode: "all",
                        zoomingMode: "all",
                        valueAxis: {
                            valueType: "numeric",
                            label: {
                                customizeText: function () { return '$' + this.valueText; }
                            }
                        },
                        argumentAxis: {
                            type: "discrete",
                            grid: { visible: true }
                        },
                        animation: { enabled: false }
                    };
                    var catColors = {
                        cat0: '#2a9b9b',
                        cat1: '#ffdf45',
                        cat2: '#ff6645',
                        cat3: '#85d385',
                        cat4: '#6d3aae',
                        cat5: '#89e43e',
                        cat6: '#e8e945',
                        cat7: '#cd388c',
                        cat8: '#7d3fe5',
                        cat9: '#4cd5a7',
                        cat10: '#d3b735'
                    };
                    var getChartSource = function(categories) {
                        var source = [],
                            shift;
                        var chartData = this.chartData,
                            map = this.categoryMap;
                        for (var i = 0; i < 24; i++) {
                            shift = source[i] = { shift: i };
                            $.each(categories, function () {
                                var totals = (chartData[map[this]] || [])[i] || {};
                                shift[this] = totals.amount || 0;
                                shift[this + 'lw'] = totals.amountLW || 0;
                                shift[this + 'ly'] = totals.amountLY || 0;
                            })
                        }
                        return source;
                    }.bind(this);
                    chartOptions.dataSource = getChartSource(this.selectedCategory);
                    chartOptions.series = [];
                    chartOptions.size = { height: $('#branches-container').css('height').replace('px', '') };
                    $.each(this.selectedCategory, function (index, category) {
                        chartOptions.series.push({
                            argumentField: "shift",
                            valueField: category,
                            type: "spline",
                            color: catColors[category] || 'black'
                        });
                        chartOptions.series.push({
                            argumentField: "shift",
                            valueField: category + (app.get('period') === 'Week' ? 'lw' : 'ly'),
                            type: "spline",
                            dashStyle: 'dash',
                            color: catColors[category] || 'black'
                        });
                    });
                    $("#chart").dxChart(chartOptions);
                };
                return this;
            },
            updateDisplay: function () {
                if (this.model.get('display') === 'List') {
                    this.updateBranchList();
                }
                else {
                    this.updateChart();
                };
            },
            chartData: {},
            categoryMap: {},
            selectedCategory: [],
            selectMeasure: function () {
                var measure = this.model.get('measure'),
                    selected = this.selectedCategory = [];
                $.each(this.categoryMap, function (assign, category) {
                    if (category === measure) {
                        selected.push(assign);
                        return false;
                    }
                });
            },
            updateBranchList: function () {
                $('#branches-container').html(this.branchTemplate({
                    period: app.get('period'),
                    level: app.get('level'),
                    node: app.get('node'),
                    measure: app.get('measure'),
                    branchList: this.branchList,
                    totalList: this.totalList,
                }));
                return this;
            },
            update: function (response) {

                var catNames = {
                    'Gross': 'Gross Revenue',
                    'Net': 'Net Revenue',
                    'Discount': 'Discounts',
                    'Hours': 'Labor Hours', 
                    'Cost': 'Labor Cost'
                };
                var prepareChartTable = function (chartData) {
                    var table = this.chartData = {};
                    $.each(chartData, function () {
                        var cat = catNames[this.category] || this.category;
                        var shifts = table[cat];
                        if (!shifts) shifts = table[cat] = [];
                        shifts[this.shift] = {
                            amount: this.amount,
                            amountLY: this.amountLY,
                            amountLW: this.amountLW
                        };
                    });
                }.bind(this);
                var prepareCategoryMap = function () {
                    var index = 0;
                    var categoryMap = this.categoryMap = {};
                    $.each(this.chartData, function (category) {
                        categoryMap['cat' + index] = catNames[category] || category;
                        index++;
                    });
                }.bind(this);
                var getShiftsTable = function () {
                    var table = [];
                    var getshiftView = function (shift) {
                        if (shift > 12) return (shift - 12) + ':00 PM';
                        else return shift + ':00 AM';
                    };
                    var getAmountView = function (value) {
                        if (value == 0) return '$0.0';
                        var _amountView;
                        var _amount = value;
                        if (_amount >= 1000000) {
                            var amount = _amount / 1000000;
                            if (amount < 100) {
                                _amountView = amount.toFixed(1) + "M";
                            }
                            else {
                                _amountView = amount.toFixed(0) + "M";
                            }
                        }
                        else if (_amount >= 1000) {
                            var amount = _amount / 1000;
                            if (amount < 100) {
                                _amountView = (_amount / 1000).toFixed(1) + "K";
                            }
                            else {
                                _amountView = (_amount / 1000).toFixed(0) + "K";
                            }
                        }
                        else {
                            if (_amount < 100) {
                                _amountView = _amount.toFixed(1);
                            }
                            else {
                                _amountView = _amount.toFixed(0);
                            }
                        };
                        return '$' + _amountView;
                    };
                    var getPercentView = function (amount, amountL) {
                        if (amountL == 0) return '0';
                        return ((amount > amountL) ? '+' : '-') + (100*((amount - amountL)/amountL)).toFixed(0);
                    };
                    var getPercentSign = function (amount, amountL) {
                        return (amount >= amountL) ? 'positive' : 'negative';
                    };
                    $.each(this.chartData, function (category, shifts) {
                        $.each(shifts, function (index, item) {
                            if (!item) item = {};
                            table.push({
                                AmountView: getAmountView(item.amount || 0),
                                measure: category,
                                Name: getshiftView(index),
                                PercentWeekSign: getPercentSign(item.amount || 0, item.amountLW || 0),
                                PercentWeekView: getPercentView(item.amount || 0, item.amountLW || 0),
                                PercentYearSign: getPercentSign(item.amount || 0, item.amountLY || 0),
                                PercentYearView: getPercentView(item.amount || 0, item.amountLY || 0),
                                hasDetails:false
                            });
                        });
                    });
                    return table;
                }.bind(this);

                this.branchList = [];

                prepareChartTable(response.chartData.chart);
                prepareCategoryMap();
                this.totalList = getShiftsTable();

                this.selectMeasure();
                this.updateDisplay();

                return this;
            },
            free: function() {
                MobileUnitViewField.__super__.free.apply(this, arguments);
                this.model.off('change:display');
                return this;
            },
            initialize: function () {
                MobileUnitViewField.__super__.initialize.apply(this, arguments);
                this.chartTemplate = _.template($('#mobile_chart_template').html());
                requirejs(['dx/dx.all'], function () {
                    this.dxModuleReady = true;
                }.bind(this), function () {
                    this.dxModuleReady = false;
                });
            }
        });
        //---------------------pages---------------------\\
        var PageMobileLevelClass = PageViewBase.extend({
            navBarClass: MobileLevelNavbar,
            pageClass: MobileLevelViewField,
            navBarId: '#main-navbar',
            pageBodyId: '#page-container',
            changeAnalytics: function () {
                var success = function (response) {
                    app.busy(false, "#branches-container");
                    app.set('measure', response.measure, { silent: true });
                    if (response.success) {
                        response['level'] = app.get('level');
                        response['node'] = app.get('node');
                        response['totalList'] = [];
                        this.pageBody.update(response);
                    }
                    else if (response.redirectURL) {
                        app.goToPage(response);
                    }
                    else {
                        this.branchList = [];
                        this.totalList = [];
                        this.pageBody.updateBranchList();
                    }
                }.bind(this);
                var error = function () {
                    this.busy(false);
                    this.branchList = [];
                    this.totalList = [];
                    this.pageBody.updateBranchList();
                    this.showError('500 - Internal server error.');
                }.bind(this);
                var options = {
                    level: app.get('level'),
                    node: app.get('node'),
                    period: app.get('period'),
                    measure: app.get('measure')
                };

                app.busy(true, "#branches-container");
                app.sendQuery('branchList', options).then(success).fail(error);
                return this;
            },
            updatePeriod: function () {
                this.pageBody.updateBranchList();
                return this;
            },
            updateMenu: function () {
                $('#menupanel').html(this.panelTemplate(this.model.attributes));
                return this;
            },
            initialize: function () {
                PageMobileLevelClass.__super__.initialize.apply(this, arguments);
                this.panelTemplate = _.template($('#mobile_menupanel_template').html());
            },
            render: function () {
                PageMobileLevelClass.__super__.render.apply(this, arguments);
                $('#main-navbar').addClass('mobile');
                $('#page-container').addClass('mobile');
                $('#page-container').append($("#mobile_panelcontainer_template").html());
                $("#menupanel").panel();
                $('#nodeHeader').on('click', '.navbar-toggle', function () {
                    $('#menupanel').panel('open');
                });
                $('#menupanel').on('click', '.switch-field [name="Measure"]', function () {
                    app.set('measure', $(this).val());
                });
                $('#menupanel').on('click', '.switch-field [name="PeriodType"]', function () {
                    app.set('period', $(this).val());
                });
                $('#menupanel').on('click', '.switch-field [name="DisplayType"]', function () {
                    app.set('display', $(this).val());
                });
            },
            update: function () {
                PageMobileLevelClass.__super__.update.apply(this, arguments);
                this.setPageHeader();
                this.updateMenu();
                return this;
            }
        });

        var PageMobileUnitClass = PageMobileLevelClass.extend({
            navBarClass: MobileLevelNavbar,
            pageClass: MobileUnitViewField,
            navBarId: '#main-navbar',
            pageBodyId: '#page-container',
            resize: function () {
                this.pageBody.resize();
                return this;
            },
            readFunction: function () {
                return 'unitTotals';
            },
            readParameters: function (level, node, measure) {
                var options = {
                    level: level,
                    node: node,
                    period: this.model.get('period')
                };

                if (measure) options['measure'] = measure;

                return options;
            },
            updatePeriod: function () {
                this.pageBody.updateDisplay();
                return this;
            },
            updateDisplay: function () {
                this.pageBody.updateDisplay();
                return this;
            },
            changeAnalytics: function () {
                this.pageBody.selectMeasure();
                this.pageBody.updateDisplay();
                return this;
            }
        });
    }

    //=====================APPLICATION MODEL=====================\\
    var Application = Backbone.Model.extend({
        initialize: function () {
            this.elSpinner = $('#loader_spinner').html();
            this.spinnerSelector = '.blanket-spinner';

            this.on('change:period', function (model, value) {
                this.pageEntity.updatePeriod();
            }, this);
            this.on('change:display', function (model, value) {
                this.pageEntity.updateDisplay();
            }, this);
            this.on('change:node', function (model, value) {
                this.pageEntity.setPageHeader();
            }, this);
            this.on('change:measure', function (model, value) {
                this.pageEntity.changeAnalytics(value);
            }, this)
            this.on('change:nodeLevel', function (model, value) {
                if (!value) return;

                var lcValue = value.toLowerCase();
                if (lcValue === 'u') this.set('pageType', 'unit');
                else if (lcValue === 'error') this.set('pageType', 'error');
                else this.set('pageType', 'level');

                this.pageEntity.changeLevel(value);

                //this.set('listName', levelNames[value.toLowerCase()] || 'Unknown');
            }, this);
            this.on('change:pageType', function (model, value) {
                if (this.pageEntity) this.pageEntity.free();
                if (!window.dcMobileMode) {
                    if (value === 'level') this.pageEntity = new PageLevelClass({ model: this });
                    else if (value === 'unit') this.pageEntity = new PageUnitClass({ model: this });
                    else this.pageEntity = new PageErrorClass({ model: this });
                }
                else {
                    if (value === 'level') this.pageEntity = new PageMobileLevelClass({ model: this });
                    else if (value === 'unit') this.pageEntity = new PageMobileUnitClass({ model: this });
                }
                this.pageEntity.render();
            }, this);
            $(window).resize(function () {
                this.pageEntity.resize();
            }.bind(this));
        },
        requestData: function (level, node, measure) {

            this.busy(false);
            this.busy(true, "#page-container");

            var options = this.pageEntity.readParameters(level, node, measure),
                query = this.pageEntity.readFunction();

            var success = function (response) {
                this.busy(false);
                if (response.success) {
                    this.set({
                        parentLevel: response.parentLevel,
                        parentName: response.parentName,
                        level: response.level,
                        node: response.node,
                        measure: response.measure || 'Gross Revenue'
                    });
                    this.pageEntity.update(response);
                }
                else if (response.redirectURL) {
                    this.busy(true, "#page-container");
                    this.goToPage(response);
                }
                else {
                    this.set({
                        parentLevel: this.get("level"),
                        parentName: this.get("node"),
                        level: newLevel,
                        node: newNode
                    });
                    this.pageEntity.clearPage();
                }
            }.bind(this),
                error = function () {
                    this.busy(false);
                    this.pageEntity.clearPage();
                    this.showError('500 - Internal server error.');
                }.bind(this);

            this.sendQuery(query, options).then(success).fail(error);
        },
        sendQuery: function (query, options) {
            var success, error;
            var getRequestURL = function (func, options) {
                return 'now/' + func + '?' + $.map(options, function (value, variable) { return variable + '=' + value }).join('&');//'level=' + level + '&node=' + node + '&period=' + period + '&measure=' + measure;
            }.bind(this);

            return $.ajax({
                type: "GET", cache: true,
                url: getRequestURL(query, options)
            });
        },
        goToPage: function (response) {
            window.location = response.redirectURL;
        },
        showPage404: function () {
            this.busy(false);
            this.set({ nodeLevel: 'error' });
            this.pageEntity.render();
            this.set({
                parentLevel: this.get("level"),
                parentName: this.get("node"),
                level: 'error',
                node: 'Error 404'
            });
            return this;
        },
        showPage: function (level, node, measure) {
            if (!level || !node) {
                this.showPage404();
                return;
            };

            this.set({ nodeLevel: level });
            this.requestData(level, node, measure);
        },
        busy: function (busy, container) {
            if (busy) {
                if (!$(this.spinnerSelector, container).length) $(container).append(this.elSpinner);
            }
            else $(this.spinnerSelector, container).remove();
            return this;
        },
        showError: function (error) {
            $('#error-alert').fadeIn(600);
            $('#page-container').append('<div class="alert alert-danger" id="error-alert" role="alert" style="margin: 20px;position: fixed;top: 60 px;width: 300px;">' +
              '<a href="#" class="alert-link">'+error+'</a>' +
            '</div>');
            setTimeout(function () {
                $('#error-alert').fadeOut(800);
            }, 3000);
        }
    });

    //application instance
    var app = new Application();
    app.set({
        period: 'Week',
        parentLevel: '',
        parentName: '',
        node: '',
        nodeLevel: '',
        measure: 'Gross Revenue',
        display: 'List',
        listName: '',
        contrastView: '',
        contrastSign: '',
        mobileMode: window.dcMobileMode
    }, { silent: true });

    return app;

});
