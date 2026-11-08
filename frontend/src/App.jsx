
import { useEffect, useState } from "react";

import ClothingListings from "./components/ClothingListings";
import ListClothing from "./components/ListClothing";
import ItemDetails from "./components/ItemDetails";
import MyListings from "./components/MyListings";
import SwapRequests from "./components/SwapRequests";
import SwapHistory from "./components/SwapHistory";
import Messages from "./components/Messages";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedItem, setSelectedItem] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    profileInformation: "",
  });

  // NAVIGATION
  const navigateTo = (nextPage) => {
    window.history.pushState(
      { currentPage: nextPage },
      "",
      window.location.pathname
    );

    setCurrentPage(nextPage);
  };

  // BROWSER BACK BUTTON
  useEffect(() => {
    const handlePopState = (event) => {
      setCurrentPage(
        event.state?.currentPage || "dashboard"
      );
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setCurrentPage("dashboard");

        window.history.replaceState(
          { currentPage: "dashboard" },
          "",
          window.location.pathname
        );
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch {
      setError("Unable to connect to the server.");
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Account created successfully! Please sign in."
        );

        setRegisterData({
          name: "",
          email: "",
          password: "",
          location: "",
          profileInformation: "",
        });

        setTimeout(() => {
          setPage("login");
          setMessage("");
        }, 1500);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Unable to connect to the server.");
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setPage("login");
    setCurrentPage("dashboard");
    setSelectedItem(null);

    setLoginData({
      email: "",
      password: "",
    });

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  // BROWSE CLOTHING
  if (user && currentPage === "browse") {
    return (
      <ClothingListings
        goToDashboard={() => navigateTo("dashboard")}
        viewItem={(item) => {
          setSelectedItem(item);
          navigateTo("details");
        }}
      />
    );
  }

  // ITEM DETAILS
  if (user && currentPage === "details") {
    return (
      <ItemDetails
        item={selectedItem}
        user={user}
        goBack={() => navigateTo("browse")}
      />
    );
  }

  // LIST CLOTHING
  if (user && currentPage === "list") {
    return (
      <ListClothing
        user={user}
        goToDashboard={() => navigateTo("dashboard")}
      />
    );
  }

  // MY LISTINGS
  if (user && currentPage === "my-listings") {
    return (
      <MyListings
        user={user}
        goToDashboard={() => navigateTo("dashboard")}
      />
    );
  }

  // SWAP REQUESTS
  if (user && currentPage === "swap-requests") {
    return (
      <SwapRequests
        user={user}
        goToDashboard={() => navigateTo("dashboard")}
      />
    );
  }

  // SWAP HISTORY
  if (user && currentPage === "swap-history") {
    return (
      <SwapHistory
        user={user}
        goToDashboard={() => navigateTo("dashboard")}
      />
    );
  }

  // MESSAGES
  if (user && currentPage === "messages") {
    return (
      <Messages
        user={user}
        goToDashboard={() => navigateTo("dashboard")}
      />
    );
  }

  // DASHBOARD
  if (user) {
    return (
      <div className="min-vh-100 bg-light">

        {/* NAVBAR */}
        <nav className="navbar bg-white border-bottom">
          <div className="container py-2">

            <div className="d-flex align-items-center">
              <div
                className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "42px",
                  height: "42px",
                  fontSize: "20px",
                }}
              >
                ♻
              </div>

              <span className="fw-bold text-success fs-4">
                ClothSwap
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small">
                {user.name}
              </span>

              <button
                className="btn btn-outline-success btn-sm"
                onClick={logout}
              >
                Logout
              </button>
            </div>

          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="container py-5">

          {/* WELCOME */}
          <div className="mb-5">
            <div className="text-success fw-semibold small mb-2">
              CLOTHSWAP DASHBOARD
            </div>

            <h1 className="fw-bold mb-2">
              Welcome back, {user.name} 👋
            </h1>

            <p className="text-muted mb-0">
              Find clothes you love. Swap what you no longer need.
            </p>
          </div>

          {/* MAIN ACTIONS */}
          <div className="row g-4 mb-5">

            {/* BROWSE */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">

                  <div className="fs-1 mb-3">👕</div>

                  <h4 className="fw-bold">
                    Browse Clothes
                  </h4>

                  <p className="text-muted">
                    Explore clothing items available for swapping
                    from other users.
                  </p>

                  <button
                    className="btn btn-success px-4"
                    onClick={() => navigateTo("browse")}
                  >
                    Browse Clothes
                  </button>

                </div>
              </div>
            </div>

            {/* LIST ITEM */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">

                  <div className="fs-1 mb-3">➕</div>

                  <h4 className="fw-bold">
                    List an Item
                  </h4>

                  <p className="text-muted">
                    Have clothes you no longer need? List them
                    and find someone to swap with.
                  </p>

                  <button
                    className="btn btn-success px-4"
                    onClick={() => navigateTo("list")}
                  >
                    List Clothing
                  </button>

                </div>
              </div>
            </div>

          </div>

          {/* ACTIVITY */}
          <div className="mb-3">
            <h4 className="fw-bold">
              Your Activity
            </h4>

            <p className="text-muted">
              Keep track of your clothing exchange activity.
            </p>
          </div>

          <div className="row g-4 mb-5">

            {/* MY LISTINGS */}
            <div className="col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => navigateTo("my-listings")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateTo("my-listings");
                  }
                }}
              >
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">
                        My Listings
                      </h6>

                      <h2 className="fw-bold mb-0">
                        View
                      </h2>
                    </div>

                    <div className="fs-2">👕</div>
                  </div>

                  <p className="text-success small mt-3 mb-0">
                    Manage your clothing listings →
                  </p>

                </div>
              </div>
            </div>

            {/* SWAP REQUESTS */}
            <div className="col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => navigateTo("swap-requests")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateTo("swap-requests");
                  }
                }}
              >
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">
                        Swap Requests
                      </h6>

                      <h2 className="fw-bold mb-0">
                        View
                      </h2>
                    </div>

                    <div className="fs-2">🔄</div>
                  </div>

                  <p className="text-success small mt-3 mb-0">
                    Track incoming and sent requests →
                  </p>

                </div>
              </div>
            </div>

            {/* SWAP HISTORY */}
            <div className="col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => navigateTo("swap-history")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateTo("swap-history");
                  }
                }}
              >
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">
                        Swap History
                      </h6>

                      <h2 className="fw-bold mb-0">
                        View
                      </h2>
                    </div>

                    <div className="fs-2">📜</div>
                  </div>

                  <p className="text-success small mt-3 mb-0">
                    View your accepted exchanges →
                  </p>

                </div>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => navigateTo("messages")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateTo("messages");
                  }
                }}
              >
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">
                        Messages
                      </h6>

                      <h2 className="fw-bold mb-0">
                        View
                      </h2>
                    </div>

                    <div className="fs-2">💬</div>
                  </div>

                  <p className="text-success small mt-3 mb-0">
                    Chat with other users →
                  </p>

                </div>
              </div>
            </div>

          </div>

          {/* PROFILE */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              <h5 className="fw-bold mb-4">
                Account Information
              </h5>

              <div className="row">

                <div className="col-md-4 mb-3 mb-md-0">
                  <small className="text-muted">Name</small>
                  <div className="fw-semibold mt-1">
                    {user.name}
                  </div>
                </div>

                <div className="col-md-4 mb-3 mb-md-0">
                  <small className="text-muted">Email</small>
                  <div className="fw-semibold mt-1">
                    {user.email}
                  </div>
                </div>

                <div className="col-md-4">
                  <small className="text-muted">Location</small>
                  <div className="fw-semibold mt-1">
                    📍 {user.location}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </main>
      </div>
    );
  }

  // REGISTRATION PAGE
  if (page === "register") {
    return (
      <div
        className="min-vh-100 d-flex align-items-center py-5"
        style={{ backgroundColor: "#f4f8f5" }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-11 col-sm-9 col-md-7 col-lg-5">

              <div className="text-center mb-4">
                <div
                  className="bg-success text-white rounded-circle mx-auto d-flex align-items-center justify-content-center mb-1"
                  style={{
                    width: "65px",
                    height: "65px",
                    fontSize: "30px",
                  }}
                >
                  ♻
                </div>

                <h1 className="fw-bold text-success mb-1">
                  ClothSwap
                </h1>

                <p className="text-muted">
                  Give your clothes a second life.
                </p>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">

                  <h2 className="fw-bold mb-1">
                    Create your account
                  </h2>

                  <p className="text-muted mb-4">
                    Join the ClothSwap community.
                  </p>

                  <form onSubmit={handleRegister}>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-start d-block">
                        Full name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your name"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-start d-block">
                        Email address
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-start d-block">
                        Password
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-start d-block">
                        Location
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Udupi"
                        value={registerData.location}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            location: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-start d-block">
                        Profile information
                        <span className="text-muted fw-normal">
                          {" "} (optional)
                        </span>
                      </label>

                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Tell something about yourself"
                        value={registerData.profileInformation}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            profileInformation: e.target.value,
                          })
                        }
                      />
                    </div>

                    {error && (
                      <div className="alert alert-danger py-2">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="alert alert-success py-2">
                        {message}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-success w-100"
                    >
                      Create Account
                    </button>

                  </form>

                  <div className="text-center mt-4">
                    <span className="text-muted">
                      Already have an account?
                    </span>

                    <button
                      type="button"
                      className="btn btn-link text-success fw-semibold text-decoration-none p-0 ms-1"
                      onClick={() => {
                        setPage("login");
                        setError("");
                        setMessage("");
                      }}
                    >
                      Sign in
                    </button>
                  </div>

                </div>
              </div>

              <p className="text-center text-muted small mt-4">
                Sustainable fashion starts with sharing. 🌱
              </p>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN PAGE
  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ backgroundColor: "#f4f8f5" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">

            <div className="text-center mb-4">
              <div
                className="bg-success text-white rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  fontSize: "30px",
                }}
              >
                ♻
              </div>

              <h1 className="fw-bold text-success mb-1">
                ClothSwap
              </h1>

              <p className="text-muted">
                Give your clothes a second life.
              </p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">

                <h2 className="fw-bold mb-1">
                  Welcome back
                </h2>

                <p className="text-muted mb-4">
                  Sign in to continue to your account.
                </p>

                <form onSubmit={handleLogin}>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-start d-block">
                      Email address
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-start d-block">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                  >
                    Sign In
                  </button>

                </form>

                <div className="text-center mt-4">
                  <span className="text-muted">
                    Don't have an account?
                  </span>

                  <button
                    type="button"
                    className="btn btn-link text-success fw-semibold text-decoration-none p-0 ms-1"
                    onClick={() => {
                      setPage("register");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Create an account
                  </button>
                </div>

              </div>
            </div>

            <p className="text-center text-muted small mt-4">
              Sustainable fashion starts with sharing. 🌱
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
