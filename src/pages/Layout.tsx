import React, { ReactNode } from "react";
import Footer from "./Layout/Footer";
import Header from "./Layout/Header";
import LeftNavBar from "./Layout/LeftNavBar";
import RightNavBar from "./Layout/RightNavBar";
import './style.css'

interface LayoutProps {
  children: ReactNode;
}
function Layout({ children }: LayoutProps) {
  return (
    <main className="layout">
      <Header />
      <div className="layoutBody">
        <LeftNavBar/>
        <div className="childBody">
          {children}
          <Footer />
        </div>
        <RightNavBar />
      </div>
    </main>
  );
}

export default Layout;
