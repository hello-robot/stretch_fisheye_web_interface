/*
 *
 *  derived from initial code from the following website with the copyright notice below
 *  https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
 *
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 *
 *
 */

'use strict';

var audioStream;

var audioInId;
var audioOutId;

var editedFps = 15;
var videoEditingCanvas = document.createElement('canvas');
var videoDisplayElement = document.querySelector('video');

var camDim = {w:videoDimensions.camW, h:videoDimensions.camH};
console.log('camDim', camDim);

var editedDim = {w:videoDimensions.w, h:videoDimensions.h};

var handRoll = 0.0;  
var degToRad = (2.0* Math.PI)/360.0;

videoEditingCanvas.width = editedDim.w;
videoEditingCanvas.height = editedDim.h;
var videoEditingContext = videoEditingCanvas.getContext('2d');
videoEditingContext.fillStyle="black";
videoEditingContext.fillRect(0, 0, editedDim.w, editedDim.h);
var editedVideoStream = videoEditingCanvas.captureStream(editedFps);


var rotateNavCanvas = document.createElement('canvas');
rotateNavCanvas.width = camDim.w;
rotateNavCanvas.height = camDim.h;
var rotateNavContext = rotateNavCanvas.getContext('2d');
rotateNavContext.fillStyle="black";
rotateNavContext.fillRect(0, 0, camDim.w, camDim.h);


function render(drawable, dim) {
    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    // s = source, d = destination
    //void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    var d = dim;
    videoEditingContext.drawImage(drawable,
				  d.sx, d.sy, d.sw, d.sh,
				  d.dx, d.dy, d.dw, d.dh);
}

function drawVideo() {

    if(interfaceMode == 'nav'){
	if (navigationImageReceived === true) {
	    var navigationRotation = 90.0 * degToRad;
	    
	    rotateNavContext.fillStyle="black";
	    rotateNavContext.fillRect(0, 0, camDim.w, camDim.h);
	    rotateNavContext.translate(camDim.w/2, camDim.h/2);
	    rotateNavContext.rotate(navigationRotation);
	    rotateNavContext.drawImage(navigationImg, -camDim.w/2, -camDim.h/2, camDim.w, camDim.h)
	    rotateNavContext.rotate(-navigationRotation);
	    rotateNavContext.translate(-camDim.w/2, -camDim.h/2);

	    render(rotateNavCanvas, videoDimensions.leftDim);
	}

	if (gripperImageReceived === true) {
	    render(gripperImg, videoDimensions.rightDim);
	}
    }

    if(interfaceMode == 'hand') {
	if (navigationImageReceived === true) {
	    render(navigationImg, videoDimensions.rightZoomDim);
	}

	if (gripperImageReceived === true) {
	    render(gripperImg, videoDimensions.leftDim);
	}
    }
    
    requestAnimationFrame(drawVideo);
}

function findDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.

    var i = 0;
    for (let d of deviceInfos) {
        console.log('');
        console.log('device number ' + i);
        i++;
        console.log('kind: ' + d.kind);
        console.log('label: ' + d.label);
        console.log('ID: ' + d.deviceId);

        // javascript switch uses === comparison
        switch (d.kind) {
        case 'audioinput':
            //if(d.label === 'USB Audio Device Analog Mono') {
                audioInId = d.deviceId;
                console.log('using this device for robot audio input');
            //}
            break; 
        case 'audiooutput':
            //      if(d.label === 'HDA NVidia Digital Stereo (HDMI 2)') {
            //if(d.label === 'USB Audio Device Analog Stereo') {
                audioOutId = d.deviceId;
                console.log('using this device for robot audio output');
            //}
            break;
        default: 
            console.log('* unrecognized kind of device * ', d);
        }
    }
    
    start();
}


navigator.mediaDevices.enumerateDevices().then(findDevices).catch(handleError);

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
            .then(function() {
                console.log('Success, audio output device attached: ' + sinkId);
            })
            .catch(function(error) {
                var errorMessage = error;
                if (error.name === 'SecurityError') {
                    errorMessage = 'You need to use HTTPS for selecting audio output ' +
                        'device: ' + error;
                }
                console.error(errorMessage);
                // Jump back to first output device in the list as it's the default.
                audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

function changeAudioDestination() {
    var audioDestination = audioOutId;
    attachSinkId(videoDisplayElement, audioDestination);
}

function gotAudioStream(stream) {
    console.log('setting up audioStream for the microphone');
    audioStream = stream;

    // remove audio tracks from localStream
    for (let a of localStream.getAudioTracks()) {
        localStream.removeTrack(a);
    }
    var localAudio = stream.getAudioTracks()[0]; // get audio track from robot microphone
    localStream.addTrack(localAudio); // add audio track to localStream for transmission to operator
}


function start() {

    if(audioOutId) {
        changeAudioDestination();
    } else {
        console.log('no audio output found or selected');
        console.log('attempting to use the default audio output');
    }

    displayStream = new MediaStream(editedVideoStream); // make a copy of the stream for local display
    // remove audio tracks from displayStream
    for (let a of displayStream.getAudioTracks()) {
        displayStream.removeTrack(a);
    }
    videoDisplayElement.srcObject = displayStream; // display the stream
    
    localStream = new MediaStream(editedVideoStream);
    
    var constraints;
    
    console.log('trying to obtain videos with');
    console.log('width = ' + camDim.w);
    console.log('height = ' + camDim.h);
    
    if(audioInId) {
	constraints = {
            audio: {deviceId: {exact: audioInId}},
            video: false
        };
        console.log('attempting to acquire audio input stream');
        navigator.mediaDevices.getUserMedia(constraints).
            then(gotAudioStream).catch(handleError);
    } else {
        console.log('the robot audio input was not found!');
    }

    drawVideo();
}


function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}
