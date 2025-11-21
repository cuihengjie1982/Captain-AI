import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppRoute } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Diagnosis from './pages/Diagnosis';
import Solution from './pages/Solution';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path={AppRoute.LOGIN} element={<Login />} />
          <Route path={AppRoute.BLOG} element={<Blog />} />
          <Route path={AppRoute.BLOG_DETAIL} element={<BlogDetail />} />
          <Route path={AppRoute.DIAGNOSIS} element={<Diagnosis />} />
          <Route path={AppRoute.SOLUTION} element={<Solution />} />
          <Route path={AppRoute.DASHBOARD} element={<Dashboard />} />
          <Route path={AppRoute.ADMIN} element={<Admin />} />
          <Route path="*" element={<Navigate to={AppRoute.BLOG} replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;