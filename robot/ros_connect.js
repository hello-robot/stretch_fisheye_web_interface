'use strict';

var messages_received_body = [];
var commands_sent_body = [];
var messages_received_wrist = [];
var commands_sent_wrist = [];
var rosJointStateReceived = false
var jointState = null

// initialize images for camera video

var navigationImageReceived = false
var navigationImg = document.createElement("IMG")
navigationImg.style.visibility = 'hidden'

var gripperImageReceived = false
var gripperImg = document.createElement("IMG")
gripperImg.style.visibility = 'hidden'

var session_body = {ws:null, ready:false, port_details:{}, port_name:"", version:"", commands:[], hostname:"", serial_ports:[]};

var session_wrist = {ws:null, ready:false, port_details:{}, port_name:"", version:"", commands:[], hostname:"", serial_ports:[]};


// connect to rosbridge websocket
var ros = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
});

ros.on('connection', function() {
    console.log('Connected to websocket.');
});

ros.on('error', function(error) {
    console.log('Error connecting to websocket: ', error);
});

ros.on('close', function() {
    console.log('Connection to websocket has been closed.');
});


// subscribe to cameras

var navigationImageTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/navigation_camera/image_raw/compressed',
    messageType : 'sensor_msgs/CompressedImage'
});


navigationImageTopic.subscribe(function(message) {
    navigationImg.src = 'data:image/jpg;base64,' + message.data

    if (navigationImageReceived === false) {
	console.log('Received first compressed image from ROS topic ' + navigationImageTopic.name);
	navigationImageReceived = true
    }
});

var gripperImageTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/gripper_camera/image_raw/compressed',
    messageType : 'sensor_msgs/CompressedImage'
});


gripperImageTopic.subscribe(function(message) {
    gripperImg.src = 'data:image/jpg;base64,' + message.data

    if (gripperImageReceived === false) {
	console.log('Received first compressed image from ROS topic ' + gripperImageTopic.name);
	gripperImageReceived = true
    }
});


// subscribe to joint state

function getJointEffort(jointStateMessage, jointName) {
    var jointIndex = jointStateMessage.name.indexOf(jointName)
    return jointStateMessage.effort[jointIndex]
}

function getJointValue(jointStateMessage, jointName) {
    var jointIndex = jointStateMessage.name.indexOf(jointName)
    return jointStateMessage.position[jointIndex]
}

var jointStateTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/stretch/joint_states/',
    messageType : 'sensor_msgs/JointState'
});

jointStateTopic.subscribe(function(message) {

    jointState = message
    
    if (rosJointStateReceived === false) {
	console.log('Received first joint state from ROS topic ' + jointStateTopic.name);
	rosJointStateReceived = true
    }

    // send wrist joint effort
    var JointEffort = getJointEffort(jointState, 'joint_wrist_yaw')
    var message = {'type': 'sensor', 'subtype':'wrist', 'name':'yaw_torque', 'value': JointEffort}
    sendData(message)

    // send gripper effort
    JointEffort = getJointEffort(jointState, 'joint_gripper_finger_left')
    var message = {'type': 'sensor', 'subtype':'gripper', 'name':'gripper_torque', 'value': JointEffort}
    sendData(message)

    // send lift effort
    JointEffort = getJointEffort(jointState, 'joint_lift')
    var message = {'type': 'sensor', 'subtype':'lift', 'name':'lift_effort', 'value': JointEffort}
    sendData(message)

    // send telescoping arm effort
    JointEffort = getJointEffort(jointState, 'joint_arm_l0')
    var message = {'type': 'sensor', 'subtype':'arm', 'name':'arm_effort', 'value': JointEffort}
    sendData(message)

    
    // Header header
    // string[] name
    // float64[] position
    // float64[] velocity
    // float64[] effort
    //imageTopic.unsubscribe()
});


// connect to follow joint trajectory action server

var trajectoryClient = new ROSLIB.ActionClient({
    ros : ros,
    serverName : '/stretch_controller/follow_joint_trajectory',
    actionName : 'control_msgs/FollowJointTrajectoryAction'
});


