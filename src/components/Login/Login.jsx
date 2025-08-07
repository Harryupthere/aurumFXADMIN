import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import useApiRequest from "../../hook/useApiRequest";
import { API_ENDPOINTS } from "../../constants/endPoints";
import { successMsg, errorMsg } from "../../utils/customFn";
import { isloginSuccess } from "../../redux/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
    const { fetchData } = useApiRequest();
  const { auth_token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);


    try{
      console.log("Login request initiated with username:", username);
        const response = await fetchData(API_ENDPOINTS.LOGIN, navigate, "POST", { username, password });

        console.log(response)
        if (response.success) {
            localStorage.setItem('isAuthenticated', 'true');
             localStorage.setItem("auth_token", response.data.token);
             localStorage.setItem("username", username);
             dispatch(isloginSuccess());
            navigate('/dashboard');

        } else {
            errorMsg(response.message);
            setLoading(false);
        }
    }catch(error){
      console.log("Login error:")
        errorMsg(error.message);
        setLoading(false);
        console.error("Login error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="login-header">
          <h1>AurumFX Admin</h1>
          <p>Sign in to your account</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
