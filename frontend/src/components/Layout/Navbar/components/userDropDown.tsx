import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCaretDown, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import styles from '../Navbar.module.scss'; 
import { useAuth } from '../../../../features/Auth/hooks/useAuth';

// Interface para receber a função do Pai
interface UserDropdownProps {
  closeSidebar: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Pegamos o 'user' para checar se ele é admin e o 'handleLogout' para sair
  const { user, handleLogout } = useAuth(); 
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lógica para verificar se é Admin
  // Verifica se a lista de roles inclui 'ROLE_ADMIN'
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onLogout = () => {
    if (handleLogout) handleLogout();
    setIsDropdownOpen(false);
    closeSidebar();
    navigate('/login');
  };

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    closeSidebar();
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button className={styles.dropdownToggle} onClick={toggleDropdown} type="button">
        {/* Muda o ícone se for Admin para diferenciar visualmente */}
        {isAdmin ? (
            <FaUserShield className={styles.userIcon} />
        ) : (
            <FaUserCircle className={styles.userIcon} />
        )}
        
        {/* Mostra o nome do usuário ou 'Minha Conta' */}
        <span>{user?.name || 'Minha Conta'}</span>
        
        <FaCaretDown className={styles.caretIcon} />
      </button>

      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          
          {/* LÓGICA DO REDIRECIONAMENTO AQUI */}
          {isAdmin ? (
            // Se for ADMIN, vai para /admin
            <Link 
              to="/admin" 
              className={styles.dropdownItem} 
              onClick={handleLinkClick}
            >
              <FaUserShield /> Painel Admin
            </Link>
          ) : (
            // Se for USER comum, vai para /profile
            <Link 
              to="/profile" 
              className={styles.dropdownItem} 
              onClick={handleLinkClick}
            >
              <FaUserCircle /> Meu Perfil
            </Link>
          )}

          <button className={styles.dropdownItem} onClick={onLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;