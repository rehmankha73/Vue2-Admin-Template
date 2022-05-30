import StudentForm from './StudentForm';
import StudentView from './StudentView';

export const studentsRoutes = [
    {
        name: 'Students',
        path: '/students',
        component: StudentView
    },
    {
        name: 'NewStudent',
        path: '/student',
        component: StudentForm
    },
];

export const studentsRouter = studentsRoutes.filter(function (x) {
    return x !== null;
})