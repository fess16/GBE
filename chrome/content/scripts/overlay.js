/* 
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
var GBE = 
{
	// адрес для получения списка закладок
	'baseUrl' : "https://www.google.com/bookmarks/",
	// адрес для работы с отдельными закладками
	'baseUrl2' : "https://www.google.com/bookmarks/mark",
	// для вывода отладочной информации (ошибок) в консоль
	'GBLTut_ConsoleService' :
      Components.
          classes['@mozilla.org/consoleservice;1'].
              getService(Components.interfaces.nsIConsoleService),
  // список всех закладок (полученный с сервера) в формате XML
  'm_ganswer' : null,
  // список всех меток (папок)
  'm_labelsArr' : null,
  // список всех закладок (обработанный)
  'm_bookmarkList' : null,
  // разделитель меток при сортировке
  'labelSep'	: "|",
  // признак необходимости обновления меню со списком закладок
  'needRefresh'	: true,
  // предыдущее значение адреса
  'oldURL': null,
  // значение поля smh:signature из m_ganswer
  'm_signature' : "",
  // id текущего элемента списка меню закладок (для работы контекстного меню)
  'currentContextId' : "",
  // id текущего меню (для работы контекстного меню)
  'currentFolderId' : "",
  // предыдущее значение поиска при автодополнении меток
  'oldSearchValue' : "",

  'refreshInProgress' : false,

  // nsIWebProgressListener
  'QueryInterface': XPCOMUtils.generateQI(["nsIWebProgressListener", "nsISupportsWeakReference"]),

  onLocationChange: function(aProgress, aRequest, aURI) 
  {
    this.processNewURL(aURI);
  },

  init: function()
	{
		if (window.location == "chrome://browser/content/browser.xul")
		{
			if(GBE.needRefresh && GBE.checkLogin())
			{
				 GBE.refreshBookmarks(false);
			}
			gBrowser.addProgressListener(this);
		}
	},

	uninit: function()
	{
		if (window.location == "chrome://browser/content/browser.xul")
		{
			gBrowser.removeProgressListener(this);
		}
	},

	/**
	 * меняет иконку на панели и активность кнопок в меню
	 * @param id - код закладки или null
	 */
	setButtonIcons: function(id)
	{
		if (id)
		{
			document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_full.png");
			document.getElementById("GBE-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_off.png");
			document.getElementById("GBE-hmenuAdd").setAttribute("disabled", "true");
			document.getElementById("GBE-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_on.png");
			document.getElementById("GBE-hmenuEdit").setAttribute("disabled", "false");
			document.getElementById("GBE-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_on.png");
			document.getElementById("GBE-hmenuDel").setAttribute("disabled", "false");
		}
		else
		{
			document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_empty.png");
			document.getElementById("GBE-hmenuAdd").setAttribute("image", "chrome://GBE/skin/images/bkmrk_add_on.png");
			document.getElementById("GBE-hmenuAdd").setAttribute("disabled", "false");
			document.getElementById("GBE-hmenuEdit").setAttribute("image", "chrome://GBE/skin/images/bkmrk_edit_off.png");
			document.getElementById("GBE-hmenuEdit").setAttribute("disabled", "true");
			document.getElementById("GBE-hmenuDel").setAttribute("image", "chrome://GBE/skin/images/bkmrk_delete_off.png");
			document.getElementById("GBE-hmenuDel").setAttribute("disabled", "true");
		}
	},

	/**
	 * обработчик изменения адреса
	 * @param aURI - текущий адрес
	 */
	processNewURL: function(aURI) 
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
   },

  /**
   * поиск информации о закладке по коду (или адресу)
   * @param  {object} - params информация о закладке
   * @param  {bool} findByURL = false - признак поиска по адресу
   */
  getBookmark : function(params, findByURL = false)
  {
  	// по-умолчанию ищем по коду
  	var number = 2, value = params.id;
  	var i;
  	// если установлен флаг - то по адресу
  	if (findByURL)
  	{
  		number = 1;
  		value = params.url;
  	}
  	if ((GBE.m_bookmarkList) && (GBE.m_bookmarkList.length))
  	{
	  	// перебираем закладки
	  	for (i = 0; i < GBE.m_bookmarkList.length; i++)
	  	{
	  		// если нашли заполняем поля и выходим
	  		if (GBE.m_bookmarkList[i][number] === value)
	  		{
	  			params.name = GBE.m_bookmarkList[i][0];
	  			params.id = GBE.m_bookmarkList[i][2];
	  			params.url = GBE.m_bookmarkList[i][1];
	  			params.labels = GBE.m_bookmarkList[i][3];
	  			params.notes = GBE.m_bookmarkList[i][4];
	  			return;
	  		}
	  	}
  	}
  	// не нашли - в поле id устанавливаем null 
  	params.id = null;
  },

  /**
   * проверяет залогинен пользователь в GB или нет
   * @return {bool}
   */
  checkLogin: function () {
		var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),
				iter = cookieManager.enumerator;
		
		while (iter.hasMoreElements()) 
		{
			var cookie = iter.getNext();
			if (cookie instanceof Components.interfaces.nsICookie && cookie.host.indexOf("google.com") !== -1 && cookie.name === "SID")
			{
				return true;	
			}
		}
		return false;
	},

	/**
	 * получает список закладок с сервера в формате RSS
	 * @param  {bool} showMenu - показывать меню после обновления или нет
	 */
	doRequestBookmarks: function(showMenu)
	{
		try
		{
			GBE.m_ganswer = null;
			GBE.m_signature = null;
			GBE.m_bookmarkList = null;
			GBE.m_labelsArr = null;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", GBE.baseUrl + "lookup?output=rss&num=10000", true); 
			//TODO: может переделать на onreadystatechange ?
			xhr.onload = function() {
	    	GBE.m_ganswer = this.responseXML.documentElement;
	    	GBE.doBuildMenu();
	    	if (showMenu)
	    	{
	    		document.getElementById("GBE-popup").openPopup(document.getElementById("GBE-toolbarbutton"), "after_start",0,0,false,false);
	    	}
	  	};
	  	xhr.onerror = function() {
	  		GBE.refreshInProgress = false;
	    	GBE.ErrorLog("doRequestBookmarks", "Ошибка при получении списка закладок");
	  	};
	  	xhr.send(null);
	  }
	  catch (e)
		{
			GBE.ErrorLog("doRequestBookmarks", " " + e);
		}
	},

	/**
	 * удаляет все закладки из меню
	 */
	doClearBookmarkList: function()
	{
		var GBE_GBlist = document.getElementById("GBE-GBlist");
		try
		{
			while (GBE_GBlist.hasChildNodes())
			{
				var firstChild = GBE_GBlist.firstElementChild;
				GBE_GBlist.removeChild(firstChild);
			}
		}
		catch (e)
		{
			GBE.ErrorLog("doClearBookmarkList", " " + e);
		}
	},

	/**
	 * формирует меню закладок
	 */
	doBuildMenu: function()
	{
		// получаем все метки из XML ответа сервера
		var labels = GBE.m_ganswer.getElementsByTagName("smh:bkmk_label");
		// получаем все закладки из XML ответа сервера
		var bookmarks = GBE.m_ganswer.getElementsByTagName("item");
		// контейнер в меню, в который будут добавляться закладки
		var GBE_GBlist = document.getElementById("GBE-GBlist");
		var allLabelsStr, i;

		// сохраняем сигнатуру из ответа (необходима при работе с закладками)
		if (GBE.m_ganswer.getElementsByTagName("smh:signature").length)
		{
			GBE.m_signature = GBE.m_ganswer.getElementsByTagName("smh:signature")[0].childNodes[0].nodeValue;
		}
		
		// если закладок и меток в ответе сервера нет - ничего не делаем
		if (!labels.length && !bookmarks.length) 
		{
			GBE.refreshInProgress = false;
		 	return; 
		}

		// временная строка для группировки и сортировки меток
		allLabelsStr = GBE.labelSep;
		// группируем метки
		for (i = 0; i < labels.length; i++) 
		{
			// название метки
			var labelVal = labels[i].childNodes[0].nodeValue;
			// если такой метки во временной строке еще нет - добавляем ее (с разделителем)
			if (allLabelsStr.indexOf(GBE.labelSep + labelVal + GBE.labelSep) === -1)
			{
				allLabelsStr += (labelVal + GBE.labelSep);
			}
		}
		
		// удаляем первый и последний разделитель ("|")
		if (allLabelsStr.length > 2)
		{
			allLabelsStr = allLabelsStr.substr(1, allLabelsStr.length-2);
		}
		
		// получаем массив меток
		GBE.m_labelsArr = allLabelsStr.split(GBE.labelSep);
		if (GBE.m_labelsArr.length)
		{
			// сортируем массив меток
			GBE.m_labelsArr.sort(GBE.sortStrings);
			// добавляем метки в меню (в виде папок)
			for (i = 0; i < GBE.m_labelsArr.length; i++) 
			{
				var tempMenupopup = document.createElement('menupopup');
				var tempMenu = document.createElement('menu');
				// устанавливаем атрибуты нового элемента меню
				tempMenu.setAttribute("id", "GBE_" + GBE.m_labelsArr[i]);
				tempMenu.setAttribute("label", GBE.m_labelsArr[i]);
				tempMenu.setAttribute("class", "menu-iconic");
				tempMenu.setAttribute("image", "chrome://GBE/skin/images/folder_blue.png");
				tempMenu.setAttribute("container", "true");
				tempMenu.setAttribute("context", "GBE-folderMenu");
				//tempMenu.setAttribute("oncontextmenu", "GBE.showFolderMenu(event); return false;");
				// добавляем к нему вложенное меню
				tempMenu.appendChild(tempMenupopup);
				// добавляем его в основное меню
				GBE_GBlist.appendChild(tempMenu);
			}
		}

		// список закладок
		GBE.m_bookmarkList = new Array(bookmarks.length);
		// сохраняем закладки в поле m_bookmarkList
		for (i = 0; i < bookmarks.length; i++) 
		{
			GBE.m_bookmarkList[i] = new Array(5);
			GBE.m_bookmarkList[i][0] = bookmarks[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
			GBE.m_bookmarkList[i][1] = bookmarks[i].getElementsByTagName("link")[0].childNodes[0].nodeValue;
			GBE.m_bookmarkList[i][2] = bookmarks[i].getElementsByTagName("smh:bkmk_id")[0].childNodes[0].nodeValue;
			var bookmark_labels = bookmarks[i].getElementsByTagName("smh:bkmk_label");
			var	j;
			// закладка с метками?
			if (bookmark_labels.length)
			{
				// сохраняем метки в массив
				GBE.m_bookmarkList[i][3] = new Array(bookmark_labels.length);
				for (j = 0; j < bookmark_labels.length; j++)
				{
					GBE.m_bookmarkList[i][3][j] =  bookmark_labels[j].childNodes[0].nodeValue;
				}
			}
			else
			{
				GBE.m_bookmarkList[i][3] = "";
			}
			// закладка с примечанием?
			if (bookmarks[i].getElementsByTagName("smh:bkmk_annotation").length)
			{
				GBE.m_bookmarkList[i][4] = bookmarks[i].getElementsByTagName("smh:bkmk_annotation")[0].childNodes[0].nodeValue;
			}
			else
			{
				GBE.m_bookmarkList[i][4] = "";
			}
		}
		// сортируем массив закладок
		GBE.m_bookmarkList.sort(GBE.sortStrings);

		// добавляем закладки в меню
		for (i = 0; i < GBE.m_bookmarkList.length; i++) 
		{
			var parentContainer,
					tempMenuitem;
			// если у закладки есть метки
			if (GBE.m_bookmarkList[i][3] !== "") 
			{
				// то добавляем ее во вложенное меню каждой метки
				for (j = 0; j < GBE.m_bookmarkList[i][3].length; j++)
				{
					tempMenuitem = document.createElement('menuitem');
					parentContainer = GBE_GBlist.getElementsByAttribute("id", "GBE_" + GBE.m_bookmarkList[i][3][j])[0].childNodes[0];
					GBE.appendMenuItem(parentContainer, tempMenuitem, GBE.m_bookmarkList[i]);
				}
			}
			else
			{
				// иначе - в основное меню
				tempMenuitem = document.createElement('menuitem');
				parentContainer = GBE_GBlist;
				GBE.appendMenuItem(parentContainer, tempMenuitem, GBE.m_bookmarkList[i]);
			}
		}
		GBE.needRefresh = false;
		GBE.refreshInProgress = false;
	},

	/**
	 * отправляет запрос на добавление (изменение) закладки
	 * @param  {object} params - параметры редактируемой закладки
	 */
	doChangeBookmark: function(params)
	{
		var xhr = new XMLHttpRequest();
		xhr.open("POST", GBE.baseUrl2, true); 
		// запрос отправлен удачно
		xhr.onload = function() 
		{
			//TODO: может переделать на onreadystatechange ?
			// необходимо обновить меню
			GBE.needRefresh = true;  
			if (window.content.location.href == params.url)
			{
				// меняем иконку на панели
				GBE.setButtonIcons(!params.id);
			}
  	};
  	// ошибка при запросе
  	xhr.onerror = function() 
  	{
    	GBE.ErrorLog("doChangeBookmark", " An error occurred while saving bookmark (" + params.url + ").");
  	};
  	var request = 'zx=' + (new Date()).getTime() + '&bkmk=' + escape(params.url) + '&title=' + encodeURIComponent(params.name) + 
  						'&annotation=' + encodeURIComponent(params.notes) + '&labels=' + encodeURIComponent(params.labels) + 
  						'&prev="/lookup"&sig=' + params.sig;
  	xhr.send(request);
	},	

	/**
	 * отправляет запрос на удаление закладки
	 * @param  {object} params параметры удаляемой закладки
	 */
	doDeleteBookmark: function(params)
	{
			var request = GBE.baseUrl2 + "?zx=" + (new Date()).getTime() + "&dlq=" + params.id + "&sig=" + params.sig;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", request, true); 
			xhr.onload = function() 
			{
				//TODO: может переделать на onreadystatechange ?
				GBE.needRefresh = true; 
				if (window.content.location.href == params.url)
				{
					// меняем иконку на панели
					GBE.setButtonIcons(null);
					//document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_empty.png");
				}
	  	};
	  	xhr.onerror = function() 
	  	{
	    	GBE.ErrorLog("doDeleteBookmark", " An error occurred while deleting bookmark (" + params.url + ").");
	  	};
	  	xhr.send(null);
	},

	/**
	 * функция сортировки строк (закладок и меток)
	 * @param  {String} a
	 * @param  {String} b
	 * @return {int} результат сравнения
	 */
	sortStrings: function (a, b) {
		var aStr = String(a),
				bStr = String(b);
		return aStr.toLowerCase() < bStr.toLowerCase() ? -1 : 1; 
	},

	/**
   * Вывод отладочных сообщений в консоль
   * @param {string} s1
   * @param {string} s2
   */
  ErrorLog: function(s1, s2)
	{
		GBE.GBLTut_ConsoleService.logStringMessage(s1 + s2);
	},

	/**
	 * задает атрибуты элемента меню закладок
	 * @param  {menu} parent
	 * @param  {menuitem} item
	 * @param  {array} value
	 */
	appendMenuItem: function(parent, item, value)
	{
		item.setAttribute("label", value[0]);
		item.setAttribute("id", value[2]);
		item.setAttribute("url", value[1]);
		item.setAttribute("tooltiptext", value[1]);
		item.setAttribute("class", "menuitem-iconic");
		item.setAttribute("image", "chrome://GBE/skin/images//bkmrk.png");
		item.setAttribute("oncommand", "GBE.bookmarkClick(event);");
		item.setAttribute("context", "GBE-contextMenu");
		// item.setAttribute("oncontextmenu", "GBE.showContextMenu(event, '" + value[2] + "'); return false;");
		parent.appendChild(item);
	},

	/**
	 * открывает заданный адрес в новой или той же вкладке
	 * @param  {[type]} url открываемый адрес
	 * @param  {[type]} inSameTab = false флаг открытия в новой вкладке
	 */
	showURL: function(url, inSameTab = false)
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
	},	

	refreshBookmarks: function(showMenu = true)
	{
		if (!GBE.refreshInProgress)
		{	
			GBE.refreshInProgress = true;
			GBE.doClearBookmarkList();
			GBE.doRequestBookmarks(showMenu);
		}
	},

	/**
	 * обработчик меню логаут
	 */
	logout : function()
	{
		GBE.showURL("https://www.google.com/accounts/Logout");
		GBE.oldURL = null;
		GBE.m_ganswer = null;
		GBE.m_labelsArr = null;
		GBE.m_bookmarkList = null;
		GBE.needRefresh = true;
		GBE.m_signature = "";
		GBE.currentContextId = "";
		GBE.currentFolderId = "";
		GBE.oldSearchValue = "";
		GBE.doClearBookmarkList();
	},

	/**
	 * обработчик меню логин
	 */
	login : function()
	{
		GBE.showURL("https://accounts.google.com");
	},	

	/**
	 * обработчик меню About
	 */
	showAboutForm: function()
	{
		window.openDialog("chrome://GBE/content/overlays/about.xul", "","centerscreen");
	},

	/**
	 * обработчик события onpopupshowing для основного меню (GBE-popup)
	 */
	onShowMenu: function()
	{
		// кнопки логин и логаут
		var btnLgn = document.getElementById("GBE-hmenuLgn"), 
				btnLgt = document.getElementById("GBE-hmenuLgt");
		// если залогинены в GB
		if (GBE.checkLogin())
		{
			// показываем кнопку логаут и прячем логин
			btnLgn.setAttribute("hidden", true);
			btnLgt.setAttribute("hidden", false);
			// если необходимо - обновляем закладки
			if(GBE.needRefresh)
			{
				 GBE.refreshBookmarks();
				 GBE.needRefresh = false;
			}
		}
		else
		{
			// показываем кнопку логин и прячем логаут
			btnLgt.setAttribute("hidden", true);
			btnLgn.setAttribute("hidden", false);
		}
	},

	/**
	 * открывает закладку в новой вкладке
	 */
	bookmarkClick: function(e)
	{
		GBE.showURL(e.currentTarget.getAttribute("url"));
	},

	/**
	 * открывает диалог добавления (редактирования) закладки
	 * @param  {bool} editBkmk = true режим редактирования (true) или добавления (false) закладки
	 * @param  {string} addLabel = "" режим добавления новой метки к закладке (через контекстное меню метки)
	 */
	showBookmarkDialog: function(editBkmk = true, addLabel = "")
	{
		// адрес текущей страницы
		var cUrl = window.content.location.href;
		// если список закладок и адрес не пустые 
		//if ((GBE.m_bookmarkList.length) && (cUrl !== ""))
		if (cUrl !== "")
		{
			// если у документа нет заголовка, то название закладки = адрес без протокола (например, без http://)
			var myRe = /(?:.*?:\/\/?)(.*)(?:\/$)/ig;
			// параметры закладки
			var params = {
					name : (window.content.document.title || myRe.exec(cUrl)[1]),
					id : null,
					url : cUrl,
					labels : "",
					notes : "",
					sig : GBE.m_signature
				};
			// находим закладку по адресу (при редактировании)
			if (editBkmk)
			{
				GBE.getBookmark(params, true);
			}
			// при добавлении дополнительной метки
			if (addLabel.length)
			{
				// для закладок, у которых уже есть метки
				if (params.labels.length)
				{
					params.labels.push(addLabel);
				}
				// для закладок без меток и новых закладок
				else
				{
					params.labels += addLabel;
				}
			}
			window.openDialog("chrome://GBE/content/overlays/bookmark.xul", "","alwaysRaised,centerscreen,resizable", params, GBE);
		}
	},

	/**
	 * выполняется при загрузке диалога редактирования закладок
	 */
	onLoadBookmarkDialog : function()
	{
		if (window.arguments[0] !== null ) 
		{
			var params = window.arguments[0];
			// заполняем поля диалога редактирования
			document.getElementById("GBE-bookmark.dialog.name").value = params.name;
			document.getElementById("GBE-bookmark.dialog.url").value = params.url;
			document.getElementById("GBE-bookmark.dialog.labels").value = params.labels;
			document.getElementById("GBE-bookmark.dialog.notes").value = params.notes;
			// при редактировании поле адреса делаем только для чтения
			if (params.id)
			{
				document.getElementById("GBE-bookmark.dialog.url").setAttribute("readonly", "true");
			}

			var searchTextField = document.getElementById("GBE-bookmark.dialog.labels");
			// формируем список для автодополнения меток
			var labelsList = window.arguments[1].m_labelsArr;
			paramsToSet = "[";
			for (var i = 0; i < labelsList.length; i++) {
				paramsToSet += "{\"value\" : \"" + labelsList[i] + "\"},";
			};
			paramsToSet = paramsToSet.substring(0, paramsToSet.length-1); // to remove the last ","
			paramsToSet += "]";
			searchTextField.setAttribute("autocompletesearchparam", paramsToSet);
		}
	},

	/**
	 * клик по кнопке сохранить в диалоге редактирования закладки
	 */
	onAcceptBookmarkDialog : function()
	{
		var params = window.arguments[0];
		params.name = document.getElementById("GBE-bookmark.dialog.name").value;
		params.url = document.getElementById("GBE-bookmark.dialog.url").value;
		params.labels = document.getElementById("GBE-bookmark.dialog.labels").value;
		params.notes = document.getElementById("GBE-bookmark.dialog.notes").value;
		if (params.name == "") {
			document.getElementById("GBE-bookmark.dialog.name").focus();
			return false;
		}
		if (params.url == "") {
			document.getElementById("GBE-bookmark.dialog.url").focus();
			return false;
		}
		window.arguments[1].doChangeBookmark(params);
	},

	/**
	 * открывает диалог удаления закладки
	 * @param  {event} e 
	 */
	showDeleteDlg: function(e)
	{
		// параметры закладки
		var params = {name : "", id : null,	url : window.content.location.href, labels : "", notes : "", sig : GBE.m_signature};
		var bookmarkNotFound = true;
		// вызов из основного меню
		if(e === null)
		{
			GBE.getBookmark(params, true);
			if (params.id)
			{
				bookmarkNotFound = false;
			}
		}
		// вызов из контекстного меню закладки
		else
		{
			params.id = e.currentTarget.getAttribute("id").replace("GBE","");
			params.name = e.currentTarget.getAttribute("label");
			bookmarkNotFound = false;
		}
		// закладка не найдена - ничего не делаем
		if(bookmarkNotFound)
		{
			GBE.ErrorLog("showDeleteBkmkDlg", " Не найдена закладка.");
			return;
		}
		window.openDialog("chrome://GBE/content/overlays/delete.xul", "","alwaysRaised,centerscreen", params, GBE);
	},

	/**
	 * при открытии диалога удаления закладки
	 */
	onLoadDeleteDialog: function()
	{
		if (window.arguments[0] !== null ) 
		{
			// выводим название удаляемой закладки
			document.getElementById("GBE-delete.dialog.title").value = window.arguments[0].name + "?";
		}
	},	

	/**
	 * клик по кнопке удалить в диалоге удаления закладки
	 */
	onAcceptDeleteDlg: function()
	{
		if(window.arguments[1] && window.arguments[0])
		{
			window.arguments[1].doDeleteBookmark(window.arguments[0]);
		}
	},

	/**
	 * при показе контекстного меню закладки
	 */
	onShowContextMenu : function(event)
	{
		try {
			// GBE.currentContextId = event.target.getAttribute("id").replace("GBE_","");
			// запоминаем код закладки
			GBE.currentContextId = event.target.triggerNode.getAttribute("id").replace("GBE_","");
			// document.getElementById("GBE-contextMenu").showPopup(document.getElementById(GBE.currentContextId), 
			// 													event.screenX - 2, event.screenY - 2, "context");
		}
		catch (e) {
			GBE.ErrorLog("onBookmarkContextMenu", " " + e);
		}
	},

	/**
	 * клик на пункте контекстного меню закладки "Открыть на месте"
	 */
	contextShowHere : function(event)
	{
		var params = {name : "", id : GBE.currentContextId,	url : "", labels : "", notes : "", sig : GBE.m_signature};
		// получаем параметры закладки
		GBE.getBookmark(params);
		// если нашли - показываем в той же вкладке
		if (params.id)
		{
			GBE.showURL(params.url, true);
		}
	},

	/**
	 * клик на пункте контекстного меню закладки "Редактировать"
	 */
	contextEditBookmark : function(event)
	{
		try
		{
			var params = {name : "", id : GBE.currentContextId,	url : "", labels : "", notes : "", sig : GBE.m_signature};
			GBE.getBookmark(params);
			if (params.id)
			{
				window.openDialog("chrome://GBE/content/overlays/bookmark.xul", "","alwaysRaised,centerscreen,resizable", params, GBE);
			}
		}
		catch (e) {
			GBE.ErrorLog("contextEditBookmark", " " + e);
		}
	},

	/**
	 * клик на пункте контекстного меню закладки "Удалить"
	 */
	contextRemoveBookmark : function(event)
	{
		try
		{
			var params = {name : "", id : GBE.currentContextId,	url : "", labels : "", notes : "", sig : GBE.m_signature};
			GBE.getBookmark(params);
			if (params.id)
			{
				window.openDialog("chrome://GBE/content/overlays/delete.xul", "","alwaysRaised,centerscreen", params, GBE);
			}
		}
		catch (e) {
			GBE.ErrorLog("contextRemoveBookmark", " " + e);
		}		

	},

	/**
	 * завершение поиска при автокомплите меток
	 */
	onSearchCompliteAutocomplite : function (e)
	{
		// обнуляем предыдущее значение поиска
		GBE.oldSearchValue = "";
		// текущее значение поиска
		var value = e.value;
		// если в строке поиска есть запятые (у закладки несколько меток), то
		if (value.indexOf(",") > 0)
		{
			// сохраняем значения до последней запятой
			GBE.oldSearchValue = value.substr(0, value.lastIndexOf(',')).trim();
		}
	},

	/**
	 * при выборе значения из списка автокомплита
	 */
	onTextEnteredAutocomplite : function (e)
	{
		// если предыдущее значение поиска не пустое
		if (GBE.oldSearchValue.length)
		{
			// объединяем старое значение и значение из списка
			e.value = GBE.oldSearchValue + ', ' + (e.value);
			GBE.oldSearchValue = "";
		}
	},

	/**
	 * при показе контекстного меню метки
	 */
	onShowFolderMenu : function(e)
	{
		try {
			GBE.currentFolderId = e.target.triggerNode.getAttribute("id");
			for (var i = 0; i < GBE.m_labelsArr.length; i++) 
			{
				if (("GBE_" + GBE.m_labelsArr[i]) != GBE.currentFolderId)
				{
					document.getElementById("GBE_" + GBE.m_labelsArr[i]).open = false;
				}
			}
		}
		catch (error) {
			GBE.ErrorLog("showFolderMenu", " " + error);
		}
	},

	/**
	 * обработчик пункта контекстного меню метки "Открыть все" - открывает все вложенные закладки в подменю
	 */
	folderMenuOpenAll : function()
	{
		// получаем название метки
		var label = document.getElementById(GBE.currentFolderId).getAttribute("label");
		if (label.length && GBE.m_bookmarkList && GBE.m_bookmarkList.length)
  	{
	  	// перебираем все закладки
	  	for (i = 0; i < GBE.m_bookmarkList.length; i++)
	  	{
	  		var labels = GBE.m_bookmarkList[i][3];
	  		if (labels.length)
	  		{
		  		for (var j = 0; j < labels.length; j++) {
		  			// открываем закладки, которые содержат искомую метку
		  			if (labels[j] == label)
		  			{
		  				GBE.showURL(GBE.m_bookmarkList[i][1]);
		  			}
		  		};
	  		}	
	  	}
  	}
  	GBE.currentFolderId = "";
	},

	/**
	 * обработчик пункта контекстного меню метки "Добавить закладку здесь"
	 */
	folderMenuAddHere : function()
	{
		// название метки
		var label = document.getElementById(GBE.currentFolderId).getAttribute("label");
		// текущий адрес
		var cUrl = window.content.location.href;
		var params = {name : "", id : null,	url : cUrl, labels : "", notes : ""};
		GBE.getBookmark(params, true);
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
		GBE.currentFolderId = "";
	},

	/**
	 * открывает диалог редактирования метки
	 */
	showFolderDialog : function()
	{
		var name = document.getElementById(GBE.currentFolderId).getAttribute("label");
		window.openDialog("chrome://GBE/content/overlays/folder.xul", "","alwaysRaised,centerscreen", name, GBE);
		GBE.currentFolderId = "";
	},

	/**
	 * при открытии диалога редактирования метки
	 */
	onLoadFolderkDialog : function()
	{
		if (window.arguments[0] !== null ) 
		{
			// Заполняем поле с названием метки
			document.getElementById("GBE-folder.dialog.name").value = window.arguments[0];
		}
	},

	/**
	 * подтверждение изменения метки
	 */
	onAcceptFolderDialog : function()
	{
		if(window.arguments[1] && window.arguments[0])
		{
			var gbe = window.arguments[1];
			var oldName = window.arguments[0];
			var name = document.getElementById("GBE-folder.dialog.name").value.trim();
			if (name == "")
			{
				document.getElementById("GBE-folder.dialog.name").focus();
				return false;
			}
			if (name == oldName)
			{
				return true;
			}
			if (name && gbe.m_bookmarkList && gbe.m_bookmarkList.length)
	  	{
		  	// перебираем закладки
		  	for (i = 0; i < gbe.m_bookmarkList.length; i++)
		  	{
		  		// флаг необходимости изменить метку
		  		var needChange = false;
		  		var newLabels = gbe.m_bookmarkList[i][3];
		  		if (newLabels.length)
		  		{
			  		for (var j = 0; j < newLabels.length; j++) {
			  			// меняем метку у соответствующих закладок
			  			if (newLabels[j] == oldName)
			  			{
			  				needChange = true;
			  				newLabels[j] = name;
			  				break;
			  			}
			  		};
		  		}	
		  		// отправляем запрос на изменение закладки
		  		if (needChange)
		  		{
			  		var params = {
							name : gbe.m_bookmarkList[i][0],
							id : gbe.m_bookmarkList[i][2],
							url : gbe.m_bookmarkList[i][1],
							labels : newLabels,
							notes : gbe.m_bookmarkList[i][4],
							sig : gbe.m_signature
						};
 						gbe.doChangeBookmark(params);
		  		}
		  	}
	  	}
		}
	},

	/**
	 * открывает диалог удаления метки
	 */
	showRemoveLabelDialog : function()
	{
		var name = document.getElementById(GBE.currentFolderId).getAttribute("label");
		window.openDialog("chrome://GBE/content/overlays/folder_del.xul", "","alwaysRaised,centerscreen", name, GBE);
		GBE.currentFolderId = "";
	},

	/**
	 * при открытии диалога удаления метки
	 */
	onLoadFolderDeleteDialog : function()
	{
		if (window.arguments[0] !== null ) 
		{
			document.getElementById("GBE-folderDelete.dialog.title").value = window.arguments[0] + "?";
		}
	},

	/**
	 * подтверждение удаления метки
	 */
	onAcceptFolderDeleteDlg : function()
	{
		if(window.arguments[1] && window.arguments[0])
		{
			var name = window.arguments[0];
			var gbe = window.arguments[1];
			// флаг удаления вложенных закладок
			var deleteChildren = document.getElementById("GBE-folderDelete.dialog.deleteChildren").checked;
			if (name && gbe.m_bookmarkList && gbe.m_bookmarkList.length)
	  	{
	  		// находим закладки с нужной меткой
	  		for (i = 0; i < gbe.m_bookmarkList.length; i++)
		  	{
		  		var labelPos = -1;
		  		var newLabels = gbe.m_bookmarkList[i][3];
		  		if (newLabels.length)
		  		{
			  		for (var j = 0; j < newLabels.length; j++) {
			  			if (newLabels[j] == name)
			  			{
			  				// запоминаем позицию искомой метки в массиве меток найденной закладки
			  				labelPos = j;
			  				break;
			  			}
			  		}
			  	}	
			  	// закладка с искомой меткой
			  	if (labelPos >= 0)
			  	{
			  		var params = {
							name : gbe.m_bookmarkList[i][0],
							id : gbe.m_bookmarkList[i][2],
							url : gbe.m_bookmarkList[i][1],
							labels : newLabels,
							notes : gbe.m_bookmarkList[i][4],
							sig : gbe.m_signature
						};
						// если у закладки это единственная метка и стоял флаг deleteChildren
			  		if ((newLabels.length == 1) && deleteChildren) 
			  		{
			  			// отправляем запрос на удаление закладки
			  			gbe.doDeleteBookmark(params);
			  		}
			  		else
			  		{
			  			// удаляем метку из массива меток найденной закладки
			  			params.labels.splice(labelPos,1);
			  			// отправляем запрос на изменение закладки 
			  			gbe.doChangeBookmark(params);
			  		}
			  	}
		  	}
	  	}
		}
	},



};

