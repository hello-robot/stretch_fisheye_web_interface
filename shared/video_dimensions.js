'use strict';


function generateVideoDimensions() {

    // Full dimensions of the WebRTC video transmitted from the robot
    // to the operator. Use only the navigation camera and the gripper
    // camera side by side.
    var iw = 2048;
    var ih = 768;

    // wide-angle camera dimensions (i.e., gripper and navigation
    // cameras)
    var camW = 1024;
    var camH = 768;

    var aspectRatio = camW/camH;

    var cameraFpsIdeal = 20.0;
    // var cameraFpsIdeal = 15.0;
    // var cameraFpsIdeal = 30.0;

    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

    var leftDim = {sx: 0,
		   sy: 0,
		   sw: camW,
		   sh: camH,
		   dx: 0,
		   dy: 0,
		   dw: camW,
		   dh: camH};

    
    var rightDim = {sx: 0,
		    sy: 0,
		    sw: camW,
		    sh: camH,
		    dx: camW,
		    dy: 0,
		    dw: camW,
		    dh: camH};

    var zoom = 1.5
    var rightZoomDim = {sx: camW / 5.0,
			sy: 0,
			sw: camW / zoom,
			sh: camH / zoom,
			dx: camW,
			dy: 0,
			dw: camW,
			dh: camH};
    
    return {w:iw, h:ih,
	    camW:camW, camH:camH,
	    cameraFpsIdeal:cameraFpsIdeal,
	    leftDim:leftDim, rightDim:rightDim, rightZoomDim:rightZoomDim};
}

var videoDimensions = generateVideoDimensions();


