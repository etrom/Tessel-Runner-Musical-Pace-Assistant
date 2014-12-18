var tessel = require('tessel');
var NRF24 = require('rf-nrf24');
var accel = require('accel-mma84').use(tessel.port['C']);
var pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];

var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
	.transmitPower('PA_MAX') // set the transmit power to max
	.dataRate('1Mbps')
	.crcBytes(2) // 2 byte CRC
	.autoRetransmit({count:15, delay:4000})
	.use(tessel.port['A']);
	nrf._debug = false;

	var tx;

	nrf.on('ready', function () {
		tx = nrf.openPipe('tx', pipes[0], {autoAck: false}); // transmit address F0F0F0F0D2
		console.log("nrf is ready");


		var bpmConvert = function(bpm) {
			if (bpm > 0 && bpm < 20) {
				return "aaaa";
			} else if (bpm > 21 && bpm < 40) {
				return "bbbb";
			} else if (bpm > 41) {
				return "cccc";
			}

		}

		var bpmRange = function(bpm) {
			if (bpm > 0 && bpm < 20) {
				return 0;
			} else if(bpm > 21 && bpm < 40) {
				return 60;
			} else if(bpm > 41) {
				return 90;
			}

		}

	   // Stream accelerometer data
	   var samples = [];
	   var isMax = false;
	   var count = 0;
	   var cycles = 0;
	   var lastbpm = 0;
	   var count_arr = [];

	   setInterval(function() {
	   	accel.getAcceleration(function(err, xyz) {
	   		samples.unshift(xyz[0]);
	   		var isMax = true;
	   		if (samples.length > 10) {
	   			samples.pop();
	   			for(var i = 0; i > 6; i++) {
	   				if(samples[i] + .15 > samples[6]){
	   					isMax = false;
	   					break;
	   				}
	   			};
	   			if (isMax) {
	   				for(var i = 7 ; i < 10 ; i++) {
	   					if (samples[6] < samples[i]+0.15) {
	   						isMax = false;
	   					}
	   				}
	   			}
	   			if (isMax) {
	   				count++;
	   				console.log("STEP #" + count);
	   			}
	   		}
	   	});


	   	if (++cycles === 200) {
	   		cycles = 0;
	           var footbpm = Math.floor(((count*7)/8)*6); //taking 7/8 of step count as rough calibration and multiplying by 6 for full min
	           //if footbpm is in a different range than last time
	           if (bpmRange(footbpm) !== bpmRange(lastbpm)) {
	           	console.log("Sending", bpmConvert(footbpm));
	           	tx.write(bpmConvert(footbpm));
	           }

	           count = 0;
	           lastbpm = footbpm;
	       }
	   }, 50);

});

process.ref();