import Navbar from "./Navbar.jsx";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default Layout;
