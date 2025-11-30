import { BuscaUsafa } from "../../features/Profile/components/buscaUsafa/BuscaUsafa";
import styles from "./Maps.module.scss";

export default function App(cepValue: string ) {
  return (
    <main className={styles.mapsContainer}>
      <BuscaUsafa cep={cepValue} />
    </main>
  );
}