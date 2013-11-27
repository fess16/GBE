/* 
Version 0.1.9
+ перешел на использование модуля (module.js) для хранения общих данных
- убрано все относящееся к SQLite
! диалоги открываются в модальном режиме
+ у отфильтрованных закладок добавлены иконки и всплывающие подсказки
! в линуксе не полностью прорисовывалось меню закладок после редактрирования и т.д.

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

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import('chrome://GBE/content/scripts/module.js');

// обработчик изменения адреса
fGoogleBookmarksExtension.onLocationChange = function(aProgress, aRequest, aURI) 
{
  this.processNewURL(aURI);
};

// обработчик изменения настроек дополнения
fGoogleBookmarksExtension.observe = function(aSubject, aTopic, aData) {
	if (aTopic != "nsPref:changed")
	{
	  return;
	}
	switch(aData)
	{
	  case "useMenuBar":
	  	this.switchInteface(this.prefs.getBoolPref(aData));
	    break;
	}
};

// в зависимости от useMenuBar прячет/показывает кнопку или пункт меню
fGoogleBookmarksExtension.switchInteface = function(useMenuBar)
{
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
				this.installButton();	
				this.switchInteface(this.useMenuBar);
			}
			catch(e)
			{
				this.ErrorLog("GBE:switchInteface ", "Can't use toolbar button! Try switch to menubar item.");
				this.useMenuBar = true;
				this.prefs.setBoolPref("useMenuBar", true);
				this.switchInteface(this.useMenuBar);
			}
		}
	}
	else
	{
		jQuery("#GBE-toolbaritem").hide();
		jQuery("#GBE-MainMenu").show();			
	}
};

fGoogleBookmarksExtension.init = function()
{
	this.getPrefsValues();

	if (window.location == "chrome://browser/content/browser.xul")
	{
		// добавляем обработчик изменения настроек
		this.prefs.addObserver("", this, false);

		// Components.utils.import('chrome://GBE/content/scripts/local_domains.js');

		Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(
			 Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://GBE/content/scripts/jquery.min.js"); 

		this.switchInteface(this.useMenuBar);
		 if(this.checkLogin() && (document.getElementById("GBE-toolbarbutton") || (document.getElementById("GBE-MainMenu") ) ) )
		{
			this.refreshBookmarks(false);
		}
		// добавляем обработчик изменения адреса
		gBrowser.addProgressListener(this);

		// в настройка включено автодополнение в адресной строке
		if (this.enableGBautocomplite)
		{
			// включаем автодополнение
			this.setURLBarAutocompleteList("on");
		}
	}
	// Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://GBE/content/scripts/jquery.min.js"); 

	//copy the jQuery variable into our namespace
	//var $ = window.$;

	//then restore the global $ and jQuery objects
	//jQuery.noConflict(true);
};


fGoogleBookmarksExtension.uninit = function()
{
	if (window.location == "chrome://browser/content/browser.xul")
	{
		// удаляем свои обработчики
		gBrowser.removeProgressListener(this);
		this.prefs.removeObserver("", this);
		if (this.enableGBautocomplite)
		{
			this.setURLBarAutocompleteList("off");
		}
	}
};

/*
	добавляет в адресную строку автодополнение по закладкам Google / восстанавливает первоначальное значение параметров 
 */
fGoogleBookmarksExtension.setURLBarAutocompleteList = function(state)
{
	var searchList = fGoogleBookmarksExtension.defAutocompliteList;
	if (state != 'off') {
		var s = fGoogleBookmarksExtension.defAutocompliteList = gURLBar.getAttribute('autocompletesearch');
		searchList = 'gbookmarks-autocomplete' + " " + s;
	}
	gURLBar.setAttribute("autocompletesearch", searchList);
	// this.ErrorLog("setURLBarAutocompleteList ", gURLBar.getAttribute('autocompletesearch'));
	// gURLBar.setAttribute("disableautocomplete", true);
	// gURLBar.setAttribute("disableautocomplete", false);
};

/**
 * меняет иконку на панели и активность кнопок в меню
 * @param id - код закладки или null
 */
