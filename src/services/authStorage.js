import api from '../api/axiosConfig';

const CURRENT_USER_KEY = "bakery_current_user";

export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('token');
}

export function getDashboardPathByRole(role) {
  return role === "confectioner" ? "/confectioner" : "/client";
}

export async function registerUser({ fullName, email, password, role }) {
  try {
    await api.post('/auth/register', {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: '',
      role: role === 'confectioner' ? 'Confectioner' : 'Client'
    });
    return await loginUser({ email, password });
  } catch (error) {
    const message = error.response?.data || 'Registration failed';
    return { ok: false, message };
  }
}


export async function loginUser({ email, password }) {
  try {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password
    });

    const { token, role, userId, name } = response.data;

    localStorage.setItem('token', token);
    const user = { id: userId, fullName: name, email, role: role.toLowerCase() };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { ok: true, user };
  } catch (error) {
    const message = error.response?.data || 'Invalid email or password!';
    return { ok: false, message };
  }
}
