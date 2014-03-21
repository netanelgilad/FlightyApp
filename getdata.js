setInterval(function() {
    $.getJSON("data.json", function(data) {
      window.postMessage(data, '*');
    })
}, 5000);