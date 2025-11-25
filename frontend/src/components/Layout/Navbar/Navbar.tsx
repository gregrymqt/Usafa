import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../features/Auth/hooks/useAuth';
import UserDropdown from './components/userDropDown';
// Certifique-se que o caminho está certo para o arquivo acima

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth(); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Função auxiliar para fechar a sidebar (passada pro filho)
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <Link to="/" onClick={closeSidebar}>
            <span>Usafa</span>
          </Link>
        </div>

        <div className={styles.menuIcon} onClick={toggleSidebar}>
          {isSidebarOpen ? <FaTimes className={styles.faTimes} /> : <FaBars />}
        </div>

        <ul className={`${styles.navMenu} ${isSidebarOpen ? styles.active : ''}`}>
          <li className={styles.navItem}>
            <Link to="/consulta" className={styles.navLinks} onClick={closeSidebar}>
              Consultas
            </Link>
          </li>

          {/* Lógica para o MENU MOBILE */}
          <li className={styles.navItemLogin}>
            {isAuthenticated ? (
              <UserDropdown closeSidebar={closeSidebar} />
            ) : (
              <Link to="/login" className={styles.navLinksLogin} onClick={closeSidebar}>
                Entrar
              </Link>
            )}
          </li>
        </ul>

        {/* Lógica para o MENU DESKTOP */}
        <div className={styles.navLogin}>
          {isAuthenticated ? (
            <UserDropdown closeSidebar={closeSidebar} />
          ) : (
            <Link to="/login" className={styles.btn}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;