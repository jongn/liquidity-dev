window.onload = function() {

  localStorage.setItem("data", "Time,Coinbase,BitFinex,Bitstamp,Poloniex\n");

  var tableData = [
        { field1: 0, field2: 0, field3: 0, field4: 0 },
        { field1: 0, field2: 0, field3: 0, field4: 0 },
        { field1: 0, field2: 0, field3: 0, field4: 0 }
        ];
            
  var dt = dynamicTable.config('chart_plot_01');


   //['field1', 'field2', 'field3', "field4"], 
    //['Coinbase', 'BitFinex', 'Bitstamp', "Poloniex"]

  dt.load(tableData);

  var index = 0;
  
  setInterval(function() {
    index = (index + 1) % 3; 
    updateData(localStorage.getItem("data"), tableData, index)
    }
  , 10000);

  setInterval(function() {
    updateGraph(localStorage.getItem("data"));
    dt.load(tableData);
    }
    , 20000);

}


var dynamicTable = (function() {
    
    var _tableId, _table, 
        _fields, _headers, 
        _defaultText;
    
    /** Builds the row with columns from the specified names. 
     *  If the item parameter is specified, the memebers of the names array will be used as property names of the item; otherwise they will be directly parsed as text.
     */
    function _buildRowColumns(names, item) {
        var row = '<tr>';
        if (names && names.length > 0)
        {
            $.each(names, function(index, name) {
                var c = item ? item[name+''] : name;
                row += '<td>' + c + '</td>';
            });
        }
        row += '<tr>';
        return row;
    }
    
    /** Builds and sets the headers of the table. */
    function _setHeaders() {
        // if no headers specified, we will use the fields as headers.
        _headers = (_headers == null || _headers.length < 1) ? _fields : _headers; 
        var h = _buildRowColumns(_headers);
        if (_table.children('thead').length < 1) _table.prepend('<thead></thead>');
        _table.children('thead').html(h);
    }
    
    function _setNoItemsInfo() {
        if (_table.length < 1) return; //not configured.
        var colspan = _headers != null && _headers.length > 0 ? 
            'colspan="' + _headers.length + '"' : '';
        var content = '<tr class="no-items"><td ' + colspan + ' style="text-align:center">' + 
            _defaultText + '</td></tr>';
        if (_table.children('tbody').length > 0)
            _table.children('tbody').html(content);
        else _table.append('<tbody>' + content + '</tbody>');
    }
    
    function _removeNoItemsInfo() {
        var c = _table.children('tbody').children('tr');
        if (c.length == 1 && c.hasClass('no-items')) _table.children('tbody').empty();
    }
    
    return {
        /** Configres the dynamic table. */
        config: function(tableId, fields, headers, defaultText) {
            _tableId = tableId;
            _table = $('#' + tableId);
            _fields = fields || null;
            _headers = headers || null;
            _defaultText = defaultText || 'No items to list...';
            _setHeaders();
            _setNoItemsInfo();
            return this;
        },
        /** Loads the specified data to the table body. */
        load: function(data, append) {
            if (_table.length < 1) return; //not configured.
            _setHeaders();
            _removeNoItemsInfo();
            if (data && data.length > 0) {
                var rows = '';
                $.each(data, function(index, item) {
                    rows += _buildRowColumns(_fields, item);
                });
                var mthd = append ? 'append' : 'html';
                _table.children('tbody')[mthd](rows);
            }
            else {
                _setNoItemsInfo();
            }
            return this;
        },
        /** Clears the table body. */
        clear: function() {
            _setNoItemsInfo();
            return this;
        }
    };
}());


function updateData(priceData, tableData, index) {

  var coinbase = 'https://api.coinbase.com/v2/exchange-rates?currency=BTC';
  var cb = createCorsRequest('GET', coinbase);

  var cryptonator = 'https://api.cryptonator.com/api/full/btc-usd';
  var ctt = createCorsRequest('GET', cryptonator);

  var poloniex = ctt.ticker.markets[13];
  var bitfinex = ctt.ticker.markets[0];
  var bitstamp = ctt.ticker.markets[1];

  var coinbasePrice = parseFloat(cb.data.rates.USD);
  var bitfinexPrice = parseFloat(bitfinex.price);
  var bitstampPrice = parseFloat(bitstamp.price);
  var poloniexPrice = parseFloat(poloniex.price);

  tableData[index].field1 = coinbasePrice;
  tableData[index].field2 = bitfinexPrice;
  tableData[index].field3 = bitstampPrice;
  tableData[index].field4 = poloniexPrice;


  localStorage.setItem("data", priceData + "\n" + 
    new Date() + "," + coinbasePrice + "," + bitfinexPrice +
    "," + bitstampPrice + "," + poloniexPrice);

}

function updateGraph(data) {
  var cgraph = new Dygraph(
      document.getElementById("chart_plot_01"), data,
      {
        //drawPoints: true,
        width: 1000,
        height: 320,
        axisLabelFontSize: 16,  
        axisLineWidth: 1.7,
        xlabel: "Time",
        //ylabel: "$/BTC",
        fillGraph: true,
        strokeWidth: 3,
        digitsAfterDecimal: 2
      }
  );

}

/** Get Data from API*/
function createCorsRequest(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        console.log("withCredentials");
        xhr.open(method, url, false);
        xhr.send();
        console.log("Status: " + xhr.status);
        console.log("Readystate: " + xhr.readyState);
        if (xhr.readyState == 4 && xhr.status == 200) {
          return JSON.parse(xhr.response);
        }
      

      } else if (typeof XDomainRequest != "undefined") {
        console.log("XDomainRequest");
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {
      console.log("supported");
        xhr = null;
    }
    return xhr;
}