function generatePoseGoal(pose){

    var outStr = '{'
    for (var key in pose) {
	outStr = outStr + String(key) + ':' + String(pose[key]) + ', '
    }
    outStr = outStr + '}'
    console.log('generatePoseGoal( ' + outStr + ' )')	
    
    var jointNames = []
    var jointPositions = []
    for (var key in pose) {
	jointNames.push(key)
	jointPositions.push(pose[key])
    }
    var newGoal = new ROSLIB.Goal({
	actionClient : trajectoryClient,
	goalMessage : {
	    trajectory : {
		joint_names : jointNames,
		points : [
		    {
			positions : jointPositions
		    }
		]
	    }
	}
    })

    console.log('newGoal created =' + newGoal)
    
    // newGoal.on('feedback', function(feedback) {
    // 	console.log('Feedback: ' + feedback.sequence);
    // });
    
    // newGoal.on('result', function(result) {
    // 	console.log('Final Result: ' + result.sequence);
    // });
    
    return newGoal
}

////////////////////////////////////////////////////////////////////////////////////

function loggedWebSocketSendWrist(cmd) {
    session_wrist.ws.send(cmd);
    commands_sent_wrist.push(cmd);
}


function sendCommandWrist(cmd) {
    if(session_wrist.ready) {
	
        command = JSON.stringify(cmd);
        loggedWebSocketSendWrist(command);
    }
}    

function loggedWebSocketSendBody(cmd) {
    session_body.ws.send(cmd);
    commands_sent_body.push(cmd);
}


function sendCommandBody(cmd) {
    if(session_body.ready) {

        command = JSON.stringify(cmd);
        loggedWebSocketSendBody(command);
    }
}

////////////////////////////////////////////////////////////////////////////////////

//Called from mode switch

function robotModeOn(modeKey) {
    console.log('robotModeOn called with modeKey = ' + modeKey)
    
    if (modeKey === 'nav') {
	var headNavPoseGoal = generatePoseGoal({'joint_head_pan': 0.0, 'joint_head_tilt': -1.0})
	headNavPoseGoal.send()
	console.log('sending navigation pose to head')	
    }

}

////////////////////////////////////////////////////////////////////////////////////

//Called from button click
function baseTranslate(dist, vel) {
    // distance in centimeters
    // velocity in centimeters / second
    console.log('sending baseTranslate command')

    if (dist > 0.0){
	var baseForwardPoseGoal = generatePoseGoal({'translate_mobile_base': -vel})
	baseForwardPoseGoal.send()
    } else if (dist < 0.0) {
	var baseBackwardPoseGoal = generatePoseGoal({'translate_mobile_base': vel})
	baseBackwardPoseGoal.send()
    }
    //sendCommandBody({type: "base",action:"translate", dist:dist, vel:vel});
}

function baseTurn(ang_deg, vel) {
    // angle in degrees
    // velocity in centimeter / second (linear wheel velocity - same as BaseTranslate)
    console.log('sending baseTurn command')
    
    if (ang_deg > 0.0){
	var baseTurnLeftPoseGoal = generatePoseGoal({'rotate_mobile_base': -vel})
	baseTurnLeftPoseGoal.send()
    } else if (ang_deg < 0.0) {
	var baseTurnRightPoseGoal = generatePoseGoal({'rotate_mobile_base': vel})
	baseTurnRightPoseGoal.send()
    }
    //sendCommandBody({type: "base",action:"turn", ang:ang_deg, vel:vel});
}


function sendIncrementalMove(jointName, jointValueInc) {
    console.log('sendIncrementalMove start: jointName =' + jointName)
    if (jointState !== null) {
	var newJointValue = getJointValue(jointState, jointName)
	newJointValue = newJointValue + jointValueInc
	console.log('poseGoal call: jointName =' + jointName)
	var pose = {[jointName]: newJointValue}
	var poseGoal = generatePoseGoal(pose)
	poseGoal.send()
	return true
    }
    return false
}

function armMove(dist, timeout, vel) {
    console.log('attempting to sendarmMove command')
    var jointValueInc = 0.0
    if (dist > 0.0) {
	jointValueInc = vel;
    } else if (dist < 0.0) {
	jointValueInc = -vel;
    }
    sendIncrementalMove('wrist_extension', jointValueInc)
   //sendCommandBody({type: "arm", action:"move", dist:dist, timeout:timeout});
}
 
