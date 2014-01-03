Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

EXPORTED_SYMBOLS = ['fGoogleBookmarksExtension'];

var fGoogleBookmarksExtension = 
{
	// адрес для получения списка закладок
	'baseUrl' : "https://www.google.com/bookmarks/",
	// адрес для работы с отдельными закладками
	'baseUrl2' : "https://www.google.com/bookmarks/mark",
  // список всех закладок (полученный с сервера) в формате XML
  'm_ganswer' : null,
  // список всех меток (папок)
  'm_labelsArr' : null,
  // список всех закладок (обработанный)
  'm_bookmarkList' : null,
  // разделитель меток при сортировке
  'labelSep'	: "{!|!}",
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
  // массив отфильтрованных закладок
  'tempFilterArray' : [],
  // предыдущее значение фильтра
  'oldFilterValue' : "",

  /* ------Свойства------*/
  // разделитель вложенных меток
  'nestedLabelSep' : '/',
  // флаг показа иконок для закладок
  'showFavicons' : true,
  // флаг переключения действия левого клика по закладке
  'reverseBkmrkLeftClick' : false,
  // тип сортировки 
  'sortType' : "name",
  // направление сортировки
  'sortOrder' : "asc",
  // флаг автоподстановки меток для новых закладок
  'suggestLabel' : true,
  // флаг включения автодополнения в адресной строке
  'enableGBautocomplite' : false,
	// режим без примечаний - формат получения закладок: rss or xml
	'enableNotes' : false,
	// переключатель использования кнопки на панели или пункта в главном меню
	'useMenuBar' : false,
	// включить добавление метки к закладкам без метки
	'enableLabelUnlabeled' : false,
	// добавляемая метка
	'labelUnlabeledName' : "Unlabeled",
	'prefs' : null,
 	/* --------------------*/

 	'defAutocompliteList' : "",
 	'timeOut' : 10000,

 	'windowsParams' : {},



  // nsIWebProgressListener
  'QueryInterface': XPCOMUtils.generateQI(["nsIWebProgressListener", "nsISupportsWeakReference"]),

  'GBLTut_ConsoleService' : Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService),
  'cookieManager' : Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),


	/**
   * Вывод отладочных сообщений в консоль
   * @param {string} s1
   * @param {string} s2
   */
  ErrorLog : function(s1, s2)
	{
		var str = "";
		for (var i = 0; i < arguments.length; i++)
		{
			str += arguments[i] + " ";
		}
		this.GBLTut_ConsoleService.logStringMessage(str);
		//Application.console.log(s1 + " " + s2);
	},

	  /**
   * проверяет залогинен пользователь в GB или нет
   * @return {bool}
   */
  checkLogin : function () {
		var	iter = this.cookieManager.enumerator;
		var domainRegexp = new RegExp(this.googleDomains.join('|'));
		while (iter.hasMoreElements()) 
		{
			var cookie = iter.getNext();
			if (cookie instanceof Components.interfaces.nsICookie && domainRegexp.test(cookie.host) && cookie.name === "SID")
			{
				return true;	
			}

		}
		return false;
	},

	/**
	 * удаляет куки авторизации в гугл аке (при ошибке получения списка закладок, для повторного логина)
	 */
	removeSIDCookie : function()
	{
		var	iter = this.cookieManager.enumerator;
		var domainRegexp = new RegExp(this.googleDomains.join('|'));
		while (iter.hasMoreElements()) 
		{
			var cookie = iter.getNext();
			if (cookie instanceof Components.interfaces.nsICookie && domainRegexp.test(cookie.host) && cookie.name === "SID")
			{
				this.cookieManager.remove(cookie.host, cookie.name, cookie.path, false);
			}
		}
	},

	/**
	 * читает значение заданного свойства. при отсутствии задает значение по-умолчанию
	 * @param  {string} prefName     назавание свойсива
	 * @param  {long}		prefType     тип свойства
	 * @param  					prefDefValue значение по-умолчанию
	 */
	readPrefValue : function(prefName, prefType, prefDefValue)
	{
		if (this.prefs.getPrefType(prefName) == prefType)
		{
			this[prefName] = ((prefType == this.prefs.PREF_STRING) ? this.prefs.getCharPref(prefName) : this.prefs.getBoolPref(prefName));
		}
		else
		{
			if (prefType == this.prefs.PREF_STRING)
			{
				this.prefs.setCharPref(prefName, prefDefValue);
				this[prefName] = prefDefValue;
			}
			else
			{
				this.prefs.setBoolPref(prefName, prefDefValue);
				this[prefName] = prefDefValue;
			}
		}		
	},


	/**
	 * читает значения свойств
	 */
	getPrefsValues : function() 
	{
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces.nsIPrefService)
     .getBranch("extensions.fessGBE.");

    this.readPrefValue("nestedLabelSep", this.prefs.PREF_STRING, "/");
    this.readPrefValue("showFavicons", this.prefs.PREF_BOOL, true);
    this.readPrefValue("reverseBkmrkLeftClick", this.prefs.PREF_BOOL, false);
    this.readPrefValue("sortType", this.prefs.PREF_STRING, "name");
    this.readPrefValue("sortOrder", this.prefs.PREF_STRING, "asc");
    this.readPrefValue("suggestLabel", this.prefs.PREF_BOOL, false);
    this.readPrefValue("enableGBautocomplite", this.prefs.PREF_BOOL, false);
    this.readPrefValue("enableNotes", this.prefs.PREF_BOOL, false);
    this.readPrefValue("useMenuBar", this.prefs.PREF_BOOL, false);
    this.readPrefValue("enableLabelUnlabeled", this.prefs.PREF_BOOL, false);
    this.readPrefValue("labelUnlabeledName", this.prefs.PREF_STRING, "Unlabeled");
	},

	/**
	 * поиск информации о закладке по коду (или адресу)
	 * @param  {object} - params информация о закладке
	 * @param  {bool} findByURL = false - признак поиска по адресу
	 */
	getBookmark : function(params, findByURL = false)
	{
		try
		{
	  	// по-умолчанию ищем по коду
	  	var field = "id", value = params.id;
	  	// если установлен флаг - то по адресу
	  	if (findByURL)
	  	{
	  		field = "url";
	  		value = params.url;
	  	}
	  	if ((this.m_bookmarkList !== null) && (this.m_bookmarkList.length))
	  	{
		  	// перебираем закладки
		  	for (var i = 0, m_bookmarkListLength = this.m_bookmarkList.length; i < m_bookmarkListLength; i++)
		  	{
		  		// если нашли заполняем поля и выходим
		  		if (this.m_bookmarkList[i][field] === value)
		  		{
		  			params.name = this.m_bookmarkList[i].title;
		  			params.id = this.m_bookmarkList[i].id;
		  			params.url = this.m_bookmarkList[i].url;
		  			params.labels = this.m_bookmarkList[i].labels;
		  			params.notes = this.m_bookmarkList[i].notes;
		  			params.index = i;
		  			return;
		  		}
		  	}
	  	}
	  	// не нашли - в поле id устанавливаем null 
	  	params.id = null;
		}
	  catch (e)
		{
			this.ErrorLog("GBE:getBookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},


	"googleDomains" : [
			"google.ad",
			"google.ae",
			"google.al",
			"google.am",
			"google.as",
			"google.at",
			"google.az",
			"google.ba",
			"google.be",
			"google.bf",
			"google.bg",
			"google.bi",
			"google.bj",
			"google.bs",
			"google.bt",
			"google.by",
			"google.ca",
			"google.cat",
			"google.cd",
			"google.cf",
			"google.cg",
			"google.ch",
			"google.ci",
			"google.cl",
			"google.cm",
			"google.cn",
			"google.co.ao",
			"google.co.bw",
			"google.co.ck",
			"google.co.cr",
			"google.co.id",
			"google.co.il",
			"google.co.in",
			"google.co.jp",
			"google.co.ke",
			"google.co.kr",
			"google.co.ls",
			"google.co.ma",
			"google.co.mz",
			"google.co.nz",
			"google.co.th",
			"google.co.tz",
			"google.co.ug",
			"google.co.uk",
			"google.co.uz",
			"google.co.ve",
			"google.co.vi",
			"google.co.za",
			"google.co.zm",
			"google.co.zw",
			"google.com",
			"google.cv",
			"google.cz",
			"google.de",
			"google.dj",
			"google.dk",
			"google.dm",
			"google.dz",
			"google.ee",
			"google.es",
			"google.fi",
			"google.fm",
			"google.fr",
			"google.ga",
			"google.ge",
			"google.gg",
			"google.gl",
			"google.gm",
			"google.gp",
			"google.gr",
			"google.gy",
			"google.hn",
			"google.hr",
			"google.ht",
			"google.hu",
			"google.ie",
			"google.im",
			"google.iq",
			"google.is",
			"google.it",
			"google.je",
			"google.jo",
			"google.kg",
			"google.ki",
			"google.kz",
			"google.la",
			"google.li",
			"google.lk",
			"google.lt",
			"google.lu",
			"google.lv",
			"google.md",
			"google.me",
			"google.mg",
			"google.mk",
			"google.ml",
			"google.mn",
			"google.ms",
			"google.mu",
			"google.mv",
			"google.mw",
			"google.ne",
			"google.nl",
			"google.no",
			"google.nr",
			"google.nu",
			"google.pl",
			"google.pn",
			"google.ps",
			"google.pt",
			"google.ro",
			"google.rs",
			"google.ru",
			"google.rw",
			"google.sc",
			"google.se",
			"google.sh",
			"google.si",
			"google.sk",
			"google.sm",
			"google.sn",
			"google.so",
			"google.st",
			"google.td",
			"google.tg",
			"google.tk",
			"google.tl",
			"google.tm",
			"google.tn",
			"google.to",
			"google.tt",
			"google.vg",
			"google.vu",
			"google.ws"
		]
};