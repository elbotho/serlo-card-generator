var fields = ['name', 'position', 'mail', 'number', 'amount', 'when-needed', 'when-date', 'address'];
var data = [];
var doc, pdfBlob;
var loaded = 0;
var font = [];

loadFont('fonts/karmilla-bold.ttf', 0);
loadFont('fonts/karmilla.ttf', 1);

$( document ).ready(function() {
  
  $('#preview-button').click( function() {
    writeToSvg();
  });
  $('#generate-button').click( function() {
  	writeToSvg();
    buildPDF();
  });
  $('#download-button').click( function() {
    packZip();
  });
});


function writeToSvg() {
  getCleanData();
  $('#svg-name').html( data['name'] );
  $('#svg-mail').html( data['mail'] );
  $('#svg-position').html( data['position'] );
  $('#svg-number').html( data['number'] );
}

function getCleanData() {
  
  var newData = $('#datarow').val().split('\t');
  //Timestamp – Email address – Vorname Name – Deine Position – Deine Serlo Mailadresse – Deine Handynummer // – Wie viele brauchst du ca.?  Brauchst du die Karten bis zu einem bestimmten Termin?  Bis wann spätestens?  Nicht in München?           
  data [ 'mail' ] = newData[4];
  data [ 'name' ] = newData[2];
  data [ 'position' ] = newData[3];
  data [ 'number' ] = newData[5];
  
  // for (var i = 0; i < fields.length; i++) {
  //   data[ fields[i] ] = $('#' + fields[i] ).val();
  //   if (data[fields[i]]===null || data[fields[i]]===undefined){
  //     data[fields[i]] = '';
  //   }
  // }
}

// function getFullLink(){
//   var url = new URL( window.location.href );
//   for (var i = 0; i < fields.length; i++) {
//     url.searchParams.set( fields[i] , data[ fields[i] ] );
//   }
//   return url.href;
//   //window.history.pushState("", "", url.href);
// }

function preparePDF(){

  var ptWidth = 55/25.4*72;
  var ptHeight = 85/25.4*72;

  doc = new PDFDocument({size: [ptWidth,ptHeight] });
  doc.registerFont('karmilla-bold', font[0]);
  doc.registerFont('karmilla', font[1]);

}

function loadFont (url, index){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function (e) { if (this.status == 200) { 
		font[index] = xhr.response;
	}
	}
	xhr.send();
}

function buildPDF(){

	preparePDF();

	SVGtoPDF(doc, document.getElementById('front').outerHTML , 0, 0, {fontCallback: function(){return 'karmilla-bold'; } }); //
	doc.addPage();
	SVGtoPDF(doc, document.getElementById('preview').outerHTML , 0, 0, {
		fontCallback: function(family, bold){
			if(bold) {return 'karmilla-bold'; }
			else {return 'karmilla'; }
		}});

	var stream = doc.pipe(blobStream());
	stream.on('finish', function() {
		var blob = stream.toBlob('application/pdf');
		if (navigator.msSaveOrOpenBlob) {
			navigator.msSaveOrOpenBlob(blob, 'serlo_visitenkarte.pdf');
		} else {
			document.getElementById('pdf-file').setAttribute('src', URL.createObjectURL(blob));
		}
		pdfBlob = blob;
	});
	doc.end();
}

function packZip()  
{
  saveAs(pdfBlob, "serlo_visitenkarte.pdf");
}
