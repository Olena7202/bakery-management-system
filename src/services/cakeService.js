import api from '../api/axiosConfig'

export async function getCakes() {
    const response = await api.get('/cakes');
    return response.data;
}

export async function getCakesById(id) {
    const response = await api.get(`/cakes/${id}`);
    return response.data;
}

export async function getCategories() {
    const response = await api.get('/categories');
    return response.data;
}

export async function getBiscuits() {
    const response = await api.get('/biscuits')
}

export async function getCreams() {
    const response = await api.get('/creams')
}

export async function getSavedCakes(clientId) {
    const response = api.get(`/savedcakes/client/${clientId}`);
    return (await response).data;
}

export async function saveCake(clientId, cakeId) {
    const response = await api.get('/bsavedcakes', { clientId, cakeId });
}

export async function unsaveCake() {
    const response = await api.delete(`/savedcakes/${savedCakeId}`)
}