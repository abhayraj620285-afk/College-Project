import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Listen to viewport resize for mobile drawer vs fixed sidebar
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setMobileNavOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas-base)',
        color: 'var(--color-text-primary)',
        position: 'relative',
      }}
    >
      {/* Accessible Skip-to-Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile Backdrop Overlay */}
      {isMobile && mobileNavOpen && (
        <div
          role="presentation"
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040,
            transition: 'opacity var(--transition-base)',
          }}
        />
      )}

      {/* Persistent / Drawer Sidebar */}
      <Sidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Content Area Frame */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        {/* Topbar Header */}
        <Topbar onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)} />

        {/* Route Content Viewport */}
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            outline: 'none',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        /* Responsive styles for AppShell */
        @media (min-width: 1024px) {
          .mobile-nav-toggle {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .mobile-nav-toggle {
            display: flex !important;
          }
          .topbar-search-slot {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .topbar-health-pill {
            display: none !important;
          }
          .user-profile-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
