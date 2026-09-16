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

export const loginUser = async (user) => {
    try {
  const response = await axios.post("http://localhost:8080/api/user/Login", user);
  
  return response.data;
} catch (error) {
    console.error('Error fetching categories:', error);
    return Promise.reject(error);  // מבטיח שנסגרת התשובה עם שגיאה
}
}
