import contextsManager from 'server/dataManagement/contexts';
import express from 'express';
const router = express.Router({ mergeParams: true });
const wrap = fn => (...args) => fn(...args).catch(args[2])

router.get('/:context', wrap(async (req, res) => {
    console.log('Entered contexts GET', req.params.environment);
    console.log('Params', req.params);
    console.log('Body', req.body);
    console.log('Query', req.query);
    let properties = await contextsManager.getContextProperties(req.params.environment, req.params.context);
    res.json(properties);
}));

router.post('/', wrap(async (req, res) => {
    console.log('Entered contexts POST', req.body, req.params);
    let result = await contextsManager.createContext(req.body, req.params.environment);
    res.json(result);
}));

export default router;