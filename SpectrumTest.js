var theme = ["rgba(255, 255, 255,","rgba(240, 240, 240,","rgba(210, 210, 210,","rgba(180, 180, 180,","rgba(150, 150, 150,","rgba(150, 120, 120,","rgba(150, 90, 90,","rgba(180, 60, 60,","rgba(180, 30, 30,","rgba(200, 0, 0,","rgba(210, 0, 0,","rgba(220, 0, 0,","rgba(230, 0, 0,","rgba(240, 0, 0,","rgba(255, 0, 0,","rgba(255, 30, 0,","rgba(255, 60, 0,","rgba(255, 90, 0,","rgba(255, 120, 0,","rgba(255, 150, 0,"];

var histoindex = 0;
var histomax = 500;

histobuffer_x = new Array();
histobuffer_y = new Array();
histobuffer_t = new Array();
for (a=0;a<histomax;a++) {
	histobuffer_t[a] = 0;
}

maxvalue = new Array();
for (a=0;a<1024;a++) {
	maxvalue[a] = 0;
}

currentvalue = new Array();

var frameBufferSize = 4096;
var bufferSize = frameBufferSize/4;

var signal = new Float32Array(bufferSize);
var peak = new Float32Array(bufferSize);

var fft = new FFT(bufferSize, 44100);

function loadedMetaData(event) {
	var audio = document.getElementById('input');
	audio.mozFrameBufferLength = frameBufferSize;
	audio.addEventListener("MozAudioAvailable", audioAvailable, false);
}

function audioAvailable(event) {
	// deinterleave and mix down to mono
	var mix = DSP.MIX;
	signal = DSP.getChannel(mix, event.frameBuffer);

	// perform forward transform
	fft.forward(signal);

	for ( var i = 0; i < bufferSize/8; i++ ) {
		magnitude = fft.spectrum[i] * 8000; 					// multiply spectrum by a zoom value

		currentvalue[i] = magnitude;

		if (magnitude > maxvalue[i]) {
			maxvalue[i] = magnitude;
			new_pos(canvas.width/2 + i*4 + 4,(canvas.height/2)-magnitude-20);
			new_pos(canvas.width/2 + i*4 + 4,(canvas.height/2)+magnitude+20);
			new_pos(canvas.width/2 - i*4 + 4,(canvas.height/2)-magnitude-20);
			new_pos(canvas.width/2 - i*4 + 4,(canvas.height/2)+magnitude+20);
		} else {
			if (maxvalue[i] > 10) {
				maxvalue[i]--;
			}
		}

	}
}

window.addEventListener('load', function () {

	// Create our draw context
	drawContext = new DrawContext();
});

function new_pos(x,y) {
	x = Math.floor(x);
	y = Math.floor(y);
	
	histobuffer_t[histoindex] = 19;
	histobuffer_x[histoindex] = x;
	histobuffer_y[histoindex++] = y;
	
	if (histoindex > histomax) {
		histoindex = 0;
	}
}

var spectrum_on = false;

function visualizer() {

	ctx.clearRect(0,0, canvas.width, canvas.height);

	if (spectrum_on) {
		ctx.fillStyle = '#000044';
		for (var i=0; i<currentvalue.length; i++) {
			// Draw rectangle bars for each frequency bin
			ctx.fillRect(i * 8, canvas.height, 7, -currentvalue[i]*3);
		}
	}

	for (h=0;h<histomax;h++) {
		if (histobuffer_t[h] > 0) {
			var size = histobuffer_t[h] * 4;
			ctx.fillStyle = theme[ (histobuffer_t[h])] + (0.5 - (0.5 - histobuffer_t[h]/40))+')';
			ctx.beginPath();
			ctx.arc(histobuffer_x[h], histobuffer_y[h], size * .5, 0, Math.PI*2, true); 
			ctx.closePath();
			ctx.fill();

			histobuffer_t[h] = histobuffer_t[h] - 1;
			histobuffer_y[h] = histobuffer_y[h] - 3 + Math.random() * 6;
			histobuffer_x[h] = histobuffer_x[h] - 3 + Math.random() * 6;
		}
	}
	t = setTimeout('visualizer()',50);
}


function toggle_spectrum() {
	if (spectrum_on) {
		spectrum_on = false;
	} else {
		spectrum_on = true;		
	}
}