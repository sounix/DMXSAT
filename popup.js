var visibleLinks = [],
sessionData = null;

var contadorFiles = 0, listFiles = [], incremetos = 0;
function downloadCheckedLinks() {
  contadorFiles = 0;
  listFiles = [];
  incremetos = 100/visibleLinks.length;

  for (var i = 0; i < visibleLinks.length; ++i) {
      contadorFiles++;
      getXmlSat(visibleLinks[i]);
  }
}

function getXmlSat (vLinks) {
  $.get(vLinks.url, function(data){
    listFiles.push({
      xml: data,
      name: vLinks.name+'.xml'
    });
    var bar = $("#barProgres .progress-bar"),
    valor = parseFloat(bar.attr("aria-valuenow"))+incremetos;
    bar.attr('aria-valuenow', valor).css('width', valor+"%").text(parseInt(valor/incremetos)+' / '+visibleLinks.length);
  }).always(function() {
    contadorFiles--;
    if (contadorFiles == 0) {
      createZip(listFiles);
      // $("#barProgres .progress-bar").text(`Descarga Completa`);
      // $("#barProgres .progress-bar").removeClass('progress-bar-danger')
      //   .addClass('progress-bar-success')
    }
  });
}

function createZip (files) {
    var zip = new JSZip();
    for (var i = 0; i < files.length; ++i) {
      zip.file(files[i].name, files[i].xml);
    }
    content = zip.generate({type:"base64"});

    chrome.downloads.download({
      url: 'data:application/zip;base64,' + content,
      filename: "archivo.zip",
      saveAs: true
    },
    function(id) {
      console.log(id);
    });
}

chrome.extension.onMessage.addListener(function (request, sender) {
  if (request.action === 'getSource') {
    var links = request.source
    if (links.length > 0) {
      $('#barProgres .progress-bar').text('0/' + links.length)
      $("#seEncontraron").html(`Se encontraron <span class="badge">${links.length}</span> CFDIs`);
      $("#msgs").hide();
      $(".btnsshow").removeClass('hidden');

      visibleLinks = links
    }
    else {
      $("#barProgres .progress-bar").text('0/'+links.length);
      $("#seEncontraron").html(`Se encontraron <span class="badge">${links.length}</span> CFDIs`);
      $("#msgs .text-center.alert").removeClass('alert-info')
        .addClass('alert-danger')
        .html("<stron>No se encontraron resultados</stron> o no se encuentra en la pagina del SAT");
    }
  }
});

window.onload = function() {
  document.getElementById('descargaCfdi').onclick = downloadCheckedLinks;

  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id},
    function(activeTabs) {
      chrome.tabs.executeScript(activeTabs[0].id, {file: 'libs/jquery-2.1.1.min.js', allFrames: true});
      chrome.tabs.executeScript(activeTabs[0].id, {file: 'send_links.js', allFrames: true});
    });
  });

  window.setTimeout(function(){
    if (visibleLinks.length == 0) {
      $("#msgs .text-center.alert").removeClass('alert-info')
        .addClass('alert-danger')
        .html("<stron>No se encontraron resultados</stron> o no se encuentra en la pagina del SAT");
    }
  }, 5000);
};
