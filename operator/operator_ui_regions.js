
'use strict';

function svgPolyString(points) {
    var str = 'M ';
    for (let p of points) {
	str = str + p.x + ',' + p.y + ' ';
    }
    str = str + 'Z';
    return str;
}

function makeRectangle(ulX, ulY, width, height) {
    return {ul: {x:ulX, y:ulY},
	    ur: {x:ulX + width, y:ulY},
	    ll: {x:ulX, y:ulY + height},
	    lr: {x:ulX + width, y:ulY + height}
	   };
}

function makeSquare(ulX, ulY, width) {
    return makeRectangle(ulX, ulY, width, width);
}

function rectToPoly(rect) {
    return [rect.ul, rect.ur, rect.lr, rect.ll];
}

function hideSvg(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

function showSvg(elementId) {
    document.getElementById(elementId).style.display = 'block';
}


function turnModeUiOn(modeKey) {
    var buttonName = modeKey + '_mode_button'
    console.log('setting to checked: buttonName = ' + buttonName)
    // This might not be working as expected. I may need to set all
    // others to false, or find out how to appropriately utilize a
    // switch like this.
    document.getElementById(buttonName).checked = true
    if (modeKey == 'nav') {
	arrangeOverlays('nav', 'hand')
	modeRegions['nav'].map(showSvg)
	modeRegions['hand'].map(showSvg)
	modeRegions['hand_nav'].map(hideSvg)
    }
    if (modeKey == 'hand') {
	arrangeOverlays('hand','hand_nav')
	modeRegions['nav'].map(hideSvg)
	modeRegions['hand'].map(showSvg)
	modeRegions['hand_nav'].map(showSvg)
    }
}


var navModeRegionIds;
var handModeRegionIds;
var handNavModeRegionIds;
var modeRegions;

function createUiRegions(debug) {

    var strokeOpacity;
    if(debug) {
	strokeOpacity = 0.1; //1.0;
    } else {
	strokeOpacity = 0.0;
    }

    function setRegionPoly(elementId, poly, color) {
	var region = document.getElementById(elementId);
	region.setAttribute('stroke', color);
	region.setAttribute('stroke-opacity', String(strokeOpacity));
	region.setAttribute('stroke-linejoin', "round");
	region.setAttribute('stroke-width', "2");
	
	region.setAttribute('d', svgPolyString(poly));
    }

    //////////////////////////////
    // set size of video region

    var w = videoDimensions.w;
    var h = videoDimensions.h;

    var camW = videoDimensions.camW;
    var camH = videoDimensions.camH;
    
    var video_region = document.getElementById('video_ui_overlay');
    video_region.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    //////////////////////////////

    
    /////// NAVIGATION MODE NAVIGATION VIDEO ////////
    var color = 'white'

    // big rectangle at the borders of the video
    var bgRect = makeRectangle(0, 0, camW, camH);

    var arm_region_width = camW/5.0;
    var navRect = makeRectangle(arm_region_width, 0,
				camW - (2.0*arm_region_width), camH);
    
    var mobile_base_width = camW/10.0;
    var mobile_base_height = camH/10.0;
    
    // small rectangle around the mobile base
    var baseRect = makeSquare((camW/2.0) - (mobile_base_width/2.0),
			      (camH/2.0) - (mobile_base_height/2.0),
			      mobile_base_width, mobile_base_height); 

    var regionPoly = rectToPoly(baseRect);
    setRegionPoly('nav_do_nothing_region', regionPoly, color);

    regionPoly = [navRect.ul, navRect.ur, baseRect.ur, baseRect.ul];
    setRegionPoly('nav_forward_region', regionPoly, color);

    regionPoly = [navRect.ll, navRect.lr, baseRect.lr, baseRect.ll];
    setRegionPoly('nav_backward_region', regionPoly, color);

    regionPoly = [navRect.ul, baseRect.ul, baseRect.ll, navRect.ll];
    setRegionPoly('nav_turn_left_region', regionPoly, color);

    regionPoly = [navRect.ur, baseRect.ur, baseRect.lr, navRect.lr];
    setRegionPoly('nav_turn_right_region', regionPoly, color);
			
    regionPoly = [bgRect.ul, navRect.ul, navRect.ll, bgRect.ll];
    setRegionPoly('nav_arm_retract_region', regionPoly, color);

    regionPoly = [navRect.ur, bgRect.ur, bgRect.lr, navRect.lr];
    setRegionPoly('nav_arm_extend_region', regionPoly, color);
    
    navModeRegionIds = ['nav_do_nothing_region',
			'nav_forward_region', 'nav_backward_region',
			'nav_turn_left_region', 'nav_turn_right_region',
			'nav_arm_retract_region', 'nav_arm_extend_region']
    
    
    /////// GRIPPER VIDEO ////////
    color = 'white'

    var wrist_region_width = camW/5.0;
    var lift_region_height = camH/5.0;
    var handRect = makeRectangle(wrist_region_width, lift_region_height,
				 camW - (2.0*wrist_region_width),
				 camH - (2.0*lift_region_height));
    
    var fingertip_width = camW/5.0;
    var fingertip_height = camH/5.0;
    
    var fingertipRect = makeRectangle((camW/2.0) - (fingertip_width/2.0),
				      (camH/2.0) - (fingertip_height/2.0),
				      fingertip_width, fingertip_height);

    var liftUpRect = makeRectangle(0, 0,
				   camW, lift_region_height);
    var liftDownRect = makeRectangle(0, camH - lift_region_height,
				     camW, lift_region_height);
    
    var wristInRect = makeRectangle(0, lift_region_height,
				    wrist_region_width, camH - (2.0*lift_region_height));
    var wristOutRect = makeRectangle(camW - wrist_region_width, lift_region_height,
				     wrist_region_width, camH - (2.0*lift_region_height));

    regionPoly = rectToPoly(fingertipRect);
    setRegionPoly('hand_close_region', regionPoly, color);
    
    regionPoly = [wristInRect.ur, wristOutRect.ul, wristOutRect.ll, fingertipRect.lr,
		  fingertipRect.ur, fingertipRect.ul, fingertipRect.ll, fingertipRect.lr,
		  wristOutRect.ll, wristInRect.lr];
    setRegionPoly('hand_open_region', regionPoly, color);

    regionPoly = rectToPoly(wristInRect);
    setRegionPoly('hand_in_region', regionPoly, color);

    regionPoly = rectToPoly(wristOutRect);
    setRegionPoly('hand_out_region', regionPoly, color);

    regionPoly = rectToPoly(liftUpRect);
    setRegionPoly('hand_arm_up_region', regionPoly, color);

    regionPoly = rectToPoly(liftDownRect);
    setRegionPoly('hand_arm_down_region', regionPoly, color);

    handModeRegionIds = ['hand_close_region', 'hand_open_region',
			 'hand_in_region', 'hand_out_region', 
			 'hand_arm_up_region', 'hand_arm_down_region'];

    
    /////// MANIPULATION MODE NAVIGATION VIDEO ////////
    color = 'white'

    // big rectangle at the borders of the video
    bgRect = makeRectangle(0, 0, camW, camH);

    arm_region_width = camW/5.0;
    navRect = makeRectangle(arm_region_width, 0,
				camW - (2.0*arm_region_width), camH);
    
    mobile_base_width = camW/10.0;
    mobile_base_height = camH/10.0;
    
    // small rectangle around the mobile base
    baseRect = makeSquare((camW/2.0) - (mobile_base_width/2.0),
			      (camH/2.0) - (mobile_base_height/2.0),
			      mobile_base_width, mobile_base_height); 

    regionPoly = rectToPoly(baseRect);
    setRegionPoly('hand_nav_do_nothing_region', regionPoly, color);

    regionPoly = [navRect.ul, navRect.ur, baseRect.ur, baseRect.ul];
    setRegionPoly('hand_nav_forward_region', regionPoly, color);

    regionPoly = [navRect.ll, navRect.lr, baseRect.lr, baseRect.ll];
    setRegionPoly('hand_nav_backward_region', regionPoly, color);

    regionPoly = [navRect.ul, baseRect.ul, baseRect.ll, navRect.ll];
    setRegionPoly('hand_nav_turn_left_region', regionPoly, color);

    regionPoly = [navRect.ur, baseRect.ur, baseRect.lr, navRect.lr];
    setRegionPoly('hand_nav_turn_right_region', regionPoly, color);
			
    regionPoly = [bgRect.ul, navRect.ul, navRect.ll, bgRect.ll];
    setRegionPoly('hand_nav_arm_retract_region', regionPoly, color);

    regionPoly = [navRect.ur, bgRect.ur, bgRect.lr, navRect.lr];
    setRegionPoly('hand_nav_arm_extend_region', regionPoly, color);

    handNavModeRegionIds = ['hand_nav_do_nothing_region',
			    'hand_nav_forward_region', 'hand_nav_backward_region',
			    'hand_nav_turn_left_region', 'hand_nav_turn_right_region',
			    'hand_nav_arm_retract_region', 'hand_nav_arm_extend_region'];
    
    modeRegions = { 'nav' : navModeRegionIds,
		    'hand' : handModeRegionIds,
		    'hand_nav' : handNavModeRegionIds}
}



function arrangeOverlays(leftKey, rightKey) {
    ///////////////////////
    var nx, ny, nw, nh;
    
    var d = videoDimensions.leftDim;
    nx = d.dx;
    ny = d.dy;
    nw = d.dw;
    nh = d.dh;
    var leftViewBox = String(nx) + ' ' + String(ny) + ' ' + String(nw) + ' ' + String(nh);

    d = videoDimensions.rightDim;
    nx = -d.dx;
    ny = -d.dy;
    nw = d.dw;
    nh = d.dh;
    var rightViewBox = String(nx) + ' ' + String(ny) + ' ' + String(nw) + ' ' + String(nh);
    
    var navOverlay = document.getElementById('nav_ui_overlay');
    var handOverlay = document.getElementById('hand_ui_overlay');
    var handNavOverlay = document.getElementById('hand_nav_ui_overlay');
    
    function setViewBox(videoKey, viewBox) {
	switch(videoKey) {
	case 'nav':
	    navOverlay.setAttribute('viewBox', viewBox);
            break;
	case 'hand':
	    handOverlay.setAttribute('viewBox', viewBox);
	    break;
	case 'hand_nav':
	    handNavOverlay.setAttribute('viewBox', viewBox);
	    break;
	default:
	    console.log('ERROR: arrangeOverlays given unrecognized key argument = ', videoKey);
	}
    }
   
    setViewBox(leftKey, leftViewBox);
    setViewBox(rightKey, rightViewBox);
}

createUiRegions(true); // debug = true or false


