const STORAGE_KEY = 'digitalmasadepan_user';
const USERS_KEY = 'digitalmasadepan_users';

function getCurrentUser() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try { return JSON.parse(saved); } catch (_) { return null; }
    }
    return null;
}

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (users[email] && users[email].password === password) {
        const name = users[email].name || email.split('@')[0];
        const user = { email, name };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
    }
    return null;
}

function registerUser(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (users[email]) return null;
    const name = email.split('@')[0];
    users[email] = { password, name };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const user = { email, name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
}

function logoutUser() {
    localStorage.removeItem(STORAGE_KEY);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}