'use strict';


function generateVideoDimensions() {

    // Full dimensions of the WebRTC video transmitted from the robot
    // to the operator. Use only the navigation camera and the gripper
    // camera side by side, each of which is currently 320x240.
    var iw = 640;
    var ih = 240;

    // wide-angle camera dimensions (i.e., gripper and navigation
    // cameras)
    var camW = 320;
    var camH = 240;
    
    var cameraFpsIdeal = 15.0;

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


    return {w:iw, h:ih, camW:camW, camH:camH, cameraFpsIdeal:cameraFpsIdeal, leftDim:leftDim, rightDim:rightDim};
}

var videoDimensions = generateVideoDimensions();