function liftMove(dist, timeout, vel) {
    console.log('attempting to sendliftMove command')
    var jointValueInc = 0.0
    if (dist > 0.0) {
	jointValueInc = vel;
    } else if (dist < 0.0) {
	jointValueInc = -vel;
    }
    sendIncrementalMove('joint_lift', jointValueInc)
    //sendCommandBody({type: "lift", action:"move", dist:dist, timeout:timeout});
}

function gripperDeltaAperture(deltaWidthCm) {
    // attempt to change the gripper aperture
    console.log('attempting to sendgripper delta command');
    var jointValueInc = 0.0
    if (deltaWidthCm > 0.0) {
	jointValueInc = 0.05
    } else if (deltaWidthCm < 0.0) {
	jointValueInc = -0.05
    }
    sendIncrementalMove('joint_gripper_finger_left', jointValueInc)
    //sendCommandWrist({type:'gripper', action:'delta', delta_aperture_cm:deltaWidthCm});
}

function wristMove(angRad, vel) {
    console.log('attempting to send wristMove command')
    var jointValueInc = 0.0
    if (angRad > 0.0) {
	jointValueInc = vel;
    } else if (angRad < 0.0) {
	jointValueInc = -vel;
    }
    sendIncrementalMove('joint_wrist_yaw', jointValueInc)
}

function headTilt(angRad) {
    console.log('attempting to send headTilt command')
    sendIncrementalMove('joint_head_tilt', angRad)
}

function headPan(angRad) {
    console.log('attempting to send headPan command')
    sendIncrementalMove('joint_head_pan', angRad)
}


////////////////////////////////////////////////////////////////////////////////////

function armHome() {
    console.log('sending armHome command')
    sendCommandBody({type: "arm", action:"home"});
}

function liftHome() {
    console.log('sending liftHome command')
    sendCommandBody({type: "lift", action:"home"});
}

function wristStopMotion() {
    console.log('sending wrist stop motion command');
    sendCommandWrist({type:'wrist', action:'stop_motion'});
}

function wristBendVelocity(deg_per_sec) {
    console.log('sending wrist bend velocity of ' + deg_per_sec + ' command');
    sendCommandWrist({type:'wrist', action:'bend_velocity', angle:deg_per_sec});
}

function wristAutoBend(angleDeg) {
    // attempt to bend the wrist by deltaAngle degrees
    //console.log('*** no wrist bend control exists yet ***');
    console.log('sending auto wrist bend to ' + angleDeg + ' command');
    sendCommandWrist({type:'wrist', action:'auto_bend', angle:angleDeg});
}

function initFixedWrist() {
    // try to emulate a fixed wrist with gripper flat and bent down 45 degrees from horizontal
    console.log('sending init_fixed_wrist command');
    sendCommandWrist({type:'wrist', action:'init_fixed_wrist'});
}

function wristBend(deltaAngle) {
    // attempt to bend the wrist by deltaAngle degrees
    //console.log('*** no wrist bend control exists yet ***');
    console.log('sending wrist bend command');
    sendCommandWrist({type:'wrist', action:'bend', angle:deltaAngle});
}

function wristRoll(deltaAngle) {
    // attempt to roll the wrist by deltaAngle degrees
    //console.log('*** no wrist roll control exists yet ***');
    console.log('sending wrist roll command');
    sendCommandWrist({type:'wrist', action:'roll', angle:deltaAngle});
}

function gripperGoalAperture(goalWidthCm) {
    // attempt to change the gripper aperture
    console.log('sending gripper command');
    sendCommandWrist({type:'gripper', action:'width', goal_aperture_cm:goalWidthCm});
}

function gripperGoalAperture(goalWidthCm) {
    // attempt to change the gripper aperture
    console.log('sending gripper command');
    sendCommandWrist({type:'gripper', action:'width', goal_aperture_cm:goalWidthCm});
}

function gripperFullyClose() {
    console.log('sending fully close gripper command');
    sendCommandWrist({type:'gripper', action:'fully_close'});
}

function gripperHalfOpen() {
    console.log('sending half open gripper command');
    sendCommandWrist({type:'gripper', action:'half_open'});
}

function gripperFullyOpen() {
    console.log('sending fully open gripper command');
    sendCommandWrist({type:'gripper', action:'fully_open'});
}
