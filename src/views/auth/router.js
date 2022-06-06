import SignIn from "@/views/auth/SignIn";
import SignUp from "@/views/auth/SignUp";

export const authRoutes = [
    {
        name: 'SignIn',
        path: '/auth/sign-in',
        component: SignIn
    },
    {
        name: 'SignUp',
        path: '/auth/sign-up',
        component: SignUp
    },
];

export const authRouter = authRoutes.filter(function (x) {
    return x !== null;
})