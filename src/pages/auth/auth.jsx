
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "feather-icons-react/build/IconComponents";
import { login02, loginicon01, loginicon02, loginicon03, loginlogo } from "../../components/imagepath";
import { loginKeycloak } from "../../auth/authService";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const Auth = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Puedes dejar los valores fijos o usar los del formulario
    const user = username;
    const pass = password;
    const result = await loginKeycloak(user, pass);
    setLoading(false);
    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <div className="main-wrapper login-body">
        <div className="container-fluid px-0">
          <div className="row">
            <div className="col-lg-6 login-wrap">
              <div className="login-sec">
                <div className="log-img">
                  <img className="img-fluid" src={login02} alt="#" />
                </div>
              </div>
            </div>
            <div className="col-lg-6 login-wrap-bg">
              <div className="login-wrapper">
                <div className="loginbox">
                  <div className="login-right">
                    <div className="login-right-wrap">
                      <div className="account-logo">
                        <Link to="/admin-dashboard">
                          <img src={loginlogo} alt="#" />
                        </Link>
                      </div>
                      <h2>Auth</h2>
                      <form onSubmit={handleSubmit}>
                        <div className="form-group">
                          <label>
                            Usuario <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            autoComplete="username"
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            Password <span className="login-danger">*</span>
                          </label>
                          <input
                            type={passwordVisible ? "text" : "password"}
                            className="form-control pass-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            autoComplete="current-password"
                          />
                          <span
                            className="toggle-password"
                            onClick={togglePasswordVisibility}
                          >
                            {passwordVisible ? (
                              <EyeOff className="react-feather-custom" />
                            ) : (
                              <Eye className="react-feather-custom" />
                            )}
                          </span>
                        </div>
                        {error && (
                          <div className="alert alert-danger" role="alert">
                            {error}
                          </div>
                        )}
                        <div className="form-group login-btn">
                          <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                          >
                            {loading ? "Ingresando..." : "Login"}
                          </button>
                        </div>
                      </form>
                      <div className="next-sign">
                        <p className="account-subtitle">
                          Need an account? <Link to="/signup">Sign Up</Link>
                        </p>
                        <div className="social-login">
                          <Link to="#">
                            <img src={loginicon01} alt="#" />
                          </Link>
                          <Link to="#">
                            <img src={loginicon02} alt="#" />
                          </Link>
                          <Link to="#">
                            <img src={loginicon03} alt="#" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
