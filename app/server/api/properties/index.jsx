import propertiesManager from 'server/dataManagement/properties';
import express from 'express';
const router = express.Router({ mergeParams: true });
const wrap = fn => (...args) => fn(...args).catch(args[2])

router.get('/:property', wrap(async (req, res) => {
    console.log('Entered contexts GET', req.params.environment);
    console.log('Params', req.params);
    console.log('Body', req.body);
    console.log('Query', req.query);
    let properties = await propertiesManager.getProperty(req.params.environment, req.params.context, req.params.property);
    res.json(properties);
}));

router.post('/', wrap(async (req, res) => {
    console.log('Entered contexts POST', req.body, req.params);
    let result = await propertiesManager.createProperty(req.body, req.params.environment, req.params.context);
    res.json(result);
}));

export default router;