# Current tasks
 - Complete database connection methods.

# Encrypted Data Search
This README.md file explains how to use the Encrypted Data Search server.

## Requirements
The project requires [Python](https://www.python.org/download/releases/2.7/), [NodeJS](https://nodejs.org/en/) to be installed as well as [MongoDB](https://www.mongodb.com/). If you run Ubuntu 14.04 just execute the command ``` $ make install ``` to install these dependencies.

## Project structure
The project has the following global structure:
 - **bash_scripts**: Scripts to quickly start, stop, test or commit the project.
 - **node_modules**: The node modules used to run the node server
 - **server**: Directory containing all server directories and files.
 - **client**: Directory containing all client directories and files.

### Server
All files necessary to run the server, including custom node modules.

### Client
All files to run the client side of the applications including HTML to be send back to the client.

## Starting the project
The project can be started by running the Makefile using the following command from the workspace directory:
```
$ make
```
Once the server runs use this [link](https://Encrypted-Data-Search-thijsvanede512475.codeanyapp.com) to access the server. 

The make file currently also has the following options:
 1. ``` $ make ``` or ``` $ make start``` to start the node server and database.
 2. ``` $ make stop ``` to stop the database.
 3. ``` $ make test ``` to test the server.
 4. ``` $ make git ``` to automatically commit to the git repository.
 5. ``` $ make install ``` to automatically install the required [Python](https://www.python.org/download/releases/2.7/), [NodeJS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/) and subsequent packages. Note this is the installation for Ubuntu 14.04.

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

## Server API
The functions provided by the Encrypted Data Search server.

### database/database.js
This contains functions to easily interact with the database. Currently supported functionality:
 - **insert( *collection, document, options* )**: To insert document(s) into collection.
 - **update( *collection, document, update, options* )**: To update documents from collection.
 - **delete( *collection, document, options* )**: To delete a single document from collection.
 - **deleteAll( *collection, document, options* )**: To delete all documents from collection.
 - **bulkWrite( *collection, operations, options* )**: To perform bulk of operations on collection.
 - **find( *collection, query, callback* )**: To find query in collection and export it to callback function.