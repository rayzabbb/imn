import axios from "axios";

// export const addUser = async (user) => {
//   const response = await axios.post("http://localhost:8080/api/users/signup", user);
//   // נניח שכאן יש לנו את ה-ID של המשתמש מהשרת לאחר ההתחברות
//   const userId = response.data.id; // לדוגמה
//   localStorage.setItem('userId', userId); // שמירת ה-ID ב-localStorage
//   return response.data;
// }

export const loginUser = async (user) => {
    try {
  const response = await axios.post("http://localhost:8080/api/user/Login", user);
  
  return response.data;
} catch (error) {
    console.error('Error fetching categories:', error);
    return Promise.reject(error);  // מבטיח שנסגרת התשובה עם שגיאה
}
}
