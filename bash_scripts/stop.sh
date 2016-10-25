#!/bin/bash

echo "Stopping MongoDB server..."
sudo service mongod stop
echo "MongoDB successfully stopped."

node_process_id=`pgrep "node"`

# Start the MongoDB server if not yet running
if [ -n $node_process_id ]
then
  echo "Stopping node server..."
  kill $node_process_id
  echo "Node server successfully stopped."
fi