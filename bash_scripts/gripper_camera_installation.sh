#!/bin/bash

echo ""
echo "Starting gripper camera installation script."

# UDEV FOR GRIPPER CAMERA
echo ""
echo "Adding udev rules for the gripper camera."
echo "roscd stretch_web_interface/"
roscd stretch_web_interface/
echo "sudo cp ./89-hello-gripper-camera.rules /etc/udev/rules.d/"
sudo cp ./89-hello-gripper-camera.rules /etc/udev/rules.d/
echo "sudo udevadm control --reload"
sudo udevadm control --reload
echo "WARNING: You should either reboot the robot or disconnect and reconnect the gripper camera for the new device symlink hello-gripper-camera to take effect."
echo ""

# ROS USB CAMERA PACKAGE
echo ""
echo "Installing ROS USB camera package"
echo "sudo apt-get --yes install ros-melodic-usb-cam"
sudo apt-get --yes install ros-melodic-usb-cam
echo "Done."

echo ""
echo "The gripper camera installation script has finished."
echo ""
