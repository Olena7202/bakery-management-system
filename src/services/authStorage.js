const USERS_KEY = "bakery_users";
const CURRENT_USER_KEY = "bakery_current_user";

function readJson(key, fallbackValue) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return fallbackValue;

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers() {
  return readJson(USERS_KEY, []);
}

export function getCurrentUser() {
  return readJson(CURRENT_USER_KEY, null);
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getDashboardPathByRole(role) {
  return role === "confectioner" ? "/confectioner" : "/client";
}

export function registerUser({ fullName, email, password, role }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const alreadyExists = users.some((user) => user.email === normalizedEmail);

  if (alreadyExists) {
    return { ok: false, message: "Користувач з таким email вже існує." };
  }

  const newUser = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role
  };

  users.push(newUser);
  saveJson(USERS_KEY, users);
  saveJson(CURRENT_USER_KEY, newUser);
  return { ok: true, user: newUser };
}

export function loginUser({ email, password }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const matchedUser = users.find(
    (user) => user.email === normalizedEmail && user.password === password
  );

  if (!matchedUser) {
    return { ok: false, message: "Неправильний email або пароль." };
  }

  saveJson(CURRENT_USER_KEY, matchedUser);
  return { ok: true, user: matchedUser };
}
