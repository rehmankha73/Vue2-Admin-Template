import MediaIndex from './MediaIndex';
export const mediaRoutes = [
    {
        name: 'Media',
        path: '/media',
        component: MediaIndex
    },
];

export const mediaRouter = mediaRoutes.filter(function (x) {
    return x !== null;
})