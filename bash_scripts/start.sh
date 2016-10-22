#!/bin/bash

mongo_process_id=`pgrep "mongod"`

# Start the MongoDB server if not yet running
if [ -z $mongo_process_id ]
then
  echo "Starting mongoDB server..."
  sudo service mongod start
fi

# Start the node server
node server.js