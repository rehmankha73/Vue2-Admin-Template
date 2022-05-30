import axios from 'axios';

export class UsersService {
    async fetchAll() {
        // return (await axios.get('/users')).data;
        console.log((await axios.get('/api/companies')).data.data, 'companies')
        // return (await axios.get('/users.json')).data;
    }

    async fetchOne(id) {
        // return (await axios.get('/users/' + id)).data;
        return (await axios.get('/companies/' + id)).data.data;
    }

    async update(user) {
        // return (await axios.patch('/users', user)).data;
        return (await axios.patch('/companies/'+ user.id, user)).data.data;
    }

    async create(user) {
        // return (await axios.post('/users', user)).data;
        return (await axios.post('/companies', user)).data.data;
    }

    async delete(user) {
        // return (await axios.delete('/users/' + user.id)).data;
        return (await axios.delete('/companies/' + user.id)).data.data;
    }
}
