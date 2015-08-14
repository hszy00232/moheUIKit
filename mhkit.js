(function(global,$,doc){
	"use strict";
	var UI = {};
	UI.$doc = $(document);
	/**
	 * 存储创建的组件
	 */
	UI.components = {};
	UI.domObservers = [];
	UI.domready = false;
	/*
	 * 工具集
	 */
	UI.Utils = {};
	UI.Utils.str2json = function(str,notevil){
		try{
			if(notevil){
				return JSON.parse(str
					// wrap keys without quote with valid double quote
					.replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":';})
					// replacing single quote wrapped ones to double quote
					.replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"';})
				);
			}else{
				return (new Function("","var json = "+str+";return JSON.parse(JSON.stringify(json));"))();
			}
		}catch(e){return false};
	};
	UI.Utils.options = function(string){
		if($.isPlainObject(string)) return string;
		var start = (string ? string.indexOf('{'):-1),
			options = {};
		if(start != -1){
			try{
				options = UI.Utils.str2json(string.substr(start));
			}catch(e){}
		}
		return options;
	}
	/**
	 * UI静态方法
	 */
	UI.ready = function(fn){
		UI.domObservers.push(fn);
		if(UI.domready){
			fn(document);
		}
	};
	UI.init = function(root){
		root = root || document;
		UI.domObservers.forEach(function(fn){
			fn(root);
		});
	};
	/**
	 * 调用方式1：UI.on("domready.UI.dom",function(){UI.init();});
	 * 调用方式2：UI.on("click","[data-slider]",function(){...});
	 */
	UI.on = function(a1,a2,a3){
			if( a1 && a1.indexOf('ready.UI.dom') > -1 && UI.domready){
				a2.apply(UI.$doc);
			}
			return UI.$doc.on(a1,a2,a3);
	};
	UI.trigger = function(evt,params){
		return UI.$doc.trigger(evt,params);
	};
	/**
	 * 创建组件方法 component
	 * @param {string} name 组件名称
	 * @param {object} def 组件配置
	 */
	UI.component = function(name,def){
		/* 
		 * fn当成工厂方法来创建实例
		 */
		var fn = function(element,options){
			this.element = element ? $(element) : null;
			this.options = $.extend( true,{},this.defaults,options );
			if(this.element){
				this.element.data(name,this);
			}
			this.init();
			return this;
		}
		/**
		 * 扩展fn.prototype
		 */
		$.extend(true,fn.prototype,{
			defaults:{},
			boot:function(){},
			init:function(){},
			on:function(a1,a2,a3){
				return $(this.element || this).on(a1,a2,a3);
			},
			off:function(evt){
				return $(this.element || this).off(evt);
			},
			trigger:function(evt,params){
				return $(this.element || this).trigger(evt,params);
			},
			find:function(selector){
				return $(this.element || this).find(selector);
			}
		},def);

		UI.components[name] = fn;

		/*
		 * 添加name为名的静态方法
		 * 调用方法：UI.slider(element,options);
		 */
		this[name] = function(){
			var element,options;
			if(arguments.length){
				switch(arguments.length){
					case 1:
						if(typeof arguments[0] === "string" || arguments[0].nodeType || arguments[0] instanceof jQuery){
							element = $(arguments[0]);
						}else{
							options = arguments[0];
						}
					break;
					case 2:
						element = $(arguments[0]);
						options = arguments[1];
					break;
				}
			};
			return (new UI.components[name](element,options));
		};

		return fn;
	};
	/*
	 * 调用指定组件的boot方法激活
	 * @param {string} name 组件名称
	 */
	UI.component.boot = function(name){
		if(UI.components[name].prototype && UI.components[name].prototype.boot && !UI.components[name].prototype.booted){
			UI.components[name].prototype.boot.apply(UI,[]);
			UI.components[name].prototype.booted = true;
		}
	};
	/* 
	 * UI.components存储的组件依次激活
	 */
	UI.component.bootComponents = function(){
		for(var component in UI.components){
			UI.component.boot(component);
		}
	};

	$(function(){
		UI.trigger("beforeready.UI.dom");
		UI.component.bootComponents();
		UI.trigger("domready.UI.dom");
		UI.trigger('afterready.UI.dom');
		UI.domready = true;
	});
	UI.on('domready.UI.dom',function(){
		UI.init();
	});
	global.MoheKit = UI;
})(window, window.jQuery, window.document);
console.log(window.MoheKit);