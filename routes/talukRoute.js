import express from 'express';
import * as talukController from '../controllers/talukController.js';

const router = express.Router();

router.route('/')
    .post(talukController.createTaluk)
    .get(talukController.getTaluks);

router.route('/:id')
    .get(talukController.getTalukById)
    .put(talukController.updateTaluk)
    .delete(talukController.deleteTaluk);

router.route('/taluk/:districtId')
    .get(talukController.getTalukByDisctrictId);
export default router;
