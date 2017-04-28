window.onload = function() {

  localStorage.setItem("data", "Time,Coinbase,BitFinex,Bitstamp,Poloniex\n");
  localStorage.setItem("ethData", "Time,Coinbase,BitFinex,Kraken,Poloniex\n");

  topPricesBTC = [0, 0, 0, 0];
  topPricesETH = [0, 0, 0, 0];

  var tableData = [
        { field1: "Coinbase", field2: 0, field3: 0, field4: 0, field5: 0 },
        { field1: "BitFinex", field2: 0, field3: 0, field4: 0, field5: 0 },
        { field1: "Bitstamp", field2: 0, field3: 0, field4: 0, field5: 0 },
        { field1: "Poloniex", field2: 0, field3: 0, field4: 0, field5: 0 }
        ];
            
  var dt = dynamicTable.config('spread-table',
                  ['field1', 'field2', 'field3', 'field4', 'field5'], 
                  ['    ' , 'Coinbase', 'BitFinex', 'Bitstamp', 'Poloniex'], //set to null for field names instead of custom header names
                  'There are no items to list...');


   //['field1', 'field2', 'field3', "field4"], 
    //['Coinbase', 'BitFinex', 'Bitstamp', "Poloniex"]

  dt.load(tableData);

  topShowBTC = true;
  
  
  setInterval(function() {
    updateData(localStorage.getItem("data"), tableData)
    }
  , 5000);

  setInterval(function() {
    updateEthData(localStorage.getItem("ethData"))
    }
  , 5000);

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
                if (c > 0) {
                  row += '<td style="background-color:#f9de0e;">' + c + '</td>';
                } else if (c < 0) {
                  row += '<td style="background-color:#e82525;">' + c + '</td>';
                } else {
                  row += '<td>' + c + '</td>';
                }
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


function updateData(priceData, tableData) {

  var coinbase = 'https://api.coinbase.com/v2/exchange-rates?currency=BTC';
  var cb = createCorsRequest('GET', coinbase);

  var cryptonator = 'https://api.cryptonator.com/api/full/btc-usd';
  var ctt = createCorsRequest('GET', cryptonator);

  var yunbi = "https://yunbi.com/api/v2/order_book.json?market=btccny&asks_limit=1&bids_limit=1";
  var yb = createCorsRequest('GET', yunbi);
  //console.log(yb);
  // var gdax = "https://api.gdax.com";
  // var gd = createCorsRequest('GET', gdax);
  // console.log(gd);

  var kraken = ctt.ticker.markets[8];
  var btccny = yb.asks[0];
  var bitstamp = ctt.ticker.markets[1];

  var coinbasePrice = parseFloat(cb.data.rates.USD);
  var btccnyPrice = parseFloat(btccny.price) / 6.89;
  var bitstampPrice = parseFloat(bitstamp.price);
  var krakenPrice = parseFloat(kraken.price);

  topPricesBTC[0] = coinbasePrice;
  topPricesBTC[1] = btccnyPrice;
  topPricesBTC[2] = bitstampPrice;
  topPricesBTC[3] = krakenPrice;


  tableData[0].field2 = 100*(coinbasePrice * 0.985 - coinbasePrice * 1.015) 
                        / (coinbasePrice * 0.985);
  tableData[0].field3 = 100 * (coinbasePrice * 0.985  - btccnyPrice * 1.000) 
                        / (coinbasePrice * 0.985);
  tableData[0].field4 = 100 * (coinbasePrice * 0.985  - bitstampPrice * 1.0) 
                        / (coinbasePrice * 0.985);
  tableData[0].field5 = 100 * (coinbasePrice * 0.985 - krakenPrice * 1.0) 
                        / (coinbasePrice * 0.985);

  tableData[1].field2 = 100*(btccnyPrice * 0.998 - coinbasePrice * 1.015) 
                        / (btccnyPrice * 0.998);
  tableData[1].field3 = 100 * (btccnyPrice * 0.998  - btccnyPrice * 1.000) 
                        / (btccnyPrice * 0.998);
  tableData[1].field4 = 100 * (btccnyPrice * 0.998  - bitstampPrice * 1.0) 
                        / (btccnyPrice * 0.998);
  tableData[1].field5 = 100 * (btccnyPrice * 0.998 - krakenPrice * 1.0) 
                        / (btccnyPrice * 0.998);

  tableData[2].field2 = 100*(bitstampPrice * 0.9975 - coinbasePrice * 1.015) 
                        / (bitstampPrice * 0.9975);
  tableData[2].field3 = 100 * (bitstampPrice * 0.9975  - btccnyPrice * 1.000) 
                        / (bitstampPrice * 0.9975);
  tableData[2].field4 = 100 * (bitstampPrice * 0.9975  - bitstampPrice * 1.0) 
                        / (bitstampPrice * 0.9975);
  tableData[2].field5 = 100 * (bitstampPrice * 0.9975 - krakenPrice * 1.0) 
                        / (bitstampPrice * 0.9975);

  tableData[3].field2 = 100* (krakenPrice * 0.9975 - coinbasePrice * 1.015) 
                        / (krakenPrice * 0.9975);
  tableData[3].field3 = 100 * (krakenPrice * 0.9975  - btccnyPrice * 1.000) 
                        / (krakenPrice * 0.9975);
  tableData[3].field4 = 100 * (krakenPrice * 0.9975  - bitstampPrice * 1.0) 
                        / (krakenPrice * 0.9975);
  tableData[3].field5 = 100 * (krakenPrice * 0.9975 - krakenPrice * 1.0) 
                        / (krakenPrice * 0.9975);

  if (topShowBTC) {
      updateTopPrices(coinbasePrice, btccnyPrice, bitstampPrice, krakenPrice);
  }

  //updateTopVolumes(bitfinex.volume, bitstamp.volume, poloniex.volume);


  localStorage.setItem("data", priceData + "\n" + 
    new Date() + "," + coinbasePrice + "," + btccnyPrice +
    "," + bitstampPrice + "," + krakenPrice);

}

function updateEthData(priceData) {

  var coinbase = 'https://api.coinbase.com/v2/exchange-rates?currency=ETH';
  var cb = createCorsRequest('GET', coinbase);

  var cryptonator = 'https://api.cryptonator.com/api/full/eth-usd';
  var ctt = createCorsRequest('GET', cryptonator);
  //console.log(cb);

  var poloniex = ctt.ticker.markets[6];
  var bitfinex = ctt.ticker.markets[0];
  var kraken = ctt.ticker.markets[4];

  var coinbasePrice = parseFloat(cb.data.rates.USD);
  var bitfinexPrice = parseFloat(bitfinex.price);
  var krakenPrice = parseFloat(kraken.price);
  var poloniexPrice = parseFloat(poloniex.price);

  topPricesETH[0] = coinbasePrice;
  topPricesETH[1] = bitfinexPrice;
  topPricesETH[2] = krakenPrice;
  topPricesETH[3] = poloniexPrice;

  if (!topShowBTC) {
      updateTopPrices(coinbasePrice, bitfinexPrice, krakenPrice, poloniexPrice);
  }

  //updateTopVolumes(bitfinex.volume, bitstamp.volume, poloniex.volume);

  localStorage.setItem("ethData", priceData + "\n" + 
    new Date() + "," + coinbasePrice + "," + bitfinexPrice +
    "," + krakenPrice + "," + poloniexPrice);

}

function updateTopPrices(cb, bf, bs, pn) {
  document.getElementById("cbprice").innerHTML = cb.toFixed(2);
  document.getElementById("bfprice").innerHTML = bf.toFixed(2);
  document.getElementById("bsprice").innerHTML = bs.toFixed(2);
  document.getElementById("pnprice").innerHTML = pn.toFixed(2);
}

function updateTopVolumes(bf, bs, pn) {
  //document.getElementById("cbvolume").innerHTML = cb.toFixed(2);
  document.getElementById("bfvolume").innerHTML = bf;
  document.getElementById("bsvolume").innerHTML = bs;
  document.getElementById("pnvolume").innerHTML = pn;
}

function updateGraph(data) {
  var cgraph = new Dygraph(
      document.getElementById("chart_plot_01"), data,
      {
        //drawPoints: true,
        width: 960,
        height: 350,
        //panEdgeFraction: 0.7,
        axisLabelFontSize: 18,  
        axisLineWidth: 6,
        //xlabel: "Time",
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

function btcToggle() {
    //document.getElementById("myDropdown").classList.toggle("show");
    topShowBTC = true;
    document.getElementById("switchMarket").innerHTML = "Bitstamp";
    updateTopPrices(topPricesBTC[0], topPricesBTC[1], 
                        topPricesBTC[2], topPricesBTC[3]);
    updateGraph(localStorage.getItem("data"));
}

function ethToggle() {
    //document.getElementById("myDropdown").classList.toggle("show");
    topShowBTC = false;
    document.getElementById("switchMarket").innerHTML = "Kraken";
    updateTopPrices(topPricesETH[0], topPricesETH[1], 
                        topPricesETH[2], topPricesETH[3]);
    updateGraph(localStorage.getItem("ethData"));
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      dropdowns[i].style.display = "none";
    }
  }
}

