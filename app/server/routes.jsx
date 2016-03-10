import productRoutes from 'server/products';
import environmentRoutes from 'server/api/environments';
import contextRoutes from 'server/api/contexts';
import propertyRoutes from 'server/api/properties';

export default function routes(app) {
    app.use('/products', productRoutes);
    app.use('/environments/:environment/contexts/:context/properties', propertyRoutes);
    app.use('/environments/:environment/contexts', contextRoutes);
    app.use('/environments', environmentRoutes);
}
