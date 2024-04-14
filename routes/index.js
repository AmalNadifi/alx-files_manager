import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = Router();

// Route to get the status of the application
router.get('/status', AppController.getStatus);

// Route to get statistics about the application
router.get('/stats', AppController.getStats);

// Route to handle new user creation
router.post('/users', UsersController.postNew);

// Route to handle user authentication
router.get('/connect', AuthController.getConnect);

// Route to handle user logout
router.get('/disconnect', AuthController.getDisconnect);

// Route to get information about the currently logged-in user
router.get('/users/me', UsersController.getMe);

// Route to upload files
router.post('/files', FilesController.postUpload);

// Route to get a specific file by ID
router.get('/files/:id', FilesController.getShow);

// Route to get all files
router.get('/files', FilesController.getIndex);

// Route to publish a file
router.put('/files/:id/publish', FilesController.putPublish);

// Route to unpublish a file
router.put('/files/:id/unpublish', FilesController.putUnpublish);

// Route to get file data
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;
