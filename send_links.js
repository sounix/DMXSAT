var links = [];
$("table img#BtnDescarga").each(function(index, el) {
  var $this = $(this);

  links.push({
    url: 'https://portalcfdi.facturaelectronica.sat.gob.mx/' + $this.attr("onclick").replace("return AccionCfdi('", "").replace("','Recuperacion');", ""),
    name: $("td:nth-child(2) span", $this.parents("tr")).text(),
    emisor: $("td:nth-child(4) span", $this.parents("tr")).text(),
    receptor: $("td:nth-child(6) span", $this.parents("tr")).text(),
    totalFactura: $("td:nth-child(10) span", $this.parents("tr")).text()
  });
});

chrome.extension.sendMessage({
  action: 'getSource',
  source: links
});