window.addEventListener("load", function() { GBE.init() }, false);
window.addEventListener("unload", function() { GBE.uninit() }, false);


/*GBE.installButton = function(toolbarId, id, afterId) 
{
    if (!document.getElementById(id)) {
        var toolbar = document.getElementById(toolbarId);
 
        // If no afterId is given, then append the item to the toolbar
        var before = null;
        if (afterId) {
            let elem = document.getElementById(afterId);
            if (elem && elem.parentNode == toolbar)
                before = elem.nextElementSibling;
        }
 
        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
 
        if (toolbarId == "addon-bar")
            toolbar.collapsed = false;
    }
}
 
if (firstRun) {
    GBE.installButton("nav-bar", "GBE-toolbaritem");
    // The "addon-bar" is available since Firefox 4
    //installButton("addon-bar", "GBE-toolbaritem");
}
*/


GBE.installButton = function()
{
	var id = "GBE-toolbaritem";
	var toolbarId = "nav-bar";
 
	var toolbar = document.getElementById(toolbarId);
 
	//add the button at the end of the navigation toolbar	
	toolbar.insertItem(id, toolbar.lastChild);
	toolbar.setAttribute("currentset", toolbar.currentSet);
	document.persist(toolbar.id, "currentset");
	alert("installButton");
 
	//if the navigation toolbar is hidden, 
	//show it, so the user can see your button
	toolbar.collapsed = false;
}
 
GBE.firstRun = function (extensions) 
{
    var extension = extensions.get("GBE@fess16.blogspot.com");
 		//alert(extension);
    if (extension.firstRun)
    {
    	GBE.installButton();	
    	//alert("firstRun2");
    }
}
 
if (Application.extensions)
{
  GBE.firstRun(Application.extensions);
}
else
{
  Application.getExtensions(GBE.firstRun);
}