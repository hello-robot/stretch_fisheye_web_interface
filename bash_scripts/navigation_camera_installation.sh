#!/bin/bash

echo ""
echo "Starting navigation camera installation script."

# UDEV FOR NAVIGATION CAMERA
echo ""
echo "Adding udev rules for the navigation camera."
echo "cd ~/catkin_ws/src/stretch_web_interface/"
cd ~/catkin_ws/src/stretch_web_interface/
echo "sudo cp ./88-hello-navigation-camera.rules /etc/udev/rules.d/"
sudo cp ./88-hello-navigation-camera.rules /etc/udev/rules.d/
echo "sudo udevadm control --reload"
sudo udevadm control --reload
echo "WARNING: You should either reboot the robot or disconnect and reconnect the navigation camera for the new device symlink hello-navigation-camera to take effect."
echo ""

# ROS USB CAMERA PACKAGE
echo ""
echo "Installing ROS USB camera package"
echo "sudo apt-get --yes install ros-melodic-usb-cam"
sudo apt-get --yes install ros-melodic-usb-cam
echo "Done."

echo ""
echo "The navigation camera installation script has finished."
echo ""
