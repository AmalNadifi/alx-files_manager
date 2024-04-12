# alx-files_manager API

This is the README file for the alx-files_manager project. This project is a RESTful API built using Node.js and Express for managing files.

## Features

- **File Upload**: Allows users to upload files to the server.
- **File Download**: Enables users to download files from the server.
- **File Management**: Provides endpoints for managing files, such as deleting and updating files.
- **Authentication**: Supports user authentication to ensure secure access to the API endpoints.
- **Authorization**: Implements authorization to control user access based on roles and permissions.

## Tasks

### Task 0: Redis utils
Inside the folder `utils`, create a file `redis.js` that contains the class `RedisClient`.

- `RedisClient` should have:
  - The constructor that creates a client to Redis.
  - Any error of the Redis client must be displayed in the console (you should use `on('error')` of the Redis client).
  - A function `isAlive` that returns `true` when the connection to Redis is successful, otherwise `false`.
  - An asynchronous function `get` that takes a string key as an argument and returns the Redis value stored for this key.
  - An asynchronous function `set` that takes a string key, a value, and a duration in seconds as arguments to store it in Redis (with an expiration set by the duration argument).
  - An asynchronous function `del` that takes a string key as an argument and removes the value in Redis for this key.

After the class definition, create and export an instance of `RedisClient` called `redisClient`.

### Example Usage
```bash
bob@dylan:~$ cat main.js
import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000*10)
})();

bob@dylan:~$ npm run dev main.js
true
null
12
null
bob@dylan:~$
```

### Task 1: MongoDB utils
Inside the folder utils, create a file db.js that contains the class DBClient.

DBClient should have:

### DBClient Requirements

- **Constructor**: Create a client to MongoDB with the following configurations:
  - Host: from the environment variable `DB_HOST` or default: `localhost`
  - Port: from the environment variable `DB_PORT` or default: `27017`
  - Database: from the environment variable `DB_DATABASE` or default: `files_manager`
- **isAlive Function**: Return `true` when the connection to MongoDB is successful; otherwise, `false`.
- **nbUsers Function**: Return the number of documents in the collection `users`.
- **nbFiles Function**: Return the number of documents in the collection `files`.

### Example Usage

```javascript
import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();

bob@dylan:~$ npm run dev main.js
false
true
4
30


## Task 2: First API

Inside `server.js`, create the Express server:

- Listen on the port set by the environment variable `PORT` or default to `5000`.
- Load all routes from the file `routes/index.js`.

### Routes Configuration

Inside the folder `routes`, create a file `index.js` that contains all endpoints of our API:

- `GET /status` => `AppController.getStatus`
- `GET /stats` => `AppController.getStats`

### AppController Definition

Inside the folder `controllers`, create a file `AppController.js` that contains the definition of the two endpoints:

1. `GET /status` should return if Redis is alive and if the DB is alive using the two utils created previously:
   - Response: `{ "redis": true, "db": true }` with a status code `200`.

2. `GET /stats` should return the number of users and files in DB:
   - Response: `{ "users": 12, "files": 1231 }` with a status code `200`.
   - `users` collection must be used for counting all users.
   - `files` collection must be used for counting all files.

### Example Usage

Terminal 1:

```bash
bob@dylan:~$ npm run start-server
Server running on port 5000
...

