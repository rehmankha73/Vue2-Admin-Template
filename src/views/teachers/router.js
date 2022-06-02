import TeacherForm from './TeacherForm';
import TeacherView from './TeacherView';
import TeacherShow from "./TeacherShow";

export const teachersRoutes = [
    {
        name: 'Teachers',
        path: '/teachers',
        component: TeacherView
    },
    {
        name: 'TeacherDetails',
        path: '/teacher-details',
        component: TeacherShow
    },
    {
        name: 'NewTeacher',
        path: '/teacher',
        component: TeacherForm
    },
];

export const teachersRouter = teachersRoutes.filter(function (x) {
    return x !== null;
})