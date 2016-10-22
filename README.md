# Encrypted Data Search
This README.md file explains how to use the Encrypted Data Search server.

## Requirements
The project requires NodeJS to be installed as well as MongoDB.

## Starting the project
The project can be started by running the Makefile using the following command from the workspace directory:
```
$ make
```
The make file currently has four options:
1. ``` $ make ``` to start the node server and database.
2. ``` $ make stop ``` to stop the database.
3. ``` $ make test ``` to test the server.
4. ``` $ make git ``` to automatically commit to the git repository.

More information on how to start the individual elements of the server can be found below.

### Starting node server
To start the node server, the main file server.js must be run using the command
``` $ node server.js ```

### Starting MongoDB server
Section explaining how to handle the MongoDB database.

#### Start server
```  $ sudo service mongod start ```

#### Stop server
``` $ sudo service mongod stop ```

### Control MongoDB
``` 
$ mongo       //Open database
$ show dbs    //Show databases
$ use <dbs>   //Select databases
```