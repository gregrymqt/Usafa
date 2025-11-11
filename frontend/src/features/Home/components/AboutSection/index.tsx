import React from "react";
import styles from "./styles.module.scss";

const AboutSection: React.FC = () => {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.content}>
        <h2>Sobre o Projeto USAFA Conecta</h2>
        <p>
          Este sistema foi desenvolvido para modernizar e facilitar o acesso aos
          serviços das Unidades de Saúde da Família (USAFA) de Praia Grande.
          Nosso objetivo é criar uma ponte digital entre os profissionais de
          saúde e os pacientes, otimizando o agendamento, o acesso a informações
          e a comunicação, para um cuidado mais ágil e humanizado.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
