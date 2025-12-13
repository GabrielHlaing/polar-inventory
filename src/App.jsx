import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Inventory from "./pages/Inventory";
import InventoryDetail from "./pages/ItemDetail";
import { DashboardProvider } from "./contexts/DashboardContext";
import { ItemsProvider } from "./contexts/ItemsContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { HistoryProvider } from "./contexts/HistoryContext";
import { ProfileProvider } from "./contexts/ProfileContext";

import Cart from "./pages/Cart";
import Home from "./pages/Home";
import History from "./pages/History";
import Settings from "./pages/Settings";
import PrintInvoice from "./components/PrintInvoice";

import AdminRoute from "./routes/AdminRoute";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import MoreInfo from "./static pages/MoreInfo";
import Tutorial from "./static pages/Tutorial";
import Contact from "./static pages/Contact";
import Protect from "./routes/Protect";
import { ToastContainer } from "react-toastify";
import { SyncProvider } from "./contexts/SyncContext";
import Header from "./components/Header";

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <DashboardProvider>
          <ProfileProvider>
            <ItemsProvider>
              <CartProvider>
                <HistoryProvider>
                  <>
                    <Header />
                    <Navbar />

                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Protect>
                            <Home />
                          </Protect>
                        }
                      />
                      <Route
                        path="/more-info"
                        element={
                          <Protect>
                            <MoreInfo />
                          </Protect>
                        }
                      />
                      <Route
                        path="/tutorial"
                        element={
                          <Protect>
                            <Tutorial />
                          </Protect>
                        }
                      />
                      <Route
                        path="/contact"
                        element={
                          <Protect>
                            <Contact />
                          </Protect>
                        }
                      />

                      <Route
                        path="/inventory"
                        element={
                          <Protect>
                            <Inventory />
                          </Protect>
                        }
                      />
                      <Route
                        path="/inventory/:id"
                        element={
                          <Protect>
                            <InventoryDetail />
                          </Protect>
                        }
                      />
                      <Route
                        path="/cart"
                        element={
                          <Protect>
                            <Cart />
                          </Protect>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <Protect>
                            <Profile />
                          </Protect>
                        }
                      />
                      <Route
                        path="/history"
                        element={
                          <Protect>
                            <History />
                          </Protect>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <Protect>
                            <Settings />
                          </Protect>
                        }
                      />
                      <Route
                        path="/history/:id/print"
                        element={
                          <Protect>
                            <PrintInvoice />
                          </Protect>
                        }
                      />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminPanel />
                          </AdminRoute>
                        }
                      />
                    </Routes>

                    {/* Toast container */}
                    <ToastContainer
                      position="bottom-center"
                      autoClose={3000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      pauseOnHover
                      draggable
                      theme="dark"
                    />
                  </>
                </HistoryProvider>
              </CartProvider>
            </ItemsProvider>
          </ProfileProvider>
        </DashboardProvider>
      </SyncProvider>
    </AuthProvider>
  );
}
