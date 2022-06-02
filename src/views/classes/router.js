import ClassForm from './ClassForm';
import ClassView from './ClassView';
import ClassShow from "./ClassShow";

export const classesRoutes = [
    {
        name: 'Classes',
        path: '/classes',
        component: ClassView
    },
    {
        name: 'ClassDetails',
        path: '/class-details',
        component: ClassShow
    },
    {
        name: 'NewClass',
        path: '/class',
        component: ClassForm
    },
];

export const classesRouter = classesRoutes.filter(function (x) {
    return x !== null;
})