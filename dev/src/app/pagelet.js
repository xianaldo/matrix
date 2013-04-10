/**
 * @class MX.app.Pagelet
 * @alias pagelet
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    var paramNameRe = /(:|\*)\w+/g; // 匹配URL中的参数名
    
    X.app.Pagelet = Klass.define({
        // private
        alias: 'pagelet',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} singleton true单例，默认false
         */
        singleton: false,
        
        /**
         * @cfg {Boolean} noCache true缓存pagelet实例，false当退出页面时立即销毁pagelet，默认false
         */
        noCache: false,
        
        /**
         * @cfg {String} hash pagelet绑定的hash
         */
        
        /**
         * @cfg {String/View} view 绑定View
         */
        
        /**
         * @cfg {String/Controller} controller 绑定Controller
         */
        
        /**
         * @cfg {Array/Model} models 绑定model，允许绑定多个model
         */
        
        /**
         * @cfg {Array/Store} stores 绑定store，允许绑定多个store
         */
        
        /**
         * @cfg {String} cls 添加到el元素上的扩展CSS样式
         */
        
        // private
        init: function() {
            // 匹配URL中包含的参数名
            this.urlParamNames = this.url.match(paramNameRe);
            
            // 解析URL中包含的参数值
            this.parseParams();

            // 这里必须严格按照这个初始化顺序
            this.initTransition();
            this.initView();
            this.initModels();
            this.initStores();
            this.initController();
        },

        // private
        initTransition: function() {
            this.transition = this.transition || '';
            if (X.isString(this.transition)) {
                this.transition = {
                    in: this.transition,
                    out: ''
                }
            }
            if (X.isString(this.transition.in)) {
                this.transition.in = {
                    effect: this.transition.in
                }
            }
            if (X.isString(this.transition.out)) {
                this.transition.out = {
                    effect: this.transition.out
                }
            }
        },

        // private
        initModels: function() {
            this.models = this.models || {};
            X.each(this.models, function(i, model) {
                model.params = this.params;
                if (model.bindTo === 'header' && this.view.headerTmpl) {
                    this.view.headerTmpl.bindStore(model);
                } else if (model.bindTo === 'footer' && this.view.footerTmpl) {
                    this.view.footerTmpl.bindStore(model);
                } else if (model.bindTo === 'body' && this.view.bodyTmpl) {
                    this.view.bodyTmpl.bindStore(model);
                }
            }, this);
        },

        // private
        initStores: function() {
            this.stores = this.stores || {};
            X.each(this.stores, function(i, store) {
                store.params = this.params;
                if (store.bindTo === 'header' && this.view.headerTmpl) {
                    this.view.headerTmpl.bindStore(store);
                } else if (store.bindTo === 'footer' && this.view.footerTmpl) {
                    this.view.footerTmpl.bindStore(store);
                } else if (store.bindTo === 'body' && this.view.bodyTmpl) {
                    this.view.bodyTmpl.bindStore(store);
                }
            }, this);
        },

        // private
        // 将hash中包含的参数解析出来
        parseParams: function() {
            var values = this.urlRe.exec(this.hash).slice(1),
                params = {};
            
            X.each(this.urlParamNames, function(i, param) {
                params[param.substr(1)] = values[i];
            }, this);
            
            this.params = params;
            return params;
        },
        
        // private
        initEvent: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 */
                'beforerender',
                /**
                 * @event render
                 */
                'render'
            );
        },
        
        // private
        initView: function() {
            this.view = X.create(this.view || 'view', {
                params: this.params
            });
            this.mon(this.view, 'render', this.onViewRender);
        },
        
        // private
        initController: function() {
            this.controller = X.create(this.controller || 'controller', {
                view: this.view,
                models: this.models,
                stores: this.stores,
                params: this.params
            });
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;
                
                this.container = container = $(container);
                
                this.el = $(document.createElement('div'));
                this.el.attr('id', 'mx-app-page-' + this.id)
                       .attr('data-' + $.mobile.ns + 'role', 'page')
                       .attr('data-' + $.mobile.ns + 'url', '#/' + this.hash);
                if (this.cls) {
                    this.el.addClass(this.cls);
                }
                container.append(this.el);
                
                if (this.view) {
                    this.view.render(this.el);
                }
                
                this.mon(this.el, {
                    'pagebeforeshow': this.beforePageShow,
                    'pageshow': this.onPageShow,
                    'pagebeforehide': this.beforePageHide,
                    'pagehide': this.onPageHide
                });
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,

        // private
        onViewRender: function() {
            if (this.controller) {
                this.controller.onViewRender();
            }
        },
        
        // private
        beforePageShow: function() {
            if (this.controller) {
                this.controller.beforePageShow();
                this.controller.fireEvent('pagebeforeshow', this.controller);
            }
        },
        
        // private
        onPageShow: function() {
            this.loadModelOrStore(this.models);
            this.loadModelOrStore(this.stores);
            if (this.controller) {
                this.controller.onPageShow();
                this.controller.fireEvent('pageshow', this.controller);
            }
        },
        
        // private
        beforePageHide: function() {
            this.cancelFetch();
            if (this.controller) {
                this.controller.beforePageHide();
                this.controller.fireEvent('pagebeforehide', this.controller);
            }
        },
        
        // private
        onPageHide: function() {
            if (this.controller) {
                this.controller.onPageHide();
                this.controller.fireEvent('pagehide', this.controller);
            }
        },
        
        // private
        // 取消所有model、store的AJAX fetch动作
        cancelFetch: function() {
            X.each(this.models, function(id, model) {
                model.cancelFetch();
            }, this);
            X.each(this.stores, function(id, store) {
                store.cancelFetch();
            }, this);
        },

        // private
        loadModelOrStore: function(objects) {
            X.each(objects, function(i, obj) {
                if (obj.autoLoad === true) {
                    obj.load();
                }
            }, this);
        },
        
        /**
         * 获得view对象
         */
        getView: function() {
            return this.view;
        },
        
        /**
         * 获得controller对象
         */
        getController: function() {
            return this.controller;
        },
        
        // private
        onDestroy: function() {
            if (this.models && X.isObject(this.models)) {
                X.each(this.models, function(i, model) {
                    model.destroy();
                });
            }
            if (this.stores && X.isObject(this.stores)) {
                X.each(this.stores, function(i, store) {
                    store.destroy();
                });
            }
            if (this.controller) {
                this.controller.destroy();
                this.controller = null;
            }
            if (this.view) {
                this.view.destroy();
                this.view = null;
            }
            if (this.el) {
                this.el.remove();
                this.el = null;
            }
            this.container = null;
        }
    });
});