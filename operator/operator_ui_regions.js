
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
    //arrangeOverlays(modeKey)
    if (modeKey == 'nav') {
	arrangeOverlays('nav', 'hand')
	modeRegions['nav'].map(showSvg)
	modeRegions['hand'].map(showSvg)
	//modeRegions[key].map(hideSvg)
    }
    if (modeKey == 'hand') {
	arrangeOverlays('hand','nav')
	modeRegions['nav'].map(showSvg)
	modeRegions['hand'].map(showSvg)
	//modeRegions[key].map(hideSvg)
    }
}


var navModeRegionIds;
var handModeRegionIds;
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
            
    //////////////////////////////
    
    var sqrW, bgSqr, mdSqr, smSqr, regionPoly;
    var mdBar, smBar, mHoriz, lHoriz, rHoriz, mVert; 
    var color;

    var bgRect, smRect, tpRect, btRect;
    
    ///////  NAVIGATION MODE  ///////

    /////// NAVIGATION VIDEO ////////
    color = 'white'

    // big rectangle at the borders of the video
    bgRect = makeRectangle(0, 0, camW, camH);
    // small rectangle around the mobile base
    //var smRect = makeSquare(w*(7.0/16.0), h*(7.0/16.0), w/8.0, h/8.0);
    smRect = makeSquare((camW/2.0)-(camW/20.0), (camH*(3.0/4.0))-(camH/20.0), camW/10.0, camH/10.0); 

    regionPoly = rectToPoly(smRect);
    setRegionPoly('nav_do_nothing_region', regionPoly, color);

    regionPoly = [bgRect.ul, bgRect.ur, smRect.ur, smRect.ul];
    setRegionPoly('nav_forward_region', regionPoly, color);

    regionPoly = [bgRect.ll, bgRect.lr, smRect.lr, smRect.ll];
    setRegionPoly('nav_backward_region', regionPoly, color);

    regionPoly = [bgRect.ul, smRect.ul, smRect.ll, bgRect.ll];
    setRegionPoly('nav_turn_left_region', regionPoly, color);

    regionPoly = [bgRect.ur, smRect.ur, smRect.lr, bgRect.lr];
    setRegionPoly('nav_turn_right_region', regionPoly, color);


    /////// GRIPPER VIDEO ////////
    color = 'white'

    //bgRect = makeRectangle(camW, 0, camW, camH);
    //tpRect = makeRectangle(camW, 0, camW, camH/4.0);
    //btRect = makeRectangle(camW, 3.0*(h/4.0), camW, camH/4.0);
    //smRect = makeRectangle(camW + (camW/3.0), 2.0*(camH/5.0), camW/3.0, camH/5.0);


    bgRect = makeRectangle(0, 0, camW, camH);
    tpRect = makeRectangle(0, 0, camW, camH/4.0);
    btRect = makeRectangle(0, 3.0*(h/4.0), camW, camH/4.0);
    smRect = makeRectangle(0 + (camW/3.0), 2.0*(camH/5.0), camW/3.0, camH/5.0);
        
    
    regionPoly = rectToPoly(smRect);
    setRegionPoly('hand_close_region', regionPoly, color);

    regionPoly = rectToPoly(tpRect);
    setRegionPoly('hand_out_region', regionPoly, color);

    regionPoly = rectToPoly(btRect);
    setRegionPoly('hand_in_region', regionPoly, color);

    regionPoly = [tpRect.ll, tpRect.lr, btRect.ur, btRect.ul, tpRect.ll,
		  smRect.ul, smRect.ll, smRect.lr, smRect.ur, smRect.ul];
    setRegionPoly('hand_open_region', regionPoly, color);
        
    navModeRegionIds = ['nav_do_nothing_region', 'nav_forward_region', 'nav_backward_region', 'nav_turn_left_region', 'nav_turn_right_region', 'hand_close_region', 'hand_out_region', 'hand_in_region', 'hand_open_region']


    ///////  MANIPULATION MODE  ///////

    // /////// NAVIGATION VIDEO ////////

    handModeRegionIds = ['nav_do_nothing_region', 'nav_forward_region', 'nav_backward_region', 'nav_turn_left_region', 'nav_turn_right_region', 'hand_close_region', 'hand_out_region', 'hand_in_region', 'hand_open_region']
    
    // ///////////////////////
    // color = 'white'

    // // big rectangle at the borders of the video
    // bgRect = makeRectangle(0, 0, w, h);
    // // small rectangle at the top of the middle of the video
    // var tpRect = makeRectangle(w*(3.0/10.0), h/4.0, w*(4.0/10.0), h/4.0);
    // // small rectangle at the bottom of the middle of the video
    // var btRect = makeRectangle(w*(3.0/10.0), h/2.0, w*(4.0/10.0), h/4.0);
    
    // regionPoly = rectToPoly(tpRect);
    // setRegionPoly('low_arm_up_region', regionPoly, color);

    // regionPoly = rectToPoly(btRect);
    // setRegionPoly('low_arm_down_region', regionPoly, color);
    
    // regionPoly = [bgRect.ul, bgRect.ur, tpRect.ur, tpRect.ul];
    // setRegionPoly('low_arm_extend_region', regionPoly, color);

    // regionPoly = [bgRect.ll, bgRect.lr, btRect.lr, btRect.ll];
    // setRegionPoly('low_arm_retract_region', regionPoly, color);

    // regionPoly = [bgRect.ul, tpRect.ul, btRect.ll, bgRect.ll];
    // setRegionPoly('low_arm_base_forward_region', regionPoly, color);

    // regionPoly = [bgRect.ur, tpRect.ur, btRect.lr, bgRect.lr];
    // setRegionPoly('low_arm_base_backward_region', regionPoly, color);
    
    // lowArmModeRegionIds = ['low_arm_down_region', 'low_arm_up_region', 'low_arm_extend_region', 'low_arm_retract_region','low_arm_base_forward_region','low_arm_base_backward_region']
    

    // ///////////////////////
    // color = 'white'

    // // big rectangle at the borders of the video
    // bgRect = makeRectangle(0, 0, w, h);
    // // small rectangle at the top of the middle of the video
    // tpRect = makeRectangle(w*(3.0/10.0), h/4.0, w*(4.0/10.0), h/4.0);
    // // small rectangle at the bottom of the middle of the video
    // btRect = makeRectangle(w*(3.0/10.0), h/2.0, w*(4.0/10.0), h/4.0);
    
    // regionPoly = rectToPoly(tpRect);
    // setRegionPoly('high_arm_up_region', regionPoly, color);

    // regionPoly = rectToPoly(btRect);
    // setRegionPoly('high_arm_down_region', regionPoly, color);
    
    // regionPoly = [bgRect.ul, bgRect.ur, tpRect.ur, tpRect.ul];
    // setRegionPoly('high_arm_extend_region', regionPoly, color);

    // regionPoly = [bgRect.ll, bgRect.lr, btRect.lr, btRect.ll];
    // setRegionPoly('high_arm_retract_region', regionPoly, color);

    // regionPoly = [bgRect.ul, tpRect.ul, btRect.ll, bgRect.ll];
    // setRegionPoly('high_arm_base_forward_region', regionPoly, color);

    // regionPoly = [bgRect.ur, tpRect.ur, btRect.lr, bgRect.lr];
    // setRegionPoly('high_arm_base_backward_region', regionPoly, color);
    
    // highArmModeRegionIds = ['high_arm_down_region', 'high_arm_up_region', 'high_arm_extend_region', 'high_arm_retract_region','high_arm_base_forward_region','high_arm_base_backward_region']
    

    // ///////////////////////
    // color = 'white'

    // tpRect = makeRectangle(0, 0, w, h/4.0);
    // btRect = makeRectangle(0, 3.0*(h/4.0), w, h/4.0);
    // var ltRect = makeRectangle(0, h/4.0, w/2.0, h/2.0);
    // var rtRect = makeRectangle(w/2.0, h/4.0, w/2.0, h/2.0);

    
    // regionPoly = rectToPoly(tpRect);
    // setRegionPoly('look_up_region', regionPoly, color);

    // regionPoly = rectToPoly(btRect);
    // setRegionPoly('look_down_region', regionPoly, color);

    // regionPoly = rectToPoly(ltRect);
    // setRegionPoly('look_left_region', regionPoly, color);

    // regionPoly = rectToPoly(rtRect);
    // setRegionPoly('look_right_region', regionPoly, color);
    
    // lookModeRegionIds = ['look_up_region', 'look_down_region', 'look_left_region', 'look_right_region']


    modeRegions = { 'nav' : navModeRegionIds,
		    'hand' : handModeRegionIds}
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
    
    function setViewBox(videoKey, viewBox) {
	switch(videoKey) {
	case 'nav':
	    navOverlay.setAttribute('viewBox', viewBox);
            break;
	case 'hand':
	    handOverlay.setAttribute('viewBox', viewBox);
	    break;
	default:
	    console.log('ERROR: arrangeOverlays given unrecognized key argument = ', videoKey);
	}
    }
   
    setViewBox(leftKey, leftViewBox);
    setViewBox(rightKey, rightViewBox);
}

createUiRegions(true); // debug = true or false


