var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

$(document).ready(function () {
      var data = [];
      var t = new Date();
      var client = new HttpClient();
      for (var i = 10; i >= 0; i--) {
        var x = new Date(t.getTime() - i * 1000);
        var year = String(x.getUTCFullYear());
        var month = x.getUTCMonth();
        if (month < 10)
          month = '0' + String(month);
        var day = x.getUTCMonth();
        if (day < 10)
          day = '0' + String(day);

        var request = "https://api.coinbase.com/v2/prices/BTC-USD/buy?date=" + year + "-" + month + "-" + day;

        var y = Math.random();
        data.push([x, y]);
        /*
        console.log(request);
        client.get(request, function(response) {
          console.log(JSON.parse(response).data.amount);
          data.push([x, JSON.parse(response).data.amount]);
          //g.updateOptions( { 'file': data } );
        });
        */
      }

      var g = new Dygraph(document.getElementById("div_g"), data,
                          {
                            drawPoints: true,
                            showRoller: true,
                            valueRange: [1000, 1400],
                            labels: ['Time', 'Random']
                          });
      // It sucks that these things aren't objects, and we need to store state in window.
      window.intervalId = setInterval(function() {
        var x = new Date();  // current time
        //var y = Math.random();
        client.get('https://api.coinbase.com/v2/prices/BTC-USD/buy', function(response) {
          console.log(JSON.parse(response).data.amount);
          data.push([x, JSON.parse(response).data.amount]);
          g.updateOptions( { 'file': data } );
        });
        //data.push([x, y]);
        //g.updateOptions( { 'file': data } );
      }, 1000);
    }
);