Terminal 2:
bob@dylan:~$ curl 0.0.0.0:5000/status ; echo ""
{"redis":true,"db":true}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/stats ; echo ""
{"users":4,"files":30}
bob@dylan:~$
```

## Task 3: Create a New User

Now that we have a simple API, it’s time to add users to our database.

### Endpoint Configuration

In the file `routes/index.js`, add a new endpoint:

- `POST /users` => `UsersController.postNew`

### UsersController Definition

Inside `controllers`, add a file `UsersController.js` that contains the new endpoint:

1. `POST /users` should create a new user in DB:
   - To create a user, you must specify an email and a password.
   - If the email is missing, return an error "Missing email" with a status code `400`.
   - If the password is missing, return an error "Missing password" with a status code `400`.
   - If the email already exists in DB, return an error "Already exist" with a status code `400`.
   - The password must be stored after being hashed in SHA1.
   - The endpoint should return the new user with only the email and the id (auto-generated by MongoDB) with a status code `201`.
   - The new user must be saved in the collection `users`:
     - email: same as the value received
     - password: SHA1 value of the value received

### Example Usage

```bash
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"id":"5f1e7d35c7ba06511e683b21","email":"bob@dylan.com"}
bob@dylan:~$
bob@dylan:~$ echo 'db.users.find()' | mongo files_manager
{ "_id" : ObjectId("5f1e7d35c7ba06511e683b21"), "email" : "bob@dylan.com", "password" : "89cad29e3ebc1035b29b1478a8e70854f25fa2b2" }
bob@dylan:~$
bob@dylan:~$
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
bob@dylan:~$
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com" }' ; echo ""
{"error":"Missing password"}
bob@dylan:~$
```

## Task 4: Authenticate a user

### Requirements:

- In the file `routes/index.js`, add 3 new endpoints:
  - `GET /connect` => `AuthController.getConnect`
  - `GET /disconnect` => `AuthController.getDisconnect`
  - `GET /users/me` => `UserController.getMe`

### Inside controllers, add a file `AuthController.js` that contains new endpoints:

- `GET /connect` should sign-in the user by generating a new authentication token:
  - By using the header Authorization and the technique of Basic auth (Base64 of the `<email>:<password>`), find the user associated with this email and password (reminder: we are storing the SHA1 of the password).
  - If no user is found, return an error Unauthorized with a status code 401.
  - Otherwise:
    - Generate a random string (using uuidv4) as token.
    - Create a key: `auth_<token>`.
    - Use this key for storing in Redis (by using the `redisClient` created previously) the user ID for 24 hours.
    - Return this token: `{ "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }` with a status code 200.
    - Now, we have a way to identify a user, create a token (= avoid storing the password on any front-end), and use this token for 24h to access the API!
    - Every authenticated endpoint of our API will look at this token inside the header X-Token.

- `GET /disconnect` should sign-out the user based on the token:
  - Retrieve the user based on the token.
  - If not found, return an error Unauthorized with a status code 401.
  - Otherwise, delete the token in Redis and return nothing with a status code 204.

### Inside the file controllers/UsersController.js, add a new endpoint:

- `GET /users/me` should retrieve the user based on the token used:
  - Retrieve the user based on the token.
  - If not found, return an error Unauthorized with a status code 401.
  - Otherwise, return the user object (email and id only).

### Example:

```bash
curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE="
{"token":"031bffac-3edc-4e51-aaae-1c121317da8a"}

curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a"
{"id":"5f1e7cda04a394508232559d","email":"bob@dylan.com"}

curl 0.0.0.0:5000/disconnect -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a"

curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a"
{"error":"Unauthorized"}
```

## Task 5: First file

### Requirements:

- In the file `routes/index.js`, add a new endpoint:
  - `POST /files` => `FilesController.postUpload`

### Inside controllers, add a file `FilesController.js` that contains the new endpoint:

- `POST /files` should create a new file in DB and on disk:
  - Retrieve the user based on the token.
  - If not found, return an error Unauthorized with a status code 401.
  - To create a file, you must specify:
    - name: as filename
    - type: either folder, file, or image
    - parentId: (optional) as ID of the parent (default: 0 -> the root)
    - isPublic: (optional) as boolean to define if the file is public or not (default: false)
    - data: (only for type=file|image) as Base64 of the file content
  - If the name is missing, return an error Missing name with a status code 400.
  - If the type is missing or not part of the list of accepted types, return an error Missing type with a status code 400.
  - If the data is missing and type != folder, return an error Missing data with a status code 400.
  - If the parentId is set:
    - If no file is present in DB for this parentId, return an error Parent not found with a status code 400.
    - If the file present in DB for this parentId is not of type folder, return an error Parent is not a folder with a status code 400.
  - The user ID should be added to the document saved in the DB as the owner of a file.
  - If the type is folder, add the new file document in the DB and return the new file with a status code 201.
  - Otherwise:
    - All files will be stored locally in a folder (to create automatically if not present).
    - The relative path of this folder is given by the environment variable `FOLDER_PATH`.
    - If this variable is not present or empty, use `/tmp/files_manager` as the storing folder path.
    - Create a local path in the storing folder with filename as a UUID.
    - Store the file in clear (reminder: data contains the Base64 of the file) in this local path.
    - Add the new file document in the collection files with these attributes:
      - userId: ID of the owner document (owner from the authentication).
      - name: same as the value received.
      - type: same as the value received.
      - isPublic: same as the value received.
      - parentId: same as the value received - if not present: 0.
      - localPath: for a type=file|image, the absolute path to the file saved locally.
    - Return the new file with a status code 201.

### Example:

```bash
bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"f21fb953-16f9-46ed-8d9c-84c6450ec80f"}
bob@dylan:~$ 
bob@dylan:~$ curl -XPOST 0.0.0.0:5000/files -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" -H "Content-Type: application/json" -d '{ "name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" }' ; echo ""
{"id":"5f1e879ec7ba06511e683b22","userId":"5f1e7cda04a394508232559d","name":"myText.txt","type":"file","isPublic":false,"parentId":0}
bob@dylan:~$
bob@dylan:~$ ls /tmp/files_manager/
2a1f4fc3-687b-491a-a3d2-5808a02942c9
bob@dylan:~$
bob@dylan:~$ cat /tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9 
Hello Webstack!
bob@dylan:~$
bob@dylan:~$ curl -XPOST 0.0.0.0:5000/files -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" -H "Content-Type: application/json" -d '{ "name": "images", "type": "folder" }' ; echo ""
{"id":"5f1e881cc7ba06511e683b23","userId":"5f1e7cda04a394508232559d","name":"images","type":"folder","isPublic":false,"parentId":0}
bob@dylan:~$
bob@dylan:~$ cat image_upload.py
import base64
import requests
import sys

file_path = sys.argv[1]
file_name = file_path.split('/')[-1]

file_encoded = None
with open(file_path, "rb") as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = { 'name': file_name, 'type': 'image', 'isPublic': True, 'data': file_encoded, 'parentId': sys.argv[3] }
r_headers = { 'X-Token': sys.argv[2] }

r = requests.post("http://0.0.0.0:5000/files", json=r_json, headers=r_headers)
print(r.json())

bob@dylan:~$
bob@dylan:~$ python image_upload.py image.png f21fb953-16f9-46ed-8d9c-84c6450ec80f 5f1e881cc7ba06511e683b23
{'id': '5f1e8896c7ba06511e683b25', 'userId': '5f1e7cda04a394508232559d', 'name': 'image.png', 'type': 'image', 'isPublic': True, 'parentId': '5f1e881cc7ba06511e683b23'}
bob@dylan:~$
bob@dylan:~$ echo 'db.files.find()' | mongo files_manager
{ "_id" : ObjectId("5f1e881cc7ba06511e683b23"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "images", "type" : "folder", "parentId" : "0" }
{ "_id" : ObjectId("5f1e879ec7ba06511e683b22"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "myText.txt", "type" : "file", "parentId" : "0", "isPublic" : false, "localPath" : "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9" }
{ "_id" : ObjectId("5f1e8896c7ba06511e683b25"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "image.png", "type" : "image", "parentId" : ObjectId("5f1e881cc7ba06511e683b23"), "isPublic" : true, "localPath" : "/tmp/files_manager/51997b88-5c42-42c2-901e-e7f4e71bdc47" }
bob@dylan:~$
bob@dylan:~$ ls /tmp/files_manager/
2a1f4fc3-687b-491a-a3d2-5808a02942c9   51997b88-5c42-42c2-901e-e7f4e71bdc47
bob@dylan:~$
```

## Task 6: Get and list file

### Requirements:

- In the file `routes/index.js`, add 2 new endpoints:
  - `GET /files/:id` => `FilesController.getShow`
  - `GET /files` => `FilesController.getIndex`

### In the file `controllers/FilesController.js`, add the 2 new endpoints:

- `GET /files/:id` should retrieve the file document based on the ID:
  - Retrieve the user based on the token.
  - If not found, return an error Unauthorized with a status code 401.
  - If no file document is linked to the user and the ID passed as a parameter, return an error Not found with a status code 404.
  - Otherwise, return the file document.

- `GET /files` should retrieve all users file documents for a specific parentId and with pagination:
  - Retrieve the user based on the token.
  - If not found, return an error Unauthorized with a status code 401.
  - Based on the query parameters `parentId` and `page`, return the list of file documents.
    - parentId:
      - No validation of parentId needed - if the parentId is not linked to any user folder, return an empty list.
      - By default, parentId is equal to 0 = the root.
    - Pagination:
      - Each page should be 20 items max.
      - The `page` query parameter starts at 0 for the first page. If equal to 1, it means it’s the second page (from the 20th to the 40th), etc.
      - Pagination can be done directly by the aggregate of MongoDB.

### Example:

```bash
bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"f21fb953-16f9-46ed-8d9c-84c6450ec80f"}
bob@dylan:~$ 
bob@dylan:~$ curl -XGET 0.0.0.0:5000/files -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" ; echo ""
[{"id":"5f1e879ec7ba06511e683b22","userId":"5f1e7cda04a394508232559d","name":"myText.txt","type":"file","isPublic":false,"parentId":0},{"id":"5f1e881cc7ba06511e683b23","userId":"5f1e7cda04a394508232559d","name":"images","type":"folder","isPublic":false,"parentId":0},{"id":"5f1e8896c7ba06511e683b25","userId":"5f1e7cda04a394508232559d","name":"image.png","type":"image","isPublic":true,"parentId":"5f1e881cc7ba06511e683b23"}]
bob@dylan:~$
bob@dylan:~$ curl -XGET 0.0.0.0:5000/files?parentId=5f1e881cc7ba06511e683b23 -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" ; echo ""
[{"id":"5f1e8896c7ba06511e683b25","userId":"5f1e7cda04a394508232559d","name":"image.png","type":"image","isPublic":true,"parentId":"5f1e881cc7ba06511e683b23"}]
bob@dylan:~$
bob@dylan:~$ curl -XGET 0.0.0.0:5000/files/5f1e8896c7ba06511e683b25 -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" ; echo ""
{"id":"5f1e8896c7ba06511e683b25","userId":"5f1e7cda04a394508232559d","name":"image.png","type":"image","isPublic":true,"parentId":"5f1e881cc7ba06511e683b23"}
bob@dylan:~$
```

## Task 7: File publish/unpublish

### Requirements:

- In the file `routes/index.js`, add 2 new endpoints:
  - `PUT /files/:id/publish` => `FilesController.putPublish`
  - `PUT /files/:id/unpublish` => `FilesController.putUnpublish`

### In the file `controllers/FilesController.js`, add the 2 new endpoints:

- `PUT /files/:id/publish` should set `isPublic` to true on the file document based on the ID:
  - Retrieve the user based on the token.
  - If not found, return an error Unauthorized with a status code 401.
  - If no file document is linked to the user and the ID passed as a parameter, return an error Not found with a status code 404.
  - Update the value of `isPublic` to true.
  - Return the file document with a status code 200.

- `PUT /files/:id/unpublish` should set `isPublic` to false on the file document based on the ID:
  - Retrieve the user based on the token.
  - If not found, return an error Unauthorized with a status code 401.
  - If no file document is linked to the user and the ID passed as a parameter, return an error Not found with a status code 404.
  - Update the value of `isPublic` to false.
  - Return the file document with a status code 200.

### Example:

```bash
bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"f21fb953-16f9-46ed-8d9c-84c6450ec80f"}
bob@dylan:~$ 
bob@dylan:~$ curl -XGET 0.0.0.0:5000/files/5f1e8896c7ba06511e683b25 -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" ; echo ""
{"id":"5f1e8896c7ba06511e683b25","userId":"5f1e7cda04a394508232559d","name":"image.png","type":"image","isPublic":false,"parentId":"5f1e881cc7ba06511e683b23"}
bob@dylan:~$
bob@dylan:~$ curl -XPUT 0.0.0.0:5000/files/5f1e8896c7ba06511e683b25/publish -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" ; echo ""
{"id":"5f1e8896c7ba06511e683b25","userId":"5f1e7cda04a394508232559d","name":"image.png","type":"image","isPublic":true,"parentId":"5f1e881cc7ba06511e683b23"}
bob@dylan:~$ 
bob@dylan:~$ curl -XPUT 0.0.0.0:5000/files/5f1e8896c7ba06511e683b25/unpublish -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" ; echo ""
{"id":"5f1e8896c7ba06511e683b25","userId":"5f1e7cda04a394508232559d","name":"image.png","type":"image","isPublic":false,"parentId":"5f1e881cc7ba06511e683b23"}
bob@dylan:~$
```

## Task 8: File data

### Requirements:

- In the file `routes/index.js`, add one new endpoint:
  - `GET /files/:id/data` => `FilesController.getFile`

### In the file `controllers/FilesController.js`, add the new endpoint:

- `GET /files/:id/data` should return the content of the file document based on the ID:
  - If no file document is linked to the ID passed as a parameter, return an error Not found with a status code 404.
  - If the file document (folder or file) is not public (`isPublic: false`) and no user is authenticated or not the owner of the file, return an error Not found with a status code 404.
  - If the type of the file document is a folder, return an error A folder doesn't have content with a status code 400.
  - If the file is not locally present, return an error Not found with a status code 404.
  - Otherwise:
    - Use the module `mime-types` to get the MIME-type based on the name of the file.
    - Return the content of the file with the correct MIME-type.

### Example:

```bash
curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE="
{"token":"f21fb953-16f9-46ed-8d9c-84c6450ec80f"}

curl -XPUT 0.0.0.0:5000/files/5f1e879ec7ba06511e683b22/unpublish -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f"
{"id":"5f1e879ec7ba06511e683b22","userId":"5f1e7cda04a394508232559d","name":"myText.txt","type":"file","isPublic":false,"parentId":0}

curl -XGET 0.0.0.0:5000/files/5f1e879ec7ba06511e683b22/data -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f"
Hello Webstack!

curl -XGET 0.0.0.0:5000/files/5f1e879ec7ba06511e683b22/data
{"error":"Not found"}

curl -XPUT 0.0.0.0:5000/files/5f1e879ec7ba06511e683b22/publish -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f"
{"id":"5f1e879ec7ba06511e683b22","userId":"5f1e7cda04a394508232559d","name":"myText.txt","type":"file","isPublic":true,"parentId":0}

curl -XGET 0.0.0.0:5000/files/5f1e879ec7ba06511e683b22/data
Hello Webstack!
```

## Task 9: Image Thumbnails

### Requirements:

- Update the endpoint `POST /files` to start a background processing for generating thumbnails for a file of type image:
  - Create a Bull queue `fileQueue`.
  - When a new image is stored (in local and in DB), add a job to this queue with the userId and fileId.

- Create a file `worker.js`:
  - By using the module Bull, create a queue `fileQueue`.
  - Process this queue:
    - If fileId is not present in the job, raise an error Missing fileId.
    - If userId is not present in the job, raise an error Missing userId.
    - If no document is found in DB based on the fileId and userId, raise an error File not found.
    - By using the module `image-thumbnail`, generate 3 thumbnails with width = 500, 250, and 100 - store each result on the same location of the original file by appending _<width size>.

- Update the endpoint `GET /files/:id/data` to accept a query parameter `size`:
  - `size` can be 500, 250, or 100.
  - Based on size, return the correct local file.
  - If the local file doesn’t exist, return an error Not found with a status code 404.

### Example:

Terminal 3: (start the worker)

bob@dylan:~$ npm run start-worker
...
Terminal 2:

bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"f21fb953-16f9-46ed-8d9c-84c6450ec80f"}
bob@dylan:~$ 
bob@dylan:~$ python image_upload.py image.png f21fb953-16f9-46ed-8d9c-84c6450ec80f 5f1e881cc7ba06511e683b23
{'id': '5f1e8896c7ba06511e683b25', 'userId': '5f1e7cda04a394508232559d', 'name': 'image.png', 'type': 'image', 'isPublic': True, 'parentId': '5f1e881cc7ba06511e683b23'}
bob@dylan:~$ ls /tmp/files_manager/
2a1f4fc3-687b-491a-a3d2-5808a02942c9   51997b88-5c42-42c2-901e-e7f4e71bdc47   6dc53397-8491-4b7c-8273-f748b1a031cb   6dc53397-8491-4b7c-8273-f748b1a031cb_100   6dc53397-8491-4b7c-8273-f748b1a031cb_250    6dc53397-8491-4b7c-8273-f748b1a031cb_500
bob@dylan:~$ 
bob@dylan:~$ curl -XGET 0.0.0.0:5000/files/5f1e8896c7ba06511e683b25/data -so new_image.png ; file new_image.png
new_image.png: PNG image data, 471 x 512, 8-bit/color RGBA, non-interlaced
bob@dylan:~$ 
bob@dylan:~$ curl -XGET 0.0.0.0:5000/files/5f1e8896c7ba06511e683b25/data?size=100 -so new_image.png ; file new_image.png
new_image.png: PNG image data, 100 x 109, 8-bit/color RGBA, non-interlaced
bob@dylan:~$ 
bob@dylan:~$ curl -XGET 0.0.0.0:5000/files/5f1e8896c7ba06511e683b25/data?size=250 -so new_image.png ; file new_image.png
new_image.png: PNG image data, 250 x 272, 8-bit/color RGBA, non-interlaced
bob@dylan:~$

## Task10: Tests!
### Advanced

Of course, a strong and stable project cannot be good without tests.

Create tests for `redisClient` and `dbClient`.

Create tests for each endpoint:

1. **GET /status**
2. **GET /stats**
3. **POST /users**
4. **GET /connect**
5. **GET /disconnect**
6. **GET /users/me**
7. **POST /files**
8. **GET /files/:id**
9. **GET /files** (don’t forget the pagination)
10. **PUT /files/:id/publish**
11. **PUT /files/:id/unpublish**
12. **GET /files/:id/data**

## Task11: New user - welcome email
### Advanced

Update the endpoint `POST /users` endpoint to start a background processing for sending a “Welcome email” to the user:

1. Create a Bull queue `userQueue`.
2. When a new user is stored (in DB), add a job to this queue with the `userId`.
3. Update the file `worker.js`:

   - By using the module Bull, create a queue `userQueue`.
   - Process this queue:
     - If `userId` is not present in the job, raise an error **Missing userId**.
     - If no document is found in DB based on the `userId`, raise an error **User not found**.
     - Print in the console **Welcome \<email\>!**

In real life, you can use a third-party service like Mailgun to send real email. These APIs are slow (sending via SMTP is worst!), and sending emails via a background job is important to optimize API endpoints.
