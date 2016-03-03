import productRoutes from 'server/products';
import environmentRoutes from 'server/environments';
import contextRoutes from 'server/contexts';
import propertyRoutes from 'server/routes';

export default function routes(app) {
    app.use('/products', productRoutes);
    app.use('/environments')
}
