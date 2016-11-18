#!/bin/bash

# Installing Node JS
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

# Installing MongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Installing Python
sudo apt-get update
sudo apt-get install python2.7

# Installing Node JS drivers
npm install express
npm install body-parser
npm install ejs
npm install mongodb --save

# Installing Crypto Libraries
npm install crypto
npm install node-rsa
npm install random-gen
npm install node-forge