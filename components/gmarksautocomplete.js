const Ci = Components.interfaces;

const CLASS_ID = Components.ID("47a2e4a0-358f-11e3-aa6e-0800200c9a66");
const CLASS_NAME = "Gbookmarks AutoComplete";
const CONTRACT_ID = "@mozilla.org/autocomplete/search;1?name=gbookmarks-autocomplete";

try{
    Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
    Components.utils.import("resource://gre/modules/Services.jsm");
    Components.utils.import("resource://gre/modules/FileUtils.jsm");
} catch (x) {
}

function GbookmarksAutoCompleteResult(result, searchString, defaultIndex) {
  this.setResults(result)
  this._searchString = searchString;
  this._defaultIndex = defaultIndex == null ? -1 : defaultIndex;
}

GbookmarksAutoCompleteResult.prototype = {
  _searchResult: 0,
  _searchString: "",
  _defaultIndex: 0,
  _errorDescription: "",
  _result: [],

  /*********** nsIAutoCompleteSimpleResult *********/
  setSearchResult: function(val)
  { 
    return this._searchResult = val;
  },

  setDefaultIndex: function(val)
  {
    return this._defaultIndex = val;
  },

  setSearchString: function(aSearchString){},

  setErrorDescription: function(aErrorDescription){},

  appendMatch: function(aValue,aComment,aImage, aStyle){},

  setListener: function(aListener){},
  /********************/

  setResults: function(result, defItem) 
  {
    if (result) 
    {
      var status = (result.length?'SUCCESS':'NOMATCH')
      this._result = result;
      this._defaultIndex = defItem ? result.indexOf(defItem) : -1
    } 
    else
    {
      var status = 'FAILURE';
    }
    this._searchResult = Ci.nsIAutoCompleteResult['RESULT_' + status];
  },

  /**
   * The result code of this result object, either:
   *         RESULT_IGNORED   (invalid searchString)
   *         RESULT_FAILURE   (failure)
   *         RESULT_NOMATCH   (no matches found)
   *         RESULT_SUCCESS   (matches found)
   */
  get searchResult() 
  {
    return this._searchResult;
  },

  /**
   * The original search string
   */
  get searchString() 
  {
    return this._searchString;
  },

  /**
   * Index of the default item that should be entered if none is selected
   */
  get defaultIndex() 
  {
    return this._defaultIndex;
  },

  /**
   * A string describing the cause of a search failure
   */
  get errorDescription() 
  {
    return this._errorDescription;
  },

  /*
   * The number of matches
   */
  get matchCount() 
  {
    return this._result.length;
  },

  /**
   * Get the comment of the result at the given index
   * Первая строка в результате поиска
   */
  getCommentAt: function(index)
  {
    return this._result[index] && this._result[index].comment || ""
  },

  /*
   * Вторая строка в результате поиска
   */
  getLabelAt: function(index)
  {
    return this._result[index] && this._result[index].url || "";
  },

  /**
   * Get the value of the result at the given index
   * адрес закладки - в адресную строку
   */    
  getValueAt: function(index)
  {
    return this._result[index] && this._result[index].url || "";
  },

  /**
   * Get the image for the result at the given index
   * The return value is expected to be an URI to the image to display
   * иконка слева от результата поиска
   */    
  getImageAt: function(index)
  {
    if (this._result[index] && this._result[index].icon !== "" && this._result[index].icon !== "chrome://GBE/skin/images/bkmrk.png")
    {
      return this._result[index].icon;
    }
    else
    {
      return "";
    }
  },

  /**
   * Get the style hint for the result at the given index
   */
  getStyleAt: function(index)
  {
      return "google_bookmark"; 
  },

  /**
   * Remove the value at the given index from the autocomplete results.
   * If removeFromDb is set to true, the value should be removed from
   * persistent storage as well.
   */
  removeValueAt: function(index, removeFromDb) {
    this._result.splice(index, 1);
  },
  QueryInterface: XPCOMUtils.generateQI([ Ci.nsIAutoCompleteResult, Ci.nsIAutoCompleteSimpleResult ])
};


// Implements nsIAutoCompleteSearch
function GbookmarksAutoCompleteSearch() {
}

GbookmarksAutoCompleteSearch.prototype = {
    classID: CLASS_ID,
    classDescription: CLASS_NAME,
    contractID: CONTRACT_ID,

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param searchString - The string to search for
   * @param searchParam - An extra parameter
   * @param previousResult - A previous result to use for faster searchinig
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function(searchString, searchParam, result, listener) {
    // This autocomplete source assumes the developer attached a JSON string
    // to the the "autocompletesearchparam" attribute or "searchParam" property
    // of the <textbox> element. The JSON is converted into an array and used
    // as the source of match data. Any values that match the search string
    // are moved into temporary arrays and passed to the AutoCompleteResult

      var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);

      var results = [];

      let file = FileUtils.getFile("ProfD", ["fessGBE","fessgbe.sqlite"]);
      let mDBConn = Services.storage.openDatabase(file); // Will also create the file if it does not exist
      if (mDBConn.tableExists("gbookmarks") && searchString.trim().length > 0)
      {
        var statement = mDBConn.createStatement("SELECT * FROM gbookmarks WHERE ftitle LIKE '%" 
          + searchString + "%' OR flink LIKE '%"+ searchString + "%'");
        statement.execute();
        try {
          while (statement.step()) {
            let ftitle = statement.row.ftitle;
            let flink = statement.row.flink;
            results.push(
            {
                  icon: statement.row.ficon,
                  title: statement.row.ftitle,
                  url: statement.row.flink,
                  comment: statement.row.ftitle
            });
          }
        }
        finally 
        {
          statement.reset();
          mDBConn.asyncClose();
        }
      }
      var newResult = new GbookmarksAutoCompleteResult(results, searchString);
      listener.onSearchResult(this, newResult);
  },

  /*
   * Stop an asynchronous search that is in progress
   */
  stopSearch: function() {
  },

  QueryInterface: function(aIID) {
    if (!aIID.equals(Ci.nsIAutoCompleteSearch) && !aIID.equals(Ci.nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },
  _QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIAutoCompleteSearch])
};

// Factory
var GbookmarksAutoCompleteSearchFactory = {
  singleton: null,
  createInstance: function (aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (this.singleton == null)
      this.singleton = new GbookmarksAutoCompleteSearch();
    return this.singleton.QueryInterface(aIID);
  }
};

// Module
var GbookmarksAutoCompleteSearchModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType) {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },

  getClassObject: function(aCompMgr, aCID, aIID) {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return GbookmarksAutoCompleteSearchFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

// Module initialization
function NSGetModule(aCompMgr, aFileSpec) { return GbookmarksAutoCompleteSearchModule; }

if (XPCOMUtils.generateNSGetFactory){
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([GbookmarksAutoCompleteSearch]);
}