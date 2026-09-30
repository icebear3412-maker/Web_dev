import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { publicRoutes } from '@/routes';
import DefaultLayout from '@/layouts/DefaultLayout';
import AdminLayout from '@/layouts/AdminLayout';
import MovieListPage from '@/pages/Admin/Movies';
import type { IRoute } from '@/types';
//import PrivateRoute from '@/routes/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Admin - Movie List */}
        <Route
          path="/admin/movies"
          element={
            <AdminLayout>
              <MovieListPage />
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
