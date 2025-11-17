import React, { useState } from 'react';
import styles from './styles.module.scss';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <a href="/">
            {/* Insira sua logo aqui */}
            <span>Usafa</span>
          </a>
        </div>

        <div className={styles.menuIcon} onClick={toggleSidebar}>
          {isSidebarOpen ? <FaTimes className={styles.faTimes} /> : <FaBars />}
        </div>

        <ul className={`${styles.navMenu} ${isSidebarOpen ? styles.active : ''}`}>
          <li className={styles.navItem}>
            <a href="/consultas" className={styles.navLinks}>
              Consultas
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/remedios" className={styles.navLinks}>
              Remédios
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/exames" className={styles.navLinks}>
              Exames
            </a>
          </li>
          <li className={styles.navItemLogin}>
            <a href="/login" className={styles.navLinksLogin}>
              Entrar
            </a>
          </li>
        </ul>

        <div className={styles.navLogin}>
          <a href="/login" className={styles.btn}>
            Entrar
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
