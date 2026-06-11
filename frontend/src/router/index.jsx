import { Navigate, createBrowserRouter } from 'react-router-dom';

import MainLayout from '@/layouts/MainLayout';
import EtfReportPage from '@/pages/EtfReport';
import EventTimelinePage from '@/pages/EventTimeline';
import HomePage from '@/pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'article/event-timeline',
        element: <EventTimelinePage />,
      },
      {
        path: 'etf/:code',
        element: <EtfReportPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
]);
