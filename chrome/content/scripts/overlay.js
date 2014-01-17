/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* 
Version 0.2.0b
+ добавлены проверки при парсинге закладки
! не сбрасывался флаг refreshInProgress при ошибках в doBuildMenu
! обновлена jquery

Version 0.1.9
+ перешел на использование модуля (module.js) для хранения общих данных
- убрано все относящееся к SQLite
! диалоги открываются в модальном режиме
+ у отфильтрованных закладок добавлены иконки и всплывающие подсказки
! в линуксе не полностью прорисовывалось меню закладок после редактрирования и т.д.
! слова заголовка для автозаполнения меток делятся регуляркой, а не только по пробелам

Version 0.1.8b
+ ссылка на Skrill
+ переключение между кнопкой на панели навигации и пунктом в главном меню программы
+ возможность добавления метки для закладок без меток
+ клик средней кнопкой по метке открывает все вложенные закладки
! оптимизировано сохранение facicons (адресов) во временном sqlite файле
! исправлено удаление куки для всех доменов google
! замена bookmarkClick() и folderClick() на handleClick()

Version 0.1.7
из-за тормозов сайта мозилы 0.1.6 пришлось загрузить как 0.1.7

Version 0.1.6
+ переключение формата получения списка закладок: xml or rss
+ поиск закладок в адресной строке
+ фильтр закладок
+ автозаполнение меток на основании заголовка страницы (для новых меток)
+ пункт для добавления в закладки через контекстное меню страницы
!автодополнение меток ищет совпадения без учета регистра с начала строки/после разделителя меток
!исправлена ошибка формирования списка закладок, когда у закладки не заполнено поле адреса
!исправлен скроллинг закладок

Version 0.1.5
! исправлено добавление пустых меток, когда ни у одной закладки меток нет
+ при клике средней кнопкой (колесиком) по закладке выполняется действие открытия из контекстного меню (в зависимости от настроек)
+ ссылка на яндекс.денежку, а вдруг? :)

Version 0.1.4
+ добавлена возможность выбора типа (по названию, по дате добавления) и направления сортировки 
Спасибо Pavel Pavlov ;)

Version 0.1.3
! пропустил "f" в fGoogleBookmarksExtension.removeSIDCookie();

Version 0.1.2
! jQuery для ajax запросов (через XMLHttpRequest перестало работать редактирование закладок)
+ добавлена работа с вложенными метками
+ добавлена возможность показа иконок для закладок (из кэша)
+ добавлена возможность смены действия левого клика по закладке (открывать на месте или в новой вкладке)

Version 0.1.1
Дурацкие правила мозилы

Version 0.1.0 
! при неудаче получения списка закладок с серевера (ошибка или куки был, а на самом деле логина не было) теперь удаляется куки SID

Version 0.0.9
! javascript namespace changed from GBE to fGoogleBookmarksExtension

Version 0.0.8
! кнопка добавлялась только на панель навигации - исправлено

Version 0.0.7
+ добавлено контекстное меню для меток (редактирование, удаление, открытие вложенных закладок, добавление закладки с выбранной меткой)

Version 0.0.6
+добавлено автодополнение меток в диалоге редактирования закладки

Version 0.0.5
+ добавлена работа с закладками через контекстное меню (открытие в той же вкладке, редактирование, удаление)

Version 0.0.4
+ удаление закладок

Version 0.0.3
+ редактирование закладок

Version 0.0.2
+ формирование меню закладок

Version 0.0.1
+ появилась кнопка на панели :)
*/

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");

Cu.import('chrome://GBE/content/scripts/module.js');

Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(
	Ci.mozIJSSubScriptLoader).loadSubScript("chrome://GBE/content/scripts/jquery.min.js"); 

