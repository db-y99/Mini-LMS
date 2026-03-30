import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuditProvider } from '@/contexts/AuditContext';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Mini-LMS CSKH Dashboard',
  description: 'Hệ thống quản lý khoản vay',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <AuditProvider>
            <WorkflowProvider>
              {children}
            </WorkflowProvider>
          </AuditProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
