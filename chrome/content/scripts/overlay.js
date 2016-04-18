/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
Version 0.2.3
+ Drag and Drop закладок
! исправлен выбор useMenuBar в настройках
! изменено чтение полей вида smh:... в списке закладок (в ответе сервера)
+ возможность искать по значению метки с помощью - label:xxxxx
	допускается только одна такая конструкция в строке поиска,
	если их будет несколько - игнорируются все 
	xxxxx - значение регистрозависимо
	(в about:config установить enableLableFilter)

Version 0.2.2
+ фокус на поле фильтра при открытии списка закладок (по просьбе Elad Shaked) 
+ при экспорте из Google Bookmarks к закладкам Firefox теперь добавляются метки
+ к всплывающей подсказке на закладке добавлена заметка (если она у закладки есть и включена enableNotes)
+ к всплывающей подсказке на закладке добавлены метки (если они у закладки есть и включена showTagsInTooltip)
! JSON.stringify rather than string concatenation to generate labels autocomplete lists и firstRun fix
+ скрытие меток
+ фильтр по url (в about:config установить enableFilterByUrl)
+ быстрый поиск (по двойному Home)
+ добавление закладки по Ctrl+D
+ иконки для темной темы
! исправлено автозаполнение меток


Version 0.2.1
+ фильтр по примечаниям (в настройка должна быть выбрана опция "Показывать примечания к закладкам")
+ добавление в закладки открытых вкладок (только из активной группы вкладок)
+ CustomizableUI для Firefox выше 29.0
+ 10 самых популярных закладок
+ 10 последних закладок
+ включение редактирования адреса для существующих закладок
+ контекстное меню  для ссылок
! автодополнение меток (в редактировании закладки) - обычный список заменен на richlist (подсвечивается введенный фрагмент)
! добавлен запрос сигнатуры при необходимости при работе с закладками
! исправлена ошибка фильтра закладок - проблема с регистром

Version 0.2.0
+ добавлены проверки при парсинге закладки
+ QR-код для закладок
+ форма для импорта/экспорта закладок, сохранения/загрузки закладок в/из файла
+ изменена структура дополнения: для работы в нескольких окнах браузера
+ кнопки на панели для обычного и быстрого добавления закладок
+ параметры для задания минимальной и максимальной ширины списка закладок
! при нажатии на кнопку Обновить список закладок не закрывается, а отображается loadingHbox (при ошибке загрузки errorHbox)
! не сбрасывался флаг refreshInProgress при ошибках в doBuildMenu
! удалена jQuery

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

// if (fGoogleBookmarksModule.above29)
// {
// 	Cu.import("resource:///modules/CustomizableUI.jsm");
// }

// Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(
// 	Ci.mozIJSSubScriptLoader).loadSubScript("chrome://GBE/content/scripts/jquery.min.js"); 

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
	    //this._M.oldURL = aURI.spec;
	  }
	  catch (e)
		{
			this._M.ErrorLog("GBE:processNewURL", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	 },

	// обработчик изменения настроек дополнения
	observe : function(aSubject, aTopic, aData) {
		try
		{
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
		    case "darkThemeIcon":
		    	this._M.darkThemeIcon = this._M.prefs.getBoolPref(aData);
		    	this.setButtonIcons();
		    	break;
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:observe", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// добавление/удаление дополнительных кнопок (обычное и быстрое добавление закладки)
	// id - код кнопки
	// prefValue - отобразить/скрыть кнопку (boolean)
	setAdditionalButton : function(id, prefValue)
	{
		try
		{
	  	if (this._M.above29)
	  	{
	  		if (prefValue)
		  	{
		  		this.installButton(id);
		  	}
		  	else
		  	{
		  		this.removeButton(id);
		  	}
	  	}
		  else	
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
		  }
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:setAdditionalButton", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// добавление кнопки на панель
	installButton : function(id)
	{
		this._M.DebugLog("installButton");
		try 
		{
			if (this._M.above29)
			{
				let position = this._M.prefs.getIntPref(id.replace("-","_")+ "Position");
				let place = this._M.prefs.getCharPref(id.replace("-","_")+ "Place");

				let test_place = CustomizableUI.getPlacementOfWidget(id);
				if (test_place && test_place.area == place)
				{
					// this._M.ErrorLog("installButton", id, "already installed in ", place);
					return;
				}

				if (position == -1)
				{
					position = CustomizableUI.getWidgetIdsInArea(place).length;
				}
				CustomizableUI.addWidgetToArea(id, place,	position);
			}
			else
			{
				let toolbarId = "nav-bar";
				let toolbar = document.getElementById(toolbarId);
				//add the button at the end of the navigation toolbar	
				toolbar.insertItem(id, toolbar.lastChild);
				toolbar.setAttribute("currentset", toolbar.currentSet);
				document.persist(toolbar.id, "currentset");

				//if the navigation toolbar is hidden, 
				//show it, so the user can see your button
				toolbar.collapsed = false;
			}
		}
		catch(e)
		{
			this._M.ErrorLog("GBE:installButton", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	// удаление кнопки с панели
	removeButton : function(id)
	{
		try 
		{
			if (this._M.above29 && CustomizableUI.getPlacementOfWidget(id) !== null)
			{
				CustomizableUI.removeWidgetFromArea(id);
			}
		}
		catch(e)
		{
			this._M.ErrorLog("GBE:removeButton", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}

	},
	 
	firstRun : function (extensions) 
	{
	    var extension = extensions.get("GBE@fess16.blogspot.com");
	    if (extension.firstRun)
	    {
	    	fessGoogleBookmarks.installButton("GBE-toolbaritem");	
	    }
	},

	// при перемещении кнопок запоминаем их новое расположение (панель и позицию)
	onWidgetMoved : function(aWidgetId, aArea, aOldPosition, aNewPosition)
	{
		try
		{
			if (aWidgetId == "GBE-toolbaritem")
			{
				this._M.prefs.setCharPref("GBE_toolbaritemPlace", aArea);
				this._M.prefs.setIntPref("GBE_toolbaritemPosition", aNewPosition);
			}
			if (aWidgetId == "GBE-btnAddBookmark")
			{
				this._M.prefs.setCharPref("GBE_btnAddBookmarkPlace", aArea);
				this._M.prefs.setIntPref("GBE_btnAddBookmarkPosition", aNewPosition);
			}
			if (aWidgetId == "GBE-btnQuickAddBookmark")
			{
				this._M.prefs.setCharPref("GBE_btnQuickAddBookmarkPlace", aArea);
				this._M.prefs.setIntPref("GBE_btnQuickAddBookmarkPosition", aNewPosition);
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onWidgetMoved", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// при добавлении кнопок запоминаем их расположение (панель и позицию)
	// для дополнительных кнопок - еще включаем опции их отображения (если кнопки были установлены из палитры вручную) 
	onWidgetAdded : function(aWidgetId, aArea, aPosition)
	{
		try
		{
			if (aWidgetId == "GBE-toolbaritem")
			{
				this._M.prefs.setCharPref("GBE_toolbaritemPlace", aArea);
				this._M.prefs.setIntPref("GBE_toolbaritemPosition", aPosition);
			}
			if (aWidgetId == "GBE-btnAddBookmark")
			{
				this._M.prefs.setCharPref("GBE_btnAddBookmarkPlace", aArea);
				this._M.prefs.setIntPref("GBE_btnAddBookmarkPosition", aPosition);
				this._M.prefs.setBoolPref("showToolbarAddBtn",true);
			}
			if (aWidgetId == "GBE-btnQuickAddBookmark")
			{
				this._M.prefs.setCharPref("GBE_btnQuickAddBookmarkPlace", aArea);
				this._M.prefs.setIntPref("GBE_btnQuickAddBookmarkPosition", aPosition);
				this._M.prefs.setBoolPref("showToolbarQuickAddBtn",true);
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onWidgetAdded", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// при удалении дополнительных кнопок выключаем опции их отображения (удаление кнопки с панели вручную)
	onWidgetRemoved : function(aWidgetId, aArea)
	{
		try
		{
			if (aWidgetId == "GBE-btnAddBookmark")
			{
				this._M.prefs.setBoolPref("showToolbarAddBtn",false);
			}
			if (aWidgetId == "GBE-btnQuickAddBookmark")
			{
				this._M.prefs.setBoolPref("showToolbarQuickAddBtn",false);
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onWidgetRemoved", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// инициализация дополнения
	init : function()
	{
		try
		{
			this._M.debugId = (new Date()).getTime();	
			this._M.DebugLog("init");
			this._M.getPrefsValues();
			this._M.refreshInProgress = false;

			if (window.location == "chrome://browser/content/browser.xul")
			{
				// добавляем обработчик изменения настроек
				this._M.prefs.addObserver("", this, false);
				if (this._M.above29)
				{
					CustomizableUI.addListener(this);
				}

				this.switchInteface(this._M.useMenuBar);
				this.setButtonIcons();
				this.setAdditionalButton("GBE-btnAddBookmark", this._M.showToolbarAddBtn);
				this.setAdditionalButton("GBE-btnQuickAddBookmark", this._M.showToolbarQuickAddBtn);

				//if (this.AppVersion.indexOf("29.") == 0)

				if(this._M.checkLogin() && (document.getElementById("GBE-toolbarbutton") 
					|| (document.getElementById("GBE-MainMenu") && !document.getElementById("GBE-MainMenu").getAttribute("hidden") ) ) )
				{
					this.refreshBookmarks(false);
				}
				// добавляем обработчик изменения адреса
				gBrowser.addProgressListener(this);

	  		window.addEventListener("contextmenu", fessGoogleBookmarks.contextPopupShowing, false);

	  		if (this._M.enableQuickSearch)
	  		{ 
	  			window.addEventListener("keyup", fessGoogleBookmarks.keyUpHandler, false);
	  		}

	  		if (this._M.enableCtrlD)
	  		{
	  			try
	  			{
	  				var AddBookmarkAs = document.getElementById("Browser:AddBookmarkAs");
	  				AddBookmarkAs.setAttribute("oncommand", "fessGoogleBookmarks.showBookmarkDialog(false);");
	  			}
	  			catch (error)
	  			{
	  				this._M.ErrorLog("GBE:init:enableCtrlD", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
	  				this._M.prefs.setBoolPref("enableCtrlD", false);
	  				this._M.ErrorLog("Set Ctrl+D command error! enableCtrlD reset to false");
	  			}
	  		}

				// в настройка включено автодополнение в адресной строке
				if (this._M.enableGBautocomplite)
				{
					// включаем автодополнение
					this.setURLBarAutocompleteList("on");
				}
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:init", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// обработчик двойного нажатия клавиши Home
	keyUpHandler	: function(event)
	{
		try
		{
			if (event.keyCode === 36)
			{
				var d = new Date();
				var n = d.getTime(); 
				// если промежуток между нажатиями от 10 до 500 мс открываем окно быстрого поиска
				if 	(	fessGoogleBookmarks._M.lastKey == event.keyCode 
							&& (n - fessGoogleBookmarks._M.keyUpTime > 10) 
							&& (n - fessGoogleBookmarks._M.keyUpTime < 500)
						)
				{
					var args = {
					  param1: fessGoogleBookmarks
					};

					args.wrappedJSObject = args;

					var watcher = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
					                            .getService(Components.interfaces.nsIWindowWatcher);
					watcher.openWindow(null, "chrome://GBE/content/overlays/search.xul", "Search", "chrome,titlebar=yes,centerscreen", args);

					fessGoogleBookmarks._M.lastKey = null;
					fessGoogleBookmarks._M.keyUpTime = 0;
				}
				else
				{
					fessGoogleBookmarks._M.lastKey = event.keyCode;
					fessGoogleBookmarks._M.keyUpTime = n;
				}
			}
		}
		catch(error)
		{
			fessGoogleBookmarks._M.ErrorLog("GBE:keyUpHandler", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	uninit : function()
	{
		try
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
				if (this._M.above29)
				{
					CustomizableUI.removeListener(this);
				}
				// var menu = document.getElementById("contentAreaContextMenu");
	  		// menu.removeEventListener("popupshowing", fessGoogleBookmarks.contextPopupShowing);
	  		window.removeEventListener("contextmenu", fessGoogleBookmarks.contextPopupShowing);
	  		if (this._M.enableQuickSearch)
	  		{ 
	  			window.removeEventListener("keyup", fessGoogleBookmarks.keyUpHandler);
	  		}
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:uninit", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// отображает пункт добавления ссылки в закладки (при правом клике на ссылках)
	contextPopupShowing: function(e)
	{
		try
		{
			if(e.target.nodeName == 'A') 
			{
				let menuitem = document.getElementById("GBE-contextMenuAddLinkToBookmark");
				if(menuitem)
				{
				  menuitem.hidden = false;
				  menuitem.setAttribute("link", e.target.href);
				  let _title = e.target.title;
				  let _text = e.target.text;
				  let linkTitle = "";
				  if ((_title != null) && (_title.length > 0))
				  {
				  	linkTitle = _title;
				  }
				  else if ((_text != null) && (_text.length > 0))
				  {
				  	linkTitle = _text;
				  }
				  menuitem.setAttribute("linkTitle", linkTitle);
				}
			}
			else 
			{			
				let menuitem = document.getElementById("GBE-contextMenuAddLinkToBookmark");
				if(menuitem)
				{
				  menuitem.hidden = true;
				}
			}
		}
		catch(error)
		{
			fessGoogleBookmarks._M.ErrorLog("GBE:contextPopupShowing", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// открывает диалог добавления в закладки после клика в контекстром меню добавления ссылки
	AddLinkToBookmark: function(e)
	{
		try
		{
			let link = e.target.getAttribute("link");
			let linkTitle = e.target.getAttribute("linkTitle");
			if (link.length > 0)
			{
				this.showBookmarkDialog(false,"", {url : link, title : linkTitle});
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:AddLinkToBookmark", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	// в зависимости от useMenuBar прячет/показывает кнопку или пункт меню
	switchInteface : function(useMenuBar)
	{
		this._M.DebugLog("switchInteface");
		let menuElement = document.getElementById('GBE-MainMenu');
		let id = 'GBE-toolbaritem';
		if (this._M.above29)
		{
			try
			{
				if (!useMenuBar)
				{
					this.installButton(id);
					if (typeof(menuElement) != 'undefined' && menuElement != null)
					{
						menuElement.setAttribute("hidden", true);
					}
				}
				else
				{
					this.removeButton(id);
					if (typeof(menuElement) != 'undefined' && menuElement != null)
					{
						menuElement.setAttribute("hidden", false);
					}

				}
			}
			catch(e)
			{
				this._M.ErrorLog("GBE:switchInteface", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
			}
		}
		else
		{
			let toolbarElement = document.getElementById('GBE-toolbaritem');
			try
			{
				if (!useMenuBar)
				{
					if (typeof(toolbarElement) != 'undefined' && toolbarElement != null)
					{
						toolbarElement.setAttribute("hidden", false);
						menuElement.setAttribute("hidden", true);
					}
					else
					{
						try
						{
							this._M.ErrorLog("switchInteface");
							this._M.ErrorLog(JSON.stringify(CustomizableUI.getPlacementOfWidget("GBE-toolbaritem")));

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
					if (typeof(menuElement) != 'undefined' && menuElement != null)
					{
						menuElement.setAttribute("hidden", false);
					}
					if (typeof(toolbarElement) != 'undefined' && toolbarElement != null)
					{
						toolbarElement.setAttribute("hidden", true);
					}
				}
			}
			catch(e)
			{
				this._M.ErrorLog("GBE:switchInteface", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
			}
		}
	},

	/*
		добавляет в адресную строку автодополнение по закладкам Google / восстанавливает первоначальное значение параметров 
	 */
	setURLBarAutocompleteList : function(state)
	{
		try
		{
			this._M.DebugLog("setURLBarAutocompleteList");
			var searchList = this._M.defAutocompliteList;
			if (state != 'off') 
			{
				var s = this._M.defAutocompliteList = gURLBar.getAttribute('autocompletesearch');
				searchList = 'gbookmarks-autocomplete' + " " + s;
			}
			gURLBar.setAttribute("autocompletesearch", searchList);
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:setURLBarAutocompleteList", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
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
					if (showMenu) this.preventMenuHiding = true;
					this.doRequestBookmarks(showMenu); 
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
					if (!this._M.useMenuBar) 
					{
						if (this._M.darkThemeIcon)
							document.getElementById("GBE-toolbarbutton").setAttribute("class", "GBE-full-star dark toolbarbutton-1");
						else
							document.getElementById("GBE-toolbarbutton").setAttribute("class", "GBE-full-star toolbarbutton-1");
					}
					if (this._M.showToolbarAddBtn && document.getElementById("GBE-btnAddBookmark"))
					{
						document.getElementById("GBE-btnAddBookmark").setAttribute("class", "GBE-button-OFF toolbarbutton-1");
					}
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/content/images/bkmrk_add_off.png");
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "true");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/content/images/bkmrk_edit_on.png");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "false");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/content/images/bkmrk_delete_on.png");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "false");

					document.getElementById("GBE-contextMenuAddBookmark").setAttribute("hidden", "true");

					if (document.getElementById("GBE-btnQuickAddBookmark"))
					{
						document.getElementById("GBE-btnQuickAddBookmark").setAttribute("class","GBE-button-OFF toolbarbutton-1");
					}
				}
				else
				{
					if (!this._M.useMenuBar) 
					{
						if (this._M.darkThemeIcon)
							document.getElementById("GBE-toolbarbutton").setAttribute("class", "GBE-empty-star dark toolbarbutton-1");
						else
							document.getElementById("GBE-toolbarbutton").setAttribute("class", "GBE-empty-star toolbarbutton-1");
					}
					if (this._M.showToolbarAddBtn && document.getElementById("GBE-btnAddBookmark"))
					{
						document.getElementById("GBE-btnAddBookmark").setAttribute("class", "toolbarbutton-1");
					}
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/content/images/bkmrk_add_on.png");
					document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "false");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/content/images/bkmrk_edit_off.png");
					document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "true");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/content/images/bkmrk_delete_off.png");
					document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "true");

					document.getElementById("GBE-contextMenuAddBookmark").setAttribute("hidden", "false");

					if (document.getElementById("GBE-btnQuickAddBookmark"))
					{
						document.getElementById("GBE-btnQuickAddBookmark").setAttribute("class","toolbarbutton-1");
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
			if (list)
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
				// document.getElementById("GBE-hmenuAdd").setAttribute("image", "chrome://GBE/content/images/bkmrk_add_on.png");
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
				if (this._M.showToolbarAddBtn && document.getElementById("GBE-btnAddBookmark"))
				{
					document.getElementById("GBE-btnAddBookmark").setAttribute("class", "toolbarbutton-1 GBE-button-OFF");
				}
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "true");
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/content/images/bkmrk_add_off.png");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/content/images/bkmrk_edit_off.png");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "true");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/content/images/bkmrk_delete_off.png");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "true");
			}
			if (!this._M.useMenuBar)
			{
				// document.getElementById("GBE-filterHBox").setAttribute("hidden","true");
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
		try
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
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onHideMenu", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	onPopupHiding : function(event)
	{
		if (this.preventMenuHiding) 
		{
			event.preventDefault();
			this.preventMenuHiding = false;
		}
	},

	hideBookmarks : function(hide)
	{
		try
		{
			this._M.DebugLog("hideBookmarks");
			let items = document.getElementById("GBE-ToolBar-popup").getElementsByClassName('google-bookmarks');
			let re = new RegExp(this._M.hiddenLabelsTitle + "$");
			if (hide)
			{
				for(let i = 0; i < items.length; i++) 
				{
				  items[i].setAttribute("hidden", true);
				}
			}
			else
			{
				for(let i = 0; i < items.length; i++) 
				{
				  // skip hidden labels
				  var label = items[i].getAttribute("label");
				  var fullName = items[i].getAttribute("fullName");
				  if (this._M.enableLabelHiding && !this._M.showHiddenLabels && 
				  	(label.search(re) !== -1 || fullName.indexOf(this._M.hiddenLabelsTitle+this._M.nestedLabelSep) == 0))
				  {
				  	continue;
				  }
				  items[i].setAttribute("hidden", false);
				}
			}
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onWidgetRemoved", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
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
			fGoogleBookmarksModule.ErrorLog("GBE:handleClick", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	/**
	 * открывает заданный адрес в новой или той же вкладке
	 * @param  {[type]} url открываемый адрес
	 * @param  {[type]} inSameTab = false флаг открытия в новой вкладке
	 */
	showURL : function(url, inSameTab = false)
	{
		try
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
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onWidgetRemoved", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	/**
	 * открывает диалог добавления (редактирования) закладки
	 * @param  {bool} editBkmk = true режим редактирования (true) или добавления (false) закладки
	 * @param  {string} addLabel = "" режим добавления новой метки к закладке (через контекстное меню метки)
	 */
	showBookmarkDialog : function(editBkmk = true, addLabel = "", link = null)
	{
		try
		{
			this._M.DebugLog("showBookmarkDialog");
			// адрес текущей страницы
			var cUrl = (link == null) ? window.content.location.href : link.url ;
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
						name : (link == null) ? (window.content.document.title || trimUrl) : (link.title || trimUrl),
						id : null,
						url : cUrl,
						labels : "",
						notes : "",
						sig : this._M.m_signature
					};

				var labelsList = this._M.m_labelsArr;

				// автозаполнение меток на основании заголовка страницы
				if (this._M.suggestLabel && window.content.document.title && labelsList !== null && !editBkmk && link == null)
				{
					// все слова из заголовка
					var words = window.content.document.title.split(/[ {}|=\[\]\(\)\-\\\/!?,.;:]/);

					// для хранения уникальных слов
					var uniqueWords = [];
					var labels = [];
					var self = this;
					// проходим по всем словам
					words.forEach(function(el, i, array)
					{
						// пропускаем повторяющиеся и слова из одного символа
				    if(uniqueWords.indexOf(el) === -1 && el.length > 1) 
				    {
				    	uniqueWords.push(el);
				    	// регулярка для поиска
				    	// ищем с начала строки/после nestedLabelSep до конца строки/nestedLabelSep 
				    	// ограничиваем уровень вложенности метки
				    	// например: ищем chrome, есть закладка Browsers/Chrome/test
				    	// newLabel будет Browsers/Chrome/
				    	// Browsers/браузер Chrome - не подходит
				    	// Browsers/Chrome браузер - подходит
							let SearchString = new RegExp("(.*(^|" + self._M.nestedLabelSep + ")" 
								+ el + ")[^$" + self._M.nestedLabelSep + "]*", "i");
						  // просматриваем массив меток
				      for (let i=0; i<labelsList.length; i++) 
				      {
				      	if (SearchString.test(labelsList[i]))
				      	{
				      		let find = SearchString.exec(labelsList[i]);
				      		// если такой метки еще не было, добавляем ее в массив
				      		if (labels.indexOf(find[0]) === -1)
				      		{
				      			labels.push(find[0]);
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
						if (this._M.windowsParams.labels.indexOf(addLabel === -1)) this._M.windowsParams.labels.push(addLabel);
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
		try
		{
			this._M.DebugLog("showPrefWindow");
			if (null == this._M._preferencesWindow || this._M._preferencesWindow.closed) 
			{
		    // let instantApply = Application.prefs.get("browser.preferences.instantApply");
		    let instantApply = Components.classes["@mozilla.org/preferences-service;1"]
		    	.getService(Components.interfaces.nsIPrefService).getBranch("browser.preferences.").getBoolPref("instantApply");
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
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onWidgetRemoved", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
	},

	showFFbookmarkWindow : function()
	{
		try
		{
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
		}
		catch(error)
		{
			this._M.ErrorLog("GBE:onWidgetRemoved", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
		}
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
			this._M.m_signature = null;
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
			e.stopPropagation();
			// set focus to filter textbox
			var textbox = document.getElementById("GBE-filterTextbox");
			if (textbox) textbox.focus();
		}
	},

	/*
	показывает отфильтрованные закладки
	 */
	filterBookmarks : function(searchValue)
	{
		// var GBE_GBlist = document.getElementById("GBE-GBlist");
		var GBE_searchResultList = document.getElementById("GBE-searchResultList");
		var search = searchValue.value.trim();
		// копия массива предыдущих отфильтрованных закладок
		var tempArray = this._M.tempFilterArray.slice(); 
		GBE_searchResultList.setAttribute("hidden", true);
		this.doClearList("GBE-searchResultList","menuitem-iconic google-bookmarks-filter");
		// фильтр пустой
		if (search.length == 0)
		{
			// показываем основной список (все закладки и метки)
			this.hideBookmarks(false);
		}
		else
		{
			let self = this;
			let checkBookmark = function (bookmark, search) 
			{
				// self._M.ErrorLog(search, "|", re1);
				let re1 = search.match(/^"\S+"$/ig);
				if (re1 && Array.isArray(re1) && re1.length == 1)
				{
					re2 = new RegExp('(?:^|\\s)(' + search.trim().replace(/"/g,"") + ')(?:\\s|$|[,.:;])',"ig");
					if (re2.test(bookmark.title))  return true;
					if (re2.test(bookmark.notes))  return true;
					if (self._M.enableFilterByUrl && re2.test(bookmark.notes))  return true;
				}
				else
				{
					if (bookmark.title.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
					if (bookmark.notes.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
					if (self._M.enableFilterByUrl && bookmark.url.toLowerCase().indexOf(search) !== -1) return true;
				}
				return false;
			};

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
/*				if(this._M.oldFilterValue !== "" && search.indexOf(this._M.oldFilterValue) == 0)
				{
					// то ищем только среди ранее отфильтрованных закладок
					for(var i = 0; i < tempArray.length; i++)
					{
						var hit = false;
						if (checkBookmark(tempArray[i], search))
						{
							hit = true;							
						}
						else
						{
							var words = search.split(/\s+/);
							for (var j = 0; j < words.length; j++)
							{
								if (checkBookmark(tempArray[i], words[j])) 
								{
									hit = true;
									break;
								}
							}
						}
						// и формируем this.tempFilterArray заново
						if (hit) 
						{
							tempMenuitem = document.createElement('menuitem');
							this.appendSearchMenuItem(GBE_searchResultList, tempMenuitem, tempArray[i]);
							this._M.tempFilterArray.push(tempArray[i]);
						}
					}
				}
				else*/
				{
					var labelFilter = "";
					// разрешен фильтр по метке
					if (this._M.enableLableFilter)
					{
							//label:Programming/jQuery
							// var re = new RegExp(/(label:(\S+))(?=\s|$)/ig);
							var re = new RegExp(/((?:^|\s+)(?:label:"(.*?)"))(?=\s|$)|(?:^|\s+)(?:label:([^"]\S+))(?=\s|$)/ig);
							var reMatch = search.match(re);
							// если нашли только одно совпадение
							if ( reMatch && Array.isArray(reMatch) && reMatch.length == 1)
							{
								// запоминаем его (без начального label:)
								labelFilter = reMatch[0].trim().replace("label:","").replace(/"/g,"");
							}
							// удаляем совпадения из строки поиска
							search = search.replace(re,"").trim();
					}
					var words = search.split(/\s+/);
					// var words = search.trim().split(/\s+/);

					var wordsCount = words.length;
					// иначе - поиск по всем закладкам
					for (var i = 0; i < this._M.m_bookmarkList.length; i++)
					{
						var hit = false;
						// значение фильтра по метке установлено и таких меток у закладки нет - пропускаем ее
						if (labelFilter != "" && this._M.m_bookmarkList[i].labels.indexOf(labelFilter) == -1)
							continue;

						if (checkBookmark(this._M.m_bookmarkList[i], search))
						{
							hit = true;							
						}
						else
						{
							var hitCount = 0;
							for (var j = 0; j < wordsCount; j++)
							{
								if (checkBookmark(this._M.m_bookmarkList[i], words[j])) 
								{
									hitCount++;
								}
							}
							if (hitCount == wordsCount) hit = true;
						}
						if (hit) 
						{
							tempMenuitem = document.createElement('menuitem');
							this.appendSearchMenuItem(GBE_searchResultList, tempMenuitem, this._M.m_bookmarkList[i]);
							this._M.tempFilterArray.push(this._M.m_bookmarkList[i]);
						}
					}
				}
			}
		}
		this._M.oldFilterValue = search;
		tempArray.length = 0;
	},

	// начало перемещения
	onMenuItemDragStart : function (event)
	{
		// event.target - перемещаемый элемент
		// сохраняем в dataTransfer id перемещаемого элемента и id меню, в котором он находится
		var id = {
			"id" :event.target.getAttribute ("id"), 
			"parentId" : event.target.parentNode.parentNode.getAttribute("id")};
		event.dataTransfer.setData('text/plain', JSON.stringify(id));
		event.dataTransfer.effectAllowed = "copyMove";
	},

	// во время перемещения
	onMenuItemDrag : function (event)
	{
		// перемещаемый элемент - меняем цвет шрифта на красный
		event.target.style.color = "red";
	},
	
	// завершение перемещения
	onMenuItemDragend : function (event)
	{
		try
		{
			var data = JSON.parse(event.dataTransfer.getData("text/plain"));

			// параметры перемещаемой закладки
			let params = {name : "", id : data.id, url : "", labels : "",	notes : "",	sig : this._M.m_signature};
			this._M.getBookmark(params);

			// признак успешного перемещения
			let isdrop = false;
			// перемещали закладку - перезаписываем метки
			if (event.dataTransfer.dropEffect == "move")
			{
				params.labels = this._DropTarget;
				isdrop = true;
			}
			// копировали закладку - добавляем новую метку к исходным
			if (event.dataTransfer.dropEffect == "copy")
			{
				params.labels += "," + this._DropTarget;
				isdrop = true;
			}

			if (isdrop)
			{
				this._M.doChangeBookmark(params, this); 
				this.needRefresh = true;
			}
			event.target.style.color = "";
			this.GBE_menupopup.hidePopup();
		}
		catch (e) {
			this._M.ErrorLog("GBE:onMenuItemDragend", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
		this._currentDropTarget = null;
		event.preventDefault();
	},


	onDragover : function(event)
	{
		var data = JSON.parse(event.dataTransfer.getData("text/plain"));
	  if (data.id.length > 0)
	  {
	  	// запрет перемещения в исходный контейнер
	  	if ((event.target.localName == "menuitem") && (data.parentId == event.target.parentNode.parentNode.getAttribute("id")))
	  	{
	  		return;
	  	}
	  	event.preventDefault();
		}
	  event.stopPropagation();
	},

	_springLoadDelay: 350, // задержка появления меню при перетаскивании
  _loadTimer: null, // таймер задержки 
  _currentDropTarget : null, // текущее назначение перетаскивания
  _DropTarget : "", 

	// закрывает все открытые menupopup, кроме тех, которые выше в иерархии curentMenu
	closePopups : function (root, curentMenu)
	{
		if (root)
		{
			// реально = this.GBE_menupopup
			// находим все элементы menu
			let menuList = root.querySelectorAll('menu');
			let curId = curentMenu.getAttribute("id") + this._M.nestedLabelSep;
			for (let i=0; i < menuList.length; i++)
			{
				let menu = menuList[i];
				// пропускаем menu, которые выше в иерархии
				if (curId.indexOf(menu.getAttribute("id") + this._M.nestedLabelSep) == 0)
				{
					continue;
				}
				// вложенный menupopup
				let menupopup = menu.lastChild;
				if (menupopup)
				{
					menupopup.removeAttribute("autoopened");
					if (menupopup.state == "open" || menupopup.state == "showing") menupopup.hidePopup();	
				}
			}
		}
	},

	// перемещаемый элемент покидает элемент-назначения 
	onMenuItemlDragExit : function(event)
	{
		try
		{
			// удаляем индикаторы перемещения в данном menupopup
			this.doClearList(event.target.parentNode.parentNode.getAttribute("id"), "GBE-menupopup-drop-indicator-bar");
			// останавливаем таймер открытия menupopup
			if (this._loadTimer) {
		    this._loadTimer.cancel();
		    this._loadTimer = null;
		  }
		}
		catch (e) {
			this._M.ErrorLog("GBE:onMenuItemlDragExit", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},
	
	// перемещаемый элемент покидает элемент-назначения menu
	onLabelDragExit : function(event)
	{
		try
		{
			if (event.target.localName !== "menu") return;
			event.target.setAttribute("_moz-menuactive", false);
		  if (this._loadTimer) {
		    this._loadTimer.cancel();
		    this._loadTimer = null;
		  }
		}
		catch (e) {
			this._M.ErrorLog("GBE:onLabelDragExit", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	// перемещаемый элемент заходит в элемент-назначения MenuItem
	onMenuItemlDragEnter : function(event)
	{
		try
		{
			let data = JSON.parse(event.dataTransfer.getData("text/plain"));
		  if (data.id.length > 0)
		  {
				this._currentDropTarget = event.target.parentNode.parentNode;
				// закрываем все остальные menupopup
		  	this.closePopups(this.GBE_menupopup, this._currentDropTarget);
		  	// убираем индикаторы перемещения в текущем меню
				this.doClearList(this._currentDropTarget.getAttribute("id"), "GBE-menupopup-drop-indicator-bar");
				// в пределах одного меню (метки) не перемещаем
				if (data.parentId == this._currentDropTarget.getAttribute("id")) return;

				// делаем копию индикатора перемещения, вставляем ее после текущего MenuItem
				let _indClone = this._indicatorBar.cloneNode(true);
				_indClone.setAttribute("hidden", false);
				_indClone.setAttribute("class", "GBE-menupopup-drop-indicator-bar");
				_indClone.setAttribute("id", event.target.getAttribute("id")+"_indicatorBar");
				event.target.parentNode.insertBefore(_indClone, event.target.nextSibling);

				event.preventDefault();
				event.stopPropagation();
			}
		}
		catch (e) {
			this._M.ErrorLog("GBE:onMenuItemlDragEnter", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	// перемещаемый элемент заходит в элемент-назначения Menu
	onLabelDragenter : function(event)
	{
		try
		{
			if (event.target.localName !== "menu") return;
			this._currentDropTarget = event.target;
			event.target.setAttribute("_moz-menuactive", true);
			// вложенный menupopup
			let popup = event.target.lastChild;
			// таймер открытия menupopup
			this._loadTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
			this._loadTimer.initWithCallback(() => {
			  this._loadTimer = null;
			  popup.setAttribute("autoopened", "true");
			  // закрываем все остальные menupopup
				this.closePopups(this.GBE_menupopup, event.target);
			  popup.showPopup(popup);
			}, this._springLoadDelay, Ci.nsITimer.TYPE_ONE_SHOT);

			event.preventDefault();
			event.stopPropagation();
		}
		catch (e) {
			this._M.ErrorLog("GBE:onLabelDragenter", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	// выполнено перемещение на элемент-назначения menupopup
	onMenuItemDrop : function(event)
	{
		try
		{
			var data = JSON.parse(event.dataTransfer.getData("text/plain"));
		  if (data.id.length > 0)
		  {
		  	if (data.parentId == event.target.parentNode.parentNode.getAttribute("id")) return;
		  	let parent = event.target.parentNode.parentNode;
		  	this._DropTarget = parent.getAttribute("fullName");
		  	// если переместили на menuitem, расположенный в this.GBE_menupopup - новая метка пустая
		  	if (event.target.parentNode.getAttribute("id") == this.GBE_menupopup.getAttribute("id"))
		  	{
					parent = event.target.parentNode;
					this._DropTarget = ""
		  	}
		  	// закрываем ВСЕ menupopup
		  	this.closePopups(this.GBE_menupopup, this.GBE_menupopup);
		  	// удаляем все индикаторы перемещения
				this.doClearList(parent.getAttribute("id"), "GBE-menupopup-drop-indicator-bar");
			}
			event.preventDefault();
			event.stopPropagation();
		}
		catch (e) {
			this._M.ErrorLog("GBE:onMenuItemDrop", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	// выполнено перемещение на элемент-назначения menu
	onLabelDrop : function(event)
	{
	  try
	  {
		  event.target.setAttribute("_moz-menuactive", false);
		  var data = JSON.parse(event.dataTransfer.getData("text/plain"));
		  if (data.id.length > 0)
		  {
				this.closePopups(this.GBE_menupopup, this.GBE_menupopup);
				this.doClearList(event.target.getAttribute("id"), "GBE-menupopup-drop-indicator-bar");
				// новая метка = меню.fullName
				this._DropTarget = event.target.getAttribute("fullName");
			}
		  event.preventDefault();
		  event.stopPropagation();
		}
		catch (e) {
			this._M.ErrorLog("GBE:onLabelDrop", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
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
		let tooltiptext = value.url;
		if (this._M.enableNotes && value.notes != "") 
		{
			tooltiptext += "\n" + document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.TooltipNotesLabel") +
			"\n" + value.notes; 
		}
		if (this._M.showTagsInTooltip && value.labels != "")
		{
			tooltiptext += "\n" + document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.TooltipTagsLabel") +
			"\n" + value.labels;
		}
	
		item.setAttribute("tooltiptext", tooltiptext);
		item.setAttribute("class", "menuitem-iconic google-bookmarks");
		item.setAttribute("style", "max-width: " + this._M.maxMenuWidth + "px;min-width: " + this._M.minMenuWidth + "px;");
		this.setFavicon(value, item); 
		item.setAttribute("context", "GBE-contextMenu");

		if (this._M.enableDnD)
		{
			item.setAttribute("ondragstart", "fessGoogleBookmarks.onMenuItemDragStart(event);");
			item.setAttribute("ondrag", "fessGoogleBookmarks.onMenuItemDrag(event);");
			item.setAttribute("ondragend", "fessGoogleBookmarks.onMenuItemDragend(event);");
			item.setAttribute("ondragover", "fessGoogleBookmarks.onDragover(event);");
			item.setAttribute("ondragenter", "fessGoogleBookmarks.onMenuItemlDragEnter(event);");
			item.setAttribute("ondragexit", "fessGoogleBookmarks.onMenuItemlDragExit(event);");
			item.setAttribute("ondrop", "fessGoogleBookmarks.onMenuItemDrop(event);");
		}

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
		item.setAttribute("style", "max-width: " + this._M.maxMenuWidth + "px;min-width: " + this._M.minMenuWidth + "px;");
		item.setAttribute("image", "chrome://GBE/content/images/folder_blue.png");
		item.setAttribute("container", "true");
		// для метки labelUnlabeledName контекстрое меню не назначаем
		if ((this._M.enableLabelUnlabeled && id == this._M.labelUnlabeledName) || id == "recent10bkmrk" || id == "most10visited") 
		{}
		else
		{
			item.setAttribute("context", "GBE-folderMenu");
		}
		// другая иконка для скрытых меток
		var re = new RegExp(this._M.hiddenLabelsTitle + "$");
		if (this._M.enableLabelHiding && (label.search(re) !== -1 || fullName.indexOf(this._M.hiddenLabelsTitle+this._M.nestedLabelSep) == 0))
		{
			item.setAttribute("image", "chrome://GBE/content/images/folder.png");
		}

		item.appendChild(document.createElement('menupopup'));
		if (id == "recent10bkmrk" || id == "most10visited")
		{
			parent.parentNode.insertBefore(item, parent);
			parent.parentNode.insertBefore(parent, item);
		}
		else
		{
			if (this._M.enableDnD)
			{
				item.setAttribute("ondragover", "fessGoogleBookmarks.onDragover(event);");
				item.setAttribute("ondragenter", "fessGoogleBookmarks.onLabelDragenter(event);");
				item.setAttribute("ondragexit", "fessGoogleBookmarks.onLabelDragExit(event);");
				item.setAttribute("ondrop", "fessGoogleBookmarks.onLabelDrop(event);");
			}

			if (parent.nodeName == "menuseparator")
			{
				parent.parentNode.insertBefore(item, parent);
			}
			else
			{
				parent.appendChild(item);
			}
		}
	},

	appendSearchMenuItem : function(parent, item, value)
	{
		item.setAttribute("label", value.title);
		item.setAttribute("id", "f_"+value.id);
		item.setAttribute("url", value.url);
		let tooltiptext = value.url;
		if (this._M.enableNotes && value.notes != "") 
		{
			tooltiptext += "\n" + document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.TooltipNotesLabel") +
			"\n" + value.notes; 
		}
		if (this._M.showTagsInTooltip && value.labels != "")
		{
			tooltiptext += "\n" + document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.TooltipTagsLabel") +
			"\n" + value.labels;
		}
		item.setAttribute("tooltiptext", tooltiptext);
		item.setAttribute("class", "menuitem-iconic google-bookmarks-filter");
		item.setAttribute("style", "max-width: " + this._M.maxMenuWidth + "px;min-width: " + this._M.minMenuWidth + "px;");
		item.setAttribute("image", value.favicon);
		item.setAttribute("context", "GBE-contextMenu");
		parent.appendChild(item);
	},

	/**
	 * при показе контекстного меню закладки
	 */
	onShowContextMenu : function(event)
	{
		try 
		{
			this._M.DebugLog("onShowContextMenu");
			// запоминаем код закладки
			this._M.currentContextId = event.target.triggerNode.getAttribute("id").replace(/^f_/,"");
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
				win.openDialog("chrome://GBE/content/overlays/qr.xul", "","chrome,centerscreen,modal",this);
			}
		}
		catch (e) {
			this._M.ErrorLog("GBE:contextShowQR", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}	
	},

	contextMenuShareBookmark : function(event, mode)
	{
		try
		{
			this._M.windowsParams = {
				name : "", id : this._M.currentContextId,	url : "", labels : "", notes : "", sig : this._M.m_signature
			};
			this._M.getBookmark(this._M.windowsParams);
			if (this._M.windowsParams.id)
			{
				var link = "";
				if (mode == "fb")
				{
					link = "https://www.facebook.com/sharer/sharer.php?u=" + this._M.windowsParams.url;
				}
				if (mode == "tw")
				{
					link = "https://twitter.com/intent/tweet?text=" + this._M.windowsParams.url + "&source=webclient";
				}
				if (mode == "email")
				{
					link = "mailto:test@example.com?"
             + "&subject=" + this._M.windowsParams.name
             + "&body=" + this._M.windowsParams.name + "%0D%0A" + escape(this._M.windowsParams.url);
				}
				this.showURL(link, false);
			}
		}
		catch (e) {
			this._M.ErrorLog("GBE:contextMenuShareBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
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
			if (this._M.enableLabelHiding)
			{
				document.getElementById("GBE-folderMenuHideFolder").setAttribute("hidden", false);
				document.getElementById("GBE-folderMenuUnhideFolder").setAttribute("hidden", true);
				document.getElementById("GBE-folderMenuUnhideAll").setAttribute("hidden", true);
			}

			if (this._M.enableLabelHiding && this._M.currentFolderId == ('GBE_' + this._M.hiddenLabelsTitle))
			{
				document.getElementById("GBE-folderMenuHideFolder").setAttribute("hidden", true);
				document.getElementById("GBE-folderMenuUnhideFolder").setAttribute("hidden", true);
				document.getElementById("GBE-folderMenuUnhideAll").setAttribute("hidden", false);
			}

			if (this._M.enableLabelHiding && this._M.currentFolderId.indexOf("GBE_" + this._M.hiddenLabelsTitle + this._M.nestedLabelSep) == 0)
			{
				document.getElementById("GBE-folderMenuHideFolder").setAttribute("hidden", true);
				document.getElementById("GBE-folderMenuUnhideFolder").setAttribute("hidden", false);
				document.getElementById("GBE-folderMenuUnhideAll").setAttribute("hidden", true);
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


	folderMenuUnhideFolder : function()
	{
		try
		{
			var folderOldName = document.getElementById(this._M.currentFolderId).getAttribute("fullName");
			var mySearchString = new RegExp("^" + this._M.hiddenLabelsTitle + this._M.nestedLabelSep, "i");
			var confirmText = document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmUnhidingText");
			if (folderOldName.search(mySearchString) == 0)
			{
				var folderUnhideName = folderOldName.replace(mySearchString, '');
				let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
				if (prompts.confirm(
					window, 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmUnhidingTitle"), 
					confirmText.replace ("%%", folderUnhideName)))
				{
					this._M.doChangeFolder(folderOldName, folderUnhideName, this._M.m_signature);
				} 
				else 
				{
					this._M.ErrorLog("folderMenuUnhideFolder", "Unhiding aborted!");
				}
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:folderMenuUnhideFolder", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	folderMenuHideFolder : function()
	{
		try
		{
			var folderOldName = document.getElementById(this._M.currentFolderId).getAttribute("fullName");
			var folderHidenName = this._M.hiddenLabelsTitle + this._M.nestedLabelSep + folderOldName;
			var confirmText = document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmHidingText");
			let prompts =	Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
			if (prompts.confirm(
				window, 
				document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmHidingTitle"), 
				confirmText.replace ("%%", folderOldName)))
			{
				this._M.doChangeFolder(folderOldName, folderHidenName, this._M.m_signature);
			} 
			else 
			{
				this._M.ErrorLog("folderMenuHideFolder", "Hiding aborted!");
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:folderMenuHideFolder", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	folderMenuUnhideAll : function()
	{
		try
		{
			if (this._M.m_bookmarkList && this._M.m_bookmarkList.length)
			{
				let prompts =	Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
				if (prompts.confirm(
					window, 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmUnhidingTitle"), 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmUnhidingAllText")))
				{
					var labelsList = this._M.m_labelsArr;
					for (var i = 0; i < labelsList.length; i++) 
					{
						if (labelsList[i].indexOf(this._M.hiddenLabelsTitle + this._M.nestedLabelSep) == 0)
						{
							var re = new RegExp("^" + this._M.hiddenLabelsTitle + this._M.nestedLabelSep, "i");
							this._M.doChangeFolder(labelsList[i], labelsList[i].replace(re, ''), this._M.m_signature);
						}
						if (labelsList[i] == this._M.hiddenLabelsTitle)
						{
							this._M.doChangeFolder(labelsList[i], '', this._M.m_signature);
						}
					};
				}
				else 
				{
					this._M.ErrorLog("folderMenuUnhideAll", "Hiding aborted!");
				}
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:folderMenuUnhideAll", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	folderMenuExport: function()
	{
		try
		{
			if (this._M.m_bookmarkList && this._M.m_bookmarkList.length)
			{
				// название метки
				var label = document.getElementById(this._M.currentFolderId).getAttribute("fullName");
				var html = "<!DOCTYPE NETSCAPE-Bookmark-file-1>\n";
				html += "<META HTTP-EQUIV='Content-Type' CONTENT=text/html; charset=UTF-8'>\n";
				html += "<TITLE>Bookmarks</TITLE>\n";
				html += "<H1>Bookmarks</H1>\n";
				html += "<DL><p>\n";
				var self = this;

				var export_folder = function(node)
				{
					html += "<DT><H3>" + node.getAttribute("fullName") + "</H3>\n";
					html += "<DL><p>\n";
					var menuPopup = node.firstChild;
					var children = menuPopup.children;
					var ch_length = children.length;
					for (var i = 0; i < ch_length; i++)
					{
						if (children[i].nodeName == "menuitem")
						{
							let params = {name : "", id : children[i].getAttribute("id"),	url : "", timestamp : "", labels : "", notes : "", sig : self._M.m_signature};
							self._M.getBookmark(params);
							html += "\t<DT><A HREF=" + '"' + params.url + ' "ADD_DATE="' 
								+ (self._M.enableNotes ? Date.parse(params.timestamp)/1000 : params.timestamp) 
								+ '">' + params.name 
								+ "</A>\n";
							if (params.length)
								html += "\t<DD>" + params.notes + "\n";
						}
						if (children[i].nodeName == "menu")
						{
							export_folder(children[i]);
						}
					}
					html += "</DL><p>\n";
				};	

				var exportLabel = document.getElementById(this._M.currentFolderId);
				export_folder(exportLabel);

				let nsIFilePicker = Ci.nsIFilePicker;
				let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
				fp.init(window, document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.SaveFileDialog.Title"), nsIFilePicker.modeSave);
				fp.defaultExtension = "html";
				fp.appendFilter("html","*.html");
				let res = fp.show();

				if (res != nsIFilePicker.returnCancel)
				{
				  let fileName = fp.fileURL.spec + ".html";
					var x = this._M.FileManager.Write(fp.file, html, true);
				}
		  	this._M.currentFolderId = "";
			}
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:folderMenuExport", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
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
				item.setAttribute("image", "chrome://GBE/content/images/bkmrk.png");  
				bkmrk.favicon = "chrome://GBE/content/images/bkmrk.png";
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
							favUrl = "chrome://GBE/content/images/bkmrk.png";
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

	doRequestBookmarks : function(showMenu)
	{
		try
		{
			this._M.DebugLog("doRequestBookmarks");
			//if (!this._M.useMenuBar) document.getElementById("GBE-filterHBox").setAttribute("hidden", true);

			document.getElementById("GBE-bc-loadingHbox").setAttribute("hidden", false);
			document.getElementById("GBE-bc-errorHbox").setAttribute("hidden", true);
			this._M.m_ganswer = null;
			this._M.m_bookmarkList = null;
			this._M.m_labelsArr = null;
			let enableNotes = this._M.enableNotes;
			let self = this;
			let hwindow = this._M.getHwindow();
			let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
			let data = 	"?output=" + (!enableNotes ? "xml" : "rss") + "&num=10000";
			request.open("GET", this._M.baseUrl + "lookup" + data, true);
			//request.open("GET", "http://10.115.161.12/my/google_bookmarks_" + (!enableNotes ? "xml" : "rss") + ".xml", true);
			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			//request.setRequestHeader('User-Agent', "Mozilla/5.0 (Windows NT 6.1; rv:26.0) Gecko/20100101 Firefox/26.0");
			//request.setRequestHeader('Accept','	text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
			request.overrideMimeType('text/xml');
			request.onreadystatechange = function()
			{
		  	if (request.readyState != 4) return;
		  	hwindow.clearTimeout(timeout) // очистить таймаут при наступлении readyState 4
	  		if (request.status == 200 && request.responseXML) 
	  		{
		    	self._M.m_ganswer = request.responseXML;
		    	// self._M.m_ganswer = request.responseXML.documentElement;
		    	self.doBuildMenu();
		    	self.preventMenuHiding = false;
		    	if (!self._M.useMenuBar)	document.getElementById("GBE-filterHBox").setAttribute("hidden", false);
		    	document.getElementById("GBE-bc-loadingHbox").setAttribute("hidden", true);
		    	document.getElementById("GBE-bc-errorHbox").setAttribute("hidden", true);
	  		} 
	  		else 
	  		{
	      	self._M.removeSIDCookie();
	  			self._M.refreshInProgress = false;
	    		self._M.ErrorLog("GBE:doRequestBookmarks", "Bookmarks loading error!");
	    		self._M.ErrorLog(request.responseText); //TODO: надо будет закоментировать
	    		document.getElementById("GBE-bc-loadingHbox").setAttribute("hidden", true);
	    		document.getElementById("GBE-bc-errorHbox").setAttribute("hidden", false);
	    		self.preventMenuHiding = false;
	  		}
	  	}
			request.send();
			let timeout = hwindow.setTimeout( 
				function(){ 
					request.abort(); 
					self._M.ErrorLog("GBE:doRequestBookmarkNote", " Error: Time over - while requesting bookmark notes");
					document.getElementById("GBE-bc-errorHbox").setAttribute("hidden", true);
					document.getElementById("GBE-bc-errorHbox").setAttribute("hidden", false);
					self.preventMenuHiding = false;
				}, 
				this._M.timeOut
			);
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:doRequestBookmarks", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
			self.preventMenuHiding = false;
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
		    sig 		: "smh:signature",
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
				var menupopup = document.getElementById("GBE-ToolBar-popup"); 
				var GBE_GBlist_separator = document.getElementById("GBE-tb-GBlist-EndSeparator");
				var GBE_GBlist_Start_separator = document.getElementById("GBE-tb-GBlist-StartSeparator");
				var _indicatorBar = document.getElementById("GBE-tb-menupopup-drop-indicator-bar");
			}
			else
			{
				var GBE_GBlist = document.getElementById("GBE-MainMenu-Popup");
				var menupopup = document.getElementById("GBE-MainMenu-Popup"); 
				var GBE_GBlist_separator = document.getElementById("GBE-mb-GBlist-EndSeparator");				
				var GBE_GBlist_Start_separator = document.getElementById("GBE-mb-GBlist-StartSeparator");				
				var _indicatorBar = document.getElementById("GBE-mb-menupopup-drop-indicator-bar");
			}
			this.GBE_menupopup = menupopup;
			this._indicatorBar = _indicatorBar;//this.GBE_menupopup.getElementsByAttribute('id',"GBE-menupopup-drop-indicator-bar")[0];

			var self = this;

			//сохраняем сигнатуру из ответа (необходима при работе с закладками)
			if (!this._M.checkSignature())
			{
				this._M.doRequestSignature();
			}
			if (!fromFile)
			{

				// получаем все метки из XML ответа сервера
				var labels = this._M.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].label);

				// получаем все закладки из XML ответа сервера
				var bookmarks = this._M.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].bkmk);
				
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

				var nsResolver = this._M.m_ganswer.createNSResolver( this._M.m_ganswer.documentElement);
				var labelsIterator = this._M.m_ganswer.evaluate(
					'//'+ bkmkFieldNames[oType].label, 
					this._M.m_ganswer, nsResolver, XPathResult.ANY_TYPE, null );
				var thsLabel = labelsIterator.iterateNext();
				while (thsLabel) {
				  // название метки
				  var labelVal = thsLabel.textContent;
				  // если такой метки во временной строке еще нет - добавляем ее (с разделителем)
				  if (allLabelsStr.indexOf(this._M.labelSep + labelVal + this._M.labelSep) === -1)
				  {
				  	allLabelsStr += (labelVal + this._M.labelSep);
				  	lbs.push({"title" : labelVal, "timestamp" : null});
				  }
				  thsLabel = labelsIterator.iterateNext();
				}

/*
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
*/
				//this._M.ErrorLog(JSON.stringify(lbs));


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

						let bookmark = this._M.xmlToJson(bookmarks[i]);
						// read id field
						if (bookmark[bkmkFieldNames[oType].id]["#text"].length) 
						{
							this._M.m_bookmarkList[i].id = bookmark[bkmkFieldNames[oType].id]["#text"];
						}
						else
						{
							this._M.m_bookmarkList[i].id = '';
							errorFlag += " id";
						}

						// read title field
						if (bookmark[bkmkFieldNames[oType].title]["#text"].length) 
						{
							this._M.m_bookmarkList[i].title = bookmark[bkmkFieldNames[oType].title]["#text"];
						}
						else
						{
							this._M.m_bookmarkList[i].title = '';
							errorFlag += " title";
						}

						// read url field
						if (bookmark[bkmkFieldNames[oType].url].hasOwnProperty("#text") &&
							bookmark[bkmkFieldNames[oType].url]["#text"].length) 
						{
		    			this._M.m_bookmarkList[i].url = bookmark[bkmkFieldNames[oType].url]["#text"];
						}
						else
						{
							this._M.m_bookmarkList[i].url = "";
							errorFlag += " url";
						}

						// read timestamp field
						if (bookmark[bkmkFieldNames[oType].date]["#text"].length)
						{
							this._M.m_bookmarkList[i].timestamp = bookmark[bkmkFieldNames[oType].date]["#text"];
						}
						else
						{
							this._M.m_bookmarkList[i].timestamp = '';
							this._M.errorFlag += "timestamp";
						}

						var bookmark_labels = [];
						// read label field
						if (oType == "rss")
						{
							if (bookmark.hasOwnProperty(bkmkFieldNames[oType].label))
							{
								if (bookmark[bkmkFieldNames[oType].label].hasOwnProperty("#text"))
								{
									bookmark_labels.push(bookmark[bkmkFieldNames[oType].label]["#text"]);
								} 
								else if (Array.isArray(bookmark[bkmkFieldNames[oType].label]))
								{
									for (var v = 0; v < bookmark[bkmkFieldNames[oType].label].length; v++) {
										bookmark_labels.push(bookmark[bkmkFieldNames[oType].label][v]["#text"]);
									};
								}
							}
						}
						else
						{
							if (bookmark.hasOwnProperty("labels"))
							{
								if (bookmark["labels"].label.hasOwnProperty("#text"))
								{
									bookmark_labels.push(bookmark["labels"].label["#text"]);
								} 
								else// if (Array.isArray(bookmark[bkmkFieldNames[oType].label]))
								{
									for (var v = 0; v < bookmark["labels"].label.length; v++) {
										bookmark_labels.push(bookmark["labels"].label[v]["#text"]);
									};
								}
							}
						}


						//this._M.ErrorLog(JSON.stringify(this._M.m_bookmarkList[i]));
						//this._M.ErrorLog(JSON.stringify(bookmark_labels));


						
/*						if (bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].id).length)
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
						}*/

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

					if (Array.isArray(bookmark_labels) && bookmark_labels.length)
					{

					}

					// закладка с метками?
					if (bookmark_labels.length)
					{
						// сохраняем метки в массив
						this._M.m_bookmarkList[i].labels = [];
						for (j = 0; j < bookmark_labels.length; j++)
						{
							this._M.m_bookmarkList[i].labels[j] =  bookmark_labels[j];
							// this._M.m_bookmarkList[i].labels[j] =  bookmark_labels[j].childNodes[0].nodeValue;
							let lbl = lbs.filter(function(val, i, ar){ return ar[i].title == bookmark_labels[j]});
							// let lbl = lbs.filter(function(val, i, ar){ return ar[i].title == bookmark_labels[j].childNodes[0].nodeValue});
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
							let lbl = lbs.filter(function(val, i, ar){ return ar[i].title == self._M.labelUnlabeledName});
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

				// запоминаем 10 последних добавленных закладок
				// (они идут всегда первыми в ответе сервера)
				if (this._M.enable10recentBookmark)
				{
					let sliceLength = (this._M.m_bookmarkList.length < 10 ? this._M.m_bookmarkList.length : 10);
					this._M.m_recent10bkmrk = this._M.m_bookmarkList.slice(0,sliceLength);
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
							// this._M.ErrorLog("GBE_" + this._M.m_labelsArr[i]);
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

			let asyncHistory = Cc["@mozilla.org/browser/history;1"].getService(Ci.mozIAsyncHistory);
			let historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
			let visitsArray = [];

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

				// заполняем 10 самых популярных закладок (из истории браузера)
				if (this._M.enable10visitedBookmark)
				{
					try
					{
						let vUri = NetUtil.newURI(this._M.m_bookmarkList[i].url);
						let options = historyService.getNewQueryOptions();
						let query = historyService.getNewQuery();
						// query.uri = uri;
						query.uri = vUri;
						let result = historyService.executeQuery(query, options);
						let cont = result.root;
						cont.containerOpen = true;
						let visitCount = 0;
						// если нашли в истории запись с данным адресом - добавляем в массив
						if (cont.childCount>0)
						{
							visitCount = cont.getChild(0).accessCount;
							visitsArray.push({"bkmsrkId" : i, "visits" : visitCount})
						}
						cont.containerOpen = false;
					}
					catch(e1)
					{
						continue;
					}
				}
			}

			this._M.needRefresh = false;
			this._M.refreshInProgress = false;
			// удаляем метку labelUnlabeledName из массива меток
			if (this._M.enableLabelUnlabeled)
			{
				this._M.m_labelsArr = this._M.m_labelsArr.filter(function(val, i, ar){ return val != self._M.labelUnlabeledName});
			}

			// вставляем 10 самых популярных закладок 
			if (this._M.enable10visitedBookmark && visitsArray.length)
			{
				visitsArray.sort(function(a,b){
					return a.visits < b.visits ? 1 : -1;
				});
				this.appendLabelItem(GBE_GBlist_Start_separator, document.createElement('menu'), "most10visited", 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.VisitedLabel"));
				let visitsLabel = GBE_GBlist.getElementsByAttribute("id", "GBE_most10visited")[0].childNodes[0];
				let visitsCount = (visitsArray.length < 10 ? visitsArray.length : 10);
				for (let i = 0; i < visitsCount; i++)
				{
					this.appendMenuItem(visitsLabel, document.createElement('menuitem'), this._M.m_bookmarkList[visitsArray[i].bkmsrkId]);
				}
			}
			visitsArray = [];

			// вставляем 10 последних добавленных закладок 
			if (this._M.enable10recentBookmark && this._M.m_recent10bkmrk.length)
			{
				this.appendLabelItem(GBE_GBlist_Start_separator, document.createElement('menu'), "recent10bkmrk", 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.RecentLabel"));
				let recentLabel = GBE_GBlist.getElementsByAttribute("id", "GBE_recent10bkmrk")[0].childNodes[0];
				for (let i = 0; i < this._M.m_recent10bkmrk.length; i++)
				{
					this.appendMenuItem(recentLabel, document.createElement('menuitem'), this._M.m_recent10bkmrk[i]);
				}
			}

			// прячем скрытые метки, если включено 
			if (!this._M.showHiddenLabels && GBE_GBlist.getElementsByAttribute('id',"GBE_" + this._M.hiddenLabelsTitle)[0] != null)
			{
				GBE_GBlist.getElementsByAttribute('id',"GBE_" + this._M.hiddenLabelsTitle)[0].setAttribute("hidden", true);
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

					this._M.doChangeBookmark(windowsParams, this); 
				}
			}
			catch (e)
			{
				this._M.ErrorLog("GBE:quickAddBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
			}
	},

	folderMenuAddAllTabs : function()
	{
		try
		{	
			// название метки
			let label = document.getElementById(this._M.currentFolderId).getAttribute("fullName");
			this.showAddAllTabsDialog(label);
			this._M.currentFolderId = "";
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:folderMenuAddAllTabs", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	showAddAllTabsDialog : function(labelName = "_OpenTabs")
	{
		try
		{
			let tabs = gBrowser.tabs;
			this._M.windowsParams = {
				label : labelName,
				tabs : []
			};
			let myRe = /(?:.*?:\/\/?)(.*)(?:\/$)/ig;
			for (let i = 0, len = tabs.length; i < len; i++) 
			{
			  let t = tabs[i];
			  if (t.hidden || t.label == "" && t.linkedBrowser.currentURI.spec == "" 
			  	|| t.linkedBrowser.currentURI.spec == "about:blank"
			  	|| t.linkedBrowser.currentURI.spec == "about:newtab")
			  {
			  	continue;
			  }
		  	let trimUrlAr = myRe.exec(t.linkedBrowser.currentURI.spec);
		  	let trimUrl = t.linkedBrowser.currentURI.spec;
		  	if (trimUrlAr && trimUrlAr.length > 1)
		  	{
		  		trimUrl = trimUrlAr[1];
		  	}

			  this._M.windowsParams.tabs.push({title : (t.label || trimUrl), uri : t.linkedBrowser.currentURI.spec})
			}

			let win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		           .getService(Components.interfaces.nsIWindowMediator)
		           .getMostRecentWindow("navigator:browser");
			win.openDialog("chrome://GBE/content/overlays/opentabs.xul", "","chrome,centerscreen,resizable,modal",this);
		}
		catch (e)
		{
			this._M.ErrorLog("GBE:showAddAllTabsDialog", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	}


};

window.addEventListener("load", function() { 
	fessGoogleBookmarks.init();
}, false);
window.addEventListener("unload", function() { fessGoogleBookmarks.uninit() }, false);
 
/*
if (Application.extensions)
{
  fessGoogleBookmarks.firstRun(Application.extensions);
}
else
{
   Application.getExtensions(fessGoogleBookmarks.firstRun);
}*/