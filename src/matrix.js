/**
 * @class MX
 */
window.MX = {};

(function(X, $, artTemplate) {
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        navigator = window.navigator,
        userAgent = navigator.userAgent,
        android = userAgent.match(/(Android)[\s\/]+([\d\.]+)/),
        ios = userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/),
        wp = userAgent.match(/(Windows\s+Phone)\s([\d\.]+)/),
        isWebkit = /WebKit\/[\d.]+/i.test(userAgent),
        isSafari = ios ? (navigator.standalone ? isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false,
        os = {};

    /**
     * The version of the framework
     */
    X.version = '{@VERSION}';

    /**
     * 声明命名空间，用法如下：
     *
     * <code>
     *  MX.namespace('NS.core', 'NS.util');
     *
     *  alert(typeof NS.core); // alert 'object'
     *
     *  alert(typeof NS.util); // alert 'object'
     *
     *  //有了命名空间之后，就可以直接在命名空间下声明类
     *  NS.util.Format = {
     *
     *      // ...
     *
     *  };
     * </code>
     *
     * @param {String} namespace1
     * @param {String...} namespace2...n
     */
    X.namespace = function() {
        var len1 = arguments.length,
            i = 0,
            len2,
            j,
            main,
            ns,
            sub,
            current;

        for(; i < len1; ++i) {
            main = arguments[i];
            ns = arguments[i].split('.');
            current = window[ns[0]];
            if (current === undefined) {
                current = window[ns[0]] = {};
            }
            sub = ns.slice(1);
            len2 = sub.length;
            for(j = 0; j < len2; ++j) {
                current = current[sub[j]] = current[sub[j]] || {};
            }
        }
        return current;
    };

    /**
     * 命名空间函数的缩写方法名
     * @param {String} namespace1
     * @param {String...} namespace2...n
     */
    X.ns = X.namespace;
    X.ns('MX.lib', 'MX.klass', 'MX.lib', 'MX.util', 'MX.app');

    $.extend(X.lib, {
        jQuery: $,
        artTemplate: artTemplate
    });

    // 重写artTemplate代码标签的（开口/闭合）标签符号，默认的标签为'<%'和'%>'，%太通用了，很容易与其他技术的页面标签冲突，如JSP等
    if (artTemplate) {
        artTemplate.openTag = '<#';
        artTemplate.closeTag = '#>';
        artTemplate.isEscape = false; // 默认让模版输出HTML标签
    }

    $.extend(X, {
        /**
         * A reusable empty function
         */
        emptyFn: $.noop,

        /**
         * Returns true if the passed value is defined.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },

        /**
         * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },

        /**
         * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
         *
         * - `null`
         * - `undefined`
         * - a zero-length array
         * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
         *
         * @param {Object} value The value to test
         * @param {Boolean} allowEmptyString (optional) true to allow empty strings (defaults to false)
         * @return {Boolean}
         */
        isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (X.isArray(value) && value.length === 0);
        },

        /**
         * Returns true if the passed value is a JavaScript Array, false otherwise.
         *
         * @param {Object} target The target to test
         * @return {Boolean}
         */
        isArray: $.isArray,

        /**
         * Returns true if the passed value is a JavaScript Date object, false otherwise.
         * @param {Object} object The object to test
         * @return {Boolean}
         */
        isDate: function(value) {
            return $.type(value) === 'date';
        },

        /**
         * Returns true if the passed value is a JavaScript Object, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isObject: $.isPlainObject,

        /**
         * Returns true if the passed value is a JavaScript Function, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isFunction: $.isFunction,

        /**
         * Returns true if the passed value is a number. Returns false for non-finite numbers.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isNumber: function(value) {
            return $.type(value) === 'number';
        },

        /**
         * Validates that a value is numeric.
         * @param {Object} value Examples: 1, '1', '2.34'
         * @return {Boolean} True if numeric, false otherwise
         */
        isNumeric: $.isNumeric,

        /**
         * Returns true if the passed value is a string.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isString: function(value) {
            return $.type(value) === 'string';
        },

        /**
         * Returns true if the passed value is a boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return $.type(value) === 'boolean';
        },

        /**
         * Returns true if the passed value is an HTMLElement
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns true if the passed value is a TextNode
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        }
    });

    if (android) {
        os.android = true;
        os.version = android[2];
    }
    if (ios) {
        os.ios = true;
        os.version = ios[2].replace(/_/g, '.');
        os.ios7 = /^7/.test(os.version);
        if (ios[1] === 'iPad') {
            os.ipad = true;
        } else if (ios[1] === 'iPhone') {
            os.iphone = true;
            os.iphone5 = window.screen.height == 568;
        } else if (ios[1] === 'iPod') {
            os.ipod = true;
        }
    }
    if (wp) {
        os.wp = true;
        os.version = wp[2];
        os.wp8 = /^8/.test(os.version);
    }

    $.extend(X, {
        /**
         * 移动设备操作系统信息，可能会包含一下属性:
         *
         *  Boolean : android
         *  Boolean : ios
         *  Boolean : ios7
         *  Boolean : ipad
         *  Boolean : iphone
         *  Boolean : iphone5
         *  Boolean : ipod
         *  String : version 系统版本号
         *
         */
        os: os,

        /**
         * 是否webkit内核浏览器
         */
        isWebkit: isWebkit,

        /**
         * 是否safari浏览器
         */
        isSafari: isSafari,

        /**
         * 将config包含的属性，合并到object对象，如果object已存在相同的属性名，则忽略合并
         * @param {Object} object
         * @param {Object} config
         */
        applyIf: function(object, config) {
            var property;

            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }

            return object;
        },

        /**
         * 将对象转换成数组，包含以下几种参数传递方式：
         *
         * <code>
         *  var arr = MX.toArray('a', 'b', 'c');
         *
         *  // 输出 ['a', 'b', 'c']
         *  alert(arr);
         *
         *
         *  arr = MX.toArray();
         *
         *  // 输出 []
         *  alert(arr);
         *
         *
         *  function fn() {
         *      return MX.toArray(arguments);
         *  }
         *
         *  arr = fn('a', 'b', 'c');
         *
         *  // 输出 ['a', 'b', 'c']
         *  alert(arr);
         *
         * </code>
         *
         */
        toArray: function(obj) {
            var args, i, len;
            if (!X.isDefined(obj)) {
                args = [];
            } else if (X.isArray(obj)) {
                args = slice.call(obj, 0);
            } else if (toString.call(obj) == '[object Arguments]') {
                args = slice.call(obj, 0);
            } else {
                // 为了兼容IE8以下浏览器，IE8不支持Arguments对象
                args = [];
                for (i = 0, len = arguments.length; i < len; i++) {
                    args.push(arguments[i]);
                }
            }
            return args;
        },

        /**
         * 遍历一个对象或数组，$.each的封装类，允许指定回调函数的作用域
         * @param {Element/Array} obj 遍历的对象或数组
         * @param {Function} fn 遍历对象的回调函数
         * @param {Object} scope 回调函数作用域
         */
        each: function(obj, fn, scope) {
            if (!obj || !fn) {
                return;
            }
            if (X.isDefined(scope)) {
                $.each(obj, $.proxy(fn, scope));
            } else {
                $.each(obj, fn);
            }
        },

        /**
         * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
         * <pre><code>
         *  var sayHi = function(name){
         *      alert('Hi, ' + name);
         *  }
         *
         *  // executes immediately:
         *  sayHi('max');
         *
         *  // executes after 2 seconds:
         *  MX.defer(sayHi, 2000, this, ['max']);
         * </code></pre>
         * @param {Function} fn The function to defer.
         * @param {Number} millis The number of milliseconds for the setTimeout call (if less than or equal to 0 the function is executed immediately)
         * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
         * <b>If omitted, defaults to the browser window.</b>
         * @param {Array} args (optionls) 回调函数的形参
         * @return {Number} The timeout id that can be used with clearTimeout
         */
        defer: function(fn, millis, scope, args) {
            scope = scope || window;
            if (millis > 0) {
                return setTimeout(function() {
                    fn.apply(scope, args);
                }, millis);
            }
            fn.apply(scope, args);
            return 0;
        },

        /**
         * 代理 orientation change 事件回调函数
         * @param fn
         * @param scope
         * @returns {Function}
         */
        createOrientationChangeProxy: function(fn, scope) {
            return function() {
                clearTimeout(scope.orientationChangedTimeout);
                var args = slice.call(arguments, 0);
                scope.orientationChangedTimeout = setTimeout($.proxy(function() {
                    var ori = window.orientation;
                    if (ori != scope.lastOrientation) {
                        fn.apply(scope, args);
                    }
                    scope.lastOrientation = ori;
                }, scope), os.android ? 300 : 50);
            };
        }
    });

    $.extend(X, {
        /**
         * 声明一个匿名函数工作空间，并执行。同时进行类依赖管理，将依赖类对象作为参数传给回调函数
         *
         * 回调函数形参的第一个参数默认为MX，例如：
         * <code>
         *  // 不依赖任何类，直接执行回调，第一个参数为MX对象
         *  MX.kindle(function(X) {
         *      // 输出true
         *      alert(X.isBoolean(true));
         *  });
         * </code>
         *
         * 处理类的依赖关系，类依赖使用alias属性，也可以直接是一个对象：
         * <code>
         *  MX.kindle('jquery', function(X, $) {
         *      // 输出true
         *      alert(window.jQuery == $;
         *  });
         *
         *  // 又或者是
         *
         *  MX.kindle('jquery', 'klass', function(X, $, Klass) {
         *
         *      var Cls1 = Klass.define({
         *          say: function() {
         *              alert('hello');
         *          }
         *      });
         *
         *      // 输出'hello'
         *      new Cls1().say();
         *  });
         *
         *  // 直接依赖对象
         *  MX.kindle('jquery', MX.klass.Klass, function(X, $, Klass) {
         *
         *      var Cls1 = Klass.define({
         *          say: function() {
         *              alert('hello');
         *          }
         *      });
         *
         *      // 输出'hello'
         *      new Cls1().say();
         *  });
         * </code>
         *
         * @param {String} alias 类对象的别名
         * @param {String} alias1...n {optional}
         * @param {Function} callback 回调函数
         */
        kindle: function() {
            var args = X.toArray.apply(X, arguments),
                len = args.length,
                fnArgs = args.slice(0, len - 1),
                fn = args[len - 1];

            X.each(fnArgs, function(i, alias) {
                fnArgs[i] = X.klass.KlassManager.get(alias);
            });
            fn.apply(window, [X].concat(fnArgs));
        },

        /**
         * 代理$.ready()函数，并具备MX.kindle()的特性
         *
         * MX.kindle()是立即执行回调函数
         *
         * MX.ready()是当DOM准备就绪时，才执行回调函数
         *
         * 基本用法：
         * <code>
         *  MX.ready('jquery', function(X, $) {
         *      // 输出true
         *      alert(window.jQuery == $;
         *  });
         * </code>
         *
         * @param {String} alias 类对象的别名
         * @param {String} alias1...n {optional}
         * @param {Function} callback 回调函数
         */
        ready: function() {
            var args = X.toArray.apply(X, arguments);
            $(document).ready(function() {
                X.kindle.apply(window, args);
            });
        }
    });
})(window.MX, window.jQuery, window.template);