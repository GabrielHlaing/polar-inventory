import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import AuthReady from "./components/AuthReady";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ProfileProvider>
      <AuthProvider>
        <SyncProvider>
          <ErrorBoundary>
            <AuthReady>
              <DashboardProvider>
                <ItemsProvider>
                  <CartProvider>
                    <HistoryProvider>
                      <>
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

                        <ToastContainer
                          position="top-right" // clears bottom-center overlap
                          autoClose={3000}
                          hideProgressBar={false}
                          newestOnTop
                          closeOnClick
                          pauseOnHover
                          draggable
                          theme="light" // light card
                          style={{
                            marginBottom: "70px", // same as your navbar height
                            marginLeft: "12px",
                          }}
                          toastStyle={{
                            backgroundColor: "#ffffff",
                            color: "#1e2a4a",
                            border: "1px solid #004c97",
                            borderRadius: "8px",
                            fontSize: "14px",
                            boxShadow: "0 4px 12px rgba(0,0,0,.15)",
                          }}
                          progressStyle={{
                            background: "#004c97", // blue progress bar
                            height: "3px",
                          }}
                        />
                      </>
                    </HistoryProvider>
                  </CartProvider>
                </ItemsProvider>
              </DashboardProvider>
            </AuthReady>
          </ErrorBoundary>
        </SyncProvider>
      </AuthProvider>
    </ProfileProvider>
  );
}
