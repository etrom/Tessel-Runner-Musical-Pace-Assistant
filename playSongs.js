/* tessel to tessel
 * requires 2 nrf24 modules (and ideally two tessels)
 * put one tessel+nrf on "ping" mode and another one on "pong" mode
 */

var tessel = require('tessel'),
    NRF24 = require('rf-nrf24'),
    pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2],
    role = 'ping'; // swap this to pong if you want to wait for receive
var fs = require('fs');
var audio = require('audio-vs1053b').use(tessel.port['A']);
var nrfff = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})



var audioFile1 = '/app/nrf24/0.mp3';
var audioFile2 = '/app/nrf24/60.mp3';
var audioFile3 = '/app/nrf24/90.mp3';
// Wait for the module to connect

var nrf;
audio.on('ready', function() {
  console.log("Audio module connected! Setting volume...");
    audio.setVolume(5, function(err) {
        nrf = nrfff.use(tessel.port['B']);
  play(60);
    });
});


var play = function(bpm){
  console.log("at play bpm is :"+bpm);
    // Set the volume in decibels. Around 20 is good; smaller is louder.
    var file = "";
    if(bpm === 0){
      file = audioFile1;
    }else if(bpm === 60){
      file = audioFile2;
    }else if(bpm === 90){
      file = audioFile3;
    }
      if (err) {
        return console.log(err);
      }
      // Get the song
      console.log('Retrieving file...');
      var song = fs.readFileSync(file);
      // Play the song
      console.log('Playing ' + file + '...', song.length);
      audio.play(song, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Done playing', file);
        }
      });
  }

// If there is an error, report it
audio.on('error', function(err) {
  console.log(err);
});




process.ref();