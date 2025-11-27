import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginPic from '../assets/login.jpg';
import { loginUser, clearError } from '../../redux/slices/authSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { mergeCart } from '../../redux/slices/cartSlice.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading, error } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  // Get redirect parameter and check if its checkout or otherwise
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';
  const isCheckoutRedirect = redirect.includes('checkout');

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? '/checkout' : '/');
        });
      } else {
        navigate(redirect);
      }
    }
  }, [dispatch, navigate, cart, user, guestId, isCheckoutRedirect]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-4">
            <h2 className="text-xl font-semibold">Stitches</h2>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Hey there!</h2>
          <p className="text-center">Enter your username and password to log in</p>
          {error && (
            <p className="text-red-500 text-center text-sm tracking-tight">
              {error || 'An unexpected error occured. Please try again later.'}
            </p>
          )}
          <div className="mt-4 mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              className="w-full rounded border p-1.5"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              className="w-full rounded border p-1.5"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded font-semibold hover:bg-gray-800 transition"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <p className="mt-6 text-center text-sm">
            Don't have an account?&nbsp;
            <Link
              to={
                redirect === '/'
                  ? `/register`
                  : `/register?redirect=${encodeURIComponent(redirect)}`
              }
              className="text-red-600 underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:block w-1/2  bg-gray-600">
        <div className="h-full flex flex-col justify-center items-center">
          <img src={LoginPic} alt="Login to Account" className="h-[600px] w-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Login;
