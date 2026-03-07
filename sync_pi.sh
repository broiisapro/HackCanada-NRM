#!/bin/bash

while true
do
rsync -avz --ignore-existing one@192.168.137.234:~/video_logs/ ~/Desktop/video_logs/
sleep 10
done
