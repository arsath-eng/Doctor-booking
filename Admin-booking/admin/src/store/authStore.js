import { writable } from 'svelte/store';

const getStoredUser = () => {
  if (typeof localStorage !== 'undefined') {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
  }
  return null;
};

const createUserStore = () => {
  const { subscribe, set } = writable(getStoredUser());

  return {
    subscribe,
    login: (userData) => {
      const mockUser = {
        name: 'Alex Doe',
        email: 'alex.doe@example.com',
        picture: `https://i.pravatar.cc/150?u=${Date.now()}`
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      set(mockUser);
    },
    logout: () => {
      localStorage.removeItem('user');
      set(null);
    }
  };
};

export const authStore = createUserStore();