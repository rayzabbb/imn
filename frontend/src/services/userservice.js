import axios from "axios";

export const addUser = async (user) => {
  try {
    const response = await axios.post("http://localhost:8080/api/user/addUser", user);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    return Promise.reject(error);
  }
};

// Creates a real account, rejecting a duplicate username (unlike addUser above).
export const registerUser = async (user) => {
  try {
    const response = await axios.post("http://localhost:8080/api/user/RegisterUser", user);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    return Promise.reject(error);
  }
};

export const loginUser = async ({ username, password }) => {
  try {
    const response = await axios.post("http://localhost:8080/api/user/Login", { username, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    return Promise.reject(error);
  }
};
