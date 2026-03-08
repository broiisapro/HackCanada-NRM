#!/bin/bash

while true
do
rsync -avz --ignore-existing one@route.local:~/image_logs/ ~/Desktop/image_logs/
sleep 10
done