import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "الحجوزات", end: true },
  { to: "/courts", label: "الملاعب" },
  { to: "/closures", label: "الإغلاقات" },
];

export default function Layout() {
  const { username, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col justify-between bg-court-900 text-white md:w-56">
        <div>
          <div className="flex items-center justify-between px-5 py-4 md:justify-start md:gap-2 md:py-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ball-500 text-court-900 font-black">
                Z
              </span>
              <span className="text-lg font-extrabold">Z Padel</span>
            </div>
            <button onClick={logout} className="text-xs text-court-100/80 underline md:hidden">
              {username} · خروج
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:mt-4 md:flex-col md:space-y-1 md:overflow-visible md:pb-0">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-court-700 text-white" : "text-court-100/80 hover:bg-court-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden border-t border-court-800 px-5 py-4 text-sm md:block">
          <p className="mb-2 text-court-200">{username}</p>
          <button onClick={logout} className="text-court-100/80 underline hover:text-white">
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