fGoogleBookmarksExtension.setButtonIcons = function(id)
{
	try
	{
		if (document.getElementById("GBE-toolbarbutton") || document.getElementById("GBE-MainMenu"))
		{
			if (id)
			{
				if (!this.useMenuBar) document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_full.png");
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_off.png");
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "true");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_on.png");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "false");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_on.png");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "false");

				document.getElementById("GBE-contextMenuAddBookmark").setAttribute("hidden", "true");
			}
			else
			{
				if (!this.useMenuBar) document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_empty.png");
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_on.png");
				document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "false");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_off.png");
				document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "true");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_off.png");
				document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "true");

				document.getElementById("GBE-contextMenuAddBookmark").setAttribute("hidden", "false");
			}
		}
	}
  catch (e)
	{
		this.ErrorLog("GBE:setButtonIcons", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * обработчик изменения адреса
 * @param aURI - текущий адрес
 */
fGoogleBookmarksExtension.processNewURL = function(aURI) 
{
  try
  {
    // адрес не поменялся - ничего не делаем
    if (aURI.spec === this.oldURL) 
  	{
  		return;
  	}
		var params = {name : "", id : null,	url : aURI.spec, labels : "", notes : ""};
		this.getBookmark(params, true);
		this.setButtonIcons(params.id);
    this.oldURL = aURI.spec;
  }
  catch (e)
	{
		this.ErrorLog("GBE:processNewURL", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
 };

/**
 * получает список закладок с сервера в формате XML
 * @param  {bool} showMenu - показывать меню после обновления или нет
 */
fGoogleBookmarksExtension.doRequestBookmarksJQuery = function(showMenu)
{
	try
	{
		if (!this.useMenuBar) document.getElementById("GBE-filterHBox").setAttribute("hidden", true);
		this.m_ganswer = null;
		this.m_signature = null;
		this.m_bookmarkList = null;
		this.m_labelsArr = null;
		var enableNotes = this.enableNotes;
		var self = this;
		jQuery.noConflict();
		jQuery.ajax({
      type: "GET",
      url: this.baseUrl + "lookup",
      data: 
      	{
          output: (!enableNotes ? "xml" : "rss"),
          num: 10000
        },
      dataType : "XML",
      timeout: this.timeOut,
      error: function(XMLHttpRequest, textStatus, errorThrown) {
      	self.removeSIDCookie();
  			self.refreshInProgress = false;
    		self.ErrorLog("GBE:doRequestBookmarksJQuery", "Ошибка при получении списка закладок");
      },
      success: function(responseXML, textStatus) {
				if (responseXML)
				{
		    	self.m_ganswer = responseXML.documentElement;
		    	self.doBuildMenu();
		    	if (showMenu)
		    	{
		    		if (self.useMenuBar)
		    		{
		    			document.getElementById("GBE-MainMenu-Popup").openPopup(document.getElementById("GBE-MainMenu"), "after_start",0,0,false,false);
						}
						else
						{			    			
		    			document.getElementById("GBE-ToolBar-popup").openPopup(document.getElementById("GBE-toolbarbutton"), "after_start",0,0,false,false);
		    		}
		    	}
		    	if (!self.useMenuBar)	document.getElementById("GBE-filterHBox").setAttribute("hidden", false);
	    	}
	    	else
	    	{
	    		self.removeSIDCookie();
	    		self.refreshInProgress = false;
	    		self.ErrorLog("GBE:doRequestBookmarksJQuery", "Ошибка при получении списка закладок!");
	    	}
      }
    });
  }
  catch (e)
	{
		this.ErrorLog("GBE:doRequestBookmarksJQuery", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

fGoogleBookmarksExtension.doRequestSignature = function()
{
	try
	{
		this.m_signature = null;
		var self = this;
		jQuery.noConflict();
		jQuery.ajax({
      type: "GET",
      url: this.baseUrl + "find",
      data: 
      	{
          zx: (new Date()).getTime(),
          output: "rss",
          q: "qB89f6ZAUXXsfrwPdN4t"
        },
      dataType : "XML",
      timeout: this.timeOut,
      success: function(responseXML, textStatus) {
      	if (responseXML.getElementsByTagName("smh:signature").length)
      	{
      		self.m_signature = responseXML.getElementsByTagName("smh:signature")[0].childNodes[0].nodeValue;
      	}
      }
    });
	}
	catch (e)
	{
		this.ErrorLog("GBE:doRequestSignature", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}

};

/**
 * удаляет все закладки из указанного меню
 */
fGoogleBookmarksExtension.doClearList = function(parentId, className)
{
	var list = document.getElementById(parentId);


	try
	{
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
		this.ErrorLog("GBE:doClearList", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};


fGoogleBookmarksExtension.hideBookmarks = function(hide)
{
	// var selectTag = document.getElementById("GBE-ToolBar-popup").getElementsByClassName("menuitem-iconic google-bookmarks");
	// for (var i = 0; i < selectTag.length; i++) {
	// 	selectTag[i].setAttribute("hidden", hide);
	// }
	jQuery.noConflict();
	if (hide)
	{
		jQuery("#GBE-ToolBar-popup").find(".google-bookmarks").hide();
	}
	else
	{
		jQuery("#GBE-ToolBar-popup").find(".google-bookmarks").show();
	}

};

/**
 * функция сравнения закладок и меток по имени
 * @return {int} результат сравнения
 */
fGoogleBookmarksExtension.compareByName = function (a, b) {
	if (a instanceof Array && b instanceof Array) 
	{
		if (fGoogleBookmarksExtension.sortOrder == "asc") 
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
		if (fGoogleBookmarksExtension.sortOrder == "asc") 
		{
			return String(a.title).toLowerCase() < String(b.title).toLowerCase() ? -1 : 1;
		}
		else
		{
			return String(a.title).toLowerCase() < String(b.title).toLowerCase() ? 1 : -1;
		}			
	}
};

/**
 * функция сравнения закладок и меток по дате добавления
 */
fGoogleBookmarksExtension.compareByDate = function (a, b) {		
	if (a instanceof Array && b instanceof Array) 
	{
		if (fGoogleBookmarksExtension.sortOrder == "asc") 
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
		if (fGoogleBookmarksExtension.sortOrder == "asc") 
		{
			return new Date(a.timestamp) < new Date(b.timestamp) ? -1 : 1;
		}
		else
		{
			return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1;
		}
	}
};

/**
 * формирует меню закладок
 */
fGoogleBookmarksExtension.doBuildMenu = function()
{
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
	if (!this.enableNotes)
	{
		var oType = "xml"
	}
	else
	{
		var oType = "rss"
	}
	try
	{		
		// получаем все метки из XML ответа сервера
		var labels = this.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].label);

		// получаем все закладки из XML ответа сервера
		var bookmarks = this.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].bkmk);
		// контейнер в меню, в который будут добавляться закладки
		//var GBE_GBlist = document.getElementById("GBE-GBlist");
		if (!this.useMenuBar)
		{
			var GBE_GBlist = document.getElementById("GBE-ToolBar-popup");
			var GBE_GBlist_separator = document.getElementById("GBE-tb-GBlist-Separator");
		}
		else
		{
			var GBE_GBlist = document.getElementById("GBE-MainMenu-Popup");
			var GBE_GBlist_separator = document.getElementById("GBE-mb-GBlist-Separator");				
		}
		var allLabelsStr, i, j;


		// сохраняем сигнатуру из ответа (необходима при работе с закладками)
		if (!this.enableNotes)
		{
			this.doRequestSignature();
		}
		else
		{
			if (this.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].sig).length)
			{
				this.m_signature = this.m_ganswer.getElementsByTagName(bkmkFieldNames[oType].sig)[0].childNodes[0].nodeValue;
			}
		}
		// если закладок и меток в ответе сервера нет - ничего не делаем
		if (!labels.length && !bookmarks.length) 
		{
			this.refreshInProgress = false;
			this.ErrorLog("GBE:doBuildMenu", "Labels and bookmarks (in server response) are empty!");
		 	return; 
		}

		// если закладок и меток в ответе сервера нет - ничего не делаем
		if (!bookmarks.length) 
		{
			this.refreshInProgress = false;
			this.ErrorLog("GBE:doBuildMenu", "Bookmarks (in server response) are empty!");
		 	return; 
		}

		var self = this;

		// временная строка для группировки и сортировки меток
		allLabelsStr = this.labelSep;

		var lbs = [];
		let labelsLength = labels.length;
		// группируем метки
		for (i = 0; i < labelsLength; i++) 
		{
			// название метки
			var labelVal = labels[i].childNodes[0].nodeValue;
			// если такой метки во временной строке еще нет - добавляем ее (с разделителем)
			if (allLabelsStr.indexOf(this.labelSep + labelVal + this.labelSep) === -1)
			{
				allLabelsStr += (labelVal + this.labelSep);
				lbs.push({"title" : labelVal, "timestamp" : null});
			}
		}
		// добавляем labelUnlabeledName метку в массив меток
		if (this.enableLabelUnlabeled)
		{
			lbs.push({"title" : this.labelUnlabeledName, "timestamp" : null});
		}

		jQuery.noConflict();

		// сохраняем закладки в поле m_bookmarkList
		let bookmarksLength = bookmarks.length;
		// список закладок
		this.m_bookmarkList = new Array(bookmarksLength);
		for (i = 0; i < bookmarksLength; i++) 
		{
			this.m_bookmarkList[i] = {};
			try
			{
				this.m_bookmarkList[i].title = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].title)[0].childNodes[0].nodeValue;
				if (bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].url)[0].hasChildNodes()) {
    			this.m_bookmarkList[i].url = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].url)[0].childNodes[0].nodeValue;
				}
				else
				{
					this.m_bookmarkList[i].url = "";
					this.ErrorLog("GBE:doBuildMenu", " Bookmark with title '" + this.m_bookmarkList[i].title + "' have no URL (or local URL)!!!");
				}
				this.m_bookmarkList[i].id = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].id)[0].childNodes[0].nodeValue;
				this.m_bookmarkList[i].timestamp = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].date)[0].childNodes[0].nodeValue;

				var bookmark_labels = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].label);
			}
			catch(e1)
			{
				this.ErrorLog("GBE:doBuildMenu", "Obtain bookmark params - error. Last processing bookmark - " + this.m_bookmarkList[i].title);
				throw e1;
			}
			var	j;
			// закладка с метками?
			if (bookmark_labels.length)
			{
				// сохраняем метки в массив
				this.m_bookmarkList[i].labels = [];
				for (j = 0; j < bookmark_labels.length; j++)
				{
					this.m_bookmarkList[i].labels[j] =  bookmark_labels[j].childNodes[0].nodeValue;
					let lbl = jQuery.grep(lbs, function(e){ return e.title == bookmark_labels[j].childNodes[0].nodeValue });
					if (lbl.length)
					{
						if (lbl[0].timestamp == null || lbl[0].timestamp < this.m_bookmarkList[i].timestamp)
						{
							lbl[0].timestamp = this.m_bookmarkList[i].timestamp;
						}
					}
				}
			}
			else
			{
				this.m_bookmarkList[i].labels = "";
				// определяем timestamp для закладок без метки
				if (this.enableLabelUnlabeled)
				{
					let lbl = jQuery.grep(lbs, function(e){ return e.title == self.labelUnlabeledName });
					if (lbl.length)
					{
						if (lbl[0].timestamp == null || lbl[0].timestamp < this.m_bookmarkList[i].timestamp)
						{
							lbl[0].timestamp = this.m_bookmarkList[i].timestamp;
						}
					}
				}
			}
			this.m_bookmarkList[i].notes = "";
			// закладка с примечанием?
			try 
			{
				if (this.enableNotes && bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].notes).length)
				{
					this.m_bookmarkList[i].notes = bookmarks[i].getElementsByTagName(bkmkFieldNames[oType].notes)[0].childNodes[0].nodeValue;
				}
			}
			catch(e1)
			{
				this.ErrorLog("GBE:doBuildMenu", "Obtain bookmark notes - error. Last processing bookmark - " + this.m_bookmarkList[i].title )
				throw e1;
			}
		}
		// сортируем массив закладок
		this.m_bookmarkList.sort((this.sortType == "timestamp")? this.compareByDate : this.compareByName);	
		// сортируем массив меток
		lbs.sort((this.sortType == "timestamp") ? this.compareByDate : this.compareByName);	
		allLabelsStr = "";//this.labelSep;
		lbs.forEach(function(element, index) {
		  allLabelsStr += element.title + self.labelSep;
		});
		if (allLabelsStr.length > 0)
		{
			allLabelsStr = allLabelsStr.substr(0, allLabelsStr.length-5);
		}

		// получаем массив меток
		this.m_labelsArr = allLabelsStr.split(this.labelSep);

		if (this.m_labelsArr.length && allLabelsStr !== "")
		{
			let m_labelsArrLength = this.m_labelsArr.length;
			// добавляем метки в меню (в виде папок)
			for (i = 0; i < m_labelsArrLength; i++) 
			{
				if (this.m_labelsArr[i] == "") 
				{
					continue;
				}
				var arr_nested_label = this.m_labelsArr[i].split(this.nestedLabelSep);
				if (arr_nested_label.length == 1)
				{
					//var testLabel = GBE_GBlist.getElementsByAttribute('id',"GBE_" + this.m_labelsArr[i])[0];
					if (GBE_GBlist.getElementsByAttribute('id',"GBE_" + this.m_labelsArr[i])[0] == null)
					{
						this.appendLabelItem(GBE_GBlist_separator, document.createElement('menu'), this.m_labelsArr[i], this.m_labelsArr[i]);
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
						fullName += this.nestedLabelSep + arr_nested_label[j];
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
		let m_bookmarkListLength = this.m_bookmarkList.length;
		for (i = 0; i < m_bookmarkListLength; i++) 
		{
			var parentContainer,
					tempMenuitem;
			// если у закладки есть метки
			if (this.m_bookmarkList[i].labels !== "") 
			{
				// то добавляем ее во вложенное меню каждой метки
				for (j = 0; j < this.m_bookmarkList[i].labels.length; j++)
				{
					tempMenuitem = document.createElement('menuitem');
					parentContainer = GBE_GBlist.getElementsByAttribute("id", "GBE_" + this.m_bookmarkList[i].labels[j])[0].childNodes[0];
					this.appendMenuItem(parentContainer, tempMenuitem, this.m_bookmarkList[i]);
				}
			}
			else
			{
				// иначе - в основное меню
				tempMenuitem = document.createElement('menuitem');
				parentContainer = GBE_GBlist_separator;
				if (this.enableLabelUnlabeled)
				{
					// закладки без метки добавляем в папку labelUnlabeledName
					parentContainer = GBE_GBlist.getElementsByAttribute("id", "GBE_" + this.labelUnlabeledName)[0].childNodes[0];
				}
				this.appendMenuItem(parentContainer, tempMenuitem, this.m_bookmarkList[i]);
			}
		}
		this.needRefresh = false;
		this.refreshInProgress = false;

		// удаляем метку labelUnlabeledName из массива меток
		if (this.enableLabelUnlabeled)
		{
			this.m_labelsArr = jQuery.grep(this.m_labelsArr, function (a) { return a != self.labelUnlabeledName; });
		}

	}
	catch (e)
	{
		this.ErrorLog("GBE:doBuildMenu", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * отправляет запрос на добавление (изменение) закладки
 * @param  {object} params - параметры редактируемой закладки
 */
fGoogleBookmarksExtension.doChangeBookmarkJQuery = function(params)
{
	try
	{
		jQuery.noConflict();
		var self = this;
		jQuery.ajax({
      type: "post",
      url: this.baseUrl2,
      data: 
      	{
          zx: (new Date()).getTime(),
          bkmk: params.url,
          title: params.name,
          labels: params.labels,
          annotation: params.notes,
          prev: "/lookup",
          sig: params.sig
        },
      timeout: this.timeOut,
      error: function(XMLHttpRequest, textStatus, errorThrown) {
      	this.windowsParams = {};
        self.ErrorLog("GBE:doChangeBookmarkJQuery", " An error occurred while saving bookmark (" + params.url + ").");
      },
      success: function(data, textStatus) {
				self.needRefresh = true;  
				if (window.content.location.href == params.url)
				{
					// меняем иконку на панели
					self.setButtonIcons(!params.id);
      	}
      	this.windowsParams = {};
      }
    });
	}
  catch (e)
	{
		this.ErrorLog("GBE:doChangeBookmarkJQuery", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};	

/**
 * отправляет запрос на удаление закладки
 * @param  {object} params параметры удаляемой закладки
 */
fGoogleBookmarksExtension.doDeleteBookmarkJQuery = function(params)
{
	try
	{
		jQuery.noConflict();
		var self = this;
		var url = params.url;
		jQuery.ajax({
			type: "get",
      url: this.baseUrl2,
      data: 
      	{
          zx: (new Date()).getTime(),
          dlq: params.id,
          sig: params.sig
        },
      timeout: this.timeOut,
      error: function(XMLHttpRequest, textStatus, errorThrown) {
      	self.ErrorLog("GBE:doDeleteBookmarkJQuery", " An error occurred while deleting bookmark (" + url + ").");
      },
      success: function(data, textStatus) {
				self.needRefresh = true; 
				if (window.content.location.href == url)
				{
					// меняем иконку на панели
					self.setButtonIcons(null);
				}
      }
		});
		this.windowsParams = {};
	}
  catch (e)
	{
		this.ErrorLog("GBE:doDeleteBookmarkJQuery", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

fGoogleBookmarksExtension.doChangeFolderJQuery = function(oldLabel, label, signature)
{
	try
	{
		jQuery.noConflict();
		var self = this;
		jQuery.ajax({
			type: "POST",
  		url: this.baseUrl2,
  		data: 
    	{
    		op: "modlabel",
        zx: (new Date()).getTime(),
        labels: oldLabel + "," + label,
        sig: signature
      },
    	timeout: this.timeOut,
    	error: function(XMLHttpRequest, textStatus, errorThrown) 
    	{
    		self.ErrorLog("GBE:doChangeFolderJQuery", " An error occurred while renaming label (" + 	oldLabel + " to " + label + ").");
    	},
    	success: function(data, textStatus) 
    	{
				self.needRefresh = true; 
    	}
		});	
		this.windowsParams = {};		
	}
	catch (e)
	{
		this.ErrorLog("GBE:doChangeFolderJQuery", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

fGoogleBookmarksExtension.doDeleteFolderJQuery = function(label, signature)
{
	try
	{
		jQuery.noConflict();
		jQuery.ajax({
			type: "GET",
			url: this.baseUrl2,
  		data: 
    	{
    		op: "modlabel",
        zx: (new Date()).getTime(),
        labels: label,
        sig: signature
      },
    	timeout: this.timeOut,
    	error: function(XMLHttpRequest, textStatus, errorThrown) 
    	{
    		fGoogleBookmarksExtension.ErrorLog("GBE:doDeleteFolderJQuery", " An error occurred while deleting label (" + label + ").");
    	},
    	success: function(data, textStatus) 
    	{
				fGoogleBookmarksExtension.needRefresh = true; 
    	}
		});	
		this.windowsParams = {};		
	}
	catch (e)
	{
		this.ErrorLog("GBE:doChangeFolderJQuery", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};


/**
 * задает атрибуты элемента меню закладок
 * @param  {menu} parent
 * @param  {menuitem} item
 * @param  {array} value
 */
fGoogleBookmarksExtension.appendMenuItem = function(parent, item, value)
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
};

fGoogleBookmarksExtension.appendLabelItem = function(parent, item, id, label, fullName = "")
{
	item = document.createElement('menu');
	item.setAttribute("id", "GBE_" + id);
	item.setAttribute("label", label);
	item.setAttribute("fullName", ((fullName == "") ? label : fullName));
	item.setAttribute("class", "menu-iconic google-bookmarks");
	item.setAttribute("image", "chrome://GBE/skin/images/folder_blue.png");
	item.setAttribute("container", "true");
	// для метки labelUnlabeledName контекстрое меню не назначаем
	if (this.enableLabelUnlabeled)
	{
		if (id !== this.labelUnlabeledName)
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
};

fGoogleBookmarksExtension.appendSearchMenuItem = function(parent, item, label, url, favicon)
{
	item.setAttribute("label", label);
	item.setAttribute("url", url);
	item.setAttribute("tooltiptext", url);
	item.setAttribute("class", "menuitem-iconic google-bookmarks-filter");
	item.setAttribute("image", favicon);
	parent.appendChild(item);
};

/**
 * открывает заданный адрес в новой или той же вкладке
 * @param  {[type]} url открываемый адрес
 * @param  {[type]} inSameTab = false флаг открытия в новой вкладке
 */
fGoogleBookmarksExtension.showURL = function(url, inSameTab = false)
{
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
/*		if (inSameTab)
	{
		// открывает в той же вкладке
		window.open(url);
	}
	else
	{
		// в новой вкладке
		var tBrowser = top.document.getElementById("content"),
		tab = tBrowser.addTab(url);
		tBrowser.selectedTab = tab;
	}*/
};

fGoogleBookmarksExtension.refreshBookmarks = function(showMenu = true)
{
	try
	{
		// меняем первый пункт меню закладки 
		if (this.reverseBkmrkLeftClick)
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
		if (!this.refreshInProgress)
		{	
			this.refreshInProgress = true;
			if (this.useMenuBar)
			{
				this.doClearList("GBE-MainMenu-Popup", "google-bookmarks");
			}
			else
			{
				this.doClearList("GBE-ToolBar-popup", "google-bookmarks");
				this.doClearList("GBE-searchResultList","menuitem-iconic google-bookmarks-filter");
			}
			this.doRequestBookmarksJQuery(showMenu);
		}
	}
	catch (e)
	{
		this.ErrorLog("GBE:refreshBookmarks", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * обработчик меню логаут
 */
fGoogleBookmarksExtension.logout = function()
{
	try
	{
		this.showURL("https://www.google.com/accounts/Logout");
		this.oldURL = null;
		this.m_ganswer = null;
		this.m_labelsArr = null;
		this.m_bookmarkList = null;
		this.needRefresh = true;
		this.m_signature = "";
		this.currentContextId = "";
		this.currentFolderId = "";
		this.oldSearchValue = "";
		if (this.useMenuBar)
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
		this.ErrorLog("GBE:logout", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}

};

/**
 * обработчик меню логин
 */
fGoogleBookmarksExtension.login = function()
{
	this.showURL("https://accounts.google.com");
};	

/**
 * устанавливает favicon для закладок
 * @param  {строка} url  адрес закладки
 * @param  {[type]} item ссылка на закладку (элемент меню)
 */
fGoogleBookmarksExtension.setFavicon = function(bkmrk, item)
{
	try
	{
		// var self = this;
		if (!this.showFavicons || bkmrk.url.length == 0)
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
		this.ErrorLog("GBE:getFavicon", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * обработчик меню About
 */
fGoogleBookmarksExtension.showAboutForm = function(e)
{
	window.openDialog("chrome://GBE/content/overlays/about.xul", "","centerscreen");
};

fGoogleBookmarksExtension.showPrefWindow = function()
{
	if (null == this._preferencesWindow || this._preferencesWindow.closed) 
	{
    let instantApply = Application.prefs.get("browser.preferences.instantApply");
    let features = "chrome,titlebar,toolbar,centerscreen" + (instantApply.value ? ",dialog=no" : ",modal");
    this._preferencesWindow =
      window.openDialog(
        "chrome://GBE/content/overlays/options.xul",
        "", features
      );
	}
	this._preferencesWindow.focus();		
};

fGoogleBookmarksExtension.onPopupShown = function(e)
{
	if (e.target.getAttribute("id") == "GBE-ToolBar-popup")
	{
		// //e.target.sizeTo(300, 700);
		// e.target.width = 300;
		document.getElementById("GBE-filterHBox").setAttribute("hidden","false");
		e.stopPropagation();
	}
};

/**
 * обработчик события onpopupshowing для основного меню (GBE-ToolBar-popup)
 */
fGoogleBookmarksExtension.onShowMenu = function(event)
{
	try
	{
		if ( !(event.target.getAttribute("id") == "GBE-ToolBar-popup" || event.target.getAttribute("id") == "GBE-MainMenu-Popup" ))
		{
			event.stopPropagation();
			return;
		}
		// кнопки логин и логаут
		var btnLgn = document.getElementById("GBE-bc-hmenuLgn"), 
				btnLgt = document.getElementById("GBE-bc-hmenuLgt");
		// если залогинены в GB
		if (this.checkLogin())
		{
			// показываем кнопку логаут и прячем логин
			btnLgn.setAttribute("hidden", "true");
			btnLgt.setAttribute("hidden", "false");
			// document.getElementById("GBE-hmenuAdd").setAttribute("disabled", "false");
			// document.getElementById("GBE-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_on.png");
			// если необходимо - обновляем закладки
			if(this.needRefresh)
			{
				 this.refreshBookmarks();
				 this.needRefresh = false;
			}
		}
		else
		{
			// показываем кнопку логин и прячем логаут
			btnLgt.setAttribute("hidden", "true");
			btnLgn.setAttribute("hidden", "false");
			document.getElementById("GBE-bc-hmenuAdd").setAttribute("disabled", "true");
			document.getElementById("GBE-bc-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_off.png");
			document.getElementById("GBE-bc-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_off.png");
			document.getElementById("GBE-bc-hmenuEdit").setAttribute("disabled", "true");
			document.getElementById("GBE-bc-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_off.png");
			document.getElementById("GBE-bc-hmenuDel").setAttribute("disabled", "true");
		}
		if (!this.useMenuBar)
		{
			document.getElementById("GBE-filterHBox").setAttribute("hidden","true");
		}
	}
	catch (e)
	{
		this.ErrorLog("GBE:onShowMenu", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

// при скрытии меню
fGoogleBookmarksExtension.onHideMenu = function(event)
{
	// делаем видимым основной список закладок
	// document.getElementById("GBE-GBlist").setAttribute("hidden", false);
	if ( !(event.target.getAttribute("id") == "GBE-ToolBar-popup" || event.target.getAttribute("id") == "GBE-MainMenu-popup" ))
	{
		event.stopPropagation();
		return;
	}
	if (!this.useMenuBar)
	{
		this.hideBookmarks(false);
		// скрываем списко отфильтрованных закладок
		document.getElementById("GBE-searchResultList").setAttribute("hidden", true);
		// обнуляем значение фильтра
		document.getElementById("GBE-filterTextbox").value = "";
	}
};

/**
 * открывает диалог добавления (редактирования) закладки
 * @param  {bool} editBkmk = true режим редактирования (true) или добавления (false) закладки
 * @param  {string} addLabel = "" режим добавления новой метки к закладке (через контекстное меню метки)
 */
fGoogleBookmarksExtension.showBookmarkDialog = function(editBkmk = true, addLabel = "")
{
	try
	{
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
			this.windowsParams = {
					name : (window.content.document.title || trimUrl),
					id : null,
					url : cUrl,
					labels : "",
					notes : "",
					sig : this.m_signature
				};

			var labelsList = this.m_labelsArr;

			// автозаполнение меток на основании заголовка страницы
			if (this.suggestLabel && window.content.document.title && labelsList !== null)
			{
				// все слова из заголовка
				var words = window.content.document.title.split(" ");
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
				this.windowsParams.labels = labels;
			}


			// находим закладку по адресу (при редактировании)
			if (editBkmk)
			{
				this.getBookmark(this.windowsParams, true);
			}
			// при добавлении дополнительной метки
			if (addLabel.length)
			{
				// для закладок, у которых уже есть метки
				if (this.windowsParams.labels.length)
				{
					if (jQuery.inArray(addLabel, this.windowsParams.labels) === -1) this.windowsParams.labels.push(addLabel);
				}
				// для закладок без меток и новых закладок
				else
				{
					this.windowsParams.labels += addLabel;
				}
			}
			window.openDialog("chrome://GBE/content/overlays/bookmark.xul", "","chrome,centerscreen,modal");
		}
	}
	catch (e)
	{
		this.ErrorLog("GBE:showBookmarkDialog", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};



/**
 * открывает диалог удаления закладки
 * @param  {event} e 
 */
fGoogleBookmarksExtension.showDeleteDlg = function(e)
{
	try
	{
		// параметры закладки
		this.windowsParams = {name : "", id : null,	url : window.content.location.href, labels : "", notes : "", sig : this.m_signature};
		var bookmarkNotFound = true;
		// вызов из основного меню
		if(e === null)
		{
			this.getBookmark(this.windowsParams, true);
			if (this.windowsParams.id)
			{
				bookmarkNotFound = false;
			}
		}
		// вызов из контекстного меню закладки
		else
		{
			this.windowsParams.id = e.currentTarget.getAttribute("id").replace("GBE","");
			this.windowsParams.name = e.currentTarget.getAttribute("label");
			bookmarkNotFound = false;
		}
		// закладка не найдена - ничего не делаем
		if(bookmarkNotFound)
		{
			this.ErrorLog("GBE:showDeleteBkmkDlg", " Не найдена закладка.");
			return;
		}
		window.openDialog("chrome://GBE/content/overlays/delete.xul", "","chrome,centerscreen,modal");
	}
	catch (e)
	{
		this.ErrorLog("GBE:showDeleteDlg", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};


/**
 * при показе контекстного меню закладки
 */
fGoogleBookmarksExtension.onShowContextMenu = function(event)
{
	try {
		// GBE.currentContextId = event.target.getAttribute("id").replace("GBE_","");
		// запоминаем код закладки
		this.currentContextId = event.target.triggerNode.getAttribute("id").replace("GBE_","");
		// document.getElementById("GBE-contextMenu").showPopup(document.getElementById(GBE.currentContextId), 
		// 													event.screenX - 2, event.screenY - 2, "context");
	}
	catch (e) {
		this.ErrorLog("GBE:onBookmarkContextMenu", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * клик на пункте контекстного меню закладки "Открыть на месте"
 */
fGoogleBookmarksExtension.contextShowHere = function(event)
{
	var params = {name : "", id : this.currentContextId,	url : "", labels : "", notes : "", sig : this.m_signature};
	// получаем параметры закладки
	this.getBookmark(params);
	// если нашли - показываем в той же вкладке
	if (params.id)
	{
		this.showURL(params.url, !this.reverseBkmrkLeftClick);
	}
};

/**
 * клик на пункте контекстного меню закладки "Редактировать"
 */
fGoogleBookmarksExtension.contextEditBookmark = function(event)
{
	try
	{
		this.windowsParams = {name : "", id : this.currentContextId,	url : "", labels : "", notes : "", sig : this.m_signature};
		this.getBookmark(this.windowsParams);
		if (this.windowsParams.id)
		{
			 window.openDialog("chrome://GBE/content/overlays/bookmark.xul", "","chrome,centerscreen,modal");
		}
	}
	catch (e) {
		this.ErrorLog("GBE:contextEditBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * клик на пункте контекстного меню закладки "Удалить"
 */
fGoogleBookmarksExtension.contextRemoveBookmark = function(event)
{
	try
	{
		this.windowsParams = {name : "", id : this.currentContextId,	url : "", labels : "", notes : "", sig : this.m_signature};
		this.getBookmark(this.windowsParams);
		if (this.windowsParams.id)
		{
			window.openDialog("chrome://GBE/content/overlays/delete.xul", "","chrome,centerscreen,modal");
		}
	}
	catch (e) {
		this.ErrorLog("GBE:contextRemoveBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}		

};


/**
 * обработчик кликов по закладкам и меткам
 */
fGoogleBookmarksExtension.handleClick = function(e)
{
	try{

		switch (e.button) 
		{
			case 0 :
				{
					if ((e.target.getAttribute("class") == "menuitem-iconic google-bookmarks") || 
							(e.target.getAttribute("class") == "menuitem-iconic google-bookmarks-filter"))
					{
						fGoogleBookmarksExtension.showURL(e.target.getAttribute("url"), fGoogleBookmarksExtension.reverseBkmrkLeftClick);
						e.stopPropagation();
						break;
					}
					break;
				}
			case 1 :
				{
					if (e.target.getAttribute("class") == "menu-iconic google-bookmarks")
					{
						fGoogleBookmarksExtension.currentFolderId = e.target.getAttribute("id");
						fGoogleBookmarksExtension.folderMenuOpenAll();
						e.stopPropagation();
						break;
					}
					if ((e.target.getAttribute("class") == "menuitem-iconic google-bookmarks") || 
							(e.target.getAttribute("class") == "menuitem-iconic google-bookmarks-filter"))
					{
						fGoogleBookmarksExtension.showURL(e.target.getAttribute("url"), !fGoogleBookmarksExtension.reverseBkmrkLeftClick);
						e.stopPropagation();
						break;
					}
					break;
				}
		}
	}
	catch(error)
	{
		fGoogleBookmarksExtension.ErrorLog("GBE:folderClick", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
	}
};

/**
 * при показе контекстного меню метки
 */
fGoogleBookmarksExtension.onShowFolderMenu = function(e)
{
	try {
		this.currentFolderId = e.target.triggerNode.getAttribute("id");
		for (var i = 0; i < this.m_labelsArr.length; i++) 
		{
			if (("GBE_" + this.m_labelsArr[i]) != this.currentFolderId)
			{
				document.getElementById("GBE_" + this.m_labelsArr[i]).open = false;
			}
		}
	}
	catch (error) {
		this.ErrorLog("GBE:showFolderMenu", " " + error + '(line = ' + error.lineNumber + ", col = " + error.columnNumber + ", file = " +  error.fileName);
	}
};

/**
 * обработчик пункта контекстного меню метки "Открыть все" - открывает все вложенные закладки в подменю
 */
fGoogleBookmarksExtension.folderMenuOpenAll = function()
{
	try
	{
		// получаем название метки
		var label = document.getElementById(this.currentFolderId).getAttribute("fullName");
		if (label.length && this.m_bookmarkList && this.m_bookmarkList.length)
  	{
	  	// перебираем все закладки
	  	for (var i = 0, m_bookmarkListLength = this.m_bookmarkList.length; i < m_bookmarkListLength; i++)
	  	{
	  		var labels = this.m_bookmarkList[i].labels;
	  		if (labels.length > 0 )
	  		{
		  		for (var j = 0; j < labels.length; j++) {
		  			// открываем закладки, которые содержат искомую метку
		  			if (labels[j].indexOf(label) == 0)
		  			{
		  				this.showURL(this.m_bookmarkList[i].url);
		  			}
		  		};
	  		}	
	  		else
	  		{
	  			// открываем закладки без метки
	  			if(this.enableLabelUnlabeled && this.currentFolderId == ("GBE_" + this.labelUnlabeledName))
	  			{
	  				this.showURL(this.m_bookmarkList[i].url);
	  			}
	  		}
	  	}
  	}
  	this.currentFolderId = "";
  }
	catch (e)
	{
		this.ErrorLog("GBE:folderMenuOpenAll", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * обработчик пункта контекстного меню метки "Добавить закладку здесь"
 */
fGoogleBookmarksExtension.folderMenuAddHere = function()
{
	try
	{	
		// название метки
		var label = document.getElementById(this.currentFolderId).getAttribute("fullName");
		// текущий адрес
		var cUrl = window.content.location.href;
		var params = {name : "", id : null,	url : cUrl, labels : "", notes : ""};
		this.getBookmark(params, true);
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
		this.currentFolderId = "";
	}
	catch (e)
	{
		this.ErrorLog("GBE:folderMenuAddHere", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * открывает диалог редактирования метки
 */
fGoogleBookmarksExtension.showFolderDialog = function()
{
	try
	{
		this.windowsParams = {
			name : document.getElementById(this.currentFolderId).getAttribute("fullName")
		};
		window.openDialog("chrome://GBE/content/overlays/folder.xul", "","chrome,centerscreen,modal");
		this.currentFolderId = "";
	}
	catch (e)
	{
		this.ErrorLog("GBE:showFolderDialog", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * открывает диалог удаления метки
 */
fGoogleBookmarksExtension.showRemoveLabelDialog = function()
{
	try
	{
		this.windowsParams = {
			name : document.getElementById(this.currentFolderId).getAttribute("fullName")
		};
		window.openDialog("chrome://GBE/content/overlays/folder_del.xul", "","chrome,centerscreen,modal");
		this.currentFolderId = "";
	}
	catch (e)
	{
		this.ErrorLog("GBE:showRemoveLabelDialog", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/*
показывает отфильтрованные закладки
 */
fGoogleBookmarksExtension.filterBookmarks = function(searchValue)
{
	// var GBE_GBlist = document.getElementById("GBE-GBlist");
	var GBE_searchResultList = document.getElementById("GBE-searchResultList");
	var search = searchValue.value;
	// копия массива предыдущих отфильтрованных закладок
	var tempArray = this.tempFilterArray.slice();
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

		if (this.m_bookmarkList && this.m_bookmarkList.length)
		{
			this.tempFilterArray.length = 0;
			// если новое значение фильтра входит в предыдущее,
			if(this.oldFilterValue !== "" && search.indexOf(this.oldFilterValue) == 0)
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
						this.tempFilterArray.push([ tempArray[i][0], tempArray[i][1], tempArray[i][2] ]);
					}
				}
			}
			else
			{
				// иначе - поиск по всем закладкам
				for (var i = 0; i < this.m_bookmarkList.length; i++)
				{
					if (this.m_bookmarkList[i].title.toLowerCase().indexOf(search) !== -1 )//||
						// this.m_bookmarkList[i].url.toLowerCase().indexOf(search) !== -1)
					{
						tempMenuitem = document.createElement('menuitem');
						this.appendSearchMenuItem(GBE_searchResultList, tempMenuitem, this.m_bookmarkList[i].title, this.m_bookmarkList[i].url, this.m_bookmarkList[i].favicon);
						this.tempFilterArray.push([this.m_bookmarkList[i].title, this.m_bookmarkList[i].url, this.m_bookmarkList[i].favicon]);
					}
				}
			}
		}
	}
	this.oldFilterValue = search;
	tempArray.length = 0;
};



window.addEventListener("load", function() { 
	// Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(
	// 	Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://GBE/content/scripts/jquery.min.js"); 
	fGoogleBookmarksExtension.init();
}, false);
window.addEventListener("unload", function() { fGoogleBookmarksExtension.uninit() }, false);

fGoogleBookmarksExtension.installButton = function()
{
	var id = "GBE-toolbaritem";
	var toolbarId = "nav-bar";
 	var toolbar = document.getElementById(toolbarId);
	//add the button at the end of the navigation toolbar	
	toolbar.insertItem(id, toolbar.lastChild);
	toolbar.setAttribute("currentset", toolbar.currentSet);
	document.persist(toolbar.id, "currentset");

	//if the navigation toolbar is hidden, 
	//show it, so the user can see your button
	toolbar.collapsed = false;
}
 
fGoogleBookmarksExtension.firstRun = function (extensions) 
{
    var extension = extensions.get("GBE@fess16.blogspot.com");
    if (extension.firstRun)
    {
    	fGoogleBookmarksExtension.installButton();	
    }
}
 
if (Application.extensions)
{
  fGoogleBookmarksExtension.firstRun(Application.extensions);
}
else
{
  Application.getExtensions(fGoogleBookmarksExtension.firstRun);
}