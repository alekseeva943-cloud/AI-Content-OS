/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './shared/components/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { ContentPlanner } from './pages/modules/ContentPlanner';
import { Newsletters } from './pages/modules/Newsletters';
import { Podcasts } from './pages/modules/Podcasts';
import { VideoAvatar } from './pages/modules/VideoAvatar';
import { Longreads } from './pages/modules/Longreads';
import { FavoritesPage } from './pages/FavoritesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="planner" element={<ContentPlanner />} />
          <Route path="newsletters" element={<Newsletters />} />
          <Route path="podcasts" element={<Podcasts />} />
          <Route path="avatars" element={<VideoAvatar />} />
          <Route path="longreads" element={<Longreads />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

