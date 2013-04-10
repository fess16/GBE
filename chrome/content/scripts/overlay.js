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
		//TODO: сделать обновлени списка закладок при запуске
		if (window.location == "chrome://browser/content/browser.xul")
		{
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
    	document.getElementById("GBE-button").setAttribute("image", "chrome://GBE/skin/images/Star_full.png");
		}
		else
		{
			document.getElementById("GBE-button").setAttribute("image", "chrome://GBE/skin/images/Star_empty.png");
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
  	// не нашли - в поле id устанавливаем null 
  	params.id = null;
  },

  /**
   * Вывод отладочных сообщений в консоль
   * @param {string} s1
   * @param {string} s2
   */
  ErrorLog: function(s1, s2)
	{
		GBE.GBLTut_ConsoleService.logStringMessage(s1 + s2);
	}


};
