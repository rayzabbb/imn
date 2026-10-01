import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginIcon from '@mui/icons-material/Login';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { login } from '../../slices/userSlice';
import './Auth.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.user);

  const [form, setForm] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = 'יש להזין שם משתמש';
    if (!form.password) errors.password = 'יש להזין סיסמה';
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
        login({ username: form.username.trim(), password: form.password })
      ).unwrap();

      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(typeof err === 'string' ? err : 'שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <div className="auth-page" dir="rtl">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-header">
          <h1>התחברות</h1>
          <p>התחברו כדי לפרסם חפצים ולנהל את הפרסומים שלכם</p>
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
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className={fieldErrors.password ? 'auth-input--error' : ''}
          />
          {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          <LoginIcon fontSize="small" />
          {loading ? 'מתחבר...' : 'התחברות'}
        </button>

        <div className="auth-switch">
          עדיין אין לכם חשבון? <Link to="/signup" state={location.state}>הרשמה</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
