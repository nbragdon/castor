import environmentsManager from 'server/dataManagement/environments';
import express from 'express';
const router = express.Router({ mergeParams: true });
const wrap = fn => (...args) => fn(...args).catch(args[2])

router.get('/:environment', wrap(async (req, res) => {
    console.log('Entered environments GET', req.params.environment);
    console.log('Params', req.params);
    console.log('Body', req.body);
    console.log('Query', req.query);
    let properties = await environmentsManager.getEnvironmentProperties(req.params.environment);
    res.json(properties);
}));

router.post('/', wrap(async (req, res) => {
    console.log('Entered environments POST', req.body);
    let result = await environmentsManager.createEnvironment(req.body);
    res.json(result);
}));

export default router;