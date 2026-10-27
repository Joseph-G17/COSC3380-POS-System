import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginLayout = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to sign in');

      const employeeID = Number(data.employeeID);
      const role = Number(data.Role);
      if (!Number.isSafeInteger(employeeID) || employeeID < 1 || !Number.isInteger(role)) {
        throw new Error('The login response was invalid');
      }

      sessionStorage.setItem('employeeID', String(employeeID));

      if (role === 0) navigate('/admin');
      else if (role === 1) navigate('/cashier');
      else navigate('/');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-7">
      <div className="inline-flex w-screen items-center justify-center">
        <img src="/SaveSolLogo.png" alt="logo" className="h-30 w-30" />
        <h1 className="text-6xl font-extralight">SaveSo</h1>
      </div>
      <form className="mt-14 justify-self-center" onSubmit={submitLogin}>
        {error && <p className="mb-4 text-red-700" role="alert">{error}</p>}
        <div className="mb-14">
          <p className="flex flex-col gap-2 p-2 font-light">
            <label htmlFor="username" className="text-3xl">Email or username:</label>
            <input
              required
              className="input-bar p-3"
              type="text"
              id="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </p>
          <p className="flex flex-col gap-2 p-2 font-light">
            <label htmlFor="password" className="text-3xl">Password:</label>
            <input
              required
              className="input-bar p-3"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </p>
        </div>
        <div className="flex justify-between">
          <button
            className="rounded button-highlight border p-2 text-2xl font-light disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Submit'}
          </button>
          <button
            className="rounded button-highlight border p-2 text-2xl font-light"
            type="button"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginLayout;