var fessGoogleBookmarks = {

	"_M" : fGoogleBookmarksModule,
	'needRefresh'	: false,

	/**
	 * функция сравнения закладок и меток по имени
	 * @return {int} результат сравнения
	 */
	compareByName : function (a, b) {
		if (a instanceof Array && b instanceof Array) 
		{
			if (fGoogleBookmarksModule.sortOrder == "asc") 
			{
				return String(a[0]).toLowerCase() < String(b[0]).toLowerCase() ? -1 : 1;
			}
			else
			{
				return String(a[0]).toLowerCase() < String(b[0]).toLowerCase() ? 1 : -1;
			}
		}
		if (a instanceof Object && b instanceof Object) 
		{
			if (fGoogleBookmarksModule.sortOrder == "asc") 
			{
				return String(a.title).toLowerCase() < String(b.title).toLowerCase() ? -1 : 1;
			}
			else
			{
				return String(a.title).toLowerCase() < String(b.title).toLowerCase() ? 1 : -1;
			}			
		}
	},

	/**
	 * функция сравнения закладок и меток по дате добавления
	 */
	compareByDate : function (a, b) {		
		if (a instanceof Array && b instanceof Array) 
		{
			if (fGoogleBookmarksModule.sortOrder == "asc") 
			{
				return new Date(a[5]) < new Date(b[5]) ? -1 : 1;
			}
			else
			{
				return new Date(a[5]) < new Date(b[5]) ? 1 : -1;
			}
		}
		if (a instanceof Object && b instanceof Object) 
		{
			if (fGoogleBookmarksModule.sortOrder == "asc") 
			{
				return new Date(a.timestamp) < new Date(b.timestamp) ? -1 : 1;
			}
			else
			{
				return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1;
			}
		}
	},

	// обработчик изменения адреса
	onLocationChange : function(aProgress, aRequest, aURI) 
	{
	  this.processNewURL(aURI);
	},

	/**
	 * обработчик изменения адреса
	 * @param aURI - текущий адрес
	 */
	processNewURL : function(aURI) 
	{
	  try
	  {
	    // адрес не поменялся - ничего не делаем
	    if (aURI.spec === this._M.oldURL) 
	  	{
	  		return;
	  	}
			var params = {name : "", id : null,	url : aURI.spec, labels : "", notes : ""};
			this._M.getBookmark(params, true);
			this.setButtonIcons(params.id);
	    this._M.oldURL = aURI.spec;
	  }
	  catch (e)
		{
			this._M.ErrorLog("GBE:processNewURL", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	 },

	// обработчик изменения настроек дополнения
	observe : function(aSubject, aTopic, aData) {
		if (aTopic != "nsPref:changed")
		{
		  return;
		}
		switch(aData)
		{
		  case "useMenuBar":
		  	this.switchInteface(this._M.prefs.getBoolPref(aData));
		    break;
		  case "showToolbarAddBtn":
		  	this.setAdditionalButton("GBE-btnAddBookmark", this._M.prefs.getBoolPref(aData));
		  	break;
		  case "showToolbarQuickAddBtn":
		  	this.setAdditionalButton("GBE-btnQuickAddBookmark", this._M.prefs.getBoolPref(aData));
	    	break;		  
		}
	},

	setAdditionalButton : function(id, prefValue)
	{
  	if (prefValue)
  	{
  		if (!document.getElementById(id))
  		{
	  		this.installButton(id);
  		}
  		document.getElementById(id).setAttribute("hidden", false);
  	}
  	else
  	{
  		if (document.getElementById(id))
  		{
  			document.getElementById(id).setAttribute("hidden", true);
  		}
  	}
	},

	installButton : function(id)
	{
		this._M.DebugLog("installButton");
		// var id = "GBE-toolbaritem";
		var toolbarId = "nav-bar";
	 	var toolbar = document.getElementById(toolbarId);
		//add the button at the end of the navigation toolbar	
		toolbar.insertItem(id, toolbar.lastChild);
		toolbar.setAttribute("currentset", toolbar.currentSet);
		document.persist(toolbar.id, "currentset");

		//if the navigation toolbar is hidden, 
		//show it, so the user can see your button
		toolbar.collapsed = false;
	},
	 
	firstRun : function (extensions) 
	{
	    var extension = extensions.get("GBE@fess16.blogspot.com");
	    if (extension.firstRun)
	    {
	    	this.installButton("GBE-toolbaritem");	
	    }
	},

	init : function()
	{
		this._M.debugId = (new Date()).getTime();	
		this._M.DebugLog("init");
		this._M.getPrefsValues();
		this._M.refreshInProgress = false;

		if (window.location == "chrome://browser/content/browser.xul")
		{
			// добавляем обработчик изменения настроек
			this._M.prefs.addObserver("", this, false);

			this.switchInteface(this._M.useMenuBar);
			this.setAdditionalButton("GBE-btnAddBookmark", this._M.showToolbarAddBtn);
			this.setAdditionalButton("GBE-btnQuickAddBookmark", this._M.showToolbarQuickAddBtn);
			 if(this._M.checkLogin() && (document.getElementById("GBE-toolbarbutton") || (document.getElementById("GBE-MainMenu") ) ) )
			{
				this.refreshBookmarks(false);
			}
			// добавляем обработчик изменения адреса
			gBrowser.addProgressListener(this);

			// в настройка включено автодополнение в адресной строке
			if (this._M.enableGBautocomplite)
			{
				// включаем автодополнение
				this.setURLBarAutocompleteList("on");
			}
		}
	},

	uninit : function()
	{
		this._M.DebugLog("uninit");
		if (window.location == "chrome://browser/content/browser.xul")
		{
			// удаляем свои обработчики
			gBrowser.removeProgressListener(this);
			this._M.prefs.removeObserver("", this);
			if (this._M.enableGBautocomplite)
			{
				this.setURLBarAutocompleteList("off");
			}
		}
	},

	// в зависимости от useMenuBar прячет/показывает кнопку или пункт меню
	switchInteface : function(useMenuBar)
	{
		this._M.DebugLog("switchInteface");
		jQuery.noConflict();
		if (!useMenuBar)
		{
			if (jQuery("#GBE-toolbaritem").length)
			{
				jQuery("#GBE-toolbaritem").show();
				jQuery("#GBE-MainMenu").hide();
			}
			else
			{
				try
				{
					this.installButton("GBE-toolbaritem");	
					this.switchInteface(this._M.useMenuBar);
				}
				catch(e)
				{
					this._M.ErrorLog("GBE:switchInteface ", "Can't use toolbar button! Try switch to menubar item.");
					this._M.useMenuBar = true;
					this._M.prefs.setBoolPref("useMenuBar", true);
					this.switchInteface(this._M.useMenuBar);
				}
			}
		}
		else
		{
			jQuery("#GBE-toolbaritem").hide();
			jQuery("#GBE-MainMenu").show();			
		}
	},

	/*
		добавляет в адресную строку автодополнение по закладкам Google / восстанавливает первоначальное значение параметров 
	 */
	setURLBarAutocompleteList : function(state)
	{
		this._M.DebugLog("setURLBarAutocompleteList");
		var searchList = this._M.defAutocompliteList;
		if (state != 'off') 
		{
			var s = this._M.defAutocompliteList = gURLBar.getAttribute('autocompletesearch');
			searchList = 'gbookmarks-autocomplete' + " " + s;
		}
		gURLBar.setAttribute("autocompletesearch", searchList);
		// this.ErrorLog("setURLBarAutocompleteList ", gURLBar.getAttribute('autocompletesearch'));
		// gURLBar.setAttribute("disableautocomplete", true);
		// gURLBar.setAttribute("disableautocomplete", false);
	},

	refreshBookmarks : function(showMenu = true, fromFile = false)
	{
		try
		{
			this._M.DebugLog("refreshBookmarks");
			// меняем первый пункт меню закладки 
			if (this._M.reverseBkmrkLeftClick)
			{
				document.getElementById("GBE-contextMenuShowHere").setAttribute(
					"label", 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.OpenBookmarkInNewTab")
				);
			}
			else
			{
				document.getElementById("GBE-contextMenuShowHere").setAttribute(
					"label", 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.OpenBookmarkHere")
				);
			}
			if (!this._M.refreshInProgress)
			{	
				this._M.refreshInProgress = true;
				if (this._M.useMenuBar)
				{
					this.doClearList("GBE-MainMenu-Popup", "google-bookmarks");
				}
				else
				{
					this.doClearList("GBE-ToolBar-popup", "google-bookmarks");
					this.doClearList("GBE-searchResultList","menuitem-iconic google-bookmarks-filter");
				}
				if (fromFile)
				{
					 return this.doBuildMenu(fromFile); 
				}
				else
				{
					this.doRequestBookmarksJQuery(showMenu); 
				}
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:refreshBookmarks", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * меняет иконку на панели и активность кнопок в меню
	 * @param id - код закладки или null
	 */
	setButtonIcons : function(id)
	{
		try
		{
			this._M.DebugLog("setButtonIcons");
			if (document.getElementById("GBE-toolbarbutton") || document.getElementById("GBE-MainMenu"))
			{
				if (id)
				{
					if (!this._M.useMenuBar) document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_full.png");
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_off.png");
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "true");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_on.png");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "false");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_on.png");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "false");

					document.getElementById("GBE-contextMenuAddBookmark").setAttribute("hidden", "true");

					if (document.getElementById("GBE-btnQuickAddBookmark"))
					{
						document.getElementById("GBE-btnQuickAddBookmark").setAttribute("image","chrome://GBE/skin/images/bkmrk_add_quick_off.png");
					}
				}
				else
				{
					if (!this._M.useMenuBar) document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_empty.png");
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_on.png");
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "false");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_off.png");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "true");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_off.png");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "true");

					document.getElementById("GBE-contextMenuAddBookmark").setAttribute("hidden", "false");

					if (document.getElementById("GBE-btnQuickAddBookmark"))
					{
						document.getElementById("GBE-btnQuickAddBookmark").setAttribute("image","chrome://GBE/skin/images/bkmrk_add_quick_on.png");
					}

				}
			}
		}
	  catch (e)
		{
			this._M.ErrorLog("GBE:setButtonIcons", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},


	/**
	 * удаляет все закладки из указанного меню
	 */
	doClearList : function(parentId, className)
	{
		var list = document.getElementById(parentId);
		try
		{
			this._M.DebugLog("doClearList");
			// Fetch all elements in the document with the class 'tagSelected'
			var selectTag = list.getElementsByClassName(className);
		  // Remove all of them.
			while( selectTag[0] ) 
			{
		    selectTag[0].parentNode.removeChild( selectTag[0] );
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:doClearList", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},


	/**
	 * обработчик события onpopupshowing для основного меню (GBE-ToolBar-popup)
	 */
	onShowMenu : function(event)
	{
		try
		{
			this._M.DebugLog("onShowMenu");
			if ( !(event.target.getAttribute("id") == "GBE-ToolBar-popup" || event.target.getAttribute("id") == "GBE-MainMenu-Popup" ))
			{
				event.stopPropagation();
				return;
			}
			// кнопки логин и логаут
			var btnLgn = document.getElementById("GBE-bc-hmenuLgn"), 
					btnLgt = document.getElementById("GBE-bc-hmenuLgt");
			// если залогинены в GB
			if (this._M.checkLogin())
			{
				// показываем кнопку логаут и прячем логин
				btnLgn.setAttribute("hidden", "true");
				btnLgt.setAttribute("hidden", "false");
				document.getElementById("GBE-bc-hmenuFFbookmark").setAttribute("disabled", "false");
				// document.getElementById("GBE-hmenuAdd").setAttribute("disabled", "false");
				// document.getElementById("GBE-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_on.png");
				// если необходимо - обновляем закладки
				if(this._M.needRefresh || this.needRefresh)
				{
					 this.refreshBookmarks();
					 this._M.needRefresh = false;
					 this.needRefresh = false;
				}
			}
			else
			{
				// показываем кнопку логин и прячем логаут
				btnLgt.setAttribute("hidden", "true");
				btnLgn.setAttribute("hidden", "false");
				document.getElementById("GBE-bc-hmenuFFbookmark").setAttribute("disabled", "true");
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "true");
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_off.png");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_off.png");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "true");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_off.png");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "true");
			}
			if (!this._M.useMenuBar)
			{
				document.getElementById("GBE-filterHBox").setAttribute("hidden","true");
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:onShowMenu", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	// при скрытии меню
	onHideMenu : function(event)
	{
		this._M.DebugLog("onHideMenu");
		// делаем видимым основной список закладок
		// document.getElementById("GBE-GBlist").setAttribute("hidden", false);
		if ( !(event.target.getAttribute("id") == "GBE-ToolBar-popup" || event.target.getAttribute("id") == "GBE-MainMenu-popup" ))
		{
			event.stopPropagation();
			return;
		}
		if (!this._M.useMenuBar)
		{
			this.hideBookmarks(false);
			// скрываем списко отфильтрованных закладок
			document.getElementById("GBE-searchResultList").setAttribute("hidden", true);
			// обнуляем значение фильтра
			document.getElementById("GBE-filterTextbox").value = "";
		}
	},

	hideBookmarks : function(hide)
	{
		this._M.DebugLog("hideBookmarks");
		jQuery.noConflict();
		if (hide)
		{
			jQuery("#GBE-ToolBar-popup").find(".google-bookmarks").hide();
		}
		else
		{
			jQuery("#GBE-ToolBar-popup").find(".google-bookmarks").show();
		}
	},

	/**
	 * обработчик кликов по закладкам и меткам
	 */
	handleClick : function(e)
	{
		try{
			switch (e.button) 
			{
				case 0 :
					{
						if ((e.target.getAttribute("class") == "menuitem-iconic google-bookmarks") || 
								(e.target.getAttribute("class") == "menuitem-iconic google-bookmarks-filter"))
						{
							fessGoogleBookmarks.showURL(e.target.getAttribute("url"), fessGoogleBookmarks._M.reverseBkmrkLeftClick);
							e.stopPropagation();
							break;
						}
						break;
					}
				case 1 :
					{
						if (e.target.getAttribute("class") == "menu-iconic google-bookmarks")
						{
							fessGoogleBookmarks._M.currentFolderId = e.target.getAttribute("id");
							fessGoogleBookmarks.folderMenuOpenAll(); 
							e.stopPropagation();
							break;
						}
						if ((e.target.getAttribute("class") == "menuitem-iconic google-bookmarks") || 
								(e.target.getAttribute("class") == "menuitem-iconic google-bookmarks-filter"))
						{
							fessGoogleBookmarks.showURL(e.target.getAttribute("url"), !fGoogleBookmarksModule.reverseBkmrkLeftClick);
							e.stopPropagation();
							break;
						}
						break;
					}
			}
		}
		catch(error)
		{
			fGoogleBookmarksModule.ErrorLog("GBE:folderClick", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	/**
	 * открывает заданный адрес в новой или той же вкладке
	 * @param  {[type]} url открываемый адрес
	 * @param  {[type]} inSameTab = false флаг открытия в новой вкладке
	 */
	showURL : function(url, inSameTab = false)
	{
	  this._M.DebugLog("showURL");
	  const kWindowMediatorContractID = "@mozilla.org/appshell/window-mediator;1";
	  const kWindowMediatorIID = Components.interfaces.nsIWindowMediator;
	  const kWindowMediator = Components.classes[kWindowMediatorContractID].getService(kWindowMediatorIID);
	  var browserWindow = kWindowMediator.getMostRecentWindow("navigator:browser");
		if (browserWindow) {
			if (inSameTab)
			{
				browserWindow.loadURI(url); 				
			}
			else
			{
				browserWindow.delayedOpenTab(url); 		
			}
		}
	},

	/**
	 * открывает диалог добавления (редактирования) закладки
	 * @param  {bool} editBkmk = true режим редактирования (true) или добавления (false) закладки
	 * @param  {string} addLabel = "" режим добавления новой метки к закладке (через контекстное меню метки)
	 */
	showBookmarkDialog : function(editBkmk = true, addLabel = "")
	{
		try
		{
			this._M.DebugLog("showBookmarkDialog");
			// адрес текущей страницы
			var cUrl = window.content.location.href;
			// если список закладок и адрес не пустые 
			//if ((GBE.m_bookmarkList.length) && (cUrl !== ""))
			if (cUrl !== "")
			{
				// если у документа нет заголовка, то название закладки = адрес без протокола (например, без http://)
				var myRe = /(?:.*?:\/\/?)(.*)(?:\/$)/ig;
				var trimUrlAr = myRe.exec(cUrl);
				var trimUrl = cUrl;
				if (trimUrlAr && trimUrlAr.length > 1)
				{
					trimUrl = trimUrlAr[1];
				}

				// параметры закладки
				this._M.windowsParams = {
						name : (window.content.document.title || trimUrl),
						id : null,
						url : cUrl,
						labels : "",
						notes : "",
						sig : this._M.m_signature
					};

				var labelsList = this._M.m_labelsArr;

				// автозаполнение меток на основании заголовка страницы
				if (this._M.suggestLabel && window.content.document.title && labelsList !== null && !editBkmk)
				{
					// все слова из заголовка
					// var words = window.content.document.title.split(" ");
					// let delimiter = /[ {}|=\[\]\(\)\-\\\/!?,.;:]/;
					var words = window.content.document.title.split(/[ {}|=\[\]\(\)\-\\\/!?,.;:]/);

					// для хранения уникальных слов
					var uniqueWords = [];
					var labels = [];
					var self = this;
					jQuery.noConflict();
					// проходим по всем словам
					jQuery.each(words, function(i, el){
						// пропускаем повторяющиеся и слова из одного символа
				    if(jQuery.inArray(el, uniqueWords) === -1 && el.length > 1) 
				    {
				    	uniqueWords.push(el);
				    	// регулярка для поиска
				    	// ищем с начала строки/после nestedLabelSep до конца строки/nestedLabelSep 
						  var SearchString = new RegExp("(^|" + self.nestedLabelSep + ")" 
						  																		+ el 
						  																		+ "($|" + self.nestedLabelSep + ")", "i");
						  // просматриваем массив меток
				      for (var i=0; i<labelsList.length; i++) 
				      {
				      	// результат поиска
				      	var position = labelsList[i].search(SearchString);
				      	// нашли совпадение
				        if (position != -1) 
				        {
				          // ограничиваем уровень вложенности метки
				          // например: ищем chrome, есть закладка Browsers/Chrome/test
				          // newLabel будет Browsers/Chrome/
				          var newLabel = labelsList[i].substring(0,position + el.length+1);
				          // если последний символ равен разделителю вложенных меток - удаляем его
				          if (newLabel.charAt(newLabel.length - 1) == self.nestedLabelSep)
				          {
				          	newLabel = newLabel.substr(0, newLabel.length-1);
				          }
				          // если такой метки еще не было, добавляем ее в массив
				          if (jQuery.inArray(newLabel, labels) === -1)
				          {
				          	labels.push(newLabel);
				          }
				        }
				      }
				    }
					});
					this._M.windowsParams.labels = labels;
				}


				// находим закладку по адресу (при редактировании)
				if (editBkmk)
				{
					this._M.getBookmark(this._M.windowsParams, true);
				}
				// при добавлении дополнительной метки
				if (addLabel.length)
				{
					// для закладок, у которых уже есть метки
					if (this._M.windowsParams.labels.length)
					{
						if (jQuery.inArray(addLabel, this._M.windowsParams.labels) === -1) this._M.windowsParams.labels.push(addLabel);
					}
					// для закладок без меток и новых закладок
					else
					{
						this._M.windowsParams.labels += addLabel;
					}
				}
				let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	           .getService(Components.interfaces.nsIWindowMediator)
	           .getMostRecentWindow("navigator:browser");
				win.openDialog("chrome://GBE/content/overlays/bookmark.xul", "","chrome,centerscreen,modal",this);
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:showBookmarkDialog", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * открывает диалог удаления закладки
	 * @param  {event} e 
	 */
	showDeleteDlg : function(e)
	{
		try
		{
			this._M.DebugLog("showDeleteDlg");
			// параметры закладки
			this._M.windowsParams = {
				name : "", id : null,	url : window.content.location.href, labels : "", notes : "", sig : this._M.m_signature
			};
			var bookmarkNotFound = true;
			// вызов из основного меню
			if(e === null)
			{
				this._M.getBookmark(this._M.windowsParams, true);
				if (this._M.windowsParams.id)
				{
					bookmarkNotFound = false;
				}
			}
			// вызов из контекстного меню закладки
			else
			{
				this._M.windowsParams.id = e.currentTarget.getAttribute("id").replace("GBE","");
				this._M.windowsParams.name = e.currentTarget.getAttribute("label");
				bookmarkNotFound = false;
			}
			// закладка не найдена - ничего не делаем
			if(bookmarkNotFound)
			{
				this._M.ErrorLog("GBE:showDeleteBkmkDlg", " Не найдена закладка.");
				return;
			}
			let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		           .getService(Components.interfaces.nsIWindowMediator)
		           .getMostRecentWindow("navigator:browser");
			win.openDialog("chrome://GBE/content/overlays/delete.xul", "","chrome,centerscreen,modal", this);
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:showDeleteDlg", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	showPrefWindow : function()
	{
		this._M.DebugLog("showPrefWindow");
		if (null == this._M._preferencesWindow || this._M._preferencesWindow.closed) 
		{
	    let instantApply = Application.prefs.get("browser.preferences.instantApply");
	    let features = "chrome,titlebar,toolbar,centerscreen" + (instantApply.value ? ",dialog=no" : ",modal");
			let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		           .getService(Components.interfaces.nsIWindowMediator)
		           .getMostRecentWindow("navigator:browser");
	    this._M._preferencesWindow =
	      win.openDialog(
	        "chrome://GBE/content/overlays/options.xul",
	        "", 
	        features, 
	        this
	      );
		}
		this._M._preferencesWindow.focus();		
	},

	showFFbookmarkWindow : function()
	{
		// if (null == this._M._ffWindow || this._M._ffWindow.closed) 
		// {
	 //    let features = "chrome,titlebar,toolbar,centerscreen";
		// 	let ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
	 //                   .getService(Components.interfaces.nsIWindowWatcher);
	 //    this.wrappedJSObject = this;
	 //    this._M._ffWindow =
	 //      ww.openWindow(
	 //      	null, 
	 //        "chrome://GBE/content/overlays/ff_bookmark.xul",
	 //        "ffWindow", 
	 //        features,
	 //        this
	 //      );
		// }
		// this._M._ffWindow.focus();	
		this._M.DebugLog("showFFbookmarkWindow");
		if (null == this._M._ffWindow || this._M._ffWindow.closed) 
		{
			let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		           .getService(Components.interfaces.nsIWindowMediator)
		           .getMostRecentWindow("navigator:browser");
	    this._M._ffWindow =
	      win.openDialog(
	        "chrome://GBE/content/overlays/ff_bookmark.xul",
	        "", 
	        "chrome,titlebar,toolbar,centerscreen,modal", 
	        this
	      );
		}
		this._M._ffWindow.focus();		
	},

	/**
	 * обработчик меню логин
	 */
	login : function()
	{
		this._M.DebugLog("login");
		this.showURL("https://accounts.google.com");
	},

	/**
	 * обработчик меню логаут
	 */
	logout : function()
	{
		try
		{
			this._M.DebugLog("logout");
			this.showURL("https://www.google.com/accounts/Logout");
			this._M.oldURL = null;
			this._M.m_ganswer = null;
			this._M.m_labelsArr = null;
			this._M.m_bookmarkList = null;
			this._M.needRefresh = true;
			this._M.m_signature = "";
			this._M.currentContextId = "";
			this._M.currentFolderId = "";
			this._M.oldSearchValue = "";
			if (this._M.useMenuBar)
			{
				this.doClearList("GBE-MainMenu-Popup", "google-bookmarks");
			}
			else
			{
				this.doClearList("GBE-ToolBar-popup", "google-bookmarks");
				document.getElementById("GBE-filterHBox").setAttribute("hidden", true);
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:logout", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * обработчик меню About
	 */
	showAboutForm : function(e)
	{
		this._M.DebugLog("showAboutForm");
		let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	           .getService(Components.interfaces.nsIWindowMediator)
	           .getMostRecentWindow("navigator:browser");
		win.openDialog("chrome://GBE/content/overlays/about.xul", "","centerscreen");
	},

	onPopupShown : function(e)
	{
		if (e.target.getAttribute("id") == "GBE-ToolBar-popup")
		{
			// //e.target.sizeTo(300, 700);
			// e.target.width = 300;
			document.getElementById("GBE-filterHBox").setAttribute("hidden","false");
			e.stopPropagation();
		}
	},

	/*
	показывает отфильтрованные закладки
	 */
	filterBookmarks : function(searchValue)
	{
		// var GBE_GBlist = document.getElementById("GBE-GBlist");
		var GBE_searchResultList = document.getElementById("GBE-searchResultList");
		var search = searchValue.value;
		// копия массива предыдущих отфильтрованных закладок
		var tempArray = this._M.tempFilterArray.slice(); 
		GBE_searchResultList.setAttribute("hidden", true);
		this.doClearList("GBE-searchResultList","menuitem-iconic google-bookmarks-filter");
		// фильтр пустой
		if (search.length == 0)
		{
			// показываем основной список (все закладки и метки)
			// GBE_GBlist.setAttribute("hidden", false);
			this.hideBookmarks(false);
		}
		else
		{
			// прячем основной список
			// GBE_GBlist.setAttribute("hidden", true);
			this.hideBookmarks(true);
			// показываем список отфильтрованных закладок
			GBE_searchResultList.setAttribute("hidden", false);
			var tempMenuitem;

			if (this._M.m_bookmarkList && this._M.m_bookmarkList.length)
			{
				this._M.tempFilterArray.length = 0;
				// если новое значение фильтра входит в предыдущее,
				if(this._M.oldFilterValue !== "" && search.indexOf(this._M.oldFilterValue) == 0)
				{
					// то ищем только среди ранее отфильтрованных закладок
					for(var i = 0; i < tempArray.length; i++)
					{
						if (tempArray[i][0].toLowerCase().indexOf(search) !== -1 )//||
							// tempArray[i][1].toLowerCase().indexOf(search) !== -1)
						{
							tempMenuitem = document.createElement('menuitem');
							this.appendSearchMenuItem(GBE_searchResultList, tempMenuitem, tempArray[i][0], tempArray[i][1], tempArray[i][2]);
							// и формируем this.tempFilterArray заново
							this._M.tempFilterArray.push([ tempArray[i][0], tempArray[i][1], tempArray[i][2] ]);
						}
					}
				}
				else
				{
					// иначе - поиск по всем закладкам
					for (var i = 0; i < this._M.m_bookmarkList.length; i++)
					{
						if (this._M.m_bookmarkList[i].title.toLowerCase().indexOf(search) !== -1 )//||
							// this.m_bookmarkList[i].url.toLowerCase().indexOf(search) !== -1)
						{
							tempMenuitem = document.createElement('menuitem');
							this.appendSearchMenuItem(GBE_searchResultList, tempMenuitem, this._M.m_bookmarkList[i].title, this._M.m_bookmarkList[i].url, this._M.m_bookmarkList[i].favicon);
							this._M.tempFilterArray.push([this._M.m_bookmarkList[i].title, this._M.m_bookmarkList[i].url, this._M.m_bookmarkList[i].favicon]);
						}
					}
				}
			}
		}
		this._M.oldFilterValue = search;
		tempArray.length = 0;
	},

	/**
	 * задает атрибуты элемента меню закладок
	 * @param  {menu} parent
	 * @param  {menuitem} item
	 * @param  {array} value
	 */
	appendMenuItem : function(parent, item, value)
	{
		item.setAttribute("label", value.title);
		item.setAttribute("id", value.id);
		item.setAttribute("url", value.url);
		item.setAttribute("tooltiptext", value.url);
		item.setAttribute("class", "menuitem-iconic google-bookmarks");
		this.setFavicon(value, item); 
		item.setAttribute("context", "GBE-contextMenu");
		if (parent.nodeName == "menuseparator")
		{
			parent.parentNode.insertBefore(item, parent);
		}
		else
		{
			parent.appendChild(item);
		}
	},

	appendLabelItem : function(parent, item, id, label, fullName = "")
	{
		item = document.createElement('menu');
		item.setAttribute("id", "GBE_" + id);
		item.setAttribute("label", label);
		item.setAttribute("fullName", ((fullName == "") ? label : fullName));
		item.setAttribute("class", "menu-iconic google-bookmarks");
		item.setAttribute("image", "chrome://GBE/skin/images/folder_blue.png");
		item.setAttribute("container", "true");
		// для метки labelUnlabeledName контекстрое меню не назначаем
		if (this._M.enableLabelUnlabeled)
		{
			if (id !== this._M.labelUnlabeledName)
			{
				item.setAttribute("context", "GBE-folderMenu");
			}
		}
		else
		{
			item.setAttribute("context", "GBE-folderMenu");
		}
		item.appendChild(document.createElement('menupopup'));
		if (parent.nodeName == "menuseparator")
		{
			parent.parentNode.insertBefore(item, parent);
		}
		else
		{
			parent.appendChild(item);
		}
	},

	appendSearchMenuItem : function(parent, item, label, url, favicon)
	{
		item.setAttribute("label", label);
		item.setAttribute("url", url);
		item.setAttribute("tooltiptext", url);
		item.setAttribute("class", "menuitem-iconic google-bookmarks-filter");
		item.setAttribute("image", favicon);
		parent.appendChild(item);
	},

	/**
	 * при показе контекстного меню закладки
	 */
	onShowContextMenu : function(event)
	{
		try {
			this._M.DebugLog("onShowContextMenu");
			// GBE.currentContextId = event.target.getAttribute("id").replace("GBE_","");
			// запоминаем код закладки
			this._M.currentContextId = event.target.triggerNode.getAttribute("id").replace("GBE_","");
			// document.getElementById("GBE-contextMenu").showPopup(document.getElementById(GBE.currentContextId), 
			// 													event.screenX - 2, event.screenY - 2, "context");
		}
		catch (e) {
			this._M.ErrorLog("GBE:onBookmarkContextMenu", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * клик на пункте контекстного меню закладки "Открыть на месте"
	 */
	contextShowHere : function(event)
	{
		var params = {name : "", id : this._M.currentContextId,	url : "", labels : "", notes : "", sig : this._M.m_signature};
		// получаем параметры закладки
		this._M.getBookmark(params);
		// если нашли - показываем в той же вкладке
		if (params.id)
		{
			this.showURL(params.url, !this._M.reverseBkmrkLeftClick);
		}
	},

	/**
	 * клик на пункте контекстного меню закладки "Редактировать"
	 */
	contextEditBookmark : function(event)
	{
		try
		{
			this._M.windowsParams = {
				name : "", id : this._M.currentContextId,	url : "", labels : "", notes : "", sig : this._M.m_signature
			};
			this._M.getBookmark(this._M.windowsParams);
			if (this._M.windowsParams.id)
			{
			 	let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				          .getService(Components.interfaces.nsIWindowMediator)
				          .getMostRecentWindow("navigator:browser");
				win.openDialog("chrome://GBE/content/overlays/bookmark.xul", "","chrome,centerscreen,modal", this);
			}
		}
		catch (e) {
			this._M.ErrorLog("GBE:contextEditBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * клик на пункте контекстного меню закладки "Удалить"
	 */
	contextRemoveBookmark : function(event)
	{
		try
		{
			this._M.windowsParams = {
				name : "", id : this._M.currentContextId,	url : "", labels : "", notes : "", sig : this._M.m_signature
			};
			this._M.getBookmark(this._M.windowsParams);
			if (this._M.windowsParams.id)
			{
				let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			           .getService(Components.interfaces.nsIWindowMediator)
			           .getMostRecentWindow("navigator:browser");
				win.openDialog("chrome://GBE/content/overlays/delete.xul", "","chrome,centerscreen,modal",this);
			}
		}
		catch (e) {
			this._M.ErrorLog("GBE:contextRemoveBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}		
	},

	contextShowQR : function(event)
	{
		try
		{
			this._M.windowsParams = {
				name : "", id : this._M.currentContextId,	url : "", labels : "", notes : "", sig : this._M.m_signature
			};
			this._M.getBookmark(this._M.windowsParams);
			if (this._M.windowsParams.id)
			{
				let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			           .getService(Components.interfaces.nsIWindowMediator)
			           .getMostRecentWindow("navigator:browser");
				win.openDialog("chrome://GBE/content/overlays/qr.xul", "","chrome,centerscreen,modal");
			}
		}
		catch (e) {
			this._M.ErrorLog("GBE:contextShowQR", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}	
	},

	/**
	 * при показе контекстного меню метки
	 */
	onShowFolderMenu : function(e)
	{
		try {
			this._M.currentFolderId = e.target.triggerNode.getAttribute("id");
			for (var i = 0; i < this._M.m_labelsArr.length; i++) 
			{
				if (("GBE_" + this._M.m_labelsArr[i]) != this._M.currentFolderId)
				{
					document.getElementById("GBE_" + this._M.m_labelsArr[i]).open = false;
				}
			}
		}
		catch (error) {
			this._M.ErrorLog("GBE:showFolderMenu", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	/**
	 * открывает диалог редактирования метки
	 */
	showFolderDialog : function()
	{
		try
		{
			this._M.windowsParams = {
				name : document.getElementById(this._M.currentFolderId).getAttribute("fullName")
			};
			let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		           .getService(Components.interfaces.nsIWindowMediator)
		           .getMostRecentWindow("navigator:browser");
			win.openDialog("chrome://GBE/content/overlays/folder.xul", "","chrome,centerscreen,modal",this);
			this._M.currentFolderId = "";
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:showFolderDialog", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * открывает диалог удаления метки
	 */
	showRemoveLabelDialog : function()
	{
		try
		{
			this._M.windowsParams = {
				name : document.getElementById(this._M.currentFolderId).getAttribute("fullName")
			};
			let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		           .getService(Components.interfaces.nsIWindowMediator)
		           .getMostRecentWindow("navigator:browser");
			win.openDialog("chrome://GBE/content/overlays/folder_del.xul", "","chrome,centerscreen,modal",this);
			this._M.currentFolderId = "";
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:showRemoveLabelDialog", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * обработчик пункта контекстного меню метки "Открыть все" - открывает все вложенные закладки в подменю
	 */
	folderMenuOpenAll : function()
	{
		try
		{
			// получаем название метки
			var label = document.getElementById(this._M.currentFolderId).getAttribute("fullName");
			if (label.length && this._M.m_bookmarkList && this._M.m_bookmarkList.length)
	  	{
		  	// перебираем все закладки
		  	for (var i = 0, m_bookmarkListLength = this._M.m_bookmarkList.length; i < m_bookmarkListLength; i++)
		  	{
		  		var labels = this._M.m_bookmarkList[i].labels;
		  		if (labels.length > 0 )
		  		{
			  		for (var j = 0; j < labels.length; j++) {
			  			// открываем закладки, которые содержат искомую метку
			  			// if (labels[j].indexOf(label) == 0)
			  			if (labels[j] == label)
			  			{
			  				this.showURL(this._M.m_bookmarkList[i].url);
			  			}
			  		};
		  		}	
		  		else
		  		{
		  			// открываем закладки без метки
		  			if(this._M.enableLabelUnlabeled && this._M.currentFolderId == ("GBE_" + this._M.labelUnlabeledName))
		  			{
		  				this.showURL(this._M.m_bookmarkList[i].url);
		  			}
		  		}
		  	}
	  	}
	  	this._M.currentFolderId = "";
	  }
		catch (e)
		{
			this._M.ErrorLog("GBE:folderMenuOpenAll", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * обработчик пункта контекстного меню метки "Добавить закладку здесь"
	 */
	folderMenuAddHere : function()
	{
		try
		{	
			// название метки
			var label = document.getElementById(this._M.currentFolderId).getAttribute("fullName");
			// текущий адрес
			var cUrl = window.content.location.href;
			var params = {name : "", id : null,	url : cUrl, labels : "", notes : ""};
			this._M.getBookmark(params, true);
			// добавляем метку к существующей закладке
			if (params.id)
			{
				this.showBookmarkDialog(true, label);
			}
			else
			// создаем новую закладку с заданной меткой
			{
				this.showBookmarkDialog(false, label);
			}
			this._M.currentFolderId = "";
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:folderMenuAddHere", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	changeButtonIcon : function(url, id, del=true)
	{
		if (window.content.location.href == url)
		{
			// меняем иконку на панели	
			if (del)
				this.setButtonIcons(null);
			else
				this.setButtonIcons(!id)
  	}
	},

	/**
	 * устанавливает favicon для закладок
	 * @param  {строка} url  адрес закладки
	 * @param  {[type]} item ссылка на закладку (элемент меню)
	 */
	setFavicon : function(bkmrk, item)
	{
		try
		{
			// var self = this;
			if (!this._M.showFavicons || bkmrk.url.length == 0)
			{
				item.setAttribute("image", "chrome://GBE/skin/images/bkmrk.png");  
				bkmrk.favicon = "chrome://GBE/skin/images/bkmrk.png";
				return;
			}
			var pageUrl = NetUtil.newURI(bkmrk.url);
	    var FaviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
	      .getService(Components.interfaces.nsIFaviconService);
	    FaviconService.getFaviconURLForPage(pageUrl,
	      {
	        onComplete: function(uri, faviconData, mimeType, privateFlag)
	        {
	          let favUrl;
	          if (uri !== null)
	          {
	          	favUrl = uri.spec;
	          }
	          else
	          {
							favUrl = "chrome://GBE/skin/images/bkmrk.png";
						}
						item.setAttribute("image",favUrl);
						bkmrk.favicon = favUrl;
	        }
	      }
	    );
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:getFavicon", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	// parseJsonFile : function(jsonString)
	// {
	// 	jQuery.noConflict();
	// 	let arr = jQuery.parseJSON(jsonString);
	// 	if (arr !== null && arr.bookmarks.length && arr.labels.length )
	// 	{
	// 		this._M.m_bookmarkList = arr.bookmarks;
	// 		this._M.m_labelsArr = arr.labels;
	// 		return this.refreshBookmarks(false,true);
	// 	}
	// 	return false;
	// },

	doRequestBookmarksJQuery : function(showMenu)
	{
		try
		{
			this._M.DebugLog("doRequestBookmarksJQuery");
			if (!this._M.useMenuBar) document.getElementById("GBE-filterHBox").setAttribute("hidden", true);
			this._M.m_ganswer = null;
			this._M.m_signature = null;
			this._M.m_bookmarkList = null;
			this._M.m_labelsArr = null;
			let enableNotes = this._M.enableNotes;
			let self = this;
			let hwindow = this._M.getHwindow();
			let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
			let data = 	"?output=" + (!enableNotes ? "xml" : "rss") + "&num=10000";
			request.open("GET", this._M.baseUrl + "lookup" + data, true);
			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			request.setRequestHeader('User-Agent', "Mozilla/5.0 (Windows NT 6.1; rv:26.0) Gecko/20100101 Firefox/26.0");
			request.setRequestHeader('Accept','	text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
			request.onreadystatechange = function()
			{
		  	if (request.readyState != 4) return;
		  	hwindow.clearTimeout(timeout) // очистить таймаут при наступлении readyState 4
	  		if (request.status == 200 && request.responseXML) 
	  		{
		    	self._M.m_ganswer = request.responseXML.documentElement;
		    	self.doBuildMenu();
		    	if (showMenu)
		    	{
		    		if (self._M.useMenuBar)
		    		{
		    			document.getElementById("GBE-MainMenu-Popup").openPopup(document.getElementById("GBE-MainMenu"), "after_start",0,0,false,false);
						}
						else
						{			    			
		    			document.getElementById("GBE-ToolBar-popup").openPopup(document.getElementById("GBE-toolbarbutton"), "after_start",0,0,false,false);
		    		}
		    	}
		    	if (!self._M.useMenuBar)	document.getElementById("GBE-filterHBox").setAttribute("hidden", false);
	  		} 
	  		else 
	  		{
	      	self._M.removeSIDCookie();
	  			self._M.refreshInProgress = false;
	    		self._M.ErrorLog("GBE:doRequestBookmarksJQuery", "Ошибка при получении списка закладок");
	  		}
	  	}
			request.send(null);
			let timeout = hwindow.setTimeout( 
				function(){ 
					request.abort(); 
					self._M.ErrorLog("GBE:doRequestBookmarkNote", " Error: Time over - while requesting bookmark notes");
				}, 
				this._M.timeOut
			);
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:doRequestBookmarksJQuery", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * формирует меню закладок
	 */
	doBuildMenu : function(fromFile = false)
	{
		this._M.DebugLog("doBuildMenu");
		var bkmkFieldNames = { 
			"rss" : {
				bkmk 		: "item",
				title 	: "title", 
		    id 			: "smh:bkmk_id",
		    url 		: "link",
		    date 		: "pubDate",
		    label 	: "smh:bkmk_label",
		    notes 	: "smh:bkmk_annotation",
		    sig 		: "smh:signature"
			},
		  "xml" : {
		  	bkmk 		: "bookmark",
				title 	: "title", 
		    id 			: "id",
		    url 		: "url",
		    date 		: "timestamp",
		    label 	: "label",
		    notes 	: "",
		    sig 		: "" 
			}
		}
		if (!this._M.enableNotes)
		{
			var oType = "xml"
		}
		else
		{
			var oType = "rss"
		}
		try
		{		
			var allLabelsStr, i, j;
			// контейнер в меню, в который будут добавляться закладки
			//var GBE_GBlist = document.getElementById("GBE-GBlist");
			if (!this._M.useMenuBar)
			{
				var GBE_GBlist = document.getElementById("GBE-ToolBar-popup");
				this.GBE_menupopup = document.getElementById("GBE-ToolBar-popup"); 
				var GBE_GBlist_separator = document.getElementById("GBE-tb-GBlist-EndSeparator");
			}
			else
			{
				var GBE_GBlist = document.getElementById("GBE-MainMenu-Popup");
				this.GBE_menupopup = document.getElementById("GBE-MainMenu-popup"); 
				var GBE_GBlist_separator = document.getElementById("GBE-mb-GBlist-EndSeparator");				
			}
			jQuery.noConflict();
			var self = this;

			//сохраняем сигнатуру из ответа (необходима при работе с закладками)
			this._M.doRequestSignature();

			if (!fromFile)
			{

				// получаем все метки из XML ответа сервера
				var labels = this._M.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].label);

				// получаем все закладки из XML ответа сервера
				var bookmarks = this._M.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].bkmk);
				

				// сохраняем сигнатуру из ответа (необходима при работе с закладками)
				// if (!this.enableNotes)
				// {
				// 	this.doRequestSignature();
				// }
				// else
				// {
				// 	if (this.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].sig).length)
				// 	{
				// 		this.m_signature = this.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].sig)[0].childNodes[0].nodeValue;
				// 	}
				// }
				// если закладок и меток в ответе сервера нет - ничего не делаем
				if (!labels.length && !bookmarks.length) 
				{
					this._M.refreshInProgress = false;
					this._M.ErrorLog("GBE:doBuildMenu", "Labels and bookmarks (in server response) are empty!");
				 	return false;
				}

				// если закладок и меток в ответе сервера нет - ничего не делаем
				if (!bookmarks.length) 
				{
					this._M.refreshInProgress = false;
					this._M.ErrorLog("GBE:doBuildMenu", "Bookmarks (in server response) are empty!");
				 	return false;
				}

				// временная строка для группировки и сортировки меток
				allLabelsStr = this._M.labelSep;

				var lbs = [];
				let labelsLength = labels.length;
				// группируем метки
				for (i = 0; i < labelsLength; i++) 
				{
					// название метки
					var labelVal = labels[i].childNodes[0].nodeValue;
					// если такой метки во временной строке еще нет - добавляем ее (с разделителем)
					if (allLabelsStr.indexOf(this._M.labelSep + labelVal + this._M.labelSep) === -1)
					{
						allLabelsStr += (labelVal + this._M.labelSep);
						lbs.push({"title" : labelVal, "timestamp" : null});
					}
				}
				// добавляем labelUnlabeledName метку в массив меток
				if (this._M.enableLabelUnlabeled)
				{
					lbs.push({"title" : this._M.labelUnlabeledName, "timestamp" : null});
				}

				// сохраняем закладки в поле m_bookmarkList
				let bookmarksLength = bookmarks.length;
				// список закладок
				this._M.m_bookmarkList = new Array(bookmarksLength);
				for (i = 0; i < bookmarksLength; i++) 
				{
					this._M.m_bookmarkList[i] = {};
					try
					{
						let errorFlag = '';
						// read id field
						if (bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].id).length)
						{
							this._M.m_bookmarkList[i].id = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].id)[0].childNodes[0].nodeValue;
						}
						else
						{
							this._M.m_bookmarkList[i].id = '';
							errorFlag += " id";
						}

						// read title field
						if (bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].title).length)
						{
							this._M.m_bookmarkList[i].title = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].title)[0].childNodes[0].nodeValue;
						}
						else
						{
							this._M.m_bookmarkList[i].title = '';
							errorFlag += " title";
						}

						// read url field
						if (bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].url).length && 
							bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].url)[0].hasChildNodes()) 
						{
		    			this._M.m_bookmarkList[i].url = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].url)[0].childNodes[0].nodeValue;
						}
						else
						{
							this._M.m_bookmarkList[i].url = "";
							errorFlag += " url";
						}

						// read timestamp field
						if (bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].date).length)
						{
							this._M.m_bookmarkList[i].timestamp = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].date)[0].childNodes[0].nodeValue;
						}
						else
						{
							this._M.m_bookmarkList[i].timestamp = '';
							this._M.errorFlag += "timestamp";
						}

						// read label field
						if (bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].label).length)
						{
							var bookmark_labels = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].label);
						}
						else
						{
							var bookmark_labels = [];
						}
						if (errorFlag.length)
						{
							this._M.ErrorLog("GBE:doBuildMenu", "Bookmark '" + JSON.stringify(this._M.m_bookmarkList[i]) + "' do not have such fields (" + 
								errorFlag + " )!!!");
							if (errorFlag.indexOf("title") && this._M.m_bookmarkList[i].title == "" && this._M.m_bookmarkList[i].url !== "")
							{
								this._M.ErrorLog("GBE:doBuildMenu", "Warning. Bookmark", this._M.m_bookmarkList[i].url, " - has empty title. Title set to '",
									this._M.m_bookmarkList[i].url, "'!");
								this._M.m_bookmarkList[i].title = this._M.m_bookmarkList[i].url;
							}
						}
					}
					catch(e1)
					{
						this._M.ErrorLog("GBE:doBuildMenu", "Parse bookmark params - error. Last processing bookmark - " + 
							JSON.stringify(this._M.m_bookmarkList[i]));
						this._M.refreshInProgress = false;
						throw e1;
					}
					var	j;
					// закладка с метками?
					if (bookmark_labels.length)
					{
						// сохраняем метки в массив
						this._M.m_bookmarkList[i].labels = [];
						for (j = 0; j < bookmark_labels.length; j++)
						{
							this._M.m_bookmarkList[i].labels[j] =  bookmark_labels[j].childNodes[0].nodeValue;
							let lbl = jQuery.grep(lbs, function(e){ return e.title == bookmark_labels[j].childNodes[0].nodeValue });
							if (lbl.length)
							{
								if (lbl[0].timestamp == null || lbl[0].timestamp < this._M.m_bookmarkList[i].timestamp)
								{
									lbl[0].timestamp = this._M.m_bookmarkList[i].timestamp;
								}
							}
						}
					}
					else
					{
						this._M.m_bookmarkList[i].labels = "";
						// определяем timestamp для закладок без метки
						if (this._M.enableLabelUnlabeled)
						{
							let lbl = jQuery.grep(lbs, function(e){ return e.title == self.labelUnlabeledName });
							if (lbl.length)
							{
								if (lbl[0].timestamp == null || lbl[0].timestamp < this._M.m_bookmarkList[i].timestamp)
								{
									lbl[0].timestamp = this._M.m_bookmarkList[i].timestamp;
								}
							}
						}
					}
					this._M.m_bookmarkList[i].notes = "";
					// закладка с примечанием?
					try 
					{
						if (this._M.enableNotes && bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].notes).length)
						{
							this._M.m_bookmarkList[i].notes = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].notes)[0].childNodes[0].nodeValue;
						}
					}
					catch(e1)
					{
						this._M.ErrorLog("GBE:doBuildMenu", "Obtain bookmark notes - error. Last processing bookmark - " + JSON.stringify(this.m_bookmarkList[i]) );
						this._M.refreshInProgress = false;
						throw e1;
					}
				}


				// сортируем массив закладок
				this._M.m_bookmarkList.sort((this._M.sortType == "timestamp")? this.compareByDate : this.compareByName);	

				// сортируем массив меток
				lbs.sort((this._M.sortType == "timestamp") ? this.compareByDate : this.compareByName);	
				allLabelsStr = "";//this.labelSep;
				lbs.forEach(function(element, index) {
				  allLabelsStr += element.title + self._M.labelSep;
				});

				if (allLabelsStr.length > 0)
				{
					allLabelsStr = allLabelsStr.substr(0, allLabelsStr.length-5);
				}

				// получаем массив меток
				this._M.m_labelsArr = allLabelsStr.split(this._M.labelSep);
			}
			else
			{
				allLabelsStr = this._M.m_labelsArr.join(this._M.labelSep);
			}

			if (this._M.m_labelsArr.length && allLabelsStr !== "")
			{
				let m_labelsArrLength = this._M.m_labelsArr.length;
				// добавляем метки в меню (в виде папок)
				for (i = 0; i < m_labelsArrLength; i++) 
				{
					if (this._M.m_labelsArr[i] == "") 
					{
						continue;
					}
					var arr_nested_label = this._M.m_labelsArr[i].split(this._M.nestedLabelSep);
					if (arr_nested_label.length == 1)
					{
						//var testLabel = GBE_GBlist.getElementsByAttribute('id',"GBE_" + this.m_labelsArr[i])[0];
						if (GBE_GBlist.getElementsByAttribute('id',"GBE_" + this._M.m_labelsArr[i])[0] == null)
						{
							this.appendLabelItem(GBE_GBlist_separator, document.createElement('menu'), this._M.m_labelsArr[i], this._M.m_labelsArr[i]);
						}
					}
					else
					{
						var fullName = arr_nested_label[0];
						var tempMenu = GBE_GBlist.getElementsByAttribute('id',"GBE_" + fullName)[0];
						if (tempMenu == null)
						{
							this.appendLabelItem(GBE_GBlist_separator, document.createElement('menu'), fullName, fullName);
						}
						
						for (j = 1; j < arr_nested_label.length; j++)
						{
							var parentContainer = GBE_GBlist.getElementsByAttribute('id',"GBE_" + fullName)[0].childNodes[0];
							fullName += this._M.nestedLabelSep + arr_nested_label[j];
							var tempSubMenu = GBE_GBlist.getElementsByAttribute('id',"GBE_" + fullName)[0];
							if (tempSubMenu == null)
							{
								this.appendLabelItem(
									parentContainer, document.createElement('menu'), 
									fullName, arr_nested_label[j], fullName)
								;
							}							
						}
					}
				}
			}

			// добавляем закладки в меню
			let m_bookmarkListLength = this._M.m_bookmarkList.length;
			for (i = 0; i < m_bookmarkListLength; i++) 
			{
				if (this._M.m_bookmarkList[i].url == "")
				{
					this._M.doRequestBookmarkURL(this._M.m_bookmarkList[i].id, this._M.m_bookmarkList[i].title, i, this.GBE_menupopup, true);
				}
				var parentContainer,
						tempMenuitem;
				// если у закладки есть метки
				if (this._M.m_bookmarkList[i].labels !== "") 
				{
					// то добавляем ее во вложенное меню каждой метки
					for (j = 0; j < this._M.m_bookmarkList[i].labels.length; j++)
					{
						tempMenuitem = document.createElement('menuitem');
						parentContainer = GBE_GBlist.getElementsByAttribute("id", "GBE_" + this._M.m_bookmarkList[i].labels[j])[0].childNodes[0];
						this.appendMenuItem(parentContainer, tempMenuitem, this._M.m_bookmarkList[i]);
					}
				}
				else
				{
					// иначе - в основное меню
					tempMenuitem = document.createElement('menuitem');
					parentContainer = GBE_GBlist_separator;
					if (this._M.enableLabelUnlabeled)
					{
						// закладки без метки добавляем в папку labelUnlabeledName
						parentContainer = GBE_GBlist.getElementsByAttribute("id", "GBE_" + this._M.labelUnlabeledName)[0].childNodes[0];
					}
					this.appendMenuItem(parentContainer, tempMenuitem, this._M.m_bookmarkList[i]);
				}
			}
			this._M.needRefresh = false;
			this._M.refreshInProgress = false;

			// удаляем метку labelUnlabeledName из массива меток
			if (this._M.enableLabelUnlabeled)
			{
				this._M.m_labelsArr = jQuery.grep(this._M.m_labelsArr, function (a) { return a != self.labelUnlabeledName; });
			}
			return true;

		}
		catch (e)
		{
			this._M.ErrorLog("GBE:doBuildMenu", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
			this._M.refreshInProgress = false;			
			return false;
		}
	},

	quickAddBookmark : function()
	{
			try
			{
				this._M.DebugLog("quickAddBookmark");
				// адрес текущей страницы
				var cUrl = window.content.location.href;
				// если список закладок и адрес не пустые 
				//if ((GBE.m_bookmarkList.length) && (cUrl !== ""))
				if (cUrl !== "")
				{
					// если у документа нет заголовка, то название закладки = адрес без протокола (например, без http://)
					var myRe = /(?:.*?:\/\/?)(.*)(?:\/$)/ig;
					var trimUrlAr = myRe.exec(cUrl);
					var trimUrl = cUrl;
					if (trimUrlAr && trimUrlAr.length > 1)
					{
						trimUrl = trimUrlAr[1];
					}

					// параметры закладки
					let windowsParams = {
							name : (window.content.document.title || trimUrl),
							id : null,
							url : cUrl,
							labels : "",
							notes : "",
							sig : this._M.m_signature
						};

					this._M.doChangeBookmarkJQuery(windowsParams, this); 
				}
			}
			catch (e)
			{
				this._M.ErrorLog("GBE:quickAddBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
			}
	},


};

window.addEventListener("load", function() { 
	fessGoogleBookmarks.init();
}, false);
window.addEventListener("unload", function() { fessGoogleBookmarks.uninit() }, false);
 
if (Application.extensions)
{
  fessGoogleBookmarks.firstRun(Application.extensions);
}
else
{
  Application.getExtensions(fessGoogleBookmarks.firstRun);
}


