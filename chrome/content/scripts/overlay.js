/* 
Version 0.0.2
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

  // nsIWebProgressListener
  QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener", "nsISupportsWeakReference"]),

  onLocationChange: function(aProgress, aRequest, aURI) 
  {
    this.processNewURL(aURI);
  },

  init: function()
	{
		if (window.location == "chrome://browser/content/browser.xul")
		{
			if(GBE.needRefresh)
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
	 * обработчик изменения адреса: меняет иконку на панели и активность кнопок в меню
	 * @param  {[type]} aURI - текущий адрес
	 * @return {[type]}
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

  	//TODO: делать неактивной кнопки Редактирования и Удаления когда страницы нет в закладках 
  	//TODO: делать неактивной кнопку Добавления - когда страница уже в закладках
   	if (params.id)
		{
    	document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_full.png");
		}
		else
		{
			document.getElementById("GBE-toolbarbutton").setAttribute("image", "chrome://GBE/skin/images/Star_empty.png");
		}
    this.oldURL = aURI.spec;
   },

  /**
   * поиск информации о закладке по коду (или адресу)
   * @param  {object} - params информация о закладке
   * @param  {bool} findByURL = false - признак поиска по адресу
   * @return {{}}
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
  	if (GBE.m_bookmarkList.length)
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
   * @return {[bool]}
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
	 * @return {[type]}
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
			//TODO: может переделать на onreadystatechange
			xhr.onload = function() {
	    	GBE.m_ganswer = this.responseXML.documentElement;
	    	GBE.doBuildMenu();
	    	if (showMenu)
	    	{
	    		document.getElementById("GBE-popup").openPopup(document.getElementById("GBE-toolbarbutton"), "after_start",0,0,false,false);
	    	}
	  	};
	  	xhr.onerror = function() {
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
	 * @return {[type]} [description]
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
	 * @return {[type]}
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
		if (!labels.length && !bookmarks.length) { return; }

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
		
		//GBE.m_labelsArr = null;
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
				tempMenu.setAttribute("image", "chrome://GBE/skin/images/folder.png");
				tempMenu.setAttribute("container", "true");
				// добавляем к нему вложенное меню
				tempMenu.appendChild(tempMenupopup);
				// добавляем его в основное меню
				GBE_GBlist.appendChild(tempMenu);
			}
		}


		// if (bookmarks.length)
		// {
		// GBE.m_bookmarkList = null;

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
		// }
		GBE.needRefresh = false;
	},

	/**
	 * функция сортировки строк (закладок и меток)
	 * @param  {[type]} a
	 * @param  {[type]} b
	 * @return {[type]}
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
	 * @param  {{}} value
	 * @return {[type]}
	 */
	appendMenuItem: function(parent, item, value)
	{
		item.setAttribute("label", value[0]);
		item.setAttribute("id", value[2]);
		item.setAttribute("url", value[1]);
		item.setAttribute("tooltiptext", value[1]);
		item.setAttribute("class", "menuitem-iconic");
		item.setAttribute("image", "chrome://GBE/skin/images//bookmark.png");
		item.setAttribute("oncommand", "GBE.bookmarkClick(event);");
		item.setAttribute("oncontextmenu", "//GBE.onBookmarkContextMenu(event, '" + value[2] + "'); return false;");

		parent.appendChild(item);
	},

	/**
	 * открывает заданный адрес в новой или той же вкладке
	 * @param  {[type]} url
	 * @param  {[type]} inSameTab = false
	 * @return {[type]}
	 */
	showURL: function(url, inSameTab = false)
	{
		if (inSameTab)
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
		}
	},	

	refreshBookmarks: function(showMenu = true)
	{
		GBE.doClearBookmarkList();
		GBE.doRequestBookmarks(showMenu);
	},

	// вызываются из XUL файлов
	/**
	 * обработчик меню логаут
	 * @return {[type]} [description]
	 */
	logout : function()
	{
		GBE.showURL("https://www.google.com/accounts/Logout");
		//TODO: при выходе обнулять меню, закладки, метки и т.д.
	},

	/**
	 * обработчик меню логин
	 * @return {[type]} [description]
	 */
	login : function()
	{
		GBE.showURL("https://accounts.google.com");
	},	

	/**
	 * обработчик меню Абоут
	 * @return {[type]} [description]
	 */
	showAboutForm: function(e)
	{
		window.openDialog("chrome://GBE/content/overlays/about.xul", "","centerscreen");
	},

	/**
	 * отображает меню закладок
	 * @return {[type]} [description]
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
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	bookmarkClick: function(e)
	{
		GBE.showURL(e.currentTarget.getAttribute("url"));
	},

	/**
	 * открывает диалог добавления (редактирования) закладки
	 * @return {[type]} [description]
	 */
	showBookmarkDialog: function(editBkmk = true)
	{
		// адрес текущей страницы
		var cUrl = window.content.location.href;
		// если список закладок и адрес не пустые 
		if ((GBE.m_bookmarkList.length) && (cUrl !== ""))
		{
			// если у документа нет заголовка, то название закладки = адрес без протокола (например, без http://)
			var myRe = /(?:.*?:\/\/?)(.*)(?:\/$)/ig;
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
			window.openDialog("chrome://GBE/content/overlays/bookmark.xul", "","alwaysRaised,centerscreen,resizable", params, GBE);
		}
	},

	onLoadBookmarkDialog : function()
	{
		if (window.arguments[0] !== null ) 
		{
			var params = window.arguments[0];
			document.getElementById("GBE-bookmark.dialog.name").value = params.name;
			document.getElementById("GBE-bookmark.dialog.url").value = params.url;
			document.getElementById("GBE-bookmark.dialog.labels").value = params.labels;
			document.getElementById("GBE-bookmark.dialog.notes").value = params.notes;
			if (params.id)
			{
				document.getElementById("GBE-bookmark.dialog.url").setAttribute("readonly", "true");
			}
		}
	},

	onAcceptBookmarkDialog : function()
	{

	},

	doChangeBookmark: function(params)
	{
		var xhr = new XMLHttpRequest();
		xhr.open("POST", GBE.baseUrl2, true); 
		xhr.onload = function() 
		{
			GBE.needRefresh = true;    
			// GBE.refreshBookmarks();	
  	};
  	xhr.onerror = function() 
  	{
  		//TODO: исправить сообщение об ошибке (добавить инфу о редактируемой закладке)
    	GBE.ErrorLog("doChangeBookmark", " An error occurred while submitting the form.");
  	};
  	var request = 'zx=' + (new Date()).getTime() + '&bkmk=' + escape(params.url) + '&title=' + encodeURI(params.name) + 
  						'&annotation=' + encodeURI(params.notes) + '&labels=' + encodeURI(params.labels) + 
  						'&prev="/lookup"&sig=' + params.sig;
  	xhr.send(request);

	},


};

window.addEventListener("load", function() { GBE.init() }, false);
window.addEventListener("unload", function() { GBE.uninit() }, false);