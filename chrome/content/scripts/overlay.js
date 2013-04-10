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
  // список всех закладок (полученный с сервера)
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
  'currentContextId' : ""

};