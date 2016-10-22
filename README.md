# Encrypted Data Search
This README.md file explains how to use the Encrypted Data Search server.

## Starting the project
The project can be started by running the Makefile using the following command from the workspace directory:
``` $ make```
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