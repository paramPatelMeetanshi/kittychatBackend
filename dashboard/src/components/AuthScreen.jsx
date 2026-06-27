import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CAT_AVATARS } from "../avatars";

const CAT_OPTIONS = ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6"];

export default function AuthScreen({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("cat1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, name, avatar);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-cream grain">
      <div className="bg-white border border-warm rounded-2xl p-8 w-full max-w-sm shadow-lifted">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-brand">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-heading text-xl font-bold text-dark-900">KittyChat</h1>
        </div>
        <p className="text-dark-400 text-sm mb-6">
          {isLogin ? "Sign in to your dashboard" : "Create your account"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required={!isLogin}
                className="w-full px-4 py-2.5 bg-sand border border-warm rounded-xl text-dark-900 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand-300 text-sm"
              />

              {/* Avatar picker */}
              <div>
                <p className="text-xs font-medium text-dark-500 mb-2">Choose your cat avatar</p>
                <div className="grid grid-cols-6 gap-2">
                  {CAT_OPTIONS.map((cat, i) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAvatar(cat)}
                      className={`w-full aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                        avatar === cat
                          ? "border-brand ring-2 ring-brand/30 scale-110"
                          : "border-warm hover:border-dark-200"
                      }`}
                    >
                      <img src={CAT_AVATARS[i]} alt={cat} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2.5 bg-sand border border-warm rounded-xl text-dark-900 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand-300 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-2.5 bg-sand border border-warm rounded-xl text-dark-900 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand-300 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm shadow-brand"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-dark-400 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-brand hover:text-brand-600 font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
