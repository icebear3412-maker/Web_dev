import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { publicRoutes } from '@/routes';
import DefaultLayout from '@/layouts/DefaultLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPage from '@/pages/Adminpage';
import MovieListPage from '@/pages/Admin/Movies';
import AdminTransactionsPage from '@/pages/Admin/Transactions';
import type { IRoute } from '@/types';
//import PrivateRoute from '@/routes/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminPage />
            </AdminLayout>
          }
        />

        {/* Admin - Movie List */}
        <Route
          path="/admin/movies"
          element={
            <AdminLayout>
              <MovieListPage />
            </AdminLayout>
          }
        />

        {/* Admin - Transactions */}
        <Route
          path="/admin/transactions"
          element={
            <AdminLayout>
              <AdminTransactionsPage />
            </AdminLayout>
          }
        />

        {/* Public routes */}
        {publicRoutes.map((route: IRoute, index: number) => {
          const Page = route.component;
          let Layout = DefaultLayout;

          if (route.layout) {
            Layout = route.layout;
          } else if (route.layout === null) {
            Layout = Fragment;
          }

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}
      </Routes>
    </Router>
  );
};

export default App;
