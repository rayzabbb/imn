import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { signUp } from '../../slices/userSlice';
import './Auth.css';

const initialForm = {
  username: '',
  password: '',
  email: '',
  phone: '',
};

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.user);

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = 'יש להזין שם משתמש';
    if (!form.password || form.password.length < 4) errors.password = 'סיסמה חייבת להכיל לפחות 4 תווים';
    if (!form.email.trim()) {
      errors.email = 'יש להזין אימייל';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errors.email = 'כתובת אימייל לא תקינה';
    }
    if (!form.phone.trim()) {
      errors.phone = 'יש להזין מספר טלפון';
    } else if (!/^\d{7,10}$/.test(form.phone.trim())) {
      errors.phone = 'מספר טלפון לא תקין (ספרות בלבד)';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitError(null);
    try {
      await dispatch(
        signUp({
          username: form.username.trim(),
          password: form.password,
          email: form.email.trim(),
          phone: Number(form.phone.trim()),
        })
      ).unwrap();

      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(typeof err === 'string' ? err : 'אירעה שגיאה בהרשמה. נסו שוב.');
    }
  };

  return (
    <div className="auth-page" dir="rtl">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-header">
          <h1>הרשמה</h1>
          <p>צרו חשבון כדי להתחיל לפרסם חפצים</p>
        </div>

        {submitError && (
          <div className="auth-banner">
            <ErrorOutlineIcon fontSize="small" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="username">
            <PersonOutlineIcon fontSize="inherit" /> שם משתמש
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            className={fieldErrors.username ? 'auth-input--error' : ''}
          />
          {fieldErrors.username && <span className="auth-field-error">{fieldErrors.username}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="password">
            <LockOutlinedIcon fontSize="inherit" /> סיסמה
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className={fieldErrors.password ? 'auth-input--error' : ''}
          />
          {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="email">
            <EmailOutlinedIcon fontSize="inherit" /> אימייל
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="example@mail.com"
            className={fieldErrors.email ? 'auth-input--error' : ''}
          />
          {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="phone">
            <PhoneOutlinedIcon fontSize="inherit" /> טלפון
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="0501234567"
            className={fieldErrors.phone ? 'auth-input--error' : ''}
          />
          {fieldErrors.phone && <span className="auth-field-error">{fieldErrors.phone}</span>}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          <HowToRegIcon fontSize="small" />
          {loading ? 'נרשם...' : 'הרשמה'}
        </button>

        <div className="auth-switch">
          כבר יש לכם חשבון? <Link to="/login" state={location.state}>התחברות</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